class NormalledCube extends Shape {
  constructor(baseColor) {
    super();
    this.baseColor = baseColor;
    this.matrix = new Matrix4();

    this.setUpBuffer();

    this.verticesAndNormals = new Float32Array([
      // back
      -0.5,-0.5,-0.5,0,0,-1, -0.5,0.5,-0.5,0,0,-1, 0.5,-0.5,-0.5,0,0,-1, 0.5,0.5,-0.5,0,0,-1, -0.5,0.5,-0.5,0,0,-1, 0.5,-0.5,-0.5,0,0,-1,
      // right
      0.5,-0.5,-0.5,1,0,0, 0.5,0.5,-0.5,1,0,0, 0.5,-0.5,0.5,1,0,0, 0.5,0.5,0.5,1,0,0, 0.5,0.5,-0.5,1,0,0, 0.5,-0.5,0.5,1,0,0,
      // left
      -0.5,-0.5,-0.5,-1,0,0, -0.5,0.5,-0.5,-1,0,0, -0.5,-0.5,0.5,-1,0,0, -0.5,0.5,0.5,-1,0,0, -0.5,0.5,-0.5,-1,0,0, -0.5,-0.5,0.5,-1,0,0,
      // bottom
      -0.5,-0.5,0.5,0,-1,0, 0.5,-0.5,0.5,0,-1,0, -0.5,-0.5,-0.5,0,-1,0, 0.5,-0.5,-0.5,0,-1,0, 0.5,-0.5,0.5,0,-1,0, -0.5,-0.5,-0.5,0,-1,0,
      // top
      -0.5,0.5,0.5,0,1,0, 0.5,0.5,0.5,0,1,0, -0.5,0.5,-0.5,0,1,0, 0.5,0.5,-0.5,0,1,0, 0.5,0.5,0.5,0,1,0, -0.5,0.5,-0.5,0,1,0,
      // front
      -0.5,-0.5,0.5,0,0,1, 0.5,-0.5,0.5,0,0,1, -0.5,0.5,0.5,0,0,1, 0.5,0.5,0.5,0,0,1, 0.5,-0.5,0.5,0,0,1, -0.5,0.5,0.5,0,0,1,
    ]);
  }

  setUpBuffer() {
    this.cornersAndNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornersAndNormalsBuffer);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Normal);
  }

  render() {
    this.drawNormalledRect(this.verticesAndNormals);
  }

  drawNormalledRect(cornersAndNorms, textureNum) {
    // cornersAndNorms = new Float32Array(cornersAndNorms);
    gl.bufferData(gl.ARRAY_BUFFER, cornersAndNorms, gl.DYNAMIC_DRAW);
    let FSIZE = cornersAndNorms.BYTES_PER_ELEMENT;

    // numeric values: components per vertex for this attribute,
    //                  stride (total comps per vert),
    //                  offset (where in the vert comps this attribute starts)
    // position is 3 comps out of 5 total, and they come first
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 0);
    // UV is 2 comps out of 5, and they start at index 3
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);

    gl.uniform1i(u_NormOrTex, (g_normVis === "on") ? 0 : 1);

    // set up base color filter
    gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // using a strip means the last 2 vertices of the prev tri are used for the next tri
    gl.drawArrays(gl.TRIANGLES, 0, cornersAndNorms.length / 6);
  }
}