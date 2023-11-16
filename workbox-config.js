module.exports = {
  globDirectory: '.next/',
  globPatterns: ['static/chunks/**/*.js'],
  swSrc: './src/worker/index.js',
  swDest: 'public/sw.js'
};
