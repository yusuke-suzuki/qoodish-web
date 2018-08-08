const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

const functions = require('firebase-functions');
const express = require('express');
const ejs = require('ejs');
import { isBot, generateMetadata } from './Utils';

const Slack = require('slack-node');
const slack = new Slack();
slack.setWebhook(process.env.FEEDBACK_WEBHOOK_URL)

const app = express();

const pageRoutes = [
  '/',
  '/discover',
  '/login',
  '/maps',
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
    res.status(200).send(ejs.render(fs.readFileSync('./metadata.html').toString(), { metadata: metadata, fbAppId: functions.config().app.fb_app_id } ));
  } else {
    //res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.status(200).send(fs.readFileSync('./hosting/index.html').toString());
  }
});

exports.host = functions.https.onRequest(app);

exports.notifyFeedback = functions.firestore
  .document('feedbacks/{feedbackId}')
  .onCreate((snap, context) => {
    slack.webhook({
      channel: "#qoodish-notice",
      username: "Feedback",
      text: "ユーザーからのフィードバックがあったよ！"
    }, (err, response) => {
      console.log(response);
    });
  });

exports.generateThumbnail = functions.storage.bucket(process.env.FIREBASE_IMAGE_BUCKET_NAME).object().onFinalize((object) => {
  const fileBucket = object.bucket;
  const filePath = object.name;
  const contentType = object.contentType;

  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  const fileName = path.basename(filePath);
  if (fileName.startsWith('thumb_')) {
    console.log('Already a Thumbnail.');
    return null;
  }

  const bucket = gcs.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = {
    contentType: contentType,
    cacheControl: 'public,max-age=86400'
  };

  return bucket.file(filePath).download({
    destination: tempFilePath,
  }).then(() => {
    console.log('Image downloaded locally to', tempFilePath);
    return spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
  }).then(() => {
    console.log('Thumbnail created at', tempFilePath);
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    return bucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata: metadata
    });
  }).then(() => fs.unlinkSync(tempFilePath));
});
