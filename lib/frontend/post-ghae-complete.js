const url = require('url');
const fetch = require('node-fetch');
const { AppSecrets, Registration } = require('../models');
const parseHost = require('../util/parse-host-from-url');
const lessThanOneHourAgo = require('../util/date-util');

module.exports = function (opts) {
  if (!opts.callbackURI) opts.callbackURI = '/githubAERegisterComplete';

  function addRoutes(router, loginCallback) {
    // compatible with flatiron/director
    router.get(opts.callbackURI, callback);
  }

  /*
    This function validates state & github host. Store app secrets in db
    & remove state, github host mapping(registration) after successful validation
  */
  async function callback(req, res, next) {
    const { query } = url.parse(req.url, true);
    const { code, state } = query;

    // check valid referer, needed to validate ghaehost
    if (!req.get('referer')) {
      console.log(`Request not coming from valid referer ${JSON.stringify(query)} - request ip ${req.ip}`);
      return res.status(400).render('ghae-register-error.hbs', {
        error: 'Request not coming from valid referer',
      });
    }
    // Check state & code present in params
    if (!state) {
      console.log(`Missing Auth state parameter ${JSON.stringify(query)} - request ip ${req.ip}`);
      return res.status(400).render('ghae-register-error.hbs', {
        error: 'Missing Auth state parameter',
      });
    }
    if (!code) {
      console.log(`Missing OAuth Code ${JSON.stringify(query)} - request ip ${req.ip}`);
      return res.status(400).render('ghae-register-error.hbs', {
        error: 'Missing OAuth Code',
      });
    }
    // retrive ghaeHost from state
    let registration = await Registration.getRegistration(state);
    // check valid state or not
    if (!registration || !lessThanOneHourAgo(registration.createdAt)) {
      console.log(`Invalid Auth state parameter ${JSON.stringify(query)} - request ip ${req.ip}`);
      return res.status(401).render('ghae-register-error.hbs', {
        error: 'Invalid Auth state parameter',
      });
    }
    let ghaeHost = parseHost(req.get('referer'));
    let githubHost = registration.githubHost;
    // check valid ghaehost
    if (githubHost !== ghaeHost) {
      console.log(`Request not coming from valid GitHub AE instance ${JSON.stringify(query)} - request ip ${req.ip}`);
      return res.status(401).render('ghae-register-error.hbs', {
        error: 'Request not coming from valid GitHub AE instance',
      });
    }
    // single app install allowed for particular host
    let appSecret = await AppSecrets.getForHost(githubHost);
    if (appSecret) {
      console.log(`Jira App already exist for the given GitHub AE instance ${JSON.stringify(query)} - request ip ${req.ip}`);
      return res.status(409).render('ghae-register-error.hbs', {
        error: `Jira App already exist for the given GitHub AE instance - ${githubHost}`,
      });
    }
    let result = await getSecretsPostApi(githubHost, code);

    // remove registration as we have successfully validate state param
    await registration.remove();

    // validate we are getting id in the response & store app secrets in db
    if (result.id) {
      await storeAppSecrets(result);
    } else {
      console.log(`Github Auth code invalidated ${JSON.stringify(query)} - request ip ${req.ip}`);
      return res.status(400).render('ghae-register-error.hbs', {
        error: 'Github Auth code invalidated',
      });
    }

    return res.render('ghae_register_complete.hbs', {
      app: JSON.stringify(result),
    });
  }

  // this function make post call to ghae to get app secrets
  async function getSecretsPostApi(githubHost, code) {
    url_fetch = `https://${githubHost}/api/v3/app-manifests/${code}/conversions`;
    let result = await fetch(url_fetch, {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github.v3+json',
      },
    }).then(response => response.json()).then(data => data).catch((error) => {
      console.error('Error:', error);
    });
    return result;
  }

  // this function store appsecrets in the db using post call response
  async function storeAppSecrets(result) {
    await AppSecrets.insert({
      clientId: result.client_id,
      clientSecret: result.client_secret,
      privateKey: result.pem,
      appId: result.id,
      githubHost: new URL(result.html_url).hostname,
      webhookSecret: result.webhook_secret,
    });
  }

  return {
    addRoutes,
  };
};
