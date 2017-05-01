const KarmaService = require('./services/karma');

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
      return KarmaService.isReliable('flag', trust);
    },
    commenter(trust) {
      return KarmaService.isReliable('comment', trust);
    }
  }
};
