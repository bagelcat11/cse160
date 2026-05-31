import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

// -- setup --
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// -- define scene --

const geometry = new THREE.BoxGeometry(1, 1, 1);
const shapes = [];

const texLoader = new THREE.TextureLoader();
const lokiTex = texLoader.load("img/test_loki.png", (t) => {
    const material = new THREE.MeshBasicMaterial({map: lokiTex});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = -1;
    scene.add(cube);
    shapes.push(cube);
});

const gltfLoader = new GLTFLoader();
gltfLoader.load("model/Dingus the cat.glb", (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    shapes.push(root);
});

const light = new THREE.DirectionalLight(0xFFFFFF, 10);
light.position.set(0,0,10);
light.target.position.set(0,0,0);
scene.add(light);
scene.add(light.target);

camera.position.z = 5;

// -- update loop --
function animate(time) {
    for (let i = 0; i < shapes.length; i++) {
        shapes[i].rotation.x = Math.sin(time / 1000) / 5;
        shapes[i].rotation.y = time / 1000;
    }

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);