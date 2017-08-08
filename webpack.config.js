const webpack =  require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

require('dotenv').config();

const plugins = [
  new CleanWebpackPlugin(['./public/javascripts/*'], {}),
  new AssetsPlugin(),
  new webpack.EnvironmentPlugin([
    'ENDPOINT',
    'npm_package_version',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_DB_URL',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_CDN_URL'
  ])
];

module.exports = {
  entry: ['whatwg-fetch', 'babel-polyfill', './app/frontend/index.js'],
  output: {
    path: __dirname + '/public/javascripts',
    publicPath: '/javascripts/',
    filename: 'bundle-[hash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '*']
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      }
    ]
  },
  plugins: plugins
};
