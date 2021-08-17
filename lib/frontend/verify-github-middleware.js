const { validateGhaeDomain } = require('./ghae-validations');

module.exports = async function verifyGithubRequest(req, res, next) {
  if (process.env.GITHUB_INSTANCE === 'ghae') {
    const githubHost = (req.headers && req.headers.referer);

    if (githubHost) {
        if (!validateGhaeDomain(githubHost)) {
        next(new Error(`${githubHost} is not a valid referrer`));
        }
        req.query.githubHost = new URL(githubHost).hostname;
        next();
    } else {
        next(new Error('Not Found'));
    }
  } else {
      const githubHost = (req.headers && req.headers.referer);
      req.query.githubHost = new URL(githubHost).hostname;
      next();
  }
};
