const pathutil = require('path');
const version = require('../package.json').version;
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const banner = `@license
itsa ${version}
Copyright ${new Date().getFullYear()} Josh Wright <https://www.joshwright.com>
MIT LICENSE`;

module.exports = () => {
  const mode = 'production';
  const isDev = mode === 'development';

  return {
    mode,
    entry: {
      'itsa': pathutil.join(__dirname, '/../dist/cache/js/itsa.js'),
      'itsa.min': pathutil.join(__dirname, '/../dist/cache/js/itsa.js'),
    },
    devtool: 'source-map',
    output: {
      path: `${__dirname}/../dist`,
      library: 'ItsaLib',
      libraryTarget: 'umd',
      filename: "[name].js",
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
          enforce: "pre",
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
            {
              loader: 'source-map-loader',
            }
          ],
        },
      ],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner,
      }),
    ],
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          include: /\.min\.js$/,
          extractComments: false,
        }),
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
