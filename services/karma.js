const UserModel = require('models/user');

/**
 * KarmaService provides interfaces for editing a user's karma.
 */
class KarmaService {

  /**
   * modifyUserKarma updates the user to adjust their karma, for either the `type`
   * of 'comment' or 'flag'. If `multi` is true, then it assumes that `id` is an
   * array of id's.
   */
  static async modifyUser(id, direction = 1, type = 'comment', multi = false) {
    const key = `metadata.trust.${type}.karma`;

    let update = {
      $inc: {
        [key]: direction
      }
    };

    if (multi) {

      // If it was in multi-mode but there was no user's to adjust, bail.
      if (id.length <= 0) {
        return;
      }

      return UserModel.update({
        id: {
          $in: id
        }
      }, update, {
        multi: true
      });
    }

    return UserModel.update({id}, update);
  }
}

module.exports = KarmaService;
