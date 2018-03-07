const webpack =  require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

require('dotenv').config();

const serviceWorkerPlugins = [
  new CleanWebpackPlugin(['./functions/hosting/firebase-messaging-sw.js'], {}),
  new webpack.EnvironmentPlugin([
    'FIREBASE_MESSAGING_SENDER_ID'
  ])
];

const plugins = [
  new CleanWebpackPlugin(['./functions/hosting/bundle.js', './functions/hosting/index.html'], {}),
  new HtmlWebpackPlugin({
    template: 'app/views/index.html',
    hash: true,
    endpoint: process.env.ENDPOINT,
    googleMapUrl: `https://maps.google.com/maps/api/js?libraries=places&v=3&key=${process.env.GOOGLE_API_KEY_CLIENT}`,
    icon36: process.env.ICON_36,
    icon512: process.env.ICON_512,
    fbAppId: process.env.FB_APP_ID
  }),
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
    entry: ['./app/service_workers/firebase-messaging-sw.js'],
    output: {
      path: __dirname + '/functions/hosting',
      publicPath: '/',
      filename: 'firebase-messaging-sw.js'
    },
    resolve: {
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    plugins: serviceWorkerPlugins
  },
  {
    entry: ['whatwg-fetch', './app/frontend/index.js'],
    output: {
      path: __dirname + '/functions/hosting',
      publicPath: '/',
      filename: 'bundle.js'
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
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
