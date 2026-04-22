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
  }

  render() {
    this.drawTriangles3D(this.vertices);
  }

  drawTriangles3D(vertices, color) {
    let n = vertices.length / 3;  // num tris = vertices / 3 comps per vertex

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    // matrix transform!!
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //TODO: consider tri fan?
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  drawRectangle3D(corners, color) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.DYNAMIC_DRAW);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // using a strip means the last 2 vertices of the prev tri are used for the next tri
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, corners.length / 3);  // 3 comps per corner
  }
}