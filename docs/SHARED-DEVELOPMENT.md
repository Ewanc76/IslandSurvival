# Shared PC and Android workflow

GitHub is the editable source of truth; GitHub Pages is the hosted playtest; Google Drive holds larger source material and export packages. An Android chat can begin from START-HERE.md without inheriting a PC chat or accessing C: paths. Do not use the historical Godot continuity candidate as the current browser implementation.

## Local and cloud setup

Clone this repository and use Node 20+. No npm dependencies or setup secrets are required for the present browser preview. Run `npm test` and `npm run build`; `npm start` serves the same hub locally. The published site only contains a build allowlist, not raw reference images, Max exports or source surveys.

For Codex cloud, connect GitHub to the account and create/publish an environment for Ewanc76/IslandSurvival using web/desktop. Check commands: `npm test` and `npm run build`. Select that published environment on Android. Source upload and Pages deployment do not themselves create or select a cloud environment. Availability/access may require account UI setup.

Official instructions: https://learn.chatgpt.com/docs/cloud . Site deployment: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages .

## Change and release practice

Start from current main; one bounded change per branch. Run tests, review changed files and record validation. Merge only when authorized. A merge to main triggers tests and Pages deployment; no public preview is promised until that deployment succeeds and its URL is checked. Do not overwrite a working PC file from an old phone download.

Record human playtests with device and actual observation. A 60 FPS PC screenshot and mobile emulation do not prove Galaxy A16 performance. Preserve terrain coordinates and generated-data provenance. Keep original survey material and older exported versions rather than silently replacing them.

## Large material

The current small section height data is checked in so cloud tasks can run without Drive access. Full-atoll inputs/export packages live in the private Drive asset folder linked in ASSETS.md. Use account-authorized connector access or download them explicitly for generation work; do not make private material public merely to make a script convenient. Max and other desktop DCC work remains on PC, while its inputs and resulting packages can be stored centrally.
