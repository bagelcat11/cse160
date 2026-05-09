// to be instantiated in asgn3.js.
// handles perspective and changing setLookAt with mouse/keyboard input.
class Camera {
    constructor() {
        // vectors for setLookAt (actual Vec3s since we wanna do math)
        this.eye = new Vector3([0,0.5,2]);
        this.at = new Vector3([0,0.5,-10]);
        this.up = new Vector3([0,1,0]);

        // perspective won't change, so do that here
        let projMtx = new Matrix4();
        // fov, aspect ratio, near plane dist, far plane dist
        //    plane dist: how close/far you have to be before things clip
        projMtx.setPerspective(60, canvas.width / canvas.height, 0.1, 128);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMtx.elements);

        this.moveSpeed = 0.1;   // generic webgl units
        this.lookSpeed = 5 * (Math.PI / 180);   // convert deg to rad

        // set up listener for keyboard
        document.addEventListener("keydown", (event) => this.handleKeyboardMovement(event));
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
    }

    handleKeyboardMovement(event) {
        switch (event.key) {
            case "w":
                this.changePositionForwardBack(this.moveSpeed);
                break;
            case "a":
                this.changePositionLeftRight(-this.moveSpeed);
                break;
            case "s":
                this.changePositionForwardBack(-this.moveSpeed);
                break;
            case "d":
                this.changePositionLeftRight(this.moveSpeed);
                break;

            // can look with keyboard also for now
            case "q":
                this.changeHorizontalLook(-this.lookSpeed);
                break;
            case "e":
                this.changeHorizontalLook(this.lookSpeed);
                break;

            default:
                break;    
        }
    }

    changePositionForwardBack(deltaPos) {
        // get direction vector with length moveSpeed
        // MAKE COPY SINCE DIRECTLY CALCULATING this.at - this.eye WOULD AFFECT this.at
        let dir = new Vector3(this.at.elements);
        dir.sub(this.eye);
        dir.normalize();
        dir.mul(deltaPos);

        // add to both eye and at so they are same distance away
        this.eye.add(dir);
        this.at.add(dir);
    }

    changePositionLeftRight(deltaPos) {
        let dir = new Vector3(this.at.elements);
        dir.sub(this.eye);
        // vector perpendicular to direction = direction x up
        let sideways = Vector3.cross(dir, this.up);
        // scale the cross product to moveSpeed
        sideways.normalize();
        sideways.mul(deltaPos);

        this.eye.add(sideways);
        this.at.add(sideways);
    }

    changeHorizontalLook(deltaLook) {
        // get direction from eye to at
        let dir = new Vector3(this.at.elements);
        dir.sub(this.eye);
        // r = distance
        let r = dir.magnitude();
        // get angle from eye to at (z, x)
        let theta = Math.atan2(dir.elements[2], dir.elements[0]);
        // update angle based on Q or E
        theta += deltaLook;
        // calculate new coords for at with updated angle
        dir.elements[0] = r * Math.cos(theta);
        dir.elements[2] = r * Math.sin(theta);

        // new at is eye + direction we calculated
        this.at.set(this.eye);
        this.at.add(dir);
    }
}