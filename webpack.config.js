const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

require('dotenv').config();

const plugins = [
  new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns: [
      '**/*',
      '!sitemap.xml',
      '!robots.txt',
      '!manifest.json',
      '!favicon.ico',
      '!apple-touch-icon.png'
    ]
  }),
  new HtmlWebpackPlugin({
    template: 'src/index.html',
    endpoint: process.env.ENDPOINT,
    icon512: process.env.ICON_512,
    ogpImage: process.env.OGP_IMAGE_URL,
    fbAppId: process.env.FB_APP_ID,
    gaTrackingId: process.env.GA_TRACKING_ID
  }),
  new webpack.EnvironmentPlugin([
    'ENDPOINT',
    'API_ENDPOINT',
    'npm_package_version',
    'SUBSTITUTE_URL',
    'OGP_IMAGE_URL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
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
    'NO_IMAGE',
    'GA_TRACKING_ID',
    'GOOGLE_MAP_API_KEY',
    'GOOGLE_STATIC_MAP_URL',
    'CLOUD_STORAGE_ENDPOINT',
    'CLOUD_STORAGE_BUCKET_NAME'
  ]),
  new InjectManifest({
    swSrc: './src/sw.ts',
    swDest: 'sw.js',
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
  }),
  new CompressionPlugin({
    test: /\.js$/,
    filename: '[path]'
  })
];

module.exports = {
  entry: ['whatwg-fetch', './src/index.tsx'],
  output: {
    filename: '[name]-[contenthash].js',
    chunkFilename: '[name]-[contenthash].js',
    path: __dirname + '/public',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
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
};
