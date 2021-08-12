const applicationinsights = require('applicationinsights');
const safeJsonStringify = require('safe-json-stringify');

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  applicationinsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).setAutoCollectConsole(true, true);
  applicationinsights.start();
}

module.exports.AppInsightsLogger = class AppInsightsLogger {
  constructor() {
    this.client = applicationinsights.defaultClient;
  }
  error(...msgs) {
    this.client.trackException({ exception: new Error(msgs.filter(item => item).map(safeJsonStringify).join(' ')) });
  }
  /**
   * trackTrace function in below methods uses the following severity levels:
   * Verbose = 0
   * Information = 1
   * Warning = 2
   * Error = 3
   * Critical = 4
   */
  warn(...msgs) {
    this.client.trackTrace({ message: msgs.filter(item => item).map(safeJsonStringify).join(' '), severity: 2 });
  }
  debug(...msgs) {
    this.client.trackTrace({ message: msgs.filter(item => item).map(safeJsonStringify).join(' '), severity: 1 });
  }
  info(...msgs) {
    this.client.trackTrace({ message: msgs.filter(item => item).map(safeJsonStringify).join(' '), severity: 0 });
  }
};
