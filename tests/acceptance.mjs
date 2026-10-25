import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium, devices} from 'playwright-core';
import {books} from '../src/data/books.js';
import {regions, shortest} from '../src/games/states-engine.js';

const base = (process.env.TEST_URL || 'http://127.0.0.1:11002/').replace(/\/?$/, '/');
const artifacts = process.env.TEST_OUTPUT || path.resolve('test-results');
await fs.mkdir(artifacts, {recursive: true});
const browser = await chromium.launch({
  ...(process.env.CHROME_BIN ? {executablePath: process.env.CHROME_BIN} : {}),
  args: ['--no-sandbox']
});
const errors = [], failures = [], checks = [];
const record = label => {checks.push(label); console.log(`PASS ${label}`);};
const storageAngle = 'aneeket:angle:round:v1', storageStates = 'aneeket:2states:round:v2';
const resumeURL = 'https://drive.google.com/file/d/1QctsHCG83CnhnHtt3D_zHy4kSPafeu7g/view?usp=sharing';
const angleFixture = {
  version: 1, target: 301, base: 90, estimate: 200, guesses: [], moved: false
};
const statesFixture = {
  version: 2, start: 'MH', end: 'RJ', max: 5, guesses: [], hints: 0,
  hintId: null, hintPath: [], status: 'playing', solution: []
};
const name = id => regions.find(r => r.id === id).name;

function monitor(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => {if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);});
}
async function route(page, hash) {
  await page.goto(`${base}#${hash}`);
  await page.getByRole('heading', {name: 'Aneeket Mangal', exact: true, level: 1}).waitFor();
  if (hash === 'games/2-states') await page.getByTestId('states-game').waitFor();
  if (hash === 'games/angle') await page.getByTestId('angle-game').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function scrollNav(page, section) {
  const mobile = await page.getByRole('button', {name: 'Open navigation'}).isVisible();
  if (mobile) {
    await page.getByRole('button', {name: 'Open navigation'}).click();
  }
  await page.getByTestId(`nav-${section}`).click();
  await page.waitForFunction(section => {
    const y = document.getElementById(section).getBoundingClientRect().top;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    return y >= 0 && (y < 130 || atBottom && y < window.innerHeight - 60);
  }, section);
  // Temporary drawers unmount their links when closed; inspect active state while open.
  if (mobile) await page.getByRole('button', {name: 'Open navigation'}).click();
  await page.waitForFunction(section => document.querySelector(`[data-testid=nav-${section}]`)?.getAttribute('aria-current') === 'location', section);
  if (mobile) {
    await page.keyboard.press('Escape');
    await page.getByRole('navigation', {name: 'Main sections'}).waitFor({state: 'hidden'});
  }
}
async function seed(page, key, value, hash) {
  await page.evaluate(({key, value}) => localStorage.setItem(key, JSON.stringify(value)), {key, value});
  // Reusing the same #hash is a same-document navigation, not a React remount.
  await page.reload();
  await route(page, hash);
}
async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({
    width: innerWidth, page: document.documentElement.scrollWidth, body: document.body.scrollWidth
  }));
  assert(size.page <= size.width + 1 && size.body <= size.width + 1, `${label}: ${JSON.stringify(size)}`);
}
async function addState(page, id) {
  const input = page.getByRole('combobox', {name: 'State or union territory'});
  await input.fill(name(id));
  await page.getByRole('option').filter({hasText: name(id)}).first().click();
  await page.getByRole('button', {name: 'Add state', exact: true}).click();
}
async function dragAngle(page, estimate, touch = false) {
  const slider = page.getByRole('slider', {name: 'Angle estimate'});
  await page.getByRole('group', {name: 'Angle dial'}).scrollIntoViewIfNeeded();
  await page.waitForTimeout(50);
  const positions = await slider.evaluate((g, estimate) => {
    const svg = g.ownerSVGElement, matrix = svg.getScreenCTM();
    const circle = g.querySelector('.handle-ring');
    const p = svg.createSVGPoint();
    p.x = +circle.getAttribute('cx'); p.y = +circle.getAttribute('cy');
    const start = p.matrixTransform(matrix);
    const {base} = JSON.parse(localStorage.getItem('aneeket:angle:round:v1'));
    p.x = 220 + Math.cos((base + estimate) * Math.PI / 180) * 180;
    p.y = 220 + Math.sin((base + estimate) * Math.PI / 180) * 180;
    const end = p.matrixTransform(matrix);
    return {start: {x: start.x, y: start.y}, end: {x: end.x, y: end.y}};
  }, estimate);
  if (touch) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{...positions.start, id: 0}]});
    for (let i = 1; i <= 10; i++) {
      const {start, end} = positions;
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{
        x: start.x + (end.x - start.x) * i / 10, y: start.y + (end.y - start.y) * i / 10, id: 0
      }]});
    }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await cdp.detach();
    await page.waitForTimeout(350);
  } else {
    await page.mouse.move(positions.start.x, positions.start.y);
    await page.mouse.down();
    await page.mouse.move(positions.end.x, positions.end.y, {steps: 15});
    await page.mouse.up();
  }
  await page.waitForFunction(estimate => document.querySelector('[role=slider]')?.getAttribute('aria-valuenow') === String(estimate), estimate);
}

