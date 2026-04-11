class Point {
  constructor() {
    this.type = "point";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    // set values for vertex/frag shaders
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_PointSize, this.size);
    
    // Draw a point
    // mode, first vertex to draw from, number of vertices to draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}