const debug = require('debug')('coral-plugin-trust');

const RELIABLE_THRESHOLD = parseInt(process.env.TRUST_RELIABLE_THRESHOLD || 0);
const UNRELIABLE_THRESHOLD = parseInt(process.env.TRUST_UNRELIABLE_THRESHOLD || 0);

debug('THRESHOLDS', RELIABLE_THRESHOLD, UNRELIABLE_THRESHOLD);

module.exports = {
  User: {
    reliable(user) {
      if (user && user.metadata && user.metadata.trust) {
        if (user.metadata.trust.karma >= RELIABLE_THRESHOLD) {
          return true;
        } else if (user.metadata.trust.karma <= UNRELIABLE_THRESHOLD) {
          return false;
        }
      }
    }
  }
};
