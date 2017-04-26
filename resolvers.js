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
      if (trust && trust.flag) {
        return KarmaService.isReliable(trust.flag);
      }
    },
    commenter(trust) {
      if (trust && trust.comment) {
        return KarmaService.isReliable(trust.comment);
      }
    }
  }
};
