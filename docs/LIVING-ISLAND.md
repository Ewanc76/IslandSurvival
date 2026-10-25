# Living palms and coconut crabs — first island integration

Candidate: Cooper West Living Island v01, October 24, 2026. Based on shared `main` at `08fd5bd5c30df6e8bbf71c54ab1066b54dab92e5` and the approved Living-Palms-Soil-v02.html artifact version 6.

The Cooper West browser walk now uses the lab's growing palms, husked coconuts and jointed crab models on the existing island terrain. This is the browser preview, not a Godot update. The old palm transforms remain the initial adult population; canopy trees, shrubs, ferns, height data, movement and water shader are retained. Those other plants remain static and are not part of the nutrient ledger.

`browser/ecology` contains the lab's unchanged monthly solver. `living-world.js` adapts its habitat, soil grid, initial population and crab travel tests to the actual height map. Initial organisms are explicit nutrient imports, not recurring rescue spawns. Canopy trees add light competition. Fruit falls, germination, growth, competition, predation, waste, death and decomposition run on the same clock. No fixed percentage predation is applied alongside actual crabs. The lab's artificial ellipse islands and eastward floating-seed transport are not used on this terrain; terrain-aware ocean dispersal remains future work.

`living-visuals.js` reuses the approved procedural forms and grounds them on sampled terrain. Walking crab motion is interpolated with terrain checks. Palms use fewer fronds at 40/100 m, ground coconuts render within 80 m, and detailed crabs within 65 m. These thresholds reduce draw work; transitions still need device review. Collision trunks rebuild after each simulated month. Crabs do not yet collide with the player or canopy trunks; existing player collision rules remain in terrain.js.

Controls: Walk the island as before. Visit a crab is an inspection-camera aid. Pause life freezes the ecology clock. Ecology speed defaults to one simulated month per real minute; 10× and 100× accelerate it. +1 year advances twelve solver steps in chunks while leaving walking/rendering responsive. The normal clock waits during this operation. Reset returns the player to the start; it does not reset ecology. Reload starts a new deterministic world. No save/persistence, harvesting, coconut-opening tools or combat is added.

Checks: `npm test` covers original terrain and build checks, island initialization, IDs and nutrient accounting, one year of real feeding/reproduction, dry-land crab travel, grounded render matrices, LOD/mesh budgets and app/control initialization with a mock WebGL renderer. `npm run build` produces the normal site plus a self-contained HTML. No Chrome/WebGL or real Android performance claim is made for this candidate. User review remains pending.

Source is prepared on a review branch; main/Pages deployment must not be described as updated until a merge and deployment actually succeed.
