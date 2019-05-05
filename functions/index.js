const functions = require('firebase-functions');

const app = require('./server');

exports.host = functions.https.onRequest(app);
