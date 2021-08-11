const subdomainRegexp = /^\w(?:[\w-]{0,61}\w)?$/;
const ghaeDomains = ['ghaekube.net', 'ghe.com'];

// TODO: validate ghae url based on certificates
function validateGhaeDomain(ghaeUrl) {
  // ghaeHost = ghaeAccount.ghaekube.net or ghaeAccount.ghe.com
  if (!validateGhaeProtocol(ghaeUrl)) {
    return false;
  }
  let ghaeHost = new URL(ghaeUrl).hostname;
  let ghaeSubDomain = ghaeHost.split('.')[0];
  let ghaeDomain = ghaeHost.replace(`${ghaeSubDomain}.`, '');
  return ghaeDomains.includes(ghaeDomain) && subdomainRegexp.test(ghaeSubDomain);
}

function validateGhaeProtocol(ghaeUrl) {
  if(!ghaeUrl || ghaeUrl == '') {
    return false;
  }

  if(ghaeUrl.indexOf("http://") == 0 || ghaeUrl.indexOf("https://") == 0){
      return true;
  }
  return false; 
}

module.exports = {
  validateGhaeDomain,
};
