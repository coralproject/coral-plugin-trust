const debug = require('debug')('coral-plugin-trust');

const ActionModel = require('models/action');
const KarmaService = require('./services/karma');
const CommentsService = require('services/comments');

/**
 * adjustKarma will adjust the affected user's karma depending on the moderators
 * action.
 */
const adjustKarma = (Comments, id, status) => async () => {
  try {

    // Use the dataloader to get the comment that was just moderated and
    // get the flag user's id's so we can adjust their karma too.
    let [
      comment,
      flagUserIDs
    ] = await Promise.all([

      // Load the comment that was just made/updated by the setCommentStatus
      // operation.
      Comments.get.load(id),

      // Find all the flag actions that were referenced by this comment
      // at this point in time.
      ActionModel.find({
        item_id: id,
        item_type: 'COMMENTS',
        action_type: 'FLAG'
      }).then((actions) => {

        // This is to ensure that this is always an array.
        if (!actions) {
          return [];
        }

        return actions.map(({user_id}) => user_id);
      })
    ]);

    debug(`Comment[${id}] by User[${comment.author_id}] was Status[${status}]`);

    switch (status) {
    case 'REJECTED':

      // Reduce the user's karma.
      debug(`CommentUser[${comment.author_id}] had their karma reduced`);

      // Decrease the flag user's karma, the moderator disagreed with this
      // action.
      debug(`FlaggingUser[${flagUserIDs.join(', ')}] had their karma increased`);
      await Promise.all([
        KarmaService.modifyUser(comment.author_id, -1, 'comment'),
        KarmaService.modifyUser(flagUserIDs, 1, 'flag', true)
      ]);

      break;

    case 'ACCEPTED':

      // Increase the user's karma.
      debug(`CommentUser[${comment.author_id}] had their karma increased`);

      // Increase the flag user's karma, the moderator agreed with this
      // action.
      debug(`FlaggingUser[${flagUserIDs.join(', ')}] had their karma reduced`);
      await Promise.all([
        KarmaService.modifyUser(comment.author_id, 1, 'comment'),
        KarmaService.modifyUser(flagUserIDs, -1, 'flag', true)
      ]);

      break;

    }

    return;
  } catch (e) {
    console.error(e);
  }
};

/**
 * postSetCommentStatus will use the arguments from the mutation and adjust the
 * affected user's karma in the next tick.
 */
const postSetCommentStatus = (_, {id, status}, {loaders: {Comments}}) => {

  // Push this operation off till after the request was acted upon.
  process.nextTick(adjustKarma(Comments, id, status));
};

/**
 * postCreateComment will inspect the user making the comment. If it is found
 * that the user is considered unreliable, the comment will have the status of
 * `PREMOD` pushed into it and added to the response payload.
 */
const postCreateComment = async (_, args, {user}, info, response) => {
  if (!response) {
    return response;
  }

  let comment = response.comment;

  try {

    // Now that we know that we have created a comment, we should check to see
    // if we need to change what is returned to the user in order to possibly
    // change the status of the comment now that it has been inserted into the
    // database.
    if (user && user.metadata) {

      // If the user is not a reliable commenter (passed the unreliability
      // threshold by having too many rejected comments) then we can change the
      // status of the comment to `PREMOD`, therefore pushing the user's comments
      // away from the public eye until a moderator can manage them. This of
      // course can only be applied if the comment's current status is `NONE`,
      // we don't want to interfere if the comment was rejected.
      if (response.comment.status === 'NONE' && KarmaService.isReliable('comment', user.metadata.trust) === false) {
        await CommentsService.pushStatus(comment.id, 'PREMOD');

        // Update the response from the comment creation to add the PREMOD so that
        // that user's UI will reflect the fact that their comment is in pre-mod.
        response.comment.status = 'PREMOD';
      }
    }

  } catch (e) {
    console.error(e);
  }

  return response;
};

module.exports = {
  RootMutation: {
    setCommentStatus: {
      post: postSetCommentStatus
    },
    createComment: {
      post: postCreateComment
    }
  }
};
