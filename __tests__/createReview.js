const timeout = 100000
jest.setTimeout(100000)
const sel = id => `[data-test="${id}"]`

const reviewComment = 'This is my comment.'

describe(
  'Create review test',
  () => {
    let page
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({ width: 1280, height: 800 })
      await page.goto(`${process.env.ENDPOINT}/login`)
      await page.click(`[data-provider-id="${process.env.CI_PROVIDER_ID}"]`)
      await page.waitFor(2000)
      const pages = await global.__BROWSER__.pages()
      const popup = pages[pages.length - 1]
      await popup.waitForSelector('input[name=email]')
      await popup.type('input[name=email]', process.env.CI_USER_ID)
      await popup.waitForSelector('input[type=password]')
      await popup.type('input[type=password]', process.env.CI_USER_PASS)
      await popup.keyboard.press('Enter')
      await popup.waitFor(15000)
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it('Create Review', async () => {
      await page.waitForSelector(sel('create-review-button'))
      await page.click(sel('create-review-button'))
      await page.type(sel('place-name-input'), '弘前 りんご公園')
      await page.waitFor(2000)
      await page.waitForSelector(sel('place-list-item'))
      await page.click(sel('place-list-item'))
      await page.waitForSelector(sel('review-comment-input'))
      await page.waitFor(2000)
      await page.click(sel('review-comment-input'))
      await page.waitFor(2000)
      await page.type(sel('review-comment-input'), reviewComment)
      await page.waitFor(2000)
      await page.waitForSelector(sel('save-review-button'))
      await page.click(sel('save-review-button'))

      await page.waitForSelector(sel('review-card-comment'))
      expect(await page.$eval(sel('review-card-comment'), node => node.innerText)).toBe(reviewComment)
    })
  }, timeout
)
