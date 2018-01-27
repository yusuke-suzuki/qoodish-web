const webpack =  require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

require('dotenv').config();

const serviceWorkerPlugins = [
  new CleanWebpackPlugin(['./public/firebase-messaging-sw.js'], {}),
  new webpack.EnvironmentPlugin([
    'FIREBASE_MESSAGING_SENDER_ID'
  ])
];

const plugins = [
  new CleanWebpackPlugin(['./public/javascripts/*'], {}),
  new AssetsPlugin(),
  new webpack.EnvironmentPlugin([
    'ENDPOINT',
    'API_ENDPOINT',
    'npm_package_version',
    'SUBSTITUTE_URL',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_DB_URL',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_IMAGE_BUCKET',
    'FB_APP_ID',
    'PICKED_UP_MAP_ID',
    'LP_CAROUSEL_1',
    'LP_IMAGE_1',
    'LP_IMAGE_2'
  ])
];

module.exports = [
  {
    entry: ['@babel/polyfill', './app/service_workers/firebase-messaging-sw.js'],
    output: {
      path: __dirname + '/public',
      publicPath: '/',
      filename: 'firebase-messaging-sw.js'
    },
    resolve: {
      extensions: ['.js']
    },
    module: {
      loaders: [
        {
          test: /.js$/,
          exclude: /node_modules/,
          loaders: ['babel-loader']
        }
      ]
    },
    plugins: serviceWorkerPlugins
  },
  {
    entry: ['whatwg-fetch', '@babel/polyfill',  './app/frontend/index.js'],
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
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'file-loader',
            'image-webpack-loader'
          ]
        },
        {
          test: /\.css/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: plugins
  }
];
