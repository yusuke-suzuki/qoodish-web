const express = require('express');
const morgan = require('morgan');

const fs = require('fs');
const http = require('http');
const fetch = require('node-fetch');
const url = require('url');

const isBot = require(__dirname + '/utils/isBot');

const generateUrl = req => {
  return url.format({
    protocol: 'https',
    host: process.env.SITE_DOMAIN,
    pathname: req.originalUrl
  });
};

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(
  morgan(
    ':user-agent - :method :url :status :res[content-length] - :response-time ms'
  )
);

app.get('*', async (req, res) => {
  if (isBot(req)) {
    console.log(`Bot access: ${req.headers['user-agent']}`);

    const response = await fetch(
      `${process.env.RENDERTRON_ENDPOINT}/render/${generateUrl(req)}`
    );
    const body = await response.text();

    //res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.set('Vary', 'User-Agent');
    res.send(body.toString());
  } else {
    res
      .status(200)
      .send(fs.readFileSync(__dirname + '/public/index.html').toString());
  }
});

http.createServer(app).listen(process.env.PORT || 5000);
