import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { Turtle } from "./3DGraphicsTurtle.js";
import { TurtleLSystem } from "./TurtleLSystem.js";
import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "./lib/THREE.MeshLine.js";

// -- setup --
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
scene.fog = new THREE.FogExp2(0x555544, 0.03);
document.body.appendChild(renderer.domElement);

// -- define scene --

const floor = new THREE.PlaneGeometry(128, 128);
const shapes = [];
const updateables = [];

const texLoader = new THREE.TextureLoader();
const floorTex = texLoader.load("img/coast_sand_rocks.png", () => {
    floorTex.repeat.set(8, 8);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    // const bump = texLoader.load("img/ground-bump.png", () => {  // yay callback hell
        // bump.repeat.set(8, 8);
        // bump.wrapS = THREE.RepeatWrapping;
        // bump.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshLambertMaterial({map: floorTex});//, bumpMap: bump, bumpScale: 5});
        const cube = new THREE.Mesh(floor, material);
        cube.rotateX(-Math.PI / 2);
        cube.receiveShadow = true;
        scene.add(cube);
        shapes.push(cube);
    // });

});
const background = texLoader.load("img/sky.png", () => {
    background.mapping = THREE.EquirectangularReflectionMapping;
    background.colorSpace = THREE.SRGBColorSpace;
    scene.background = background;
});

const gltfLoader = new GLTFLoader();

const sun = new THREE.DirectionalLight(0xFFFFEE, 2);
sun.position.set(128,24,128);
sun.target.position.set(0,0,0);
sun.castShadow = true;
scene.add(sun);
scene.add(sun.target);
const ambient = new THREE.AmbientLight(0xFFFFFF, 0.1);
scene.add(ambient);

// -- camera/controls --
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;
camera.position.y = 1;

const controls = new PointerLockControls(camera, document.body);
document.onmousedown = (event) => {
    controls.lock();
}
let speed = 0.25;
document.onkeydown = (event) => {
    switch (event.key) {
        case "w":
            controls.moveForward(speed);
            break;
        case "s":
            controls.moveForward(-speed);
            break;
        case "d":
            controls.moveRight(speed);
            break;
        case "a":
            controls.moveRight(-speed);
            break;
    }
}
controls.addEventListener("lock", () => {
	// menu.style.display = 'none';
});
controls.addEventListener("unlock", () => {
	// menu.style.display = 'block';
});
controls.addEventListener("change", () => {
    controls.update();
});
controls.update();  // controls need to be updated any time the camera transforms

// const koch1 = new TurtleLSystem(scene, 5, 0.05, 90, "F+F+F+F", {"F": "F+F-F-FF+F+F-F"});
// koch1.draw();

// const bracketed = new TurtleLSystem(5, 0.01, 23, "X", {"X": "F-[[X]+X]+F[+FX]-X", "F": "FF"})
// scene.add(bracketed);
// bracketed.draw();

// const threedtest = new TurtleLSystem(2, 0.1, 90, "A", {
//     "A": "B-F+CFC+F-D&F^D-F+&&CFC+F+B//",
//     "B": "A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//",
//     "C": "|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//",
//     "D": "|CFB-F+B|FA&F^A&&FB-F+B|FC//"
// });
// scene.add(threedtest);
// threedtest.position.x = 10;
// threedtest.draw();

let leafModel = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), background);  // dummy
gltfLoader.load("model/Leaf.glb", (gltf) => {
    leafModel = gltf.scene;
    let samt = 0.15;
    leafModel.scale.set(samt,samt,samt)
    leafModel.traverse((o) => {
        if (o instanceof THREE.Mesh) {
            o.castShadow = true;    // have to do this for every mesh in glb!!!
            o.receiveShadow = true;
        }
    })
    // leafModel.rotateOnAxis  // make it point up
    // console.log("loaded leaf")

    // const threeplant = new TurtleLSystem(4, 0.04, 40, "FAA", {
    //     "A": "F[&FL!A]/////'[&FL!A]///////'[&FL!A]",
    //     "F": String.raw`S\\\\F`,
    //     "S": "F",
    //     "L": "L"
    // }, leafModel);

    // scene.add(threeplant);
    // threeplant.draw();

    const stochastic = new TurtleLSystem(4, 0.04, 25, "AFA", {
        "A": ["F[&FL!A]//SL/'[&FL!A]/SL//'[&FL!A]", "F[&FL!A]/L/'[&FL!A]"],
        "F": ["S///////F"],
        "S": ["F"],
        "L": ["L"]
    }, leafModel);
    stochastic.castShadow = true;
    stochastic.position.z = -3;
    scene.add(stochastic);
    stochastic.draw();
    updateables.push(stochastic);
});

