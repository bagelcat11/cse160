
import * as THREE from "three";

// rotation matrices and vector setup from Algorithmic Beauty of Plants 1.5: Modeling in three dimensions
export class Turtle {
    constructor() {
        this.position = new THREE.Vector3(0,0,0);
        
        this.heading = new THREE.Vector3(0,0,-1);
        this.left = new THREE.Vector3(-1,0,0);
        this.up = new THREE.Vector3(0,1,0);
    }

    forward(amount) {
        let dir = this.heading.clone();
        dir.normalize();
        dir.multiplyScalar(amount);

        this.position.add(dir);
        // console.log("new pos:", this.position);
    }

    // like looking left/right
    turn(deg) {
        // deg = deg * Math.PI / 180;
        this.upRotMtx = new THREE.Matrix3(Math.cos(deg), Math.sin(deg), 0,
                                        -Math.sin(deg), Math.cos(deg), 0,
                                        0, 0, 1);
        // console.log(upRotMtx);
        let orientation = new THREE.Matrix3().fromArray(this.heading.toArray().concat(this.left.toArray(), this.up.toArray()));

        orientation.multiply(this.upRotMtx);
        let e = orientation.elements;
        //TODO: translating from matrix to vectors back and forth is kinda evil and bad
        this.heading.set(e[0],e[1],e[2]);
        this.left.set(e[3],e[4],e[5]);
        this.up.set(e[6],e[7],e[8]);
        // console.log(this.heading, this.left, this.up)
    }

    // like looking up/down
    pitch(deg) {
        this.leftRotMtx = new THREE.Matrix3(Math.cos(deg), 0, -Math.sin(deg),
                                            0, 1, 0,
                                            Math.sin(deg), 0, Math.cos(deg));
        let orientation = new THREE.Matrix3().fromArray(this.heading.toArray().concat(this.left.toArray(), this.up.toArray()));
        orientation.multiply(this.leftRotMtx);
        let e = orientation.elements;
        this.heading.set(e[0],e[1],e[2]);
        this.left.set(e[3],e[4],e[5]);
        this.up.set(e[6],e[7],e[8]);
    }

    // like tilting view
    roll(deg) {
        this.headRotMtx = new THREE.Matrix3(1, 0, 0,
                                            0, Math.cos(deg), -Math.sin(deg),
                                            0, Math.sin(deg), Math.cos(deg));
        let orientation = new THREE.Matrix3().fromArray(this.heading.toArray().concat(this.left.toArray(), this.up.toArray()));
        orientation.multiply(this.headRotMtx);
        let e = orientation.elements;
        this.heading.set(e[0],e[1],e[2]);
        this.left.set(e[3],e[4],e[5]);
        this.up.set(e[6],e[7],e[8]);
    }

    // helpers for bracket notation
    getStateObj() {
        return {"p": this.position.clone(), "h": this.heading.clone(), "l": this.left.clone(), "u": this.up.clone()};
    }

    setStateFromObj(obj) {
        this.position = obj["p"];
        this.heading = obj["h"];
        this.left = obj["l"];
        this.up = obj["u"];
    }
}