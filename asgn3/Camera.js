// to be instantiated in asgn3.js.
// handles perspective and changing setLookAt with mouse/keyboard input.
class Camera {
    constructor() {
        // vectors for setLookAt (actual Vec3s since we wanna do math)
        this.eye = new Vector3([0,0,2]);
        this.at = new Vector3([0,0,-10]);
        this.up = new Vector3([0,1,0]);

        // perspective won't change, so do that here
        let projMtx = new Matrix4();
        // fov, aspect ratio, near plane dist, far plane dist
        //    plane dist: how close/far you have to be before things clip
        projMtx.setPerspective(60, canvas.width / canvas.height, 0.1, 32);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMtx.elements);

        this.moveSpeed = 0.1;   // generic webgl units
        this.lookSpeed = 5 * (Math.PI / 180);   // convert deg to rad

        // set up listener for keyboard
        document.addEventListener("keydown", (event) => this.handleKeyboardMovement(event));
    }

    cameraTick() {  // every frame
        let viewMtx = new Matrix4();
        // eye position, pos to look at (conventionally, -z), up direction
        viewMtx.setLookAt(this.eye.x,this.eye.y,this.eye.z,
            this.at.x,this.at.y,this.at.z,
            this.up.x,this.up.y,this.up.z);
        gl.uniformMatrix4fv(u_ViewMatrix, false, viewMtx.elements);
    }

    handleKeyboardMovement(event) {
        switch (event.key) {
            // move both eye and at so that they are always the same distance away
            case "w":
                this.eye.z -= this.moveSpeed;
                this.at.z -= this.moveSpeed;
                break;
            case "a":
                this.eye.x -= this.moveSpeed;
                this.at.x -= this.moveSpeed;
                break;
            case "s":
                this.eye.z += this.moveSpeed;
                this.at.z += this.moveSpeed;
                break;
            case "d":
                this.eye.x += this.moveSpeed;
                this.at.x += this.moveSpeed;
                break;

            // can look with keyboard also for now
            case "q":
                this.updateLookDirection(true);
                break;
            case "e":
                this.updateLookDirection(false);
                break;

            default:
                break;    
        }
    }

    updateLookDirection(isTurningLeft) {
        // get direction from eye to at
        let dir = this.at.sub(this.eye);
        // r = distance: only use x and z for 2D
        let r = Math.sqrt(dir.x * dir.x + dir.z * dir.z);
        // get angle from eye to at
        let theta = Math.atan2(dir.z, dir.x);
        // update angle based on Q or E
        theta += (isTurningLeft) ? -this.lookSpeed : this.lookSpeed;
        // calculate new coords for at with updated angle
        let newX = r * Math.cos(theta);
        let newZ = r * Math.sin(theta);
        dir.x = newX;
        dir.z = newZ;

        this.at = this.at.add(dir);
    }
}