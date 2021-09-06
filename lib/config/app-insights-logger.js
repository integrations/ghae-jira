const applicationinsights = require('applicationinsights');
const safeJsonStringify = require('safe-json-stringify');

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  applicationinsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).setAutoCollectConsole(true, true);
  applicationinsights.start();
}

/**
 * trackTrace and trackException function in below method uses the following severity levels:
 * Verbose = 0
 * Information = 1
 * Warning = 2
 * Error = 3
 * Critical = 4
 */
const sendLogToAppInsights = (isError, severity, ...msgs) => {
  let properties = {};
  let msgString = '';
  let client = applicationinsights.defaultClient;
  // If msgs[0] is an object, then it is assumed that it is the properties/measurements to be sent in the log.
  if (typeof msgs[0] === 'object') {
    properties = msgs.shift();
  }
  msgString = msgs.filter(item => item).map(safeJsonStringify).join(' ');
  if (isError) {
    client.trackException({ exception: new Error(msgString), measurements: properties, severityLevel: severity });
  } else {
    client.trackTrace({ message: msgString, properties, severity });
  }
};

module.exports.AppInsightsLogger = class AppInsightsLogger {
  /**
   * param @msgs - If msgs[0] is an object, it will be sent as measurements. Rest are stringified and joined.
   */
  error(...msgs) {
    sendLogToAppInsights(true, 3, ...msgs);
  }
  /**
   * param @msgs - If msgs[0] is an object, it will be sent as properties. Rest are stringified and joined.
   */
  warn(...msgs) {
    sendLogToAppInsights(false, 2, ...msgs);
  }
  /**
   * param @msgs - If msgs[0] is an object, it will be sent as properties. Rest are stringified and joined.
   */
  debug(...msgs) {
    sendLogToAppInsights(false, 1, ...msgs);
  }
  /**
   * param @msgs - If msgs[0] is an object, it will be sent as properties. Rest are stringified and joined.
   */
  info(...msgs) {
    sendLogToAppInsights(false, 0, ...msgs);
  }
};
