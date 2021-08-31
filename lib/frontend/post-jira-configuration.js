const { validateGhaeDomain } = require('./ghae-validations');

module.exports = async (req, res) => {
  const { githubHost } = req.body;

  if (!githubHost || !validateGhaeDomain(githubHost)) {
    res.status(400);
    res.json({
      err: `"${githubHost}" is not a valid GitHuB AE account url, please enter a valid url.`,
    });
    return res;
  }

  const ghaeHost = new URL(githubHost).hostname;
  res.status(200);
  res.json({
    ghaeHost,
  });
  return res;
};
