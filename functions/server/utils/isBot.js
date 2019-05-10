const BOTS = [
  '\\+https:\\/\\/developers.google.com\\/\\+\\/web\\/snippet\\/',
  'baiduspider',
  'gurujibot',
  'yandexbot',
  'slurp',
  'msnbot',
  'bingbot',
  'facebookexternalhit',
  'linkedinbot',
  'twitterbot',
  'slackbot',
  'telegrambot',
  'applebot',
  'pingdom',
  'tumblr ',
  'googlebot'
];

const IS_BOT_REGEXP = new RegExp('^.*(' + BOTS.join('|') + ').*$');

const isBot = req => {
  let source = req.headers['user-agent'] || '';
  if (typeof source === 'undefined') {
    source = 'unknown';
  }
  let isBot = IS_BOT_REGEXP.exec(source.toLowerCase());
  if (isBot) {
    isBot = isBot[1];
  }
  return isBot;
};

module.exports = isBot;
