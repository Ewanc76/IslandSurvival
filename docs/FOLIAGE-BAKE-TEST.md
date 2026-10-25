# Foliage texture baking A/B experiment 01

October 25, 2026. This is a separate renderer experiment; the island's default foliage and biology are unchanged.

A uses treeVariant(802)'s original leaf polygons. B replaces the same 36 twig clusters with three orthogonal texture cards per cluster. Bark, instance transforms, lighting shader and camera path are identical. Leaf geometry is reduced from 1,728 to 216 triangles/tree; bark stays at 648, so total tree geometry is 2,376 versus 864 triangles/tree. The normal atlas stores object-space leaf normals, letting the same live light calculation shade both modes; lighting itself is not baked.

The offline Python baker z-buffers the original vertex colors, alpha silhouettes and normals in three directions, writing 64/128/256 px tiles into two atlases. PNG RGB stores linear albedo or encoded normal components and must be sampled with NoColorSpace. Alpha cutout happens before the normal lookup, with opaque depth writes. Padded tiles and RGB edge dilation support filtered edges. Mipmaps are ordinary browser-generated mipmaps; distant alpha coverage and tile bleeding remain things to inspect. Crossed cards can change diagonal silhouettes and add overlapping leaf images. Fewer polygons do not guarantee faster rendering: texture bandwidth, mostly transparent card area, overdraw and extra texture memory may dominate.

Controls: A/B mode, tree count, tile resolution, filtered+mipmapped or nearest pixels, near/wide view and drag/wheel orbit. The benchmark locks configuration, warms each mode for one second, then repeats the same six-second orbit per mode. It records average FPS, median frame time, p95 frame time, draw/triangle counts, render dimensions, tile resolution and filtering. Repeat in the opposite order. Hiding the page or resizing aborts the comparison. No ecology solver runs in this experiment. Save results downloads the measured JSON locally.

Validation: source geometry hash and all card bounds/UVs correspond to the original mesh. A mock-renderer controller test checks identical camera paths and benchmark state transitions, not GPU performance. Baked PNGs are decoded/checked and a three-view sample was inspected. The standalone loader bundles every asset and local module. Actual WebGL rendering, appearance and device performance remain pending; no FPS gain is claimed.

Run npm test and npm run build. Hosted source entry: /foliage-bake/. Direct-open artifact: _site/foliage-bake/Foliage-Texture-Bake-AB.html. To reproduce baking, export the exact source arrays and run:

    node scripts/export-foliage-source.mjs leaf-source.json
    python3 scripts/bake-foliage.py leaf-source.json browser/foliage-bake

The baker needs NumPy and Pillow; ordinary builds/tests use only Node and the committed baked atlases. No external textures or generated images are used.
