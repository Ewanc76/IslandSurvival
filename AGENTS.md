# Island Survival contributor instructions

Read README.md and docs/CONTINUITY.md before changing the project. Use open GitHub issues for current work and update continuity after significant decisions or validation.

Godot owns physics, movement, perception, reach and authoritative interaction results. Sol uses the same physical rules as the human player. Remembered observations are not current world truth.

Preserve the first crafting slice: find stone -> shape -> choose stick -> carve -> bind -> swing. Make bounded changes and avoid broad rewrites during recovery.

Never commit credentials, local environment files, raw personal session logs or generated caches. Keep sanitized examples separate from real user data.

Distinguish automated checks from Ewan's live playtest results. Do not claim a build was run unless it was actually run. Document the exact candidate, checks performed and unresolved issues.

## Shared browser work

Read START-HERE.md before the historical continuity file. The current runnable browser preview is browser/cooper-west; it is standalone Three.js, not a Godot export or the unavailable Mobile Test 08. For browser changes, terrain.js owns preview collision and height sampling. The Godot authority rules above apply to the original game and future integration, not an imaginary Godot runtime inside this preview.

Run npm test and npm run build. Keep shared UTM origin and metre scale. Preserve coordinate-seeded vegetation, authored-depth masks and the connected eastern land. Do not check in PC paths, private screenshot references, raw session logs, credentials or large DCC exports. Shared large inputs are indexed in docs/ASSETS.md. Do not imply that Pages deployment creates a Codex cloud environment; that still requires account UI setup.
