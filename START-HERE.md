# Island Survival — start here

Updated 2026-10-20. This file is the short entry point for a fresh PC or Android Codex chat. Read this before the historical continuity document.

## Current work

We are developing the western half-mile (804.672 m) of Cooper/Strawn Island as an expandable terrain test, not a defined first level. Keep the island connected eastward. North shore has broad shallows; south shore meets deeper lagoon water. Low rounded sandbars, mostly flatter than 3–5°, a 2.5 m generated land cap, and occasional small erosion banks are the chosen first-pass assumptions.

**Current runnable source:** `browser/cooper-west/`. **Project home/playtest:** GitHub Pages deployment linked from the repository and Actions. Do not confuse this standalone Three.js preview with the older Godot game or the separately developed Mobile Test 08. Test 08 source has not been imported here.

**Verified:** six terrain/movement tests, static-site build test, headless desktop and mobile-emulation rendering and input checks. User PC playtest: “works great on pc,” screenshot showed 60 FPS. Actual Android phone performance is pending. No Sol, crafting, persistence, shadows or established Test 08 LOD system is integrated into this preview.

## Work from either device

1. Use this GitHub repository as the source of truth. Start each task from current `main`, not from an old chat attachment or a PC-only output directory.
2. On Android, use the Codex cloud environment connected to this repository. First-time environment setup is done in the web/desktop UI, then the same environment can be selected on mobile. Cloud setup may still need to be selected/published in the account UI; committing source does not create it automatically.
3. Ask for a bounded change, run `npm test` and `npm run build`, and review the change. After approved changes reach `main`, the Pages workflow publishes the current playtest automatically.
4. Test the public project-home link on the phone. Record device, observed result and build/commit. Keep actual device results separate from emulation.

No installs are required for hosted playtesting. For PC source development use Node 20+; `npm start` serves the shared hub locally on port 8790. No npm dependency installation or credentials are needed for this browser preview; Three.js is vendored with its MIT license.

## Source material

- Code, current section grid, plant transforms and tests: this repository.
- Larger source surveys, generation inputs and Max packages: [Survival Island asset folder](https://drive.google.com/drive/folders/195gg_Ts389z6H_vQJcc5CKeA9jD9u16G), private to the existing Drive account. See [asset index](docs/ASSETS.md).
- The local full-atoll mesh was 20.185 × 5.405 km at 5 m spacing; the user confirmed metre scale in Max. Source depth gaps were filled procedurally and flagged, not claimed as surveyed terrain.
- Google Earth imagery is for visual shoreline/vegetation comparison. Its elevation mesh was found unreliable. Yellow line meaning is unresolved. The red grid in user screenshots is a measured square and a cross for side-view elevation inspection, not a boundary design.

## Preserve these contracts

Origin E817000, N653660, EPSG:32603. Browser/GLB X east, Y up, Z south; one unit = one metre. Node heights in `height.f32` exactly match the full-atoll v02 crop. `section.json` records extent, focus, spawn and seeded vegetation. Do not change units, zero the origin per section, invent a channel at the eastern focus edge or overwrite source depths without recording an authored mask.

Read `AGENTS.md`, [browser notes](browser/cooper-west/README.md) and [shared development](docs/SHARED-DEVELOPMENT.md) for details. Historical game/bridge architecture remains in `docs/CONTINUITY.md`; it is not evidence that those features exist in this browser preview.

## Immediate next work

1. Human Android playtest of the hosted Cooper preview: touch movement/look, shoreline, trees on/off and FPS.
2. Refine density, materials and water from actual walking feedback.
3. Locate/import the real Mobile Test 08 source and integrate this section while preserving its tested controls and LODs.
4. Expand eastward using shared coordinates and deterministic plant seeds, one section at a time.
