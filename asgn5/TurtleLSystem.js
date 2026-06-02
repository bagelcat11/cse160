import * as THREE from "three";
import { Turtle } from "./3DGraphicsTurtle.js";

export class TurtleLSystem extends THREE.Object3D { // extend Obj3D so we can add this to scene, and add lines to this
    constructor(iters, dist, rot, initStr, rulesObj) {
        super();

        this.turtle = new Turtle();
        this.turtleArrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.25),
            new THREE.MeshNormalMaterial()
        );
        this.add(this.turtleArrow);
        this.turtleArrow.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI / 2);

        this.iterations = iters;
        this.distance = dist;
        this.rotationAmt = rot * Math.PI / 180;
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
        const lines = [];   // holds arrays of point vectors
        lines.push( [new THREE.Vector3( 0, 0, 0 )] );

        this.interpretString(str, lines);

        // console.log("got points", points)
        lines.forEach((line) => {
            let g = new THREE.BufferGeometry().setFromPoints( line );
            let l = new THREE.Line( g, m );
            this.add(l);
        });
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

    interpretString(str, lines) {
        let stack = [];

        for (let i = 0; i < str.length; i++) {
            switch (str[i]) {
                case "F":
                    this.turtle.forward(this.distance);
                    this.turtleArrow.position.set(this.turtle.position.x, this.turtle.position.y, this.turtle.position.z);
                    lines.at(-1).push(this.turtle.position.clone());  // you're telling me it got passed by ref here
                    // console.log("points now has", points)
                    break;
                case "+":
                    // wow it is really nasty that these have to go in opposite directions
                    this.turtle.turn(this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.up, -this.rotationAmt);
                    break;
                case "-":
                    this.turtle.turn(-this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.up, this.rotationAmt);
                    break;
                case "[":
                    stack.push(this.turtle.getStateObj());
                    break;
                case "]":
                    this.turtle.setStateFromObj(stack.pop());
                    this.turtleArrow.position.set(this.turtle.position.x, this.turtle.position.y, this.turtle.position.z);
                    lines.push([this.turtle.position.clone()]); // start new line to emulate penup/pendown
                    //TODO: set arrow rotationAmt?
                default:
                    break;
            }
        }
    }
}