class Triangle {
  constructor() {
    this.type = "triangle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    let xy = this.position;
    let s = this.size / 150;    // distance from click position to vertices

    // set values for color (size/position are later)
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    // use our own drawTriangle function since we need to handle buffer things
    // array is components of all 3 vertices of the triangle
    this.drawTriangle([xy[0], xy[1] + s, xy[0] - s, xy[1] - s, xy[0] + s, xy[1] - s]);
  }

  drawTriangle(vertices) {
    var n = 3;  // number of vertices

    // create buffer object
    var vertexBuffer = gl.createBuffer();
    // bind buffer to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // write data to buffer
    // convert to F32Arr for GLSL
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // assign buffer to attribute var
    // var, # comps per vertex, type, normalize to [-1, 1], stride, offset
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // enable assignment
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
}