const { IncomingWebhook } = require('@slack/client');

const notifyFeedback = (snap, context) => {
  const feedbackWebhook = new IncomingWebhook(process.env.FEEDBACK_WEBHOOK_URL);
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
};

module.exports = notifyFeedback;
