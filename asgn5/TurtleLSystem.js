import * as THREE from "three";
import { Turtle } from "./3DGraphicsTurtle.js";
// import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
// import { Line2 } from 'three/addons/lines/Line2.js';

export class TurtleLSystem {    // TODO: could make this extend Object3D
    constructor(scene, iters, dist, rot, initStr, rulesObj) {
        this.scene = scene;
        this.turtle = new Turtle();
        this.turtleArrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.25, 0.5),
            new THREE.MeshNormalMaterial()
        );
        scene.add(this.turtleArrow);
        this.turtleArrow.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI / 2);

        this.iterations = iters;
        this.distance = dist;
        this.rotation = rot * Math.PI / 180;
        this.seed = initStr;
        this.rules = rulesObj;
    }

    draw() {
        let str = this.seed;
        for (let i = 0; i < this.iterations; i++) {
            for (let [key, val] of Object.entries(this.rules)) {
                str = this.applyRule(str, key);
            }
            // console.log("got string", str, "after", i+1)
        }

        const m = new THREE.LineBasicMaterial( { color: 0x003300 } );
        const points = [];
        points.push( new THREE.Vector3( 0, 0, 0 ) );

        this.interpretString(str, points);

        // console.log("got points", points)
        const g = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( g, m );
        this.scene.add( line );
    }

    applyRule(str, ruleLeft) {
        let ruleRight = this.rules[ruleLeft];    // left is the starting string, right is the resulting string
        let tmpstr = str;
        let i = 0;
        while (true) {
            i = tmpstr.indexOf(ruleLeft, i);    // find next instance of thing to replace
            if (i < 0) { break; }

            tmpstr = tmpstr.substring(0, i) + ruleRight + tmpstr.substring(i+1);    // replace
            i += ruleRight.length;
        }
        return tmpstr;
    }

    interpretString(str, points) {
        // let stack = [];

        for (let i = 0; i < str.length; i++) {
            switch (str[i]) {
                case "F":
                    this.turtle.forward(this.distance);
                    this.turtleArrow.position.set(this.turtle.position.x, this.turtle.position.y, this.turtle.position.z);
                    points.push(this.turtle.position.clone());  // you're telling me it got passed by ref here
                    // console.log("points now has", points)
                    break;
                case "+":
                    // wow it is really nasty that these have to go in opposite directions
                    this.turtle.turn(this.rotation);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.up, -this.rotation);
                    break;
                case "-":
                    this.turtle.turn(-this.rotation);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.up, this.rotation);
                    break;
                default:
                    break;
            }
        }
    }
}