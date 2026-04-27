// generic class for polyhedra to inherit from. has different drawing helpers
class Shape {
  constructor() {
    // this.vertices = vertices;
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();

    // set up buffer in the constructor so we don't remake it!
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // handy colors
    this.RED = [1.0, 0.0, 0.0, 1.0];
    this.GREEN = [0.0, 1.0, 0.0, 1.0];
    this.BLUE = [0.0, 0.0, 1.0, 1.0];
    this.YELLOW = [1.0, 1.0, 0.0, 1.0];
    this.MAGENTA = [1.0, 0.0, 1.0, 1.0];
    this.CYAN = [0.0, 1.0, 1.0];
    this.WHITE = [1.0, 1.0, 1.0, 1.0];
    this.BLACK = [0.0, 0.0, 0.0, 1.0];
    this.GRAY = [0.5, 0.5, 0.5, 1.0];
    this.PINK = [1.0, 0.5, 0.5, 1.0];
    this.INDIGO = [0.5, 0.5, 1.0, 1.0];
    this.LIME = [0.5, 1.0, 0.5, 1.0];
  }

  render() {
    this.drawTriangles3D(this.vertices);
  }

  drawTriangles3D(vertices, color, mode) {
    let n = vertices.length / 3;  // num tris = vertices / 3 comps per vertex

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    // matrix transform!!
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.drawArrays(mode, 0, n);
  }

  drawRectangle3D(corners, color) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.DYNAMIC_DRAW);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // using a strip means the last 2 vertices of the prev tri are used for the next tri
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}