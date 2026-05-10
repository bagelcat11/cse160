class TexturedCube extends Shape {
  constructor(textureNum, baseColor, texColorWeight) {
    super();
    this.textureNum = textureNum;
    this.baseColor = baseColor;
    this.texColorWeight = texColorWeight;
    this.matrix = new Matrix4();

    this.setUpBuffer();

    this.verticesAndUVs = new Float32Array([
      // top
      -0.5,-0.5,-0.5,0,0, 0.5,-0.5,-0.5,1,0, -0.5,0.5,-0.5,0,1, 0.5,0.5,-0.5,1,1, 0.5,-0.5,-0.5,1,0, -0.5,0.5,-0.5,0,1,
      // right
      0.5,-0.5,-0.5,1,1, 0.5,0.5,-0.5,1,0, 0.5,-0.5,0.5,0,1, 0.5,0.5,0.5,0,0, 0.5,0.5,-0.5,1,0, 0.5,-0.5,0.5,0,1,
      // left
      -0.5,-0.5,-0.5,1,1, -0.5,0.5,-0.5,1,0, -0.5,-0.5,0.5,0,1, -0.5,0.5,0.5,0,0, -0.5,0.5,-0.5,1,0, -0.5,-0.5,0.5,0,1,
      // front
      -0.5,-0.5,0.5,0,1, 0.5,-0.5,0.5,0,0, -0.5,-0.5,-0.5,1,1, 0.5,-0.5,-0.5,1,0, 0.5,-0.5,0.5,0,0, -0.5,-0.5,-0.5,1,1,
      // back
      -0.5,0.5,0.5,0,1, 0.5,0.5,0.5,0,0, -0.5,0.5,-0.5,1,1, 0.5,0.5,-0.5,1,0, 0.5,0.5,0.5,0,0, -0.5,0.5,-0.5,1,1,
      // bottom
      -0.5,-0.5,0.5,0,0, 0.5,-0.5,0.5,1,0, -0.5,0.5,0.5,0,1, 0.5,0.5,0.5,1,1, 0.5,-0.5,0.5,1,0, -0.5,0.5,0.5,0,1,
    ]);
  }

  setUpBuffer() {
    this.cornersAndUVsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornersAndUVsBuffer);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_UVCoords);
  }

  

  render() {
    this.drawTexturedRect(this.verticesAndUVs, this.textureNum);
    // //top
    // this.drawTexturedRect([-0.5,-0.5,-0.5,0,0, 0.5,-0.5,-0.5,1,0, -0.5,0.5,-0.5,0,1, 0.5,0.5,-0.5,1,1,], this.textureNum);
    // // right
    // this.drawTexturedRect([0.5,-0.5,-0.5,1,1, 0.5,0.5,-0.5,1,0, 0.5,-0.5,0.5,0,1, 0.5,0.5,0.5,0,0,], this.textureNum);
    // // left
    // this.drawTexturedRect([-0.5,-0.5,-0.5,1,1, -0.5,0.5,-0.5,1,0, -0.5,-0.5,0.5,0,1, -0.5,0.5,0.5,0,0,], this.textureNum);
    // // front
    // this.drawTexturedRect([-0.5,-0.5,0.5,0,1, 0.5,-0.5,0.5,0,0, -0.5,-0.5,-0.5,1,1, 0.5,-0.5,-0.5,1,0,], this.textureNum);
    // // back
    // this.drawTexturedRect([-0.5,0.5,0.5,0,1, 0.5,0.5,0.5,0,0, -0.5,0.5,-0.5,1,1, 0.5,0.5,-0.5,1,0,], this.textureNum);
    // // bottom
    // this.drawTexturedRect([-0.5,-0.5,0.5,0,0, 0.5,-0.5,0.5,1,0, -0.5,0.5,0.5,0,1, 0.5,0.5,0.5,1,1,], this.textureNum);
  }

  drawTexturedRect(cornersAndUVs, textureNum) {
    // cornersAndUVs = new Float32Array(cornersAndUVs);
    gl.bufferData(gl.ARRAY_BUFFER, cornersAndUVs, gl.DYNAMIC_DRAW);
    let FSIZE = cornersAndUVs.BYTES_PER_ELEMENT;

    // numeric values: components per vertex for this attribute,
    //                  stride (total comps per vert),
    //                  offset (where in the vert comps this attribute starts)
    // position is 3 comps out of 5 total, and they come first
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 0);
    // UV is 2 comps out of 5, and they start at index 3
    gl.vertexAttribPointer(a_UVCoords, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);

    // give texture unit number to sampler
    gl.uniform1i(u_Sampler, textureNum);

    // set up base color filter
    gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
    gl.uniform1f(u_TexColorWeight, this.texColorWeight);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // using a strip means the last 2 vertices of the prev tri are used for the next tri
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, cornersAndUVs.length / 5);
    gl.drawArrays(gl.TRIANGLES, 0, cornersAndUVs.length / 5);
  }
}