try {
  const context = await browser.newContext({viewport: {width: 1500, height: 1100}});
  const page = await context.newPage(); monitor(page);
  const scripts = [];
  page.on('request', r => {if (r.resourceType() === 'script') scripts.push(r.url());});
  await route(page, 'home');
  assert.deepEqual(await page.locator('.page-section').evaluateAll(es => es.map(e => e.id)), ['home', 'projects', 'games', 'library']);
  assert.equal(await page.locator('main h1').count(), 1);
  const rail = await page.getByRole('navigation', {name: 'Main sections'}).evaluate(e => {
    const r = e.getBoundingClientRect(); return {x: r.x, center: r.y + r.height / 2, width: innerWidth, height: innerHeight, bg: getComputedStyle(e).backgroundColor};
  });
  assert(rail.x > rail.width * .8 && Math.abs(rail.center - rail.height / 2) < 2);
  assert.equal(rail.bg, 'rgba(0, 0, 0, 0)');
  assert.equal(await page.locator('[aria-labelledby=home-work] article').count(), 2);
  assert.equal(await page.locator('[aria-labelledby=home-internships] article').count(), 2);
  assert(!/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/.test(await page.locator('#home').innerText()));
  assert((await page.locator('[aria-labelledby=home-work] li').count()) >= 4);
  assert.equal(await page.locator('nav[aria-label="Main sections"] a').count(), 6);
  assert.equal(await page.getByRole('link', {name: 'CV', exact: true}).count(), 0);
  assert.equal(await page.locator('.site-navigation [aria-label="Profile photo placeholder"]').count(), 0);
  assert.equal(await page.getByRole('img', {name: 'Aneeket Mangal', exact: true}).count(), 1);
  const resume = page.getByRole('link', {name: 'Resume', exact: true});
  assert.equal(await resume.getAttribute('href'), resumeURL);
  assert.equal(await resume.getAttribute('target'), '_blank');
  assert.match(await resume.getAttribute('rel'), /noopener/);
  const style = await page.locator('body').evaluate(e => ({font: getComputedStyle(e).fontFamily, background: getComputedStyle(e).backgroundColor}));
  assert(style.font.includes('Manrope'));
  assert.equal(style.background, 'rgb(14, 18, 22)');
  const pill = await page.locator('#home a').filter({hasText: 'LinkedIn'}).evaluate(e => ({bg: getComputedStyle(e).backgroundColor, radius: parseFloat(getComputedStyle(e).borderRadius)}));
  assert.equal(pill.bg, 'rgb(98, 181, 217)');
  assert(pill.radius >= 99);
  for (const brand of await page.locator('.brand-mark').all()) {
    assert.equal(await brand.evaluate(e => getComputedStyle(e).borderTopWidth), '0px');
  }
  for (const image of await page.locator('main img').all()) assert(await image.evaluate(e => e.complete && e.naturalWidth > 0));
  assert.deepEqual(await page.locator('#projects h3').allTextContents(), ['DevAssist MCP Server', 'Gmail File System', 'RISC-V Simulator', 'PG Admissions Portal', 'GameDome']);
  assert(!/Johnson/i.test(await page.locator('main').innerText()));
  assert.equal(await page.locator('.project-row').count(), 5);
  assert.equal(await page.locator('.site-footer').count(), 0);
  const projectActions = await page.locator('#projects .project-action').allTextContents();
  assert.deepEqual(projectActions, ['Resume', 'Repository', 'Repository', 'Watch Demo', 'Repository']);
  for (const row of await page.locator('#projects .project-row').all()) {
    assert.equal(await row.evaluate(e => e.tagName), 'ARTICLE');
    assert.equal(await row.locator('a').count(), 1);
    const action = row.locator('.project-action');
    assert.equal(await action.getAttribute('target'), '_blank');
    assert.match(await action.getAttribute('rel'), /noopener/);
    assert((await action.evaluate(e => parseFloat(getComputedStyle(e).borderRadius))) >= 99);
  }
  assert.equal(await page.locator('#projects .project-action').nth(3).evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(34, 45, 56)');
  assert.equal(await page.locator('#projects .project-action').nth(1).evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(32, 37, 44)');
  const copy = await page.locator('#home, #projects').allTextContents();
  assert(!/2 States|What.s Your Angle|build games|Systems at scale|Small things that make life better|Useful, from the ground up/i.test(copy.join(' ')));
  const homeSections = await page.locator('#home h2').allTextContents();
  assert(homeSections.indexOf('Education') < homeSections.indexOf('Work Experience'));
  await page.screenshot({path: `${artifacts}/desktop-single-flow.png`, fullPage: true});
  record('One continuous page, correct project order, no Johnson/CV, original profile design and Resume link retained');

  await page.evaluate(() => {window.__samePage = 'single-flow-witness';});
  for (const id of ['education', 'experience', 'projects', 'games', 'library', 'home']) {
    await scrollNav(page, id);
    assert.equal(await page.evaluate(() => window.__samePage), 'single-flow-witness');
    assert.equal(await page.locator('.page-section').count(), 4);
  }
  await page.evaluate(() => document.getElementById('library').scrollIntoView({behavior: 'instant'}));
  await page.waitForFunction(() => document.querySelector('[data-testid=nav-library]').getAttribute('aria-current') === 'location');
  record('Navigation scrolls without replacing content; active item also follows manual scrolling');

  // Reproduce the original failure conditions: no additional JS may be fetched to play.
  const loadedScripts = scripts.length;
  await context.setOffline(true);
  await scrollNav(page, 'games');
  await page.getByRole('button', {name: 'Play 2 States', exact: true}).click();
  await page.getByTestId('states-game').waitFor();
  assert.equal(await page.locator('#projects').count(), 1);
  assert.equal(await page.locator('#library .shelf-book').count(), 11);
  await page.getByRole('button', {name: 'All games', exact: true}).click();
  await page.getByRole('button', {name: 'Play What’s Your Angle', exact: true}).click();
  await page.getByTestId('angle-game').waitFor();
  assert.equal(scripts.length, loadedScripts);
  assert.equal(await page.getByTestId('game-recovery').count(), 0);
  await context.setOffline(false);
  record('BOTH games open offline after initial load: no lazy game files and no whole-page crash');

  await seed(page, storageStates, statesFixture, 'games/2-states');
  assert.equal(await page.locator('[data-region]').count(), 36);
  assert(!/Travle|leaderboard|daily|practice|share/i.test(await page.locator('#games').innerText()));
  await page.getByRole('button', {name: 'Add state', exact: true}).click();
  await page.getByRole('status').filter({hasText: 'Choose a state'}).waitFor();
  for (const id of shortest('MH', 'RJ').slice(1, -1)) await addState(page, id);
  await page.getByText('Route complete', {exact: true}).waitFor();
  assert(await page.getByRole('combobox').isDisabled());
  await page.reload(); await page.getByText('Route complete', {exact: true}).waitFor();
  await page.screenshot({path: `${artifacts}/states-win.png`});
  await seed(page, storageStates, statesFixture, 'games/2-states');
  for (const label of ['Reveal next outline', 'Reveal route outlines', 'Show state initials']) {
    await page.getByRole('button', {name: label, exact: true}).click();
  }
  assert(await page.getByRole('button', {name: 'Hints used', exact: true}).isDisabled());
  await addState(page, 'AN');
  await page.getByRole('button', {name: 'New route', exact: true}).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('dialog').getByRole('button', {name: 'New route', exact: true}).click();
  await page.waitForFunction(() => !document.querySelector('[role=dialog]'));
  await page.getByText('0 /', {exact: false}).waitFor();
  record('2 States autocomplete, route completion, persistence, hints and restart work inline');

  if (process.env.TEST_ALL_REGIONS === '1') {
  // Check map projection/labels for every possible mainland/land-connected endpoint.
  for (const region of regions) {
    const start = ['MH', 'RJ', 'UP'].find(id => shortest(id, region.id)?.length >= 3);
    if (!start) continue;
    await seed(page, storageStates, {...statesFixture, start, end: region.id, max: shortest(start, region.id).length + 2}, 'games/2-states');
    const invalid = await page.locator('[data-region]').evaluateAll(paths => paths.some(p => /NaN|Infinity/.test(p.getAttribute('d'))));
    assert(!invalid, `Invalid projection for ${region.name}`);
    assert.equal(await page.getByTestId('game-recovery').count(), 0, `Game failed for ${region.name}`);
  }
  record('All land-connected region endpoints render without map/projection crashes');

  }
  await seed(page, storageAngle, angleFixture, 'games/angle');
  assert.equal(await page.getByTestId('target-ray').count(), 0);
  assert(await page.getByRole('button', {name: 'Lock angle', exact: true}).isDisabled());
  await dragAngle(page, 296);
  await page.getByRole('button', {name: 'Lock angle', exact: true}).click();
  await page.getByText('Matched in 1 attempt', {exact: true}).waitFor();
  assert.equal(await page.getByTestId('target-ray').count(), 1);
  await page.reload(); await page.getByText('Matched in 1 attempt', {exact: true}).waitFor();
  await page.screenshot({path: `${artifacts}/angle-win.png`});
  await seed(page, storageAngle, angleFixture, 'games/angle');
  for (const estimate of [180, 160, 140, 120]) {
    await dragAngle(page, estimate);
    await page.getByRole('button', {name: 'Lock angle', exact: true}).click();
  }
  await page.getByText('Round finished', {exact: true}).waitFor();
  assert.equal(await page.getByRole('button', {name: 'Lock angle', exact: true}).count(), 0);
  await seed(page, storageAngle, angleFixture, 'games/angle');
  await page.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('slider').getAttribute('aria-valuenow'), '201');
  await page.getByRole('button', {name: 'Lock angle', exact: true}).click();
  await page.getByText('Clockwise', {exact: true}).waitFor();
  record('Angle pointer dragging, ±5° success, four attempts, hidden answer, persistence and keyboard work inline');

  await scrollNav(page, 'library');
  assert.equal(await page.locator('.wooden-plank').count(), 2);
  assert.equal(await page.locator('.shelf-book').count(), 11);
  assert.equal(await page.locator('.horizontal-book').count(), 4);
  const book = page.getByRole('button', {name: 'Open High Performance Browser Networking'});
  await book.click();
  assert.equal(await page.locator('.is-pulling').count(), 1);
  await page.getByRole('dialog').waitFor();
  await page.getByText('Ilya Grigorik', {exact: true}).waitFor();
  await page.getByRole('img', {name: 'High Performance Browser Networking cover', exact: true}).waitFor();
  await page.screenshot({path: `${artifacts}/library-modal.png`});
  await page.getByRole('button', {name: 'Close book', exact: true}).click();
  await page.waitForFunction(() => !document.querySelector('[role=dialog]'));
  assert(await book.evaluate(e => e === document.activeElement));
  await book.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[role=dialog]'));
  for (const item of books) {
    await page.getByRole('button', {name: `Open ${item.title}`, exact: true}).click();
    await page.getByRole('dialog').waitFor();
    const cover = page.getByRole('img', {name: `${item.title} cover`, exact: true});
    await cover.waitFor();
    await page.waitForFunction(title => {const e = [...document.images].find(e => e.alt === `${title} cover`); return e?.complete && e.naturalWidth > 0;}, item.title);
    assert.equal(await page.getByRole('dialog').getByRole('link').getAttribute('href'), item.url);
    if (item.type === 'Article') assert.equal(await page.getByRole('dialog').getByText('Article', {exact: true}).count(), 1);
    await page.getByRole('button', {name: 'Close book', exact: true}).click();
    await page.waitForFunction(() => !document.querySelector('[role=dialog]'));
  }
  record('All 11 reading-list entries have working local covers, descriptions, source links and accessible animated modals');

  for (const width of [320, 360, 390, 650, 768, 1024, 1500]) {
    await page.setViewportSize({width, height: 1000});
    for (const hash of ['home', 'games/2-states', 'games/angle']) {
      await route(page, hash);
      await noOverflow(page, `${width}px ${hash}`);
      assert.equal(await page.locator('.page-section').count(), 4);
    }
  }
  await page.setViewportSize({width: 320, height: 780});
  await route(page, 'home');
  await scrollNav(page, 'projects');
  await scrollNav(page, 'games');
  await scrollNav(page, 'library');
  const scroller = page.locator('.shelf-scroll').first();
  assert(await scroller.evaluate(e => e.scrollWidth > e.clientWidth));
  await scroller.evaluate(e => {e.scrollLeft = e.scrollWidth;});
  await noOverflow(page, 'Scrolled shelf');
  await page.screenshot({path: `${artifacts}/mobile-library.png`});
  await scrollNav(page, 'home');
  await page.screenshot({path: `${artifacts}/mobile-single-flow.png`, fullPage: true});
  await seed(page, storageStates, {...statesFixture, start: 'DH', end: 'AR', max: shortest('DH', 'AR').length + 2}, 'games/2-states');
  await noOverflow(page, 'Long endpoint labels');
  record('Seven widths (320–1500), mobile scroll navigation, long region names and horizontal shelves have no overflow');
  await context.close();

  for (const device of ['iPhone SE', 'iPhone 13', 'Pixel 5']) {
    const c = await browser.newContext({...devices[device], reducedMotion: 'reduce'});
    const p = await c.newPage(); monitor(p);
    await route(p, 'games/angle');
    await seed(p, storageAngle, angleFixture, 'games/angle');
    await dragAngle(p, 296, true);
    const lock = p.getByRole('button', {name: 'Lock angle', exact: true});
    await lock.scrollIntoViewIfNeeded(); await p.waitForTimeout(200); await lock.tap();
    await p.getByText('Matched in 1 attempt', {exact: true}).waitFor();
    await scrollNav(p, 'library');
    await p.getByRole('button', {name: 'Open High Performance Browser Networking'}).tap();
    await p.getByRole('dialog').waitFor();
    await noOverflow(p, `${device} modal`);
    await c.close();
  }
  record('Real touch dragging, navigation, books and reduced motion on iPhone SE, iPhone 13 and Pixel 5');

  // A malformed stored round or denied storage access must not crash either game.
  const recoveryContext = await browser.newContext({viewport: {width: 1500, height: 1000}});
  const recovery = await recoveryContext.newPage(); monitor(recovery);
  await route(recovery, 'home');
  await recovery.evaluate(({storageStates, storageAngle}) => {
    localStorage.setItem(storageStates, '{broken JSON');
    localStorage.setItem(storageAngle, JSON.stringify({version: 1, target: null, guesses: [null]}));
  }, {storageStates, storageAngle});
  await recovery.reload();
  await route(recovery, 'games/2-states');
  await recovery.getByTestId('states-game').waitFor();
  await route(recovery, 'games/angle');
  await recovery.getByTestId('angle-game').waitFor();
  assert.equal(await recovery.getByTestId('game-recovery').count(), 0);
  await recoveryContext.close();
  const denied = await browser.newContext();
  await denied.addInitScript(() => Object.defineProperty(window, 'localStorage', {get() {throw new Error('Storage disabled');}}));
  const deniedPage = await denied.newPage(); monitor(deniedPage);
  await route(deniedPage, 'games/2-states');
  await deniedPage.getByTestId('states-game').waitFor();
  await route(deniedPage, 'games/angle');
  await deniedPage.getByTestId('angle-game').waitFor();
  await denied.close();
  record('Corrupt saved rounds and disabled browser storage recover without crashing');

  // A deliberate game-only rendering failure is contained and retryable.
  const faultContext = await browser.newContext({viewport: {width: 1500, height: 1000}});
  await faultContext.addInitScript(() => {
    const NativeObserver = window.ResizeObserver;
    window.__breakMap = true;
    window.ResizeObserver = class {
      constructor(callback) {this.observer = new NativeObserver(callback);}
      observe(node, ...args) {
        if (window.__breakMap && node.classList.contains('india-map')) throw new Error('Injected game-only failure');
        this.observer.observe(node, ...args);
      }
      unobserve(...args) {this.observer.unobserve(...args);}
      disconnect() {this.observer.disconnect();}
    };
  });
  const fault = await faultContext.newPage();
  await route(fault, 'home');
  await scrollNav(fault, 'games');
  await fault.getByRole('button', {name: 'Play 2 States', exact: true}).click();
  await fault.getByTestId('game-recovery').waitFor();
  assert.equal(await fault.locator('.page-section').count(), 4);
  assert.equal(await fault.getByRole('link', {name: 'Resume', exact: true}).count(), 1);
  await fault.evaluate(() => {window.__breakMap = false;});
  await fault.getByRole('button', {name: 'Try again', exact: true}).click();
  await fault.getByTestId('states-game').waitFor();
  assert.equal(await fault.getByTestId('game-recovery').count(), 0);
  await faultContext.close();
  record('A game-only failure leaves the entire page available and can be retried without reload');

  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  record('No unexpected JavaScript exceptions or failed HTTP assets');
  await fs.writeFile(`${artifacts}/summary.json`, JSON.stringify({checks, errors, failures}, null, 2));
} finally {
  await browser.close();
}
