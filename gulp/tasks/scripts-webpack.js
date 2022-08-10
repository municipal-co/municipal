// Require dependencies: webpack webpack-cli

import path from 'path';
import webpack from 'webpack';
import * as url from 'url';
import log from 'fancy-log';


const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const webpackConfig = {
  entry: {
    theme: path.resolve(__dirname, '/src/_scripts/theme.js'),
    vendor: path.resolve(__dirname, '/src/_scripts/vendor.js'),
    checkout: path.resolve(__dirname, '/src/_scripts/checkout.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'assets/[name].js'
  },
  resolve: {
    alias: {
      'handlebars' : 'handlebars/dist/handlebars.js'
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: "babel-loader",
        }],
        resolve: {
          fullySpecified: false,
        }
      }
    ]
  }
}

const scripts = () => {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if(err) {
        log(err);
      }
      if (stats.hasErrors()) {
        log(new Error(stats.compilation.errors.join('\n')));
      }
      resolve();
    });
  });
};

export default scripts;