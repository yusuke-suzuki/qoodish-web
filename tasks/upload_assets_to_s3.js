
var Slack = require('slack-node');

var slack = new Slack();
slack.setWebhook(process.env.SLACK_WEBHOOK);
var slackParams = {
  channel: process.env.SLACK_CHANNEL,
  username: 'webpack build status'
}

var AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
var s3 = new AWS.S3();

var fs = require('fs');
var path = require('path');
var manifest = require('../webpack-assets.json');
var assetPath = `./public/${manifest.main.js}`;
var fileStream = fs.createReadStream(assetPath);
fileStream.on('error', function(err) {
  console.log('File Error', err);
});
var bundleName = path.basename(assetPath);
var params = {
  Bucket: process.env.S3_BUCKET_ASSETS,
  Key: bundleName,
  Body: fileStream,
  ContentType: 'text/javascript',
  ACL: 'public-read'
};
s3.upload (params, function (err, data) {
  if (err) {
    console.log('Error', err);
    slackParams.text = 'Build failed!';
  } if (data) {
    console.log('Upload Success', data.Location);
    slackParams.text = 'Successfully built! Bundle: ' + bundleName;
  }

  slack.webhook(slackParams, function(err, response) {
    if (err) {
      console.log(err);
    }
    console.log(response);
  });
});
