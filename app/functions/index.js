const functions = require('firebase-functions');
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
import { isBot, generateMetadata } from './Utils';

const app = express();

const pageRoutes = [
  '/',
  '/discover',
  '/login',
  '/maps',
  '/maps/:mapId',
  '/maps/:mapId/reports/:reviewId',
  '/spots/:placeId',
  '/settings',
  '/terms',
  '/privacy'
];

app.get(pageRoutes, async (req, res) => {
  if (isBot(req)) {
    console.log(`Bot access: ${req.headers['user-agent']}`);
    const metadata = await generateMetadata(req);
    res.status(200).send(ejs.render(fs.readFileSync('./metadata.html').toString(), { metadata: metadata, fbAppId: functions.config().app.fb_app_id } ));
  } else {
    //res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.status(200).send(fs.readFileSync('./hosting/index.html').toString());
  }
});

exports.host = functions.https.onRequest(app);
