# Island Survival v28 — Procedural Seabed (prototype)

This folder contains a Godot 4 seabed generator and a separate experimental water shader. **Not yet merged into v27's actual world scene or tested in Godot.** The goal is to establish believable bathymetry before tuning water optics.

## Add to existing v27 scene

1. Copy `procedural_seabed.gd` into the Godot project.
2. Add a `MeshInstance3D` to the existing world and attach the script.
3. Move its origin to a shoreline point at water level. Rotate it so local **+Z** extends offshore. Its first row is at local Z=0; its Y=0 is the waterline.
4. Assign a sandy `StandardMaterial3D` to the generated mesh's surface override. Disable or remove any old seabed geometry that overlaps the new mesh. **Do not delete the existing island terrain or gameplay nodes.**
5. Set the current ocean plane's height to the same Y coordinate. Start with the existing water material; tune the new shader only after inspecting seabed geometry.
6. Use the exported `regenerate` checkbox in the inspector to rebuild after changing parameters. The script also generates on entering the scene.
7. If the generated collision duplicates an existing collision surface, remove/disable `GeneratedSeabedCollision` or adapt the script to use the world's collision manager.

## Terrain profile

- 0–32% offshore: smooth shallow beach ramp
- ~32–75%: irregular lagoon floor with soft meandering channel
- ~62%: raised reef shelf with broad variation
- ~75–100%: deeper outer drop-off
- Multi-scale noise adds subtle undulations, avoiding evenly spaced depth bands.
- Defaults: 180 × 180 m, ~3 m cell spacing, 13 m nominal outer depth.
- This is a **coastal test patch**, not yet a coastline-following ring around the whole island.

## Test checklist

- The seam at the shoreline is visually continuous and free of holes.
- No seabed protrudes above water unexpectedly.
- The lagoon has recognizably shallow, intermediate, and deeper regions.
- Collision works, and Sol's existing navigation is unaffected.
- No major FPS regression on the Samsung A16.
- Water transparency shows the seabed without hard concentric color bands.

## Next iteration

Read actual island shoreline height samples and generate a connected coastline-following seabed mesh, with material masks based on depth and slope. Then refine the depth-aware water shader against that geometry. Add swim/dive controls only after terrain and water pass visual checks.
