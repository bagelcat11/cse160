import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { Turtle } from "./3DGraphicsTurtle.js";
import { TurtleLSystem } from "./TurtleLSystem.js";
import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

// -- setup --
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// -- define scene --

const floor = new THREE.BoxGeometry(64, 0.01, 64);
const shapes = [];

const texLoader = new THREE.TextureLoader();
const floorTex = texLoader.load("img/coast_sand_rocks.png", () => {
    floorTex.repeat.set(8, 8);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshBasicMaterial({map: floorTex});
    const cube = new THREE.Mesh(floor, material);
    // cube.position.y = -1;
    scene.add(cube);
    shapes.push(cube);
});
const background = texLoader.load("img/sky.png", () => {
    background.mapping = THREE.EquirectangularReflectionMapping;
    background.colorSpace = THREE.SRGBColorSpace;
    scene.background = background;
});

const gltfLoader = new GLTFLoader();

const light = new THREE.DirectionalLight(0xFFFFFF, 3);
light.position.set(0,5,100);
light.target.position.set(0,0,0);
scene.add(light);
scene.add(light.target);
const ambient = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(ambient);

// -- camera/controls --
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;
camera.position.y = 1;
// camera.lookAt(scene.position);
// camera.updateProjectionMatrix();
// window.camera = camera;

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

const threedtest = new TurtleLSystem(2, 0.1, 90, "A", {
    "A": "B-F+CFC+F-D&F^D-F+&&CFC+F+B//",
    "B": "A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//",
    "C": "|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//",
    "D": "|CFB-F+B|FA&F^A&&FB-F+B|FC//"
});
scene.add(threedtest);
threedtest.position.x = 10;
threedtest.draw();

let leafModel = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), background);  // dummy
gltfLoader.load("model/Leaf.glb", (gltf) => {
    leafModel = gltf.scene;
    let samt = 0.15;
    leafModel.scale.set(samt,samt,samt)
    leafModel.rotateOnAxis  // make it point up
    // console.log("loaded leaf")

    const threeplant = new TurtleLSystem(4, 0.04, 40, "FAA", {
    "A": "F[&FL!A]/////'[&FL!A]///////'[&FL!A]",
    "F": String.raw`S\\\\F`,
    "S": "F",
    "L": "L"
}, leafModel);
scene.add(threeplant);
    threeplant.draw();
    // scene.add(leafModel);


});



// -- update loop --
function animate(time) {
    // for (let i = 0; i < shapes.length; i++) {
    //     shapes[i].rotation.x = Math.sin(time / 1000) / 5;
    //     shapes[i].rotation.y = time / 1000;
    // }

    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);