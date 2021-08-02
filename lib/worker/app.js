// FIXME: This is all a bit of a hack to get access to a Probot Application
//        instance, mainly to use the `auth()` method. Probot needs refactored
//        so that method is more easily accessible.

const { Probot } = require('probot');
const { getPrivateKey } = require('@probot/get-private-key');
const { Installation } = require('../models');
const { AppSecrets } = require('../models');


module.exports = async (jiraHost) => {
  const installation = await Installation.getForHost(jiraHost);
  const ghaeInstanceData = await AppSecrets.getForHost(installation.githubHost);
  return new Probot({
    appId: (ghaeInstanceData && ghaeInstanceData.appId) || process.env.APP_ID,
    privateKey: (ghaeInstanceData && ghaeInstanceData.privateKey) || getPrivateKey(),
    secret: (ghaeInstanceData && ghaeInstanceData.webhookSecret) || process.env.WEBHOOK_SECRET,
    baseUrl: (ghaeInstanceData && `https://${ghaeInstanceData.githubHost}/api/v3`),
  });
}
