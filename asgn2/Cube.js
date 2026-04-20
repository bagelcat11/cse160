class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        let tri = new Triangle();
        tri.color = rgba;
        tri.matrix = this.matrix;
        // draw front
        // CCW
        tri.drawTriangle3D([0,0,0, 1,0,0, 1,1,0,]);
        tri.drawTriangle3D([0,0,0, 1,1,0, 0,1,0,]);

        // top
        // fake some lighting first
        tri.color = tri.color.map(c => c * 0.5);
        tri.drawTriangle3D([0,1,0, 1,1,-1, 0,1,-1,]);
        tri.drawTriangle3D([0,1,0, 1,1,0, 1,1,-1,]);

        // bottom
        tri.color = tri.color.map(c => c * 0.5);
        tri.drawTriangle3D([0,0,0, 1,0,-1, 0,0,-1,]);
        tri.drawTriangle3D([0,0,0, 1,0,0, 1,0,-1,]);

        // back
        tri.color = tri.color.map(c => c * 0.5);
        tri.drawTriangle3D([0,0,-1, 1,1,-1, 1,0,-1,]);
        tri.drawTriangle3D([0,0,-1, 0,1,-1, 1,1,-1,]);
    }
}