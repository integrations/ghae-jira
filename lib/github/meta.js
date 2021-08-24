const { AppSecrets } = require('../models');

module.exports.unregister = async (context) => {
  if (!context.payload.sender || !context.payload.sender.html_url) {
    context.log.error({ noop: 'no_html_url' }, 'html_url in Installation payload is empty for unregister event');
    return;
  }
  const githubHost = new URL(context.payload.sender.html_url).hostname;
  let appsecrets = await AppSecrets.getForHost(githubHost);
  if (!appsecrets) {
    context.log({ noop: 'no_appsecrets' }, `Halting further execution for unregister for ${githubHost} since appsecrets not exist`);
    return;
  }
  appsecrets.uninstall();
};
