class Circle {
  constructor() {
    this.type = "circle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.segments = 16;
  }

  render() {
    let xy = this.position;

    // set values for color
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    let s = this.size / 150;    // distance from click position to vertices

    // draw a circle by drawing triangles in a loop around a point (xy)
    let angleStep = 360 / this.segments;
    //TODO: this could be improved by using TRIANGLE_FAN rather than calling normal drawTriangle
    for (let angle = 0; angle < 360; angle += angleStep) {
      let angle2 = angle + angleStep;
      let vec1 = [Math.cos(angle * Math.PI / 180) * s, Math.sin(angle * Math.PI / 180) * s];
      let vec2 = [Math.cos(angle2 * Math.PI / 180) * s, Math.sin(angle2 * Math.PI / 180) * s];
      let pt1 = [xy[0] + vec1[0], xy[1] + vec1[1]];
      let pt2 = [xy[0] + vec2[0], xy[1] + vec2[1]];

      Triangle.drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
    }
  }
}