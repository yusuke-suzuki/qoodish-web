require('dotenv').config();

const fs = require('fs');
const http = require('http');
const url = require('url');

const isBot = require(__dirname + '/utils/isBot');
const prerender = require(__dirname + '/utils/prerender');

const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.static(__dirname + '/../hosting'));
app.use(morgan('tiny'));

const generateUrl = req => {
  return url.format({
    protocol: 'https',
    host: process.env.SITE_DOMAIN,
    pathname: req.originalUrl
  });
};

app.get('*', async (req, res) => {
  if (isBot(req)) {
    console.log(`Bot access: ${req.headers['user-agent']}`);
    const serialized = await prerender(generateUrl(req));

    //res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.set('Vary', 'User-Agent');
    res.status(serialized.status).send(serialized.content);
  } else {
    res
      .status(200)
      .send(fs.readFileSync(__dirname + '/../hosting/index.html').toString());
  }
});

if (process.env.NODE_ENV === 'development') {
  http.createServer(app).listen(5000);
}

module.exports = app;
