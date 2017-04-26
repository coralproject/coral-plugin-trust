const debug = require('debug')('coral-plugin-trust');

const UserModel = require('models/user');
const ActionModel = require('models/action');
const KarmaService = require('../services/karma');

/**
 * postSetCommentStatus will use the arguments from the mutation and adjust the
 * affected user's karma in the next tick.
 */
const postSetCommentStatus = (_, {id, status}, {loaders: {Comments}}) => {

  // Push this operation off till after the request was acted upon.
  process.nextTick(((id, status) => async () => {
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

      }

      return;
    } catch (e) {
      console.error(e);
    }
  })(id, status));
};

module.exports = {
  RootMutation: {
    setCommentStatus: {
      post: postSetCommentStatus
    }
  }
};
