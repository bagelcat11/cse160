// handles perspective and changing setLookAt with mouse/keyboard input.
class Camera {
    constructor() {
        // vectors for setLookAt (actual Vec3s since we wanna do math)
        this.eye = new Vector3([0,0.5,0]);
        this.at = new Vector3([0,0.5,-200]);
        this.atDist = 200;
        this.up = new Vector3([0,5.5,0]);

        // perspective won't change, so do that here
        let projMtx = new Matrix4();
        // fov, aspect ratio, near plane dist, far plane dist
        //    plane dist: how close/far you have to be before things clip
        projMtx.setPerspective(60, canvas.width / canvas.height, 0.1, 256);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMtx.elements);

        this.maxSpeed = 0.1;   // generic webgl units
        this.lookSpeed = 5 * (Math.PI / 180);   // convert deg to rad
        this.verticalLookPadding = 5 * (Math.PI / 180);   // stay x degrees away from looking straight up/down

        // set up listener for keyboard
        document.addEventListener("keydown", (event) => this.handleKeyboardMovement(event));
    }

    cameraTick() {  // every frame
        let viewMtx = new Matrix4();

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
                this.changePosition(this.maxSpeed, 0);
                break;
            case "a":
                this.changePosition(0, -this.maxSpeed);
                break;
            case "s":
                this.changePosition(-this.maxSpeed, 0);
                break;
            case "d":
                this.changePosition(0, this.maxSpeed);
                break;

            // can look with keyboard horizontally only
            case "q":
                this.changeLook(-this.lookSpeed, 0);
                break;
            case "e":
                this.changeLook(this.lookSpeed, 0);
                break;

            case "m":
                console.log("position:", this.eye.elements[0].toFixed(3),
                this.eye.elements[1].toFixed(3),
                this.eye.elements[2].toFixed(3));

                console.log("cursorat:", this.cursorAt.elements[0].toFixed(3),
                this.cursorAt.elements[1].toFixed(3),
                this.cursorAt.elements[2].toFixed(3));

                console.log("at:", this.at.elements[0].toFixed(3),
                this.at.elements[1].toFixed(3),
                this.at.elements[2].toFixed(3));

            default:
                break;    
        }
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
        // these are the endpoint coordinates of the direction vector from eye to new at
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi);
        z = r * Math.sin(phi) * Math.sin(theta);

        // make sure new at position has consistent distance from eye
        let d = new Vector3([x,y,z]);
        d.normalize();
        d.mul(this.atDist);
        this.at.set(this.eye);
        this.at.add(d);

        // make sure up vector is always perpendicular to at
        // phi -= Math.PI / 2;
        x = r * Math.sin(phi - Math.PI / 2) * Math.cos(theta);
        y = r * Math.cos(phi - Math.PI / 2);
        z = r * Math.sin(phi - Math.PI / 2) * Math.sin(theta);
        this.up.set(new Vector3([x, y, z]).normalize());
    }
}