class Body extends Shape {
    constructor() {
        super();

        // this.randColors = [];
        // for (let i = 0; i < 16; i++) {
        //     this.randColors.push(Math.random());
        // }
    }

    render() {
        let radius = 0.25;
        let length = 1.0;
        let numSides = 8
        // front octagonal prism
        let v = [0,0,0];
        let angleStep = 360 / numSides;
        for (let angle = 0; angle < 360; angle += angleStep) {
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle * Math.PI / 180) * radius, Math.sin(angle * Math.PI / 180) * radius];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * radius, Math.sin(angle2 * Math.PI / 180) * radius];

            v.push(vec1[0], 0, vec1[1], vec2[0], 0, vec2[1],);
        }

        this.drawTriangles3D(v, LOKI_WHITE, gl.TRIANGLE_FAN);

        // back
        v = [0,length,0];
        for (let angle = 0; angle < 360; angle += angleStep) {
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle * Math.PI / 180) * radius, Math.sin(angle * Math.PI / 180) * radius];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * radius, Math.sin(angle2 * Math.PI / 180) * radius];

            v.push(vec1[0], length, vec1[1], vec2[0], length, vec2[1],);
        }

        this.drawTriangles3D(v, LOKI_MED_BROWN, gl.TRIANGLE_FAN);

        // fill rects (bottom half)
        for (let i = 1; i < numSides; i++) {
            let rgba = LOKI_WHITE;
            this.drawRectangle3D([  v[i*3+0], length, v[i*3+2],
                                    v[i*3+3], length, v[i*3+5],
                                    v[i*3+0], 0, v[i*3+2],
                                    v[i*3+3], 0, v[i*3+5],],
                                    rgba);
        }
        // top half
        for (let i = numSides; i <= numSides * 2; i++) {
            let rgba = LOKI_DARK_BROWN;
            this.drawRectangle3D([  v[i*3+0], length, v[i*3+2],
                                    v[i*3+3], length, v[i*3+5],
                                    v[i*3+0], 0, v[i*3+2],
                                    v[i*3+3], 0, v[i*3+5],],
                                    rgba);
        }
    }
}