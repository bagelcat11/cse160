// to be instantiated in asgn3.js.
// handles perspective and changing setLookAt with mouse/keyboard input.
class Camera {
    constructor() {
        // vectors for setLookAt
        this.eye = [0,0,2];
        this.at = [0,0,-10];
        this.up = [0,1,0];

        // perspective won't change, so do that here
        let projMtx = new Matrix4();
        // fov, aspect ratio, near plane dist, far plane dist
        //    plane dist: how close/far you have to be before things clip
        projMtx.setPerspective(60, canvas.width / canvas.height, 0.1, 32);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMtx.elements);

        this.moveSpeed = 0.1;
        // key listeners
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                // move both eye and at so that they are always the same distance away
                case "w":
                    this.eye[2] -= this.moveSpeed;
                    this.at[2] -= this.moveSpeed;
                    break;
                case "a":
                    this.eye[0] -= this.moveSpeed;
                    this.at[0] -= this.moveSpeed;
                    break;
                case "s":
                    this.eye[2] += this.moveSpeed;
                    this.at[2] += this.moveSpeed;
                    break;
                case "d":
                    this.eye[0] += this.moveSpeed;
                    this.at[0] += this.moveSpeed;
                    break;
                default:
                    break;    
            }
        });
    }

    cameraTick() {  // every frame
        let viewMtx = new Matrix4();
        // eye position, pos to look at (conventionally, -z), up direction
        viewMtx.setLookAt(this.eye[0],this.eye[1],this.eye[2], this.at[0],this.at[1],this.at[2], this.up[0],this.up[1],this.up[2]);
        gl.uniformMatrix4fv(u_ViewMatrix, false, viewMtx.elements);
    }
}