require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const http = require('http');

const isBot = require(__dirname + '/utils/isBot');
const generateMetadata = require(__dirname + '/utils/generateMetadata');

const app = express();
app.use(express.static(__dirname + '/../hosting'));

const pageRoutes = [
  '/',
  '/discover',
  '/login',
  '/maps/:mapId',
  '/maps/:mapId/reports/:reviewId',
  '/profile',
  '/users/:userId',
  '/spots/:placeId',
  '/notifications',
  '/settings',
  '/invites',
  '/terms',
  '/privacy'
];

app.get(pageRoutes, async (req, res) => {
  if (isBot(req)) {
    console.log(`Bot access: ${req.headers['user-agent']}`);
    const metadata = await generateMetadata(req);
    res.status(200).send(
      ejs.render(fs.readFileSync(__dirname + '/metadata.html').toString(), {
        metadata: metadata,
        fbAppId: process.env.FB_APP_ID
      })
    );
  } else {
    //res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res
      .status(200)
      .send(fs.readFileSync(__dirname + '/../hosting/index.html').toString());
  }
});

if (process.env.NODE_ENV === 'development') {
  http.createServer(app).listen(5000);
}

module.exports = app;
