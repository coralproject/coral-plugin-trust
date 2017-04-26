const debug = require('debug')('coral-plugin-trust');

const RELIABLE_THRESHOLD = parseInt(process.env.TRUST_RELIABLE_THRESHOLD || 0);
const UNRELIABLE_THRESHOLD = parseInt(process.env.TRUST_UNRELIABLE_THRESHOLD || 0);

debug(`THRESHOLDS Reliable[${RELIABLE_THRESHOLD}] Unreliable[${UNRELIABLE_THRESHOLD}]`);

/**
 *
 * determineReliability will inspect the property of the user to match their
 * reliability score to that of settings.
 *
 * @param {Object} property the property containing the karma field to check against
 */
const determineReliability = (property) => {
  if (property.karma > RELIABLE_THRESHOLD) {
    return true;
  } else if (property.karma < UNRELIABLE_THRESHOLD) {
    return false;
  }
  return null;
};

module.exports = {
  User: {

    // Extract the reliability from the user metadata if they have permission.
    reliable(user, _, {user: requestingUser}) {
      if (requestingUser && requestingUser.hasRoles('ADMIN')) {
        if (user && user.metadata && user.metadata.trust) {
          return user.metadata.trust;
        } else {
          return {};
        }
      }
    }
  },
  Reliability: {
    flagger(trust) {
      if (trust && trust.flag) {
        return determineReliability(trust.flag);
      }
    },
    commenter(trust) {
      if (trust && trust.comment) {
        return determineReliability(trust.comment);
      }
    }
  }
};
