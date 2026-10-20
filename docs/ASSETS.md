# Shared asset index

The current runnable Cooper section data is committed in browser/cooper-west so cloud/mobile development does not depend on this PC or downloading a full-atoll mesh.

Large material is stored privately in the existing [Survival Island Drive folder](https://drive.google.com/drive/folders/195gg_Ts389z6H_vQJcc5CKeA9jD9u16G). Sign in to the same Google account on Android. Folder sharing has not been changed.

## Current packages

- [Cooper West v01 package](https://drive.google.com/file/d/1n5WEat7Becu2GcEjxV2exBur5gMveyAY/view): full local test package, terrain GLB/Max OBJ, section grid, screenshots, references and validation. Runtime is also available from the hosted project hub without downloading this ZIP.
- [Terrain source kit, 20 October](https://drive.google.com/file/d/10aLzxxzIpSucCwYZaY-H6d6YSmgXdHb2/view): original 40 m grid/JPG/metadata, original 5 m NetCDF, full-atoll v02 grid, shoreline vectors, and terrain generation scripts. The ZIP retains workspace-relative paths. Extract into a separate asset workspace; install numpy, scipy, pillow, pyproj, shapely, matplotlib and trimesh for generation work. No credentials are included.

These are versioned packages, not automatic Drive/GitHub folder synchronization. Editable browser code lives in GitHub. Put new large-source packages in the same Drive folder and update this index with the verified link and version.

The full v02 atoll OBJ/tiles ZIP is a derived PC export, approximately 500 MB. The source kit includes its height grid and generator, so it can be regenerated; the large export itself is not required for ordinary browser development. The source kit generator retains prototype-specific relative paths and should be reviewed before running; the committed browser preview already has its own ready-to-run section data.

Original survey credit: NOAA/PIBHMC/PacIOOS and NOAA OCS. Derived land, shoreline blending and gap fill are authored estimates. Google Earth reference screenshots in the private package are visual reference, not game textures or a reliable source of ground heights.
