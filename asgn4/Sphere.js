class Sphere extends Shape {
  constructor(baseColor) {
    super();
    this.baseColor = baseColor;
    this.matrix = new Matrix4();

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

            // first tri
            arr = arr.concat(p1.concat([0,0]).concat(p1));  // for a sphere, the vertices are also the normals!
            arr = arr.concat(p2.concat([0,0]).concat(p2));  // also using dummy UVs    
            arr = arr.concat(p4.concat([0,0]).concat(p4));

            // second tri
            arr = arr.concat(p1.concat([0,0]).concat(p1));
            arr = arr.concat(p4.concat([0,0]).concat(p4));
            arr = arr.concat(p3.concat([0,0]).concat(p3));
        }
    }

    this.verticesAndNormals = new Float32Array(arr);
  }

  setUpBuffer() {
    this.cornersAndNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornersAndNormalsBuffer);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Normal);
    gl.enableVertexAttribArray(a_UVCoords);
  }

  render() {
    this.drawNormTri(this.verticesAndNormals);
  }

  drawNormTri(cornersAndNorms) {
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

    gl.uniform1i(u_Sampler, 0); // dummy
    gl.uniform1i(u_NormOrTex, (g_normVis === "on") ? 0 : 1);

    // set up base color filter
    gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
    gl.uniform1f(u_TexColorWeight, 0);  //dummy

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, cornersAndNorms.length / 8);
  }
}