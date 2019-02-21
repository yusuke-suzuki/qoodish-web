const functions = require('firebase-functions');

const app = require('./server');
const notifyFeedback = require('./notifyFeedback');
const generateThumbnail = require('./generateThumbnail');

exports.host = functions.https.onRequest(app);

exports.notifyFeedback = functions.firestore
  .document('feedbacks/{feedbackId}')
  .onCreate(notifyFeedback);

exports.generateThumbnail = functions
  .region('asia-northeast1')
  .storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME)
  .object()
  .onFinalize(generateThumbnail);
