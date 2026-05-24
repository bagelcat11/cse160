class NormalledTexturedCube extends Shape {
  constructor(textureNum, baseColor, texColorWeight) {
    super();
    this.textureNum = textureNum;
    this.baseColor = baseColor;
    this.texColorWeight = texColorWeight;
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();

    this.setUpBuffer();

    this.verticesAndUVsAndNorms = new Float32Array([
      // position x,y,z, UV u,v, normal x,y,z
      // back
      -0.5,-0.5,-0.5,0,0,0,0,-1, -0.5,0.5,-0.5,0,1,0,0,-1, 0.5,-0.5,-0.5,1,0,0,0,-1, 0.5,0.5,-0.5,1,1,0,0,-1, -0.5,0.5,-0.5,0,1,0,0,-1, 0.5,-0.5,-0.5,1,0,0,0,-1,
      // right
      0.5,-0.5,-0.5,0,0,1,0,0, 0.5,0.5,-0.5,0,1,1,0,0, 0.5,-0.5,0.5,1,0,1,0,0, 0.5,0.5,0.5,1,1,1,0,0, 0.5,0.5,-0.5,0,1,1,0,0, 0.5,-0.5,0.5,1,0,1,0,0,
      // left
      -0.5,-0.5,-0.5,0,0,-1,0,0, -0.5,0.5,-0.5,0,1,-1,0,0, -0.5,-0.5,0.5,1,0,-1,0,0, -0.5,0.5,0.5,1,1,-1,0,0, -0.5,0.5,-0.5,0,1,-1,0,0, -0.5,-0.5,0.5,1,0,-1,0,0,
      // bottom
      -0.5,-0.5,0.5,0,1,0,-1,0, 0.5,-0.5,0.5,0,0,0,-1,0, -0.5,-0.5,-0.5,1,1,0,-1,0, 0.5,-0.5,-0.5,1,0,0,-1,0, 0.5,-0.5,0.5,0,0,0,-1,0, -0.5,-0.5,-0.5,1,1,0,-1,0,
      // top
      -0.5,0.5,0.5,0,1,0,1,0, 0.5,0.5,0.5,0,0,0,1,0, -0.5,0.5,-0.5,1,1,0,1,0, 0.5,0.5,-0.5,1,0,0,1,0, 0.5,0.5,0.5,0,0,0,1,0, -0.5,0.5,-0.5,1,1,0,1,0,
      // front
      -0.5,-0.5,0.5,0,0,0,0,1, 0.5,-0.5,0.5,1,0,0,0,1, -0.5,0.5,0.5,0,1,0,0,1, 0.5,0.5,0.5,1,1,0,0,1, 0.5,-0.5,0.5,1,0,0,0,1, -0.5,0.5,0.5,0,1,0,0,1,
    ]);
  }

  setUpBuffer() {
    this.cornersAndUVsAndNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornersAndUVsAndNormalsBuffer);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Normal);
    gl.enableVertexAttribArray(a_UVCoords);
  }

  render() {
    this.drawNormalledTexturedRect(this.verticesAndUVsAndNorms, this.textureNum);
  }

  drawNormalledTexturedRect(cornersAndUVsAndNorms, textureNum) {
    // cornersAndUVsAndNorms = new Float32Array(cornersAndUVsAndNorms);
    gl.bufferData(gl.ARRAY_BUFFER, cornersAndUVsAndNorms, gl.DYNAMIC_DRAW);
    let FSIZE = cornersAndUVsAndNorms.BYTES_PER_ELEMENT;

    // numeric values: components per vertex for this attribute,
    //                  stride (total comps per vert),
    //                  offset (where in the vert comps this attribute starts)
    // position is 3 comps out of 8 total, and they come first
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 0);
    // uv is 2 comps out of 8, and they start at index 3
    gl.vertexAttribPointer(a_UVCoords, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    // normal is 3 comps out of 8, and they start at index 3
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);

    gl.uniform1i(u_Sampler, textureNum);
    gl.uniform1i(u_NormOrTex, (g_normVis === "on") ? 0 : 1);

    // set up base color filter
    gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
    gl.uniform1f(u_TexColorWeight, this.texColorWeight);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    this.normalMatrix.setInverseOf(this.matrix).transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    // using a strip means the last 2 vertices of the prev tri are used for the next tri
    gl.drawArrays(gl.TRIANGLES, 0, cornersAndUVsAndNorms.length / 8);
  }
}