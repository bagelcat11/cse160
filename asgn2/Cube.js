class Cube extends Shape {
    constructor() {
        super();
    }

    render() {
        var rgba = this.color.slice();
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // draw front
        // CCW
        this.drawTriangles3D([0,0,0, 1,0,0, 1,1,0,], rgba);
        this.drawTriangles3D([0,0,0, 1,1,0, 0,1,0,], rgba);

        // top
        // fake some lighting first
        rgba = rgba.map(c => c * 0.5);
        this.drawTriangles3D([0,1,0, 1,1,-1, 0,1,-1,], rgba);
        this.drawTriangles3D([0,1,0, 1,1,0, 1,1,-1,], rgba);

        // bottom
        rgba = rgba.map(c => c * 0.5);
        this.drawTriangles3D([0,0,0, 1,0,-1, 0,0,-1,], rgba);
        this.drawTriangles3D([0,0,0, 1,0,0, 1,0,-1,], rgba);

        // back
        rgba = rgba.map(c => c * 0.5);
        this.drawTriangles3D([0,0,-1, 1,1,-1, 1,0,-1,], rgba);
        this.drawTriangles3D([0,0,-1, 0,1,-1, 1,1,-1,], rgba);
    }
}