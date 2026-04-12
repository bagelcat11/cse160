class Point {
  constructor() {
    this.type = "point";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    // disable buffer since we are just passing one point
    gl.disableVertexAttribArray(a_Position);

    // set values for vertex/frag shaders
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);

    // if in party mode, make vertex colors random
    if (g_partyModeSelector.value === "on") {
        this.color[0] = Math.random();
        this.color[1] = Math.random();
        this.color[2] = Math.random();
    }
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_PointSize, this.size);
    
    // mode (how to interpret buffer data), first vertex to draw from, number of vertices to draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}