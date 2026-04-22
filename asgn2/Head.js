class Head extends Shape {
    constructor() {
        super();
    }

    render() {
        var rgba = this.color.slice();

        // draw bottom
        this.drawRectangle3D([0,-0.2,0, 1,-0.2,0, 0,1,0, 1,1,0,], rgba);

        // back
        rgba = [1, 1, 0, 1];
        this.drawRectangle3D([0,1,0, 0,1,-1, 1,1,0, 1,1,-1,], rgba);

        // its right
        rgba = [1, 0, 0, 1];
        this.drawRectangle3D([0,0,0, 0,1,0, 0,0,-1, 0,1,-1], rgba);

        // its left
        rgba = [0, 1, 0, 1];
        this.drawRectangle3D([1,0,0, 1,0,-1, 1,1,0, 1,1,-1,], rgba);

        // front
        rgba = [0, 0, 1, 1];
        this.drawRectangle3D([0,0,0, 0,0,-1, 1,0,0, 1,0,-1,], rgba);

        // top
        rgba = [1, 1, 1, 1];
        this.drawRectangle3D([0,0,-1, 1,0,-1, 0,1,-1, 1,1,-1,], rgba);

        // nose top
        this.drawRectangle3D([0,-0.2,-0.3, 1,-0.2,-0.3, 0,0,-0.6, 1,0,-0.6], rgba);

        // nose front
        rgba = [0.7, 0.7, 0.7, 1.0];
        this.drawRectangle3D([0,-0.2,-0.3, 1,-0.2,-0.3, 0,-0.2,0, 1,-0.2,0], rgba);


    }
}