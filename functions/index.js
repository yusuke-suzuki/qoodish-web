const functions = require('firebase-functions');

const app = require('./server');
const notifyFeedback = require('./notifyFeedback');

exports.host = functions.https.onRequest(app);

exports.notifyFeedback = functions.firestore
  .document('feedbacks/{feedbackId}')
  .onCreate(notifyFeedback);
