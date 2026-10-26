# Living island integration candidate

Living palms and coconut crabs now share this terrain. See [integration notes](../../docs/LIVING-ISLAND.md). Run `npm test` and `npm run build`; the build also creates `Cooper-West-Living-Island.html` for direct browser opening. Automated geometry and control checks pass; human/browser review is pending. Historical baseline notes follow.

---

# Cooper West browser source

Standalone Three.js terrain walk, first version, 2026-10-20. This is the source used for the shared PC/Android playtest, not a Godot export or the missing Mobile Test 08 implementation.

Run from repo root: `npm test`, `npm run build`, then `npm start`. Hosted entry is `/cooper-west/` on the project hub. Runtime files are local; no CDN, API, paid provider or API key is required.

Controls: WASD/arrows, Shift to jog, drag to look. Touch: left joystick moves, right-side drag looks. Buttons inspect the two shores, forest, aerial view or hide trees. Viewpoint jumps are test-camera aids, not Sol/gameplay teleport capabilities. Tree-trunk collision is a simple horizontal cylinder test. Deep water uses a slow surface-traversal placeholder, not finished swimming. Technical crop edges stop movement with a message; the island continues east and there is no authored channel or level gate.

Terrain is 273 × 159 nodes at 5 m spacing, covering 1,360 × 790 m including context beyond the core 804.672 m focus. `height.f32` is little-endian float32, row-major north-first. `provenance.u8` flags 0 designed land, 1 beach, 2 existing source depths, 3 authored coast band, 4 generated missing seabed. `section.json` holds metadata and UTM-seeded vegetation transforms.

Origin E817000/N653660 in EPSG:32603. Browser X=easting−817000, Y=elevation, Z=653660−northing. Bilinear sampling and movement are isolated in terrain.js. Keep the same heights, origin and plant cell seeds for adjacent sections. The source shoreline is provisional; generated land/sea-floor regions are estimates, not surveyed heights. The 5 m source itself merges sonar and satellite-derived depths. Water colors here come from grid depth, not converted screenshot pixels.

Vegetation is authored low-poly approximation: branched canopy trees, palms, shrubs and ferns, in four instanced draws. The total preview is about 0.58 million rendered triangles in six draws; no phone performance claim follows from desktop/headless FPS. Established Mobile Test 08 assets and LOD code are not present. No Sol, crafting, persistence, audio or game backend is integrated.

Six terrain tests cover dimensions/sampling, the full crossing, movement scale, collision and crop limits. Headless Edge keyboard and emulated touch input/rendering passed without page errors. User reported the PC preview works great; screenshot displayed 60 FPS. Physical Android test pending.

Credits: NOAA OCS shoreline via PacIOOS, https://www.pacioos.hawaii.edu/metadata/pat_ocs_all_shoreline.html ; NOAA/PIBHMC/PacIOOS bathymetry, https://pae-paha.pacioos.hawaii.edu/erddap/griddap/pibhmc_bathy_5m_palmyra.html . Three.js 0.180.0 is MIT licensed, see vendor/THREE-LICENSE.txt. No Google Earth screenshots are included in the public runtime/source import.

