require('dotenv').config();

const express = require('express');
const rendertron = require('rendertron-middleware');
const fs = require('fs');
const fetch = require('node-fetch');
const url = require('url');

// Add googlebot to the list of bots we will use Rendertron for
const BOTS = rendertron.botUserAgents.concat('googlebot');
const BOT_REGEXP = new RegExp('^.*(' + BOTS.join('|').toLowerCase() + ').*$');

const isBot = req => {
  let ua = req.headers['user-agent'] || '';
  if (typeof ua === 'undefined') {
    ua = 'unknown';
  }
  let result = BOT_REGEXP.exec(ua.toLowerCase());
  if (result) {
    result = result[1];
  }
  return result;
};

const generateUrl = req => {
  return url.format({
    protocol: req.protocol,
    host: process.env.SITE_DOMAIN,
    pathname: req.originalUrl
  });
};

const app = express();

app.use(express.static(__dirname + '/../hosting'));

app.get('*', async (req, res) => {
  if (isBot(req)) {
    console.log(`Bot access: ${req.headers['user-agent']}`);

    const response = await fetch(
      `${process.env.RENDERTRON_ENDPOINT}/render/${generateUrl(req)}`
    );
    const body = await response.text();

    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.set('Vary', 'User-Agent');
    res.send(body.toString());
  } else {
    res
      .status(200)
      .send(fs.readFileSync(__dirname + '/../hosting/index.html').toString());
  }
});

if (process.env.NODE_ENV === 'development') {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Node Express server listening on 5000`);
  });
}

module.exports = app;
