import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { Turtle } from "./3DGraphicsTurtle.js";
import { TurtleLSystem } from "./TurtleLSystem.js";
// import {FirstPersonControls} from "three/addons/controls/FirstPersonControls.js";

// -- setup --
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


// -- define scene --

const geometry = new THREE.BoxGeometry(1, 1, 1);
const shapes = [];

const texLoader = new THREE.TextureLoader();
const lokiTex = texLoader.load("img/test_loki.png", () => {
    const material = new THREE.MeshBasicMaterial({map: lokiTex});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = -1;
    scene.add(cube);
    shapes.push(cube);
});
const background = texLoader.load("img/sky.png", () => {
    background.mapping = THREE.EquirectangularReflectionMapping;
    background.colorSpace = THREE.SRGBColorSpace;
    scene.background = background;
});

const gltfLoader = new GLTFLoader();
// gltfLoader.load("model/Dingus the cat.glb", (gltf) => {
//     const root = gltf.scene;
//     scene.add(root);
//     shapes.push(root);
// });

const light = new THREE.DirectionalLight(0xFFFFFF, 10);
light.position.set(0,0,10);
light.target.position.set(0,0,0);
scene.add(light);
scene.add(light.target);

camera.position.z = 3;
camera.position.y = 1;
controls.update();  // controls need to be updated any time the camera transforms

const koch1 = new TurtleLSystem(scene, 4, 0.05, 90, "F+F+F+F", {"F": "F+F-F-FF+F+F-F"})
koch1.draw();
// -- listeners --
// document.onkeydown = (event) => {
//     let amt = 5 * Math.PI / 180;
//     switch (event.key) {
//         case "w":
//             turtle.forward(0.1)
//             turtleArrow.position.set(turtle.position.x, turtle.position.y, turtle.position.z);
//             break;
//         case "a":
//             // wow it is really nasty that these have to go in opposite directions
//             turtle.turn(amt);
//             turtleArrow.rotateOnWorldAxis(turtle.up, -amt);
//             break;
//         case "d":
//             turtle.turn(-amt);
//             turtleArrow.rotateOnWorldAxis(turtle.up, amt);
//             break;
//         case "s":
//             turtle.forward(-0.1);
//             turtleArrow.position.set(turtle.position.x, turtle.position.y, turtle.position.z);
//             break;
//         case "i":
//             turtle.pitch(amt);
//             turtleArrow.rotateOnWorldAxis(turtle.left, -amt);
//             break;
//         case "k":
//             turtle.pitch(-amt);
//             turtleArrow.rotateOnWorldAxis(turtle.left, amt);
//             break;
//         case "j":
//             turtle.roll(amt);
//             turtleArrow.rotateOnWorldAxis(turtle.heading, -amt);
//             break;
//         case "l":
//             turtle.roll(-amt);
//             turtleArrow.rotateOnWorldAxis(turtle.heading, amt);
//             break;
//         default:
//             break;
//         }
// }

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