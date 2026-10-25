import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, cp, readFile, writeFile, access, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import profile from '../src/data/profile.json' with {type: 'json'};
import {books} from '../src/data/books.js';

const execute = promisify(execFile);
const project = fileURLToPath(new URL('..', import.meta.url));

test('navigation is a horizontal top bar with education and work retained on Home', async () => {
  const app = await readFile(path.join(project, 'src/App.jsx'), 'utf8');
  const home = await readFile(path.join(project, 'src/components/Home.jsx'), 'utf8');
  assert(!app.includes("['education', 'Education'"));
  assert(!app.includes("['experience', 'Work Experience'"));
  assert.match(home, /home-education-summary/);
  assert.match(home, /home-work-summary/);
  assert.match(app, /id=\{activeSection\}/);
  assert.match(app, /className="top-navigation"/);
  assert.match(app, /<Stack direction="row"/);
  assert(!app.includes('Open navigation'));
  assert(!app.includes('<Drawer'));
  assert(!app.includes('site-footer'));
});

test('Projects use the shared rounded social-link pills and keep Watch Demo muted', async () => {
  const projects = await readFile(path.join(project, 'src/components/Projects.jsx'), 'utf8');
  const shared = await readFile(path.join(project, 'src/components/Shared.jsx'), 'utf8');
  assert.match(projects, /<PillLink/);
  assert.match(shared, /export function PillLink/);
  assert.match(projects, /label: 'Repository'/);
  assert.match(projects, /label: 'Watch Demo'[\s\S]*tone: 'muted'/);
  assert.match(projects, /label: 'Resume'/);
  assert(!projects.includes('ArrowOutward'));
});

test('Games navigation has a gold shimmer and a reduced-motion fallback', async () => {
  const app = await readFile(path.join(project, 'src/App.jsx'), 'utf8');
  const css = await readFile(path.join(project, 'src/styles.css'), 'utf8');
  assert.match(app, /id === 'games' \? '#e7bc61'/);
  assert.match(app, /!reducedMotion && <animateTransform/);
  assert.match(css, /@keyframes games-menu-shimmer/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*games-menu-label[\s\S]*animation:none/);
});

test('Microsoft full-time experience includes L60 promotion and internal awards', () => {
  const microsoft = profile.jobs.find(job => job.company === 'Microsoft' && !/intern/i.test(job.role));
  const promotion = microsoft.homeHighlights.find(point => point.includes('L60'));
  assert(promotion);
  assert.match(promotion, /September 2024/);
  assert.match(promotion, /multiple internal awards/);
});

test('profile heading and introduction use the requested wording', async () => {
  const home = await readFile(path.join(project, 'src/components/Home.jsx'), 'utf8');
  assert(home.includes('>Software Engineer</Typography>'));
  assert(home.includes('Currently working as a Full Stack SDE2 at **Uber**. Previously at **Microsoft**. Me and my AI coding agents work on scaling backend systems, building user-friendly frontends and improving customer experience.'));
  assert.match(home, /data-testid="profile-intro"[^>]+fontWeight: 400/);
  assert(!home.includes('M365'));
  assert(!home.includes('Software Engineer II at Uber'));
  assert(!home.includes('Previously at Microsoft. I work on backend systems, developer tools, and frontend architecture.'));
});

test('real reading list has ten books and one correctly identified article, with local covers', async () => {
  assert.equal(books.length, 11);
  assert.equal(books.filter(book => book.category === 'tech').length, 4);
  assert.equal(books.filter(book => book.category === 'non-tech').length, 7);
  assert.equal(books.filter(book => book.type === 'Article').length, 1);
  for (const book of books) {
    assert(book.author && book.description && book.url && !book.sample);
    await access(path.join(project, 'public', book.cover));
  }
  assert.equal(books.find(book => book.type === 'Article').url, 'https://overreacted.io/react-as-a-ui-runtime/');
});

test('project order includes RISC-V above PG plus GameDome, without Johnson or website easter eggs', () => {
  assert.deepEqual(profile.projects.map(p => p.title), [
    'DevAssist MCP Server', 'Gmail File System', 'RISC-V Simulator', 'PG Admissions Portal', 'GameDome'
  ]);
  assert(profile.projects.every(p => !/2 states|what.s your angle|johnson/i.test(p.title)));
  assert.equal(profile.projects[4].url, 'https://github.com/aneeketMangal/theGameDome');
  assert.equal(profile.projects[2].url, 'https://github.com/aneeketMangal/RISC-V_Simulator');
});

test('games are imported eagerly, not through fragile delayed game chunks', async () => {
  const app = await readFile(path.join(project, 'src/App.jsx'), 'utf8');
  const games = await readFile(path.join(project, 'src/components/Games.jsx'), 'utf8');
  assert(!/\blazy\s*\(|\bimport\s*\(/.test(app + games));
  assert.match(games, /import StatesGame from/);
  assert.match(games, /import AngleGame from/);
  assert.match(games, /<GameBoundary/);
});

test('publishing keeps old assets for open tabs and rejects an incomplete entry point', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-publish-'));
  try {
    await mkdir(path.join(root, 'scripts'));
    await mkdir(path.join(root, 'dist/assets'), {recursive: true});
    await cp(path.join(project, 'scripts/publish.mjs'), path.join(root, 'scripts/publish.mjs'));
    await writeFile(path.join(root, 'dist/assets/old-game.js'), 'original game asset');
    await writeFile(path.join(root, 'dist/index.html'), '<div id="root"></div><script src="assets/old-game.js"></script>');
    const runPublish = () => execute(process.execPath, [path.join(root, 'scripts/publish.mjs')]);

    async function stage(name) {
      await mkdir(path.join(root, '.build/assets'), {recursive: true});
      const html = `<div id="root"></div><script src="assets/${name}.js"></script>`;
      await writeFile(path.join(root, '.build/index.html'), html);
      await writeFile(path.join(root, `.build/assets/${name}.js`), `asset ${name}`);
      return html;
    }
    const first = await stage('new-page');
    await runPublish();
    assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), first);
    assert.equal(await readFile(path.join(root, 'dist/assets/old-game.js'), 'utf8'), 'original game asset');
    await access(path.join(root, 'dist/assets/new-page.js'));

    const second = await stage('another-update');
    const publishing = runPublish();
    for (let i = 0; i < 100; i++) {
      const visible = await readFile(path.join(root, 'dist/index.html'), 'utf8');
      assert(visible === first || visible === second, 'An incomplete HTML entry point became visible');
    }
    await publishing;
    assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), second);
    await access(path.join(root, 'dist/assets/new-page.js'));
    await access(path.join(root, 'dist/assets/old-game.js'));

    await mkdir(path.join(root, '.build'), {recursive: true});
    await writeFile(path.join(root, '.build/index.html'), 'incomplete build');
    await assert.rejects(runPublish());
    assert.equal(await readFile(path.join(root, 'dist/index.html'), 'utf8'), second);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
