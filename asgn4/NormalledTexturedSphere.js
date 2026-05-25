class NormalledTexturedSphere extends Shape {
  constructor(textureNum, baseColor, texColorWeight) {
    super();
    this.textureNum = textureNum;
    this.baseColor = baseColor;
    this.texColorWeight = texColorWeight;
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.flipped = false;

    this.setUpBuffer();

    // making a UV sphere out of squares (each square is 2 tris)
    let arr = [];
    let circumferenceStep = Math.PI / 10;
    let triSize = Math.PI / 10;

    // use spherical coords to find points
    for (let theta = 0; theta < Math.PI; theta += circumferenceStep) {
        for (let phi = 0; phi < (2 * Math.PI); phi += circumferenceStep) {
            let p1 = [Math.sin(theta)*Math.cos(phi), Math.sin(theta)*Math.sin(phi), Math.cos(theta)];

            let p2 = [Math.sin(theta+triSize)*Math.cos(phi), Math.sin(theta+triSize)*Math.sin(phi), Math.cos(theta+triSize)];
            let p3 = [Math.sin(theta)*Math.cos(phi+triSize), Math.sin(theta)*Math.sin(phi+triSize), Math.cos(theta)];
            let p4 = [Math.sin(theta+triSize)*Math.cos(phi+triSize), Math.sin(theta+triSize)*Math.sin(phi+triSize), Math.cos(theta+triSize)];

            let uv1 = [theta/Math.PI, phi/(2*Math.PI)];
            let uv2 = [(theta+triSize)/Math.PI, phi/(2*Math.PI)];
            let uv3 = [theta/Math.PI, (phi+triSize)/(2*Math.PI)];
            let uv4 = [(theta+triSize)/Math.PI, (phi+triSize)/(2*Math.PI)];

            // first tri
            // position, UVs (which are just theta and phi scaled!), normals (which are sphere vertices!)
            arr = arr.concat(p1.concat(uv1).concat(p1));
            arr = arr.concat(p2.concat(uv2).concat(p2));    
            arr = arr.concat(p4.concat(uv4).concat(p4));

            // second tri
            arr = arr.concat(p1.concat(uv1).concat(p1));
            arr = arr.concat(p4.concat(uv4).concat(p4));
            arr = arr.concat(p3.concat(uv3).concat(p3));
        }
    }

    this.verticesAndNormals = new Float32Array(arr);
  }

  setUpBuffer() {
    this.cornersAndNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornersAndNormalsBuffer);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_UVCoords);
    gl.enableVertexAttribArray(a_Normal);
  }

  render() {
    this.drawNormalledTexturedTri(this.verticesAndNormals, gl.TRIANGLES);
  }

  drawNormalledTexturedTri(cornersAndNorms, drawMode) {
    // cornersAndNorms = new Float32Array(cornersAndNorms);
    gl.bufferData(gl.ARRAY_BUFFER, cornersAndNorms, gl.DYNAMIC_DRAW);
    let FSIZE = cornersAndNorms.BYTES_PER_ELEMENT;

    // numeric values: components per vertex for this attribute,
    //                  stride (total comps per vert),
    //                  offset (where in the vert comps this attribute starts)
    // position is 3 comps out of 5 total, and they come first
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 0);
    gl.vertexAttribPointer(a_UVCoords, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);

    gl.uniform1i(u_Sampler, this.textureNum);
    gl.uniform1i(u_NormOrTex, (g_normVis === "on") ? 0 : 1);

    // set up base color filter
    gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
    gl.uniform1f(u_TexColorWeight, this.texColorWeight);

    this.normalMatrix.setInverseOf(this.matrix).transpose();
    if (this.flipped) { this.matrix.scale(-1,-1,-1); }
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    gl.drawArrays(drawMode, 0, cornersAndNorms.length / 8);
  }

  //TODO: this is stolen from normtexcube, should just make a base class
  drawNormalledTexturedRect(cornersAndUVsAndNorms) {
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

    gl.uniform1i(u_Sampler, this.textureNum);
    gl.uniform1i(u_NormOrTex, (g_normVis === "on") ? 0 : 1);

    // set up base color filter
    gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
    gl.uniform1f(u_TexColorWeight, this.texColorWeight);

    this.normalMatrix.setInverseOf(this.matrix).transpose();
    if (this.flipped) { this.matrix.scale(-1,-1,-1); }
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    // using a strip means the last 2 vertices of the prev tri are used for the next tri
    gl.drawArrays(gl.TRIANGLES, 0, cornersAndUVsAndNorms.length / 8);
  }
}