// to be instantiated in asgn3.js.
// handles perspective and changing setLookAt with mouse/keyboard input.
class Camera {
    constructor() {
        // vectors for setLookAt (actual Vec3s since we wanna do math)
        this.eye = new Vector3([0,0.5,2]);
        this.at = new Vector3([0,0.5,-1000]);
        this.atDist = 1000;
        this.up = new Vector3([0,1,0]);

        // perspective won't change, so do that here
        let projMtx = new Matrix4();
        // fov, aspect ratio, near plane dist, far plane dist
        //    plane dist: how close/far you have to be before things clip
        projMtx.setPerspective(60, canvas.width / canvas.height, 0.1, 128);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMtx.elements);

        this.maxSpeed = 0.1;   // generic webgl units
        this.lookSpeed = 5 * (Math.PI / 180);   // convert deg to rad
        this.verticalLookPadding = 15 * (Math.PI / 180);   // stay x degrees away from looking straight up/down

        // set up listener for keyboard
        document.addEventListener("keydown", (event) => this.handleKeyboardMovement(event));

        // things for smoother movement
        this.currentMovement = [0.0, 0.0];  // forward/back, right/left
        this.accel = 0.01;
        this.friction = 0.95;
    }

    cameraTick() {  // every frame
        let viewMtx = new Matrix4();
        // eye position, pos to look at (conventionally, -z), up direction
        // viewMtx.setLookAt(this.eye.x,this.eye.y,this.eye.z,
        //     this.at.x,this.at.y,this.at.z,
        //     this.up.x,this.up.y,this.up.z);

        //TODO: it would be really nice if i could change the vector library
        //      to have vec.x = vec.elements[0], etc. but setting that in the
        //      constructor makes it by value and not reference...
        viewMtx.setLookAt(this.eye.elements[0],this.eye.elements[1],this.eye.elements[2],
            this.at.elements[0],this.at.elements[1],this.at.elements[2],
            this.up.elements[0],this.up.elements[1],this.up.elements[2]);
        gl.uniformMatrix4fv(u_ViewMatrix, false, viewMtx.elements);

        // acceleration!!
        // this.moveSmoothly();
    }

    handleKeyboardMovement(event) {
        switch (event.key) {
            case "w":
                this.changePosition(this.maxSpeed, 0);
                // if (this.currentMovement[0] < this.maxSpeed) {
                //     this.currentMovement[0] += this.accel;
                // }
                break;
            case "a":
                this.changePosition(0, -this.maxSpeed);
                // if (this.currentMovement[1] > -this.maxSpeed) {
                    // this.currentMovement[1] -= this.accel;
                // }
                break;
            case "s":
                this.changePosition(-this.maxSpeed, 0);
                // if (this.currentMovement[0] > -this.maxSpeed) {
                    // this.currentMovement[0] -= this.accel;
                // }
                break;
            case "d":
                this.changePosition(0, this.maxSpeed);
                // if (this.currentMovement[1] < this.maxSpeed) {
                    // this.currentMovement[1] += this.accel;
                // }
                break;

            // can look with keyboard horizontally only
            case "q":
                this.changeLook(-this.lookSpeed, 0);
                break;
            case "e":
                this.changeLook(this.lookSpeed, 0);
                break;

            default:
                break;    
        }
    }

    moveSmoothly() {
        this.changePosition(this.currentMovement[0], this.currentMovement[1]);
        // console.log("moving", this.currentMovement);

        this.currentMovement[0] *= this.friction;
        //TODO: can't clamp to 0 because that happens every frame while keypresses do not?
        // if (Math.abs(this.currentMovement[0]) < 0.001) { this.currentMovement[0] = 0; console.log("clamped")} else {console.log("not clamped")}
        this.currentMovement[1] *= this.friction;
        // if (Math.abs(this.currentMovement[1] < 0.001)) { this.currentMovement[0] = 0; }
    }

    changePosition(deltaForwardPos, deltaRightPos) {
        // get direction vector with length moveSpeed
        // MAKE COPY SINCE DIRECTLY CALCULATING this.at - this.eye WOULD AFFECT this.at
        let dir = new Vector3(this.at.elements);
        dir.sub(this.eye);
        dir.normalize();
        dir.mul(deltaForwardPos);

        // add to both eye and at so they are same distance away
        this.eye.add(dir);
        this.at.add(dir);

        dir = new Vector3(this.at.elements);
        dir.sub(this.eye);
        // vector perpendicular to direction = direction x up
        let sideways = Vector3.cross(dir, this.up);
        // scale the cross product to moveSpeed
        sideways.normalize();
        sideways.mul(deltaRightPos);

        this.eye.add(sideways);
        this.at.add(sideways);
    }

    changeLook(deltaHorizontalLook, deltaVerticalLook) {
        let dir = new Vector3(this.at.elements);
        dir.sub(this.eye);
        let r = dir.magnitude();
        let x = dir.elements[0], y = dir.elements[1], z = dir.elements[2];

        // get angles for spherical coordinates so we can change the look angle
        let theta = Math.atan2(z, x);   // horizontal
        theta += deltaHorizontalLook;

        let phi = Math.acos(y / r);     // vertical
        // keep from looking straight up/down since that causes hypersensitivity to horizontal rotation
        if (phi + deltaVerticalLook > this.verticalLookPadding
            && phi + deltaVerticalLook < Math.PI - this.verticalLookPadding) {
            phi += deltaVerticalLook;
        }

        // convert new angles back to cartesian
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi);
        z = r * Math.sin(phi) * Math.sin(theta);

        // make sure new at vector has consistent length
        this.at.set(this.eye);
        this.at.add(new Vector3([x, y, z]));
        this.at.normalize();
        this.at.mul(this.atDist);

        // make sure up vector is always perpendicular to at
        phi -= Math.PI / 2;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi);
        z = r * Math.sin(phi) * Math.sin(theta);
        this.up.set(new Vector3([x, y, z]));
        this.up.normalize();

        console.log(Math.acos(Vector3.dot(this.at, this.up) / this.at.magnitude() / this.up.magnitude()) * 180 / Math.PI);
    }
}