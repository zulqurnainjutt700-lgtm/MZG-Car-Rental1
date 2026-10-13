# Hero asset sources and modifications

Renderer, loaders, Draco runtime, environment implementation, Ferrari GLB and baked ground shadow are pinned to the official Three.js r170 repository:
https://github.com/mrdoob/three.js/tree/r170
Repository license: MIT; retained verbatim in assets/three/LICENSE.
Model: examples/models/gltf/ferrari.glb (1.68 MB); shadow: examples/models/gltf/ferrari_ao.png.
Original model attribution used by the official example: Ferrari 458 Italia by vicent091036.
Original source: https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6
The original Sketchfab item now returns not found; no separate Creative Commons license is asserted. This copy comes from the MIT-licensed Three.js distribution above.

MZG modifications: silver physical paint, tinted glass, custom curved hardtop, side glazing and pillars, city/road scene, lighting, camera tracking, scroll response and independent rotation of the original four wheel meshes. The car is an editorial hero visual and does not imply Ferrari rental availability or affiliation.
Road, scenery and hardtop geometry are authored in project code. No stock video, image overlay wheels or remote runtime dependencies are used. No changes to navigation/CTA destinations.
