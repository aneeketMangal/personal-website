# Project context — Aneeket Mangal’s personal website

Updated: October 25, 2026 (Asia/Kolkata).

This is the handoff for the **current personal website**, not the earlier standalone game prototypes. The latest requested changes are implemented. The source files are authoritative; do not restore older designs from historical compiled assets.

## 1. Stack and entry points

- React 19.3.0, Material UI / Material Icons 9.5.0, Emotion, Vite 8.3.4.
- D3 7.9.0 and topojson-client 3.1.0 power the India map.
- Self-hosted variable Manrope font. Dark theme; larger, readable type.
- `index.html` → `src/main.jsx` → `src/App.jsx`.
- Exact direct dependencies and scripts: `package.json`; resolved dependencies: `package-lock.json`.
- No app backend, analytics, accounts, runtime game API, or external font requests.

## 2. Current layout and navigation

One continuous scrolling page. Navigation scrolls to anchors rather than replacing pages.

| Menu label | Anchor |
| --- | --- |
| Home | `#home` |
| Education | `#education` |
| Work Experience | `#experience` |
| Projects | `#projects` |
| Games | `#games` |
| Library | `#library` |

Education and Work Experience are nested sections inside Home. Internships are a separate section below full-time work, before Projects. Scroll-spy navigation follows whichever section is visible.

- At widths **900px and above**: vertically centered, background-free menu on the **right**.
- Below 900px: a top-right **hamburger** opens a right-hand drawer with all six labeled links. Selecting a link closes the drawer and scrolls to the section.
- The Games item is **gold**, including its icon and label, with a slow shimmer. Reduced-motion preferences disable the animation and keep it static gold.
- The old left sidebar, duplicate sidebar identity/photo, standalone CV section, and bottom name/email footer have been removed.
- Email remains available in the main profile’s social/contact buttons.
- Keep copy direct; no taglines such as “Systems at scale”, “Small things that make life better”, or “Useful, from the ground up”.

## 3. Profile: exact current wording

Heading beneath the person’s name:

> Software Engineer

Introduction, in **normal weight**, with **only Uber and Microsoft bold**:

> Currently working as a Full Stack SDE2 at **Uber**. Previously at **Microsoft**. Me and my AI coding agents work on scaling backend systems, building user-friendly frontends and improving customer experience.

Do not re-add “M365” or make the whole introduction bold. Keep the user’s wording, including “Me and my AI coding agents”.

- Photo: `public/assets/profile-photo.jpg`, configured in `src/components/Shared.jsx`.
- The supplied portrait also matched the user’s public GitHub avatar; the matching copy was used locally.
- GitHub: https://github.com/aneeketMangal
- LinkedIn: https://www.linkedin.com/in/aneeketmangal/
- Email: aneeketmangal@gmail.com
- Resume button: https://drive.google.com/file/d/1QctsHCG83CnhnHtt3D_zHy4kSPafeu7g/view?usp=sharing
- The Resume link opens a new tab. There is no generated CV PDF in the current public assets.
- Do not add the phone number from the original resume.

## 4. Education, jobs and internships

`src/data/profile.json` holds the facts; `homeHighlights` are the concise displayed bullets.

- Education comes **above Work Experience**: IIT Ropar, B.Tech in Computer Science & Engineering, 2019–2023.
- Full-time work: Uber (Software Engineer II, Oct 2025–Present), then Microsoft (Software Engineer, Jul 2023–Oct 2025).
- Separate Internships section: Curer (Nov 2022–Feb 2023), Microsoft (May 2022–Jul 2022).
- Microsoft full-time entry includes **promotion to L60 in September 2024** and **multiple internal awards**. Do not invent award names.
- Preserve qualifiers in resume-derived claims, especially **projected** improvements and **estimated** savings.
- Month names/abbreviations use title case, e.g. `Oct 2025 — Present`, not all caps.
- Logos are original identity assets and have **no added circular or boxed frames**. Uber/Microsoft were downloaded; Curer assets came from the user-supplied official site, https://www.curer.app/. IIT Ropar artwork was supplied by the user and prepared with a transparent surrounding field.

## 5. Projects and destination pills

Current order, intentionally preserved:

1. DevAssist MCP Server — Resume link.
2. Gmail File System — GitHub repository.
3. RISC-V Simulator — GitHub repository; collaborative academic project.
4. PG Admissions Portal — Watch Demo link.
5. GameDome — GitHub repository: https://github.com/aneeketMangal/theGameDome

