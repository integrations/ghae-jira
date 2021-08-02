const GHAE_URL_PATTERN_PROD = 'ghe.com';
const GHAE_URL_PATTERN_DEV = 'ghaekube.net';
const GHAE_INSTANCE_URL_DEV = 'https://ghaebuild48746.ghaekube.net';
const GHAE_INSTANCE_URL_PROD = 'https://ghaebuild48746.ghe.com';

function getGhaeInstanceUrl() {
  if (process.env.NODE_ENV === 'production') return GHAE_INSTANCE_URL_PROD;
  else return GHAE_INSTANCE_URL_DEV;
}

function getGhaeUrlPattern() {
  if (process.env.NODE_ENV === 'production') return GHAE_URL_PATTERN_PROD;
  else return GHAE_URL_PATTERN_DEV;
}

module.exports = {
  GHAE_URL_PATTERN: getGhaeUrlPattern(),
  GHAE_INSTANCE_URL: getGhaeInstanceUrl(),
};
