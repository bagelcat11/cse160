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
        // draw front
        tri.drawTriangle3D([0.0, 0.0, 0.0,
                        1.0, 1.0, 0.0,
                        1.0, 0.0, 0.0
        ]);
        tri.drawTriangle3D([0.0, 0.0, 0.0,
                        0.0, 1.0, 0.0,
                        1.0, 1.0, 0.0
        ]);
    }
}