const assert = require('assert');
const { chromium } = require('playwright');

const sel = id => `[data-test="${id}"]`;
const reviewComment = 'This is my comment.';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  await page.goto(`${process.env.ENDPOINT}/login`);

  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click(`[data-provider-id="${process.env.CI_PROVIDER_ID}"]`)
  ]);

  await popup.waitForLoadState('domcontentloaded');

  await popup.waitForSelector('#email');
  await popup.type('#email', process.env.CI_USER_ID);
  await popup.waitForSelector('#pass');
  await popup.type('#pass', process.env.CI_USER_PASS);
  await popup.keyboard.press('Enter');

  await page.waitForSelector(sel('create-resource-button'));
  await page.click(sel('create-resource-button'));
  await page.click(sel('create-review-button'));
  await page.type(sel('place-name-input'), '弘前 りんご公園');
  await page.waitForSelector(sel('place-list-item'));
  await page.click(sel('place-list-item'));
  await page.waitForSelector(sel('review-comment-input'));
  await page.click(sel('review-comment-input'));
  await page.type(sel('review-comment-input'), reviewComment);
  await page.click(sel('map-select'));
  await page.click(sel('map-item'));
  await page.waitForSelector(sel('save-review-button'));
  await page.click(sel('save-review-button'));
  await page.waitForSelector(sel('review-card-comment'));

  assert.deepEqual(
    reviewComment,
    await page.$eval(sel('review-card-comment'), node => node.innerText)
  );

  await page.close();
  await browser.close();
})();
