class Head extends Shape {
    constructor() {
        super();
    }

    render() {
        let rgba = LOKI_WHITE;

        // draw bottom
        this.drawRectangle3D([0,0,0, 1,0,0, 0,1,0, 1,1,0,], rgba);

        // back
        rgba = LOKI_DARK_BROWN;
        this.drawRectangle3D([0,1,0, 0,1,-1, 1,1,0, 1,1,-1,], rgba);

        // right
        this.drawRectangle3D([0,0,0, 0,1,0, 0,0,-1, 0,1,-1], rgba);

        // left
        this.drawRectangle3D([1,0,0, 1,0,-1, 1,1,0, 1,1,-1,], rgba);

        // top
        this.drawRectangle3D([0,0,-1, 1,0,-1, 0,1,-1, 1,1,-1,], rgba);

        // front
        // rgba = LOKI_MED_BROWN;
        this.drawRectangle3D([0,0,0, 0,0,-1, 1,0,0, 1,0,-1,], rgba);

        // nose top
        rgba = LOKI_MED_BROWN;
        this.drawRectangle3D([0.35,-0.3,-0.3, 0.65,-0.3,-0.3, 0.35,0,-0.5, 0.65,0,-0.5], rgba);

        // nose front
        rgba = LOKI_LIGHT_BROWN;
        this.drawRectangle3D([0.35,-0.3,-0.3, 0.65,-0.3,-0.3, 0.35,-0.2,0, 0.65,-0.2,0], rgba);

        // mouth left, right
        // rgba = LOKI_MED_BROWN;
        rgba = LOKI_LIGHT_BROWN;
        this.drawTriangles3D([0.65,-0.3,-0.3, 0.65,-0.2,0, 1,0,0], rgba, gl.TRIANGLES);
        this.drawTriangles3D([0.35,-0.3,-0.3, 0.35,-0.2,0, 0,0,0], rgba, gl.TRIANGLES);

        // eye left, right
        rgba = LOKI_LIGHT_BROWN;
        this.drawTriangles3D([0.65,-0.3,-0.3, 1,0,-0.5, 0.65,0,-0.5], rgba, gl.TRIANGLES);
        this.drawTriangles3D([0.35,-0.3,-0.3, 0,0,-0.5, 0.35,0,-0.5], rgba, gl.TRIANGLES);

        // eyebrow thingies
        this.drawTriangles3D([0.55,-0.01,-0.4, 1,-0.01,-0.72, 0.6,-0.01,-0.7], rgba, gl.TRIANGLES);
        this.drawTriangles3D([0.45,-0.01,-0.4, 0,-0.01,-0.72, 0.4,-0.01,-0.7], rgba, gl.TRIANGLES);

        // side cheek left, right
        this.drawTriangles3D([1.2,0.3,-0.25, 1,0,-0.5, 1,0,0], rgba, gl.TRIANGLES);
        this.drawTriangles3D([-0.2,0.3,-0.25, 0,0,-0.5, 0,0,0], rgba, gl.TRIANGLES);

        // cheek left, right
        rgba = LOKI_MED_BROWN;
        this.drawTriangles3D([0.65,-0.3,-0.3, 1,0,-0.5, 1,0,0], rgba, gl.TRIANGLES);
        this.drawTriangles3D([0.35,-0.3,-0.3, 0,0,-0.5, 0,0,0], rgba, gl.TRIANGLES);

        // forehead lines!!
        this.drawRectangle3D([0.4,-0.01,-0.9, 0.3,-0.01,-0.9, 0.4,-0.01,-0.77, 0.3,-0.01,-0.77,], rgba);
        this.drawRectangle3D([0.6,-0.01,-0.9, 0.7,-0.01,-0.9, 0.6,-0.01,-0.77, 0.7,-0.01,-0.77,], rgba);

        // side cheek left under, over, back
        rgba = LOKI_MED_BROWN;
        this.drawTriangles3D([1.2,0.3,-0.25, 1,0,0, 1,0.7,0], rgba, gl.TRIANGLES);
        this.drawTriangles3D([1.2,0.3,-0.25, 1,0,-0.5, 1,0.7,-0.5], rgba, gl.TRIANGLES);
        this.drawTriangles3D([1.2,0.3,-0.25, 1,0.7,0, 1,0.7,-0.5], rgba, gl.TRIANGLES);

        // side cheek right under, over, back
        this.drawTriangles3D([-0.2,0.3,-0.25, 0,0,0, 0,0.7,0], rgba, gl.TRIANGLES);
        this.drawTriangles3D([-0.2,0.3,-0.25, 0,0,-0.5, 0,0.7,-0.5], rgba, gl.TRIANGLES);
        this.drawTriangles3D([-0.2,0.3,-0.25, 0,0.7,0, 0,0.7,-0.5], rgba, gl.TRIANGLES);

        // roof of mouth
        this.drawRectangle3D([0,0,0, 0.35,-0.2,0, 1,0,0, 0.65,-0.2,0,], LOKI_MED_BROWN, gl.TRIANGLE_STRIP);
        this.drawRectangle3D([0.2,0,0.01, 0.35,0.5,0.01, 0.8,0,0.01, 0.65,0.5,0.01,], this.RED, gl.TRIANGLE_STRIP);

        // top teeth!!!
        this.drawTriangles3D([0.3,-0.1,0.1, 0.4,-0.05,0, 0.3,-0.15,0, 0.2,-0.05,0,], this.WHITE, gl.TRIANGLE_FAN);
        this.drawTriangles3D([0.7,-0.1,0.1, 0.8,-0.05,0, 0.7,-0.15,0, 0.6,-0.05,0,], this.WHITE, gl.TRIANGLE_FAN);

        // nose!!!
        rgba = this.BLACK;
        this.drawTriangles3D([0.35,-0.3,-0.3, 0.65,-0.3,-0.3, 0.5,-0.31,-0.15], rgba, gl.TRIANGLES);

        // mouth!!!
        this.drawRectangle3D([0.48,-0.31,-0.22, 0.52,-0.31,-0.22, 0.48,-0.21,-0.01, 0.52,-0.21,-0.01,], rgba);
        this.drawTriangles3D([0.35,-0.21,-0.01, 0.65,-0.21,-0.01, 0.5,-0.25,-0.08], rgba, gl.TRIANGLES);
    }
}