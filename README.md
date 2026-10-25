# Aneeket Mangal — personal website

A responsive, dark personal site built with React and Material UI. It is one continuous page: Home (profile, Education, Work Experience, Internships), Projects, Games, and Library. A background-free navigation rail is fixed at the right, vertically centered. It has icons and labels on larger screens; smaller screens use a hamburger button opening a right-hand drawer. The six links are Home, Education, Work Experience, Projects, Games, and Library. Links scroll to section anchors; the active item follows the current scroll position. There are no separate section pages, duplicated project lists, or name/email footer. The Games navigation item stays gold and has a slow shimmer on its label and icon; reduced-motion preferences show static gold.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev -- --port 11002
```

The production bundle works under a forwarded URL prefix as well as at a domain root:

```sh
npm run build
npm run preview -- --port 11002
```

`dist/` is the deployable static site. Production builds first go to `.build/`; `scripts/publish.mjs` copies assets before atomically replacing the entry point and keeps previous hashed assets for already-open tabs. Use an HTTP server; opening `index.html` directly as a `file://` URL is not supported.

## Personalize

- **Profile and project content:** `src/data/profile.json`.
- **Profile photo:** add a photo under `public/assets/`, then set `profilePhoto` in `src/components/Shared.jsx` to its relative path, for example `assets/profile-photo.jpg`. The supplied portrait is already configured on the Home page; there is no duplicate sidebar identity block. Set `profilePhoto` to `null` if you want to return to a placeholder.
- **Social buttons:** URLs and GitHub/LinkedIn pill styling are in `src/components/Shared.jsx`.
- **Theme/font:** `src/theme.js` and `src/styles.css`. Manrope is self-hosted, with no Google Fonts request at runtime.
- **Company/institute logos:** `public/brands/`. Uber and Microsoft assets were downloaded; Curer’s mark is from the official site supplied by the user. The IIT Ropar artwork is the user-provided image, trimmed and resized with its black surrounding field made transparent. No added frames.
- **Library:** the supplied list is in `src/data/books.js`: three tech books, one tech article, and seven non-tech books. Covers are self-hosted in `public/books/`; modals have authors, short descriptions, and official reading/detail links. The article is identified as such. Add optional `note` fields for personal notes; none have been invented. Books can be upright or `stacked: true`, with width/height controlling spine dimensions.
- **Job details:** `homeHighlights` in each job record supply the concise resume-based bullet points. Full-time jobs and internships are grouped separately; month abbreviations use title case (e.g. Oct, Nov).

## Resume

The Home page has a Resume button linking to the user's Google Drive resume in a new tab. Change `urls.resume` in `src/components/Shared.jsx` to update the button. DevAssist's project entry also links to that resume because it has no public repository; update its URL in `src/data/profile.json` at the same time. Education and Work Experience stay on Home, with Education first. There is no separate CV tab or generated CV PDF. Legacy `#cv` bookmarks safely display Home.

## Projects

The single Projects list contains DevAssist MCP Server, Gmail File System, RISC-V Simulator, PG Admissions Portal, and GameDome, in that order. Johnson’s Algorithm has been removed. The user explicitly requested GameDome (the separate Flutter project) here; 2 States and What’s Your Angle remain only in Games. Each project uses a labeled Resume, Repository, or Watch Demo pill via the same `PillLink` component as the profile’s social links. Watch Demo uses a muted blue-gray tone. Project entries are defined in `src/data/profile.json`.

## Games

The games appear only under Games and share the website’s components, colors and typography. Selecting a game opens it inline without replacing Home, Projects, or Library. `#games/2-states` and `#games/angle` deep links still work. Both games are imported with the initial app: opening them never requests a delayed game chunk that might have been removed during an update. `GameBoundary` contains any game-specific render error and offers retry/reset controls without blanking the site. Invalid JSON and unavailable browser storage fall back to a fresh round.

- **2 States:** a random pair of Indian regions, shared-land-border routing, state autocomplete, sequential hints, and a new-route control. It has no daily/practice modes, sharing, leaderboard, external game branding or world grid. 36 regions (28 states and 8 union territories) are represented. Islands have no land routes; Puducherry connects only through Tamil Nadu so its remote enclaves do not create shortcuts. The route graph is in `src/data/india-regions.json`; boundaries are in `src/data/india-states.topo.json`.
- **What’s Your Angle:** estimate a clockwise angle by dragging the handle. Four attempts, within ±5° wins. Numeric estimates are displayed only after submission. The handle also supports keyboard arrows, Shift+arrows, Page Up/Down, Home and End.

Both games save the current round in browser localStorage only. There are no accounts, analytics, tracking or game APIs. Library animations respect reduced-motion preferences.

## Test

```sh
npm test
npx playwright-core install chromium
# With a local server already running:
TEST_URL=http://127.0.0.1:11002/ npm run test:browser
```

Optional environment variables: `CHROME_BIN` for an existing Chromium executable; `TEST_OUTPUT` for screenshots and a JSON test summary. Browser checks cover the transparent centered right menu, job/internship sections, title-case month formatting, all 11 cover modals, 320–1500px layouts, project order, original logos, pills, anchor scrolling and scroll-spy navigation, the external resume link, both games (including offline opening and every land-connected map endpoint), corrupt/disabled storage, retryable game failures, real touch dragging on three device profiles, and the book animation/modal. Unit tests also check that publishing retains old assets for open tabs and never replaces a good page with an incomplete build.

See `THIRD_PARTY_NOTICES.md` and `public/licenses/` for third-party and geographical-data attribution. No affiliation with or endorsement by the displayed companies/institute is implied.

For the optional full map endpoint matrix: `TEST_ALL_REGIONS=1 npm run test:browser`.
