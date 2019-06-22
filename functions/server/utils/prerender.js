const puppeteer = require('puppeteer');

const stripPage = () => {
  // Strip only script tags that contain JavaScript (either no type attribute or one that contains "javascript")
  const elements = document.querySelectorAll(
    'script:not([type]), script[type*="javascript"], link[rel=import]'
  );
  for (const e of Array.from(elements)) {
    e.remove();
  }
};

const prerender = async requestUrl => {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === 'development' ? false : true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1000,
    height: 1000,
    isMobile: false
  });

  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('https://firestore.googleapis.com')) {
      request.abort();
    } else {
      request.continue();
    }
  });

  let response = null;

  // Capture main frame response. This is used in the case that rendering
  // times out, which results in puppeteer throwing an error. This allows us
  // to return a partial response for what was able to be rendered in that
  // time frame.
  page.addListener('response', r => {
    if (!response) {
      response = r;
    }
  });

  try {
    response = await page.goto(requestUrl, {
      timeout: 10000,
      waitUntil: 'networkidle2'
    });
  } catch (e) {
    console.error(e);
  }

  if (!response) {
    console.error('response does not exist');
    // This should only occur when the page is about:blank. See
    // https://github.com/GoogleChrome/puppeteer/blob/v1.5.0/docs/api.md#pagegotourl-options.
    await page.close();
    return { status: 400, content: '' };
  }

  // Set status to the initial server's response code. Check for a <meta
  // name="render:status_code" content="4xx" /> tag which overrides the status
  // code.
  let statusCode = response.status();
  const newStatusCode = await page
    .$eval('meta[name="render:status_code"]', element =>
      parseInt(element.getAttribute('content') || '')
    )
    .catch(() => undefined);

  // On a repeat visit to the same origin, browser cache is enabled, so we may
  // encounter a 304 Not Modified. Instead we'll treat this as a 200 OK.
  if (statusCode === 304) {
    statusCode = 200;
  }

  // Original status codes which aren't 200 always return with that status
  // code, regardless of meta tags.
  if (statusCode === 200 && newStatusCode) {
    statusCode = newStatusCode;
  }

  // Remove script & import tags.
  await page.evaluate(stripPage);

  // Serialize page.
  const result = await page.evaluate('document.firstElementChild.outerHTML');

  await page.close();
  return { status: statusCode, content: result };
};

module.exports = prerender;
