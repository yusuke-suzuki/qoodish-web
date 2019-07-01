const express = require('express');
const morgan = require('morgan');
const rendertron = require('rendertron-middleware');

const BOTS = rendertron.botUserAgents.concat(['googlebot', 'notebot']);
const BOT_UA_PATTERN = new RegExp(BOTS.join('|'), 'i');

const DIST_FOLDER = __dirname + '/public';
const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  morgan(
    ':user-agent - :method :url :status :res[content-length] - :response-time ms'
  )
);

app.use(
  rendertron.makeMiddleware({
    proxyUrl: `${process.env.RENDERTRON_ENDPOINT}/render`,
    userAgentPattern: BOT_UA_PATTERN
  })
);

app.get('*.*', express.static(DIST_FOLDER, { index: false }));

app.get('*', (req, res) => {
  res.sendFile(DIST_FOLDER + '/index.html');
});

app.listen(PORT, () => {
  console.log(
    `Node Express server listening on http://localhost:${PORT} from ${DIST_FOLDER}`
  );
});
