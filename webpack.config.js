const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

require('dotenv').config();

const swPlugins = [
  new CleanWebpackPlugin(['./functions/hosting/sw-proto.js'], {})
];

const plugins = [
  new CleanWebpackPlugin(
    [
      './functions/hosting/*.*.js',
      './functions/hosting/index.html',
      './functions/hosting/sw.js'
    ],
    {}
  ),
  new HtmlWebpackPlugin({
    template: 'src/views/index.html',
    endpoint: process.env.ENDPOINT,
    icon36: process.env.ICON_36,
    icon512: process.env.ICON_512,
    fbAppId: process.env.FB_APP_ID,
    gaTrackingId: process.env.GA_TRACKING_ID
  }),
  new webpack.EnvironmentPlugin([
    'ENDPOINT',
    'API_ENDPOINT',
    'npm_package_version',
    'SUBSTITUTE_URL',
    'FIREBASE_PROJECT_ID',
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
    'LP_IMAGE_2',
    'GA_TRACKING_ID',
    'GOOGLE_MAP_API_KEY',
    'GOOGLE_STATIC_MAP_URL',
    'CLOUD_STORAGE_ENDPOINT',
    'CLOUD_STORAGE_BUCKET_NAME'
  ]),
  new InjectManifest({
    swSrc: './functions/hosting/sw-proto.js',
    swDest: 'sw.js'
  })
];

module.exports = [
  {
    entry: ['./src/service_workers/sw.js'],
    output: {
      path: __dirname + '/functions/hosting',
      publicPath: '/',
      filename: 'sw-proto.js'
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
    plugins: swPlugins
  },
  {
    entry: ['whatwg-fetch', './src/frontend/index.js'],
    output: {
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].js',
      path: __dirname + '/functions/hosting',
      publicPath: '/'
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
          loaders: ['file-loader', 'image-webpack-loader']
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
