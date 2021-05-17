const TerserPlugin = require("terser-webpack-plugin");
const pathutil = require('path');
const os = require('os');
const babel = require("@babel/core");
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



module.exports = () => {
  const mode = 'production';
  const isDev = mode === 'development';

  return {
    mode,
    entry: pathutil.join(__dirname, '/../dist/js/itsa.ts'),
    devtool: 'source-map',
    output: {
      path: `${__dirname}/../dist`,
      library: 'ItsaLib',
      libraryTarget: 'umd',
      filename: 'itsa.js',
      globalObject: 'this',
    },
    // infrastructureLogging: {
    //   level: 'error',
    // },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'entry',
                      corejs: 3,
                      targets: { ie: 11 },
                    },
                  ]
                ],
              }
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({}),
      ]
    },
    performance: {
      hints: false,
    },
    resolve: {
      extensions: ['.js', '.json'],
    },
  };
};
