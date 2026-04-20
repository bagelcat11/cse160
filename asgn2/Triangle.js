class Triangle {
  constructor() {
    this.type = "triangle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    // allow others (me) to specify custom vertices
    this.vertices; 
  }

  render() {
    // if no custom vertices, use default from position
    if (this.vertices === undefined) {
      let xy = this.position;
      let s = this.size / 150;  // distance from click position to vertices
      this.vertices = [xy[0], xy[1] + s, xy[0] - s, xy[1] - s, xy[0] + s, xy[1] - s];
    }

    // use our own drawTriangle function since we need to handle buffer things
    // array is components of all 3 vertices of the triangle
    this.drawTriangle(this.vertices);
  }

  drawTriangle(vertices) {
    var n = vertices.length / 2;  // num tris = vertices / 2 comps per vertex

    // create buffer object
    var vertexBuffer = gl.createBuffer();
    // bind buffer to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // write data to buffer
    // convert to F32Arr for GLSL
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // assign buffer to attribute var
    // var, # comps per vertex, type, f=normalize to [-1, 1], stride, offset
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // enable assignment
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  drawTriangle3D(vertices) {
    var n = vertices.length / 3;  // num tris = vertices / 3 comps per vertex

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // 3 comps instead of 2
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
}