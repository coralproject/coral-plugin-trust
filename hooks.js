const debug = require('debug')('coral-plugin-trust');

const UserModel = require('models/user');

/**
 * modifyUserKarma updates the user to adjust their karma.
 */
const modifyUserKarma = async (id, direction) => {
  let update;

  if (direction === 'up') {
    update = {
      $inc: {
        'metadata.trust.karma': 1
      }
    };
  } else {
    update = {
      $inc: {
        'metadata.trust.karma': -1
      }
    };
  }

  return UserModel.update({id}, update);
};

module.exports = {
  RootMutation: {
    setCommentStatus: {
      post: async (_, {id, status}, {loaders: {Comments}}) => {

        // Push this operation off till after the request was acted upon.
        process.nextTick(((id, status) => async () => {
          try {

            // Use the dataloader to get the comment that was just moderated.
            let comment = await Comments.get.load(id);

            debug(`Comment[${id}] by User[${comment.author_id}] was Status[${status}]`);

            switch (status) {
            case 'REJECTED':

                // Reduce the user's karma.
              debug(`User[${comment.author_id}] had their karma reduced`);
              return modifyUserKarma(comment.author_id, 'down');

            case 'ACCEPTED':

                // Increase the user's karma.
              debug(`User[${comment.author_id}] had their karma increased`);
              return modifyUserKarma(comment.author_id, 'up');
            }

            return;
          } catch (e) {
            console.error(e);
          }

        })(id, status));
      }
    }
  }
};
