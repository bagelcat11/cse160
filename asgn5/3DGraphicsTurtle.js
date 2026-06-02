
import * as THREE from "three";

export class Turtle {
    constructor() {
        this.position = new THREE.Vector3(0,0,0);
        // heading, left, up
        this.heading = new THREE.Vector3(0,0,-1);
        this.left = new THREE.Vector3(-1,0,0);
        this.up = new THREE.Vector3(-1,0,0);
        // this.orientation = new THREE.Matrix3(0,0,-1, -1,0,0, 0,1,0);
    }

    forward(amount) {
        let dir = this.heading.clone();
        dir.normalize();
        dir.multiplyScalar(amount);

        this.position.add(dir);
        // console.log("new pos:", this.position);
    }
}