class Jaw extends Shape {
    constructor() {
        super();
    }

    render() {
        let rgba = LOKI_WHITE;
        // front
        this.drawRectangle3D([0.35,-0.1,0.1, 0.65,-0.1,0.1, 0.35,-0.2,0, 0.65,-0.2,0], rgba);

        // front left
        rgba = rgba.map(c => c*0.5)
        this.drawTriangles3D([0.65,-0.1,0.1, 0.65,-0.2,0, 0.8,0,0], rgba, gl.TRIANGLES);

        // mouth right
        this.drawTriangles3D([0.35,-0.1,0.1, 0.35,-0.2,0, 0.2,0,0], rgba, gl.TRIANGLES);

        // bottom center
        this.drawRectangle3D([0.35,-0.1,0.1, 0.65,-0.1,0.1, 0.35,0.5,0, 0.65,0.5,0], rgba);

        // bottom mouth
        rgba = this.BLACK;
        this.drawTriangles3D([0.35,-0.2,0, 0.65,-0.2,0, 0.5,-0.2,0.02], rgba, gl.TRIANGLES);

        // bottom sides
        rgba = LOKI_WHITE;
        this.drawTriangles3D([0.8,0,0, 0.65,-0.1,0.1, 0.65,0.5,0,], rgba, gl.TRIANGLES);
        this.drawTriangles3D([0.2,0,0, 0.35,-0.1,0.1, 0.35,0.5,0,], rgba, gl.TRIANGLES);

        // teeth (hidden when closed)
        rgba = this.WHITE;
        this.drawTriangles3D([0.4,-0.1,-0.1, 0.45,-0.05,0, 0.4,-0.15,0, 0.3,-0.05,0,], this.WHITE, gl.TRIANGLE_FAN);
        this.drawTriangles3D([0.6,-0.1,-0.1, 0.55,-0.05,0, 0.6,-0.15,0, 0.7,-0.05,0,], this.WHITE, gl.TRIANGLE_FAN);

        // cheeks
        rgba = this.BLACK;
        this.drawTriangles3D([0.8,0,0, 0.65,0.5,0, 0.8,0.3,-0.5], rgba, gl.TRIANGLES);
        this.drawTriangles3D([0.2,0,0, 0.35,0.5,0, 0.2,0.3,-0.5], rgba, gl.TRIANGLES);

        // other things
        rgba = this.BLACK;
        this.drawTriangles3D([0.8,0,0, 1,0.3,-0.5, 0.65,-0.1,0.1,], rgba, gl.TRIANGLES);
        this.drawTriangles3D([0.2,0,0, 0,0.3,-0.5, 0.35,-0.1,0.1,], rgba, gl.TRIANGLES);

        // bottom inside
        rgba = this.RED;
        this.drawRectangle3D([0.2,0,0, 0.35,-0.2,0, 0.8,0,0, 0.65,-0.2,0,], rgba, gl.TRIANGLE_STRIP);
        this.drawRectangle3D([0.2,0,0, 0.35,0.5,0, 0.8,0,0, 0.65,0.5,0,], rgba, gl.TRIANGLE_STRIP);
    }
}