
const webpack = require('webpack');
const buildWebpackConfig = require('./build-webpack-config');
const util = require('util');
const fs = require('fs');
const execAsync = util.promisify(require('child_process').exec);
const version = require('../package.json').version;
const banner = `
  /**
   * @license
   * itsa ${version}
   * Copyright ${new Date().getFullYear()} Josh Wright <https://www.joshwright.com>
   * MIT LICENSE
   */
  `;

const pathInDist = path => {
  return `${__dirname}/../dist${path}`;
}

(async () => {
  try {

    console.log(`clear dist...`);
    await execAsync('rm -rf ./dist/*', { shell: true });

    console.log(`tsc...`);
    await execAsync('tsc', { shell: true });

    console.log(`webpack...`);
    const config = buildWebpackConfig();
    await new Promise(((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) return reject(err);
        if (stats.hasErrors()) return reject(stats.toJson().errors[0]);
        resolve();
      });
    }));

    console.log('testing...');
    const { itsa } = require(pathInDist('/itsa.js'));
    console.log(`valid: ${itsa.string().validate('test').ok}`);

    console.log(`clear cache...`);
    await execAsync('rm -rf ./dist/cache', { shell: true });

    console.log('SUCCESS');
    process.exit(0);
  }catch(e){
    console.log('EXCEPTION:');
    console.log(e);
    process.exit(1);
  }

})();