- RISC-V must remain **above PG Admissions Portal**.
- **Johnson’s Algorithm was removed**.
- The user explicitly requested **GameDome as a project**, overriding its earlier exclusion. It is a separate Flutter arcade application, not the two website games.
- GameDome description was checked against its public README: Flutter arcade-game collection, authentication, local persistence, animations, and global chat using a Flask REST API. Avoid inventing new features or achievements.
- **2 States and What’s Your Angle are NOT projects**. They remain only in Games.
- The earlier request to add Probable was withdrawn; do not add it.

Project rows are static `article` elements, with a single explicit action pill rather than a whole-row anchor or an outward-link arrow. This avoids nested interactive links.

`PillLink` in `src/components/Shared.jsx` is shared by profile social buttons and project actions:

- Repository: original GitHub icon, dark GitHub-style rounded pill.
- Watch Demo: play icon, **muted blue-gray**, not the bright LinkedIn blue.
- Resume: document icon, mint outline pill.

Labels must make the destination clear. All these external actions use a new tab with `noopener noreferrer`.

## 6. Library: real list, no placeholders

`src/data/books.js` contains 11 reading-list entries. `public/books/` has local cover thumbnails and the article’s custom typographic cover.

### Tech

- High Performance Browser Networking — Ilya Grigorik.
- React as a UI Runtime — Dan Abramov; **article**, not a book: https://overreacted.io/react-as-a-ui-runtime/
- Designing Data-Intensive Applications — Martin Kleppmann.
- Understanding Distributed Systems — Roberto Vitillo.

The user wrote “Designing data intensive algorithms”; it was interpreted as Designing Data-Intensive Applications, and that assumption was explicitly communicated. The displayed cover is the first-edition cover from the author’s site.

### Non-tech

- Frankenstein — Mary Shelley.
- Kafka on the Shore — Haruki Murakami.
- The Metamorphosis — Franz Kafka.
- Of Mice and Men — John Steinbeck.
- Fahrenheit 451 — Ray Bradbury.
- Catch-22 — Joseph Heller.
- Piranesi — Susanna Clarke.

Two wooden shelves, Tech and Non-tech, show pastel upright spines and horizontal stacks. Clicking a spine pulls it outward before opening a Material UI modal with cover, author, short neutral description and an official reading/detail link. Mobile shelves scroll horizontally. Focus returns to the book on close. Reduced motion is respected.

Do not invent personal notes or ratings. Optional `note` values can be added later if the user supplies them. Cover/source credits are in `THIRD_PARTY_NOTICES.md`; thumbnails are not licensed as site code.

## 7. Games and the important crash fix

Games open **inline** inside Games, leaving the rest of the page present. Deep links `#games/2-states` and `#games/angle` are supported.

### 2 States

- Connect two Indian regions using shared land borders and state autocomplete.
- Random routes, sequential hints, reveal route, and new-route control.
- 36 regions: 28 states and 8 union territories. Islands have no land routes.
- Puducherry uses its Tamil Nadu connection only, avoiding shortcuts through remote enclaves.
- Map data: geoBoundaries / DataMeet / ECI, CC BY 2.5 India. See included notices. Boundaries are for gameplay, not authoritative legal/political statements.
- No external game branding, logo, world grid, share button, daily/practice modes, statistics page or leaderboard.
- Current round storage key: `aneeket:2states:round:v2`.

### What’s Your Angle

- Match the target by dragging a handle clockwise from the gray starting line.
- **Four attempts**; within **±5 degrees** wins.
- Exact estimate is visually hidden until locked; the target ray appears only after completion.
- Pointer/touch and keyboard controls; current round persists locally.
- Storage key: `aneeket:angle:round:v1`.
- Touch action is disabled on the dial to prevent the browser cancelling the drag for page scrolling.

### Do not undo the loading/release fix

The prior lazy-loaded game files could disappear during a rebuild. A cached tab then failed to fetch its old game chunk and React unmounted the whole page. This failure was reproduced.

Current protections:

