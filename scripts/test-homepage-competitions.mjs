import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';

const captureBefore = process.argv.includes('--capture-before');
const screenshots = process.env.SCREENSHOT_DIR || path.join(tmpdir(), 'grip-homepage-screenshots');
const root = path.resolve('dist');
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    else if (!path.extname(pathname)) pathname += '/index.html';
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) throw new Error('Invalid path');
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const pageErrors = [];
  async function openPage(date, timezone = 'America/Los_Angeles', width = 1280) {
    const page = await browser.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewport({ width, height: 900 });
    await page.emulateTimezone(timezone);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.url().includes('vimeo.com')) request.abort();
      else request.continue();
    });
    await page.evaluateOnNewDocument((now) => {
      const RealDate = Date;
      window.__competitionNow = now;
      window.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [window.__competitionNow])); }
        static now() { return window.__competitionNow; }
      };
      const realTimeout = window.setTimeout;
      const realClearTimeout = window.clearTimeout;
      window.__competitionTimers = new Map();
      let timerId = -1;
      window.setTimeout = (callback, delay, ...args) => {
        if (delay >= 1000) {
          const id = timerId--;
          window.__competitionTimers.set(id, { callback, delay });
          return id;
        }
        return realTimeout(callback, delay, ...args);
      };
      window.clearTimeout = (id) => {
        window.__competitionTimers.delete(id);
        realClearTimeout(id);
      };
    }, Date.parse(date));
    await page.goto(url, { waitUntil: 'networkidle0' });
    return page;
  }
  const visible = (page) => page.$$eval('[data-homepage-competition]', (buttons) => buttons
    .filter((button) => getComputedStyle(button).display !== 'none')
    .map((button) => ({ id: button.dataset.homepageCompetition, text: button.textContent.trim(), href: button.getAttribute('href') })));

  if (!captureBefore) {
    for (const timezone of ['America/Los_Angeles', 'Asia/Tokyo']) {
      for (const [date, ids, details] of [
        ['2026-10-12T00:00:00Z', ['king-kong-grip-2026', 'hobart-hoist-2027'], null],
        ['2026-10-23T13:00:00Z', ['king-kong-grip-2026', 'hobart-hoist-2027'], 'king-kong-grip-2026'],
        ['2026-10-24T12:59:59.999Z', ['king-kong-grip-2026', 'hobart-hoist-2027'], 'king-kong-grip-2026'],
        ['2026-10-24T13:00:00Z', ['hobart-hoist-2027'], null],
        ['2027-01-29T13:00:00Z', ['hobart-hoist-2027'], 'hobart-hoist-2027'],
        ['2027-01-30T12:59:59.999Z', ['hobart-hoist-2027'], 'hobart-hoist-2027'],
        ['2027-01-30T13:00:00Z', [], null],
      ]) {
        const page = await openPage(date, timezone);
        const buttons = await visible(page);
        assert.deepEqual(buttons.map((button) => button.id), ids, `${date} in ${timezone}`);
        for (const button of buttons) {
          assert.match(button.text, button.id === details ? /Details$/ : /Sign-up$/);
          if (button.id === details) assert.equal(button.href, `/competition-calendar#${button.id}`);
        }
        assert.equal(await page.$eval('#homepage-competition-calendar', (element) => element.hidden), ids.length > 0);
        assert.ok(await page.$('a[href="/2026-championship"]'));
        await page.close();
      }
    }

    const page = await openPage('2026-10-23T12:59:00Z');
    assert.ok(await page.evaluate(() => [...window.__competitionTimers.values()].some((timer) => timer.delay === 60000)));
    await page.evaluate(() => {
      window.__competitionNow = Date.parse('2026-10-23T13:00:00Z');
      for (const { callback } of [...window.__competitionTimers.values()]) callback();
    });
    assert.match((await visible(page))[0].text, /Details$/);
    assert.equal(await page.$eval('[data-homepage-competition]', (button) => button.hasAttribute('target')), false);
    await page.evaluate(() => {
      window.__competitionNow = Date.parse('2026-10-24T13:00:00Z');
      for (const { callback } of [...window.__competitionTimers.values()]) callback();
    });
    assert.deepEqual((await visible(page)).map((button) => button.id), ['hobart-hoist-2027']);
    await page.evaluate(() => {
      window.__competitionNow = Date.parse('2027-01-30T13:00:00Z');
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    assert.deepEqual(await visible(page), []);
    await page.evaluate(() => {
      window.__competitionNow = Date.parse('2026-10-12T00:00:00Z');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal((await visible(page)).length, 2);
    await page.close();

    const noScript = await browser.newPage();
    await noScript.setJavaScriptEnabled(false);
    await noScript.goto(url, { waitUntil: 'domcontentloaded' });
    assert.deepEqual(await visible(noScript), []);
    assert.equal(await noScript.$eval('#homepage-competition-calendar', (element) => getComputedStyle(element).display !== 'none'), true);
    await noScript.close();

    const calendar = await browser.newPage();
    await calendar.goto(`${url}/competition-calendar#hobart-hoist-2027`, { waitUntil: 'domcontentloaded' });
    assert.equal(await calendar.$eval('#hobart-hoist-2027 a', (link) => link.href), 'https://strongforlife.online/hobart-hoist');
    await calendar.close();
    console.log('PASS: one build, all expiry dates, visitor timezones, midnight timer, page restoration, tab visibility, no-JS fallback, and calendar link.');
  }

  await mkdir(screenshots, { recursive: true });
  for (const theme of ['calibrated', 'outback']) {
    for (const [name, width] of [['desktop', 1280], ['mobile', 390]]) {
      const page = await openPage('2026-10-12T00:00:00Z', 'Australia/Hobart', width);
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const section = await page.$(captureBefore ? 'main > section:nth-of-type(2)' : '#homepage-event-actions');
      assert.ok(section);
      await section.screenshot({ path: path.join(screenshots, `${captureBefore ? 'before' : 'after'}-${theme}-${name}.png`) });
      if (!captureBefore) {
        const bounds = await page.$$eval('[data-homepage-competition]', (buttons) => buttons.map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: rect.width, scrollWidth: button.scrollWidth, y: rect.y, bottom: rect.bottom };
        }));
        assert.ok(bounds.every((rect) => rect.scrollWidth <= rect.width + 1), 'button text fits');
        assert.ok(bounds[1].y > bounds[0].bottom, 'Hobart appears below King Kong');
      }
      await page.close();
    }
  }
  assert.deepEqual(pageErrors, []);
  console.log(`Screenshots: ${screenshots}`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
