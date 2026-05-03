class TexturedCube extends Shape {
  constructor(texturePath, baseColor, texColorWeight) {
    super();
    this.texturePath = texturePath;
    this.baseColor = baseColor;
    this.texColorWeight = texColorWeight;
    this.matrix = new Matrix4();

    this.setUpBuffer();
    this.initTexture();
  }

  setUpBuffer() {
    this.cornersAndUVsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornersAndUVsBuffer);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_UVCoords);
  }

  initTexture() {
    this.texture = gl.createTexture();
    this.img = new Image();
    // setup callback to load texture once browser loads image
    this.img.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip y axis
      gl.activeTexture(gl.TEXTURE0);  // set texture unit number
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      // set texture params
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // target, mipmap level, internalformat, texelformat, texel type, img
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.img);

      gl.uniform1i(u_Sampler, 0); // give unit 0 to the texture sampler
    };
    // have browser load image
    this.img.src = this.texturePath;
  }

  render() {
    //top
    this.drawTexturedRect([-0.5,-0.5,-0.5,0,0, 0.5,-0.5,-0.5,1,0, -0.5,0.5,-0.5,0,1, 0.5,0.5,-0.5,1,1,], this.texturePath);
    // right
    this.drawTexturedRect([0.5,-0.5,-0.5,1,1, 0.5,0.5,-0.5,1,0, 0.5,-0.5,0.5,0,1, 0.5,0.5,0.5,0,0,], this.texturePath);
    // left
    this.drawTexturedRect([-0.5,-0.5,-0.5,1,1, -0.5,0.5,-0.5,1,0, -0.5,-0.5,0.5,0,1, -0.5,0.5,0.5,0,0,], this.texturePath);
    // front
    this.drawTexturedRect([-0.5,-0.5,0.5,0,1, 0.5,-0.5,0.5,0,0, -0.5,-0.5,-0.5,1,1, 0.5,-0.5,-0.5,1,0,], this.texturePath);
    // back
    this.drawTexturedRect([-0.5,0.5,0.5,0,1, 0.5,0.5,0.5,0,0, -0.5,0.5,-0.5,1,1, 0.5,0.5,-0.5,1,0,], this.texturePath);
    // bottom
    this.drawTexturedRect([-0.5,-0.5,0.5,0,0, 0.5,-0.5,0.5,1,0, -0.5,0.5,0.5,0,1, 0.5,0.5,0.5,1,1,], this.texturePath);
  }

  drawTexturedRect(cornersAndUVs, texturePath) {
    cornersAndUVs = new Float32Array(cornersAndUVs);  //TODO: don't remake this every frame?
    gl.bufferData(gl.ARRAY_BUFFER, cornersAndUVs, gl.DYNAMIC_DRAW);
    let FSIZE = cornersAndUVs.BYTES_PER_ELEMENT;

    // numeric values: components per vertex for this attribute,
    //                  stride (total comps per vert),
    //                  offset (where in the vert comps this attribute starts)
    // position is 3 comps out of 5 total, and they come first
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 0);
    // UV is 2 comps out of 5, and they start at index 3
    gl.vertexAttribPointer(a_UVCoords, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);

    // set up base color filter
    gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
    gl.uniform1f(u_TexColorWeight, this.texColorWeight);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // using a strip means the last 2 vertices of the prev tri are used for the next tri
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}