1. Both games and Library are **eagerly imported** with the page. Opening a game never requests an additional game JavaScript chunk.
2. `GameBoundary` contains a game-only render error and offers retry/reset without blanking the website.
3. Invalid saved JSON or unavailable localStorage falls back safely.
4. `npm run build` builds into `.build/`, then `scripts/publish.mjs` copies assets and atomically replaces `dist/index.html`.
5. Previous hashed assets are intentionally retained in `dist/assets/` for already-open tabs. **Do not empty the live `dist/` during a build.** Its older hashed files may contain earlier copy/designs; current source and current `index.html` are authoritative.
6. A real browser tab opened before deployment was verified to load both old-version games after deployment.

## 8. Main files

- `src/App.jsx`: layout, six navigation anchors, scroll spy, hamburger/drawer, inline game selection.
- `src/components/Home.jsx`: exact profile copy, Education, Work Experience, Internships.
- `src/components/Projects.jsx`: project rows and action mapping.
- `src/components/Shared.jsx`: shared `PillLink`, social links, resume URL, portrait, logos, rich emphasis.
- `src/components/Games.jsx`, `GameBoundary.jsx`: inline game gallery and error recovery.
- `src/components/Library.jsx`: shelves, book animation and modal.
- `src/data/profile.json`, `books.js`: editable content.
- `src/games/`: engines, UI components and map renderer.
- `src/data/india-*.json`: geographic topology, region graph and source attribution.
- `src/theme.js`, `src/styles.css`: typography, dark palette, responsive styles, gold shimmer.
- `public/assets/`, `public/brands/`, `public/books/`, `public/licenses/`: self-hosted assets/notices.
- `scripts/publish.mjs`: safe build publishing.
- `tests/`: Node unit tests and Playwright browser acceptance checks.

## 9. Run, build and test

Use Node.js 22.12+; the development environment used Node 22.22.2 and npm 10.9.7.

```sh
npm ci
npm run dev -- --port 11002

npm run build
npm run preview -- --port 11002

npm test
npx playwright-core install chromium
# With a server already running:
TEST_URL=http://127.0.0.1:11002/ npm run test:browser
```

`CHROME_BIN` may point to an existing Chromium executable; `TEST_OUTPUT` selects the output directory. `TEST_ALL_REGIONS=1` enables the extended map endpoint matrix.

For simply viewing the already-built site without installing Node dependencies:

```sh
python3 -m http.server 11002 --directory dist
```

Use HTTP, not `file://`. Vite’s base is `./`, needed for the forwarded URL prefix. Do not change it to an absolute root without reviewing hosting requirements.

### Dependency portability

The complete archive includes the installed `node_modules` directory as requested. Those packages include Linux-specific native bindings. On another operating system, run `npm ci` to reinstall the correct platform dependencies rather than relying on the bundled installation. Browser executables live outside this project and are not bundled; install Chromium for browser tests.

The lockfile was created using an internal npm mirror (`unpm.uberinternal.com`). If unavailable on a different network, configure an accessible registry or regenerate a lockfile from the pinned `package.json` using that registry. Do not copy or share npm/SSO credentials.

## 10. Current preview and verification

Original environment serves `dist/` on port **11002**:

https://devpod-mumbai.uberinternal.com/proxy/aneeketmangal-go2/11002/

This is a temporary environment-specific preview requiring Uber SSO; it is not a permanent public deployment. No authentication tokens are in this project or handoff.

Latest verification:

- **19 Node unit tests passed**.
- Full browser acceptance checks passed at widths 320, 360, 390, 650, 768, 1024 and 1500.
- Real emulated touch input checked with iPhone SE, iPhone 13 and Pixel 5 device profiles (Chromium, not a claim of native Safari testing).
- Both games worked inline/offline after the initial page load, and survived corrupted or disabled storage.
- All 11 reading-list covers/modals and their source links were checked.
- Six-link desktop/mobile navigation, Education/Work targets, destination pills, muted Watch Demo, GameDome and footer removal were checked.
- A deliberate game-rendering fault was contained and successfully retried.
- Latest forwarded preview was checked for these changes, with no unexpected runtime errors.

The `validation/` folder contains a fresh unit-test log, the most recent browser summary, the open-tab deployment regression result, and representative screenshots.

## 11. Export scope

The archives contain this website project, including its source, assets, build, tests, documentation and this `context.md`. The complete ZIP additionally includes all installed dependencies and every current project file, including intentionally retained older build assets. The smaller portable ZIP omits only `node_modules/` and can be restored with `npm ci`.

Earlier standalone prototype folders, external attachments, original resume PDF, scratch downloads, browser binaries and environment logs outside this project are not part of the current application and are not included.
