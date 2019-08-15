const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

const endorse = async ({ person, page }) => {
  await page.goto(person);
  for (let i = 0; i < 8; i++) {
    await page.evaluate(_ => {
      window.scrollBy(0, window.innerHeight);
    });
    await page.waitFor(500);
  }

  await page.waitFor('button[aria-controls="skill-categories-expanded"]');
  await page.click('button[aria-controls="skill-categories-expanded"]');

  const buttons = await page.$$('button.pv-skill-entity__featured-endorse-button-shared[aria-pressed="false"]');
  for (let button of buttons) {
    await button.click();
    await page.waitFor(2000);
  }
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  try {
    const page = await browser.newPage();
    await page.goto('https://linkedin.com');
    await page.screenshot({ path: 'example.png' });

    await page.waitFor('input[name="session_key"]');
    await page.type('input[name="session_key"]', process.env.EMAIL);
    await page.type('input[name="session_password"]', process.env.PASSWORD);

    await page.click('button.sign-in-form__submit-btn');
    await page.waitFor(2000);

    const lines = fs.readFileSync('./kudos.txt', 'utf8');
    const people = lines.split(/\r\n|\r|\n/).filter(l => l);
    for (let person of people) {
      await endorse({ person, page });
    }

    await browser.close();
  } catch (e) {
    await browser.close();
    console.log('Error:', e.stack);
  }
})();
