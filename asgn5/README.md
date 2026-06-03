**references:**
- I learned about L-Systems and using them to represent plants from [The Algorithmic Beauty of Plants (Prusinkiewicz, Lindenmayer)](https://algorithmicbotany.org/papers/abop/abop.pdf). 3D turtle rotation matrices and some example L-System seeds/rules came from Ch1 Graphical Modeling using L-Systems.


- skybox, ground, wood, rock textures modified from [polyhaven.com]
- tent, lantern, UFO, sea urchin models from [poly.pizza]
- [THREE.MeshLine](https://github.com/spite/THREE.MeshLine) to be able to texture lines
    - Slightly [modified](https://github.com/spite/THREE.MeshLine/issues/103#issuecomment-1551044669) to import as local module
- Overlay from [three.js pointer lock controls example](https://threejs.org/examples/misc_controls_pointerlock.html)

**wishlist for when I have more time:**
- make it more interactive! add GUI to let you set the L-system rules, seeds, iterations, etc.
- make the branches/trunks out of custom cylindrical geometry (rather than MeshLine) so they can interact with light
- nice sounds??
- more plants/nicer terrain