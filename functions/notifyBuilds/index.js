const { IncomingWebhook } = require('@slack/client');

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = data => {
  return JSON.parse(new Buffer(data, 'base64').toString());
};

// createSlackMessage creates a message from a build object.
const createSlackMessage = build => {
  console.log(build);

  let statusEmoji = '';
  let color = '';
  if (build.status === 'SUCCESS') {
    statusEmoji = ':yo-soro-2:';
    color = 'good';
  } else if (build.status === 'FAILURE') {
    statusEmoji = ':you:';
    color = 'danger';
  }

  let message = {
    text: `Build ${build.id}`,
    mrkdwn: true,
    attachments: [
      {
        title: 'Build logs',
        title_link: build.logUrl,
        color: color,
        fields: [
          {
            title: 'Status',
            value: `${build.status} ${statusEmoji}`,
            short: true
          },
          {
            title: 'Repository',
            value: build.substitutions.REPO_NAME,
            short: true
          },
          {
            title: 'Branch',
            value: build.substitutions.BRANCH_NAME,
            short: true
          },
          {
            title: 'Commit',
            value: build.substitutions.SHORT_SHA,
            short: true
          }
        ]
      }
    ]
  };
  return message;
};

const notifyBuilds = message => {
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
};

module.exports = notifyBuilds;
