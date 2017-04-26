const debug = require('debug')('coral-plugin-trust');

const RELIABLE_THRESHOLD = parseInt(process.env.TRUST_RELIABLE_THRESHOLD || 0);
const UNRELIABLE_THRESHOLD = parseInt(process.env.TRUST_UNRELIABLE_THRESHOLD || 0);

debug('THRESHOLDS', RELIABLE_THRESHOLD, UNRELIABLE_THRESHOLD);

module.exports = {
  User: {

    // Extract the reliability from the user metadata.
    reliable(user) {
      if (user && user.metadata && user.metadata.trust) {
        return user.metadata.trust;
      }

      return {};
    }
  },
  Reliability: {
    flagger(trust) {
      if (trust && trust.flag) {
        if (trust.flag.karma >= RELIABLE_THRESHOLD) {
          return true;
        } else if (trust.flag.karma <= UNRELIABLE_THRESHOLD) {
          return false;
        }
      }
    },
    commenter(trust) {
      if (trust && trust.comment) {
        if (trust.comment.karma >= RELIABLE_THRESHOLD) {
          return true;
        } else if (trust.comment.karma <= UNRELIABLE_THRESHOLD) {
          return false;
        }
      }
    }
  }
};
