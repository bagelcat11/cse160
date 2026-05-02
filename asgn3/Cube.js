class Cube extends Shape {
    constructor() {
        super();
    }

    render() {
        var rgba = this.color.slice();

        // top
        this.drawRectangle3D([-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5,], rgba);

        // right
        rgba = rgba.map(c => c * 0.75);
        this.drawRectangle3D([0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,], rgba);

        // left
        rgba = rgba.map(c => c * 0.75);
        this.drawRectangle3D([-0.5,-0.5,-0.5, -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,], rgba);

        // front
        rgba = rgba.map(c => c * 0.75);
        this.drawRectangle3D([-0.5,-0.5,0.5, 0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,], rgba);

        // back
        rgba = rgba.map(c => c * 0.75);
        this.drawRectangle3D([-0.5,0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5,], rgba);

        // bottom
        rgba = rgba.map(c => c * 0.75);
        this.drawRectangle3D([-0.5,-0.5,0.5, 0.5,-0.5,0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,], rgba);
    }
}