// const testcube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshLambertMaterial());
// scene.add(testcube);
// testcube.castShadow = true; // wish this set it for children
// testcube.position.y = 1;

const tent = gltfLoader.load("model/Tent.glb", (gltf) => {
    let t = gltf.scene;
    t.traverse((o) => { // get rid of shininess; metal = 0 didn't work for some reason
        if (o instanceof THREE.Mesh) {
            // o.material.metalness = 0;
            o.material = new THREE.MeshLambertMaterial({color: o.material.color})
            o.castShadow = true;    // have to do this for every mesh in glb!!!
            o.receiveShadow = true;
        }
    })
    let samt = 0.2;
    t.scale.set(samt,samt,samt)
    t.rotateY(-Math.PI / 3)
    t.position.set(3,0,0);
    scene.add(t);
});
let ufo = gltfLoader.load("model/Flying saucer.glb", (gltf) => {
    ufo = gltf.scene;
    let samt = 0.1;
    ufo.scale.set(samt,samt/2,samt);
    ufo.position.set(10,10,10)
    scene.add(ufo);

    let beamTarget = new THREE.Object3D();
    // beamTarget.position.set(0, 0, 0);
    ufo.add(beamTarget);
    
    let ufoBeam = new THREE.SpotLight(0x00FF33);
    ufoBeam.castShadow = true;
    ufoBeam.intensity = 5;
    // ufoBeam.power = 100;
    ufoBeam.decay = 0;
    ufoBeam.angle = Math.PI / 6;
    ufoBeam.target = beamTarget;
    console.log(beamTarget.position)
    ufo.add(ufoBeam);
});

let lanternLight;
const lantern = gltfLoader.load("model/Lantern.glb", (gltf) => {
    let t = gltf.scene;
    t.traverse((o) => { // get rid of shininess; metal = 0 didn't work for some reason
        if (o instanceof THREE.Mesh) {
            // o.material.metalness = 0;
            o.material = new THREE.MeshLambertMaterial({color: o.material.color})
            if (o.name == "Lantern_5") {    // make glowy
                o.material.emissive.set(1,1,0.5);
                o.material.emissiveIntensity = 1;
            }
            o.castShadow = true;    // have to do this for every mesh in glb!!!
            o.receiveShadow = true;
        }
    })
    t.position.set(-0.5,0.25,0);
    scene.add(t);

    lanternLight = new THREE.PointLight(0xFFFFFF, 2, 10, 1);
    lanternLight.position.y += 0.25;
    // lanternLight.castShadow = true;
    t.add(lanternLight);
});

const rockyTex = texLoader.load("img/worn-sandy-rock.png", () => {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(),
    new THREE.MeshLambertMaterial({map: rockyTex, color: 0xCCCCBB}));
    rock.rotateOnAxis(new THREE.Vector3(1,1,1).normalize(),2.0);
    scene.add(rock);
    rock.scale.set(2,3,2);
    rock.position.set(-5,1,-10);
    rock.castShadow = true;
    rock.receiveShadow = true;
});



// -- update loop --
function animate(time) {
    if (lanternLight) {
        lanternLight.power = (10 + Math.sin(time / 500) * 5);
    }

    if (ufo) {
        // gerono lemniscate (figure 8)
        ufo.position.set(Math.sin(time / 5000) * 64, Math.sin(time / 3000) * 5 + 15, Math.cos(time / 5000) * Math.sin(time / 5000) * 64);
        // ufo.lookAt(0,5,0);
    }
    // updateables.forEach((u) => {u.update(time);});

    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);