import * as THREE from "three";
import { Turtle } from "./3DGraphicsTurtle.js";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "./lib/THREE.MeshLine.js";

export class TurtleLSystem extends THREE.Object3D { // extend Obj3D so we can add this to scene, and add lines to this
    constructor(iters, dist, rot, initStrs, rulesObj, leafModel) {
        super();

        this.turtle = new Turtle();
        this.turtleArrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.1),
            new THREE.MeshNormalMaterial()
        );
        // this.add(this.turtleArrow);
        this.turtleArrow.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI / 2);

        this.iterations = iters;
        this.distance = dist;
        this.rotationAmt = rot * Math.PI / 180;
        this.seeds = initStrs;
        this.rules = rulesObj;
        this.leafModel = leafModel;
        this.stemMaterial = new LineMaterial( { color: 0x443322, linewidth: 5 } );

        this.texLoader = new THREE.TextureLoader();
        this.leaves = [];
    }

    draw() {
        // reset children meshes, turtle on draw
        this.turtle = new Turtle();
        this.clear();

        // random seed
        let randi = Math.floor(Math.random() * this.seeds.length);
        let str = this.seeds[randi];
        for (let i = 0; i < this.iterations; i++) {
            for (let [key, val] of Object.entries(this.rules)) {
                str = this.applyRule(str, key);
            }
        }

        const lines = [];   // holds arrays of point vectors
        lines.push( [new THREE.Vector3( 0, 0, 0 )] );

        this.interpretString(str, lines);

        //TODO: because the branches are made with meshline, they ignore lighting, and can't cast/receive shadow
        lines.forEach((line) => {
            let l = new MeshLine();
            l.setPoints(line, p => (1-p/4)*Math.cos(p));  // THIS HAS TO BE ON ITS OWN LINE
            
            let woodTex = this.texLoader.load("img/wood.png", () => {
                let m = new MeshLineMaterial({useMap: true, map: woodTex, lineWidth: 0.15})
                const mesh = new THREE.Mesh(l, m);
                mesh.castShadow = true;
                this.add(mesh);
            })
        });
    }

    applyRule(str, ruleLeft) {
        let rulesRight = this.rules[ruleLeft];    // left is the starting string, right is possible resulting strings (randomly chosen)
        let tmpstr = str;
        let i = 0;
        while (true) {
            i = tmpstr.indexOf(ruleLeft, i);    // find next instance of thing to replace
            if (i < 0) { break; }

            // get random right rule
            let randi = Math.floor(Math.random() * rulesRight.length);
            tmpstr = tmpstr.substring(0, i) + rulesRight[randi] + tmpstr.substring(i+1);    // replace
            i += rulesRight[randi].length;
        }
        return tmpstr;
    }

    interpretString(str, lines) {
        let stack = [];

        for (let i = 0; i < str.length; i++) {
            switch (str[i]) {
                case "F":   // forwards
                    this.turtle.forward(this.distance);
                    this.turtleArrow.position.set(this.turtle.position.x, this.turtle.position.y, this.turtle.position.z);
                    lines.at(-1).push(this.turtle.position.clone());  // you're telling me it got passed by ref here
                    break;

                case "+":   // turn left
                    // wow it is really nasty that these have to go in opposite directions
                    this.turtle.turn(this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.up, -this.rotationAmt);
                    break;
                case "-":   // turn right
                    this.turtle.turn(-this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.up, this.rotationAmt);
                    break;
                case "&":   // pitch down
                    this.turtle.pitch(this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.left, -this.rotationAmt);
                    break;
                case "^":   // pitch up
                    this.turtle.pitch(-this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.left, this.rotationAmt);
                    break;
                case "\\":   // roll left
                    this.turtle.roll(this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.heading, -this.rotationAmt);
                    break;
                case "/":   // roll right
                    this.turtle.roll(-this.rotationAmt);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.heading, this.rotationAmt);
                    break;
                case "|":   // turn around
                    this.turtle.turn(Math.PI);
                    this.turtleArrow.rotateOnWorldAxis(this.turtle.up, Math.PI);
                    break;
                
                case "[":   // push state to stack
                    stack.push(this.turtle.getStateObj());
                    break;
                case "]":   // pop state from stack
                    this.turtle.setStateFromObj(stack.pop());
                    this.turtleArrow.position.set(this.turtle.position.x, this.turtle.position.y, this.turtle.position.z);
                    lines.push([this.turtle.position.clone()]); // start new line to emulate penup/pendown
                    //TODO: set arrow rotationAmt?
                    break;

                case "L":   // add leaf
                    let l = this.leafModel.clone();
                    l.position.set(this.turtle.position.x, this.turtle.position.y, this.turtle.position.z);
                    l.lookAt(this.turtle.position.clone().add(this.turtle.heading));
                    // l.castShadow = true;
                    // l.receiveShadow = true;
                    // l.rotateOnAxis(this.turtle.up, Math.PI / 2);
    // l.rotateOnAxis(new THREE.Vector3(0,0,1), -Math.PI)
                    this.add(l);
                    this.leaves.push(l);
                    // console.log("adding leaf",l)
                    //TODO: set leaf rotation
                    break;
                case "'":   // make branch color greener
                    // this.stemMaterial.color.g += 0.02;
                    // console.log(this.stemMaterial.color);
                    break;


                default:
                    break;
            }
        }
    }

    // called in main update loop
    update(time) {
        this.leaves.forEach((leaf) => {
            leaf.position.x += Math.sin((time + leaf.position.z * 100) / 600) / 3000;
            leaf.position.z += Math.cos((time + leaf.position.x * 100) / 800) / 3000;
        });       
    }
}