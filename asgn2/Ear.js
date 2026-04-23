class Ear extends Shape {
    constructor() {
        super();
    }

    render() {
        this.drawTriangles3D([0,0,0, -0.3,0,0.3, 0.15,0,0.5], this.MAGENTA, gl.TRIANGLES);
        this.drawTriangles3D([0,0,0, 0.15,0,0.5, 0,0.3,0.4], this.PINK, gl.TRIANGLES);
        this.drawTriangles3D([0,0,0, 0,0.3,0.4, -0.3,0,0.3,], this.GRAY, gl.TRIANGLES);
    }
}