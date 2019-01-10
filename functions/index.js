const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

const functions = require('firebase-functions');

const { IncomingWebhook } = require('@slack/client');

const app = require('./server');
exports.host = functions.https.onRequest(app);

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = data => {
  return JSON.parse(new Buffer(data, 'base64').toString());
};

// createSlackMessage creates a message from a build object.
const createSlackMessage = build => {
  let message = {
    text: `Build ${build.id} :cocoa5:`,
    mrkdwn: true,
    attachments: [
      {
        title: 'Build logs',
        title_link: build.logUrl,
        fields: [
          {
            title: 'Status',
            value: build.status
          }
        ]
      }
    ]
  };
  return message;
};

exports.subscribeCloudBuild = functions.pubsub
  .topic('cloud-builds')
  .onPublish(message => {
    const build = eventToBuild(message.data);

    // Skip if the current status is not in the status list.
    // Add additional statuses to list if you'd like:
    // QUEUED, WORKING, SUCCESS, FAILURE,
    // INTERNAL_ERROR, TIMEOUT, CANCELLED
    const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
    if (status.indexOf(build.status) === -1) {
      console.log('Build status is not the target status.');
      return null;
    }

    const cloudBuildWebhook = new IncomingWebhook(
      process.env.CLOUD_BUILD_WEBHOOK_URL
    );

    cloudBuildWebhook.send(createSlackMessage(build), (err, res) => {
      if (err) {
        console.log('Error: ', err);
      } else {
        console.log('Message sent: ', res);
      }
    });
  });

exports.notifyFeedback = functions.firestore
  .document('feedbacks/{feedbackId}')
  .onCreate((snap, context) => {
    const feedbackWebhook = new IncomingWebhook(
      process.env.FEEDBACK_WEBHOOK_URL
    );
    feedbackWebhook.send(
      'ユーザーからのフィードバックがあったよ！',
      (err, res) => {
        if (err) {
          console.log('Error: ', err);
        } else {
          console.log('Message sent: ', res);
        }
      }
    );
  });

exports.generateThumbnail = functions
  .region('asia-northeast1')
  .storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
  .object()
  .onFinalize(object => {
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

    return bucket
      .file(filePath)
      .download({
        destination: tempFilePath
      })
      .then(() => {
        console.log('Image downloaded locally to', tempFilePath);
        return spawn('convert', [
          tempFilePath,
          '-thumbnail',
          '200x200>',
          tempFilePath
        ]);
      })
      .then(() => {
        console.log('Thumbnail created at', tempFilePath);
        const thumbFileName = `thumb_${fileName}`;
        const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
        return bucket.upload(tempFilePath, {
          destination: thumbFilePath,
          metadata: metadata
        });
      })
      .then(() => fs.unlinkSync(tempFilePath));
  });
