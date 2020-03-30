/* bundleLogger
   ------------
   Provides gulp style logs to the bundle method in browserify.js
*/

const colors = require('ansi-colors');
const log = require('fancy-log');
const prettyHrtime = require('pretty-hrtime');
let startTime;

module.exports = {
  start(filepath) {
    startTime = process.hrtime();
    log(`Bundling: ${colors.green(filepath)}`);
  },

  watch(bundleName) {
    log(`Watching files required by: ${colors.yellow(bundleName)}`);
  },

  minifyifying(bundleName) {
    log(`Minifyify-ing ${colors.yellow(bundleName)}`)
  },

  end(filepath) {
    const taskTime = process.hrtime(startTime);
    const prettyTime = prettyHrtime(taskTime);
    log(`Bundled: ${colors.green(filepath)} in ${colors.magenta(prettyTime)}`);
  },

  error(error) {
    log.error(`${colors.bold.red('Bundle Error')}: ${error.message}`);

    if (typeof this.emit === 'function') this.emit('end');
  }
};
