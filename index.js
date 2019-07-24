const express = require('express');
const morgan = require('morgan');
const fetch = require('node-fetch');
const url = require('url');

const DIST_FOLDER = __dirname + '/public';
const PORT = process.env.PORT || 5000;

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
  'tumblr',
  'googlebot',
  'notebot'
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

const generateUrl = req => {
  return url.format({
    protocol: 'https',
    host: process.env.SITE_DOMAIN,
    pathname: req.originalUrl
  });
};

const app = express();

app.use(
  morgan(
    ':user-agent - :method :url :status :res[content-length] - :response-time ms'
  )
);

app.use(
  express.static(DIST_FOLDER, {
    index: false,
    maxAge: 2592000
  })
);

app.get('/healthcheck', (req, res) => {
  res.status(200).end();
});

app.get('*', async (req, res) => {
  if (isBot(req)) {
    console.log(`Bot access: ${req.headers['user-agent']}`);

    const response = await fetch(
      `${process.env.RENDERTRON_ENDPOINT}/render/${generateUrl(
        req
      )}?mobile=true`
    );
    const body = await response.text();

    //res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.set('Vary', 'User-Agent');
    res.send(body.toString());
  } else {
    res.sendFile(DIST_FOLDER + '/index.html');
  }
});

app.listen(PORT, () => {
  console.log(
    `Node Express server listening on http://localhost:${PORT} from ${DIST_FOLDER}`
  );
});
