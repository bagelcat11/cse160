// modified from our codesandbox assignment
class ObjModel {
    constructor(objPath, color) {
        this.filePath = objPath;
        this.baseColor = color;
        this.matrix = new Matrix4();
        this.isLoaded = false;

        this.getFileContent().then(() => {
            // this.vertexAndUVAndNormalBuffer = gl.createBuffer();
            // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexAndUVAndNormalBuffer);
            // gl.enableVertexAttribArray(a_Position);
            // gl.enableVertexAttribArray(a_UVCoords);
            // gl.enableVertexAttribArray(a_Normal);

            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer();
            this.uvBuffer = gl.createBuffer();

            this.isLoaded = true;
        });
    }

    parseModel(fileContent) {
        let lines = fileContent.split("\n");
        let allVertices = [];
        let allNormals = [];

        let unpackedVerts = [];
        let unpackedNorms = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let tokens = line.split(" ");

            if (tokens[0] == "v") {
                allVertices.push(parseFloat(tokens[1]),
                                parseFloat(tokens[2]),
                                parseFloat(tokens[3])
                );
            } else if (tokens[0] == "vn") {
                allNormals.push(parseFloat(tokens[1]),
                                parseFloat(tokens[2]),
                                parseFloat(tokens[3])
                );
            } else if (tokens[0] == "f") {
                for (let face of [tokens[1], tokens[2], tokens[3]]) {
                    let indices = face.split("//");
                    let vertexIndex = (parseInt(indices[0]) - 1) * 3;
                    let normalIndex = (parseInt(indices[1]) -1 ) * 3;

                    unpackedVerts.push(allVertices[vertexIndex],
                                        allVertices[vertexIndex + 1],
                                        allVertices[vertexIndex + 2]
                    );
                    unpackedNorms.push(allNormals[normalIndex],
                        allNormals[normalIndex + 1],
                        allNormals[normalIndex + 2]
                    );
                }
            }
        }
        // console.log(unpackedVerts.length, allVertices.length)
        // console.log(unpackedVerts.length == unpackedNorms.length);
        // console.log(allVertices.length == allNormals.length);

        // this.modelData = [];
        // for (let i = 0; i < allVertices.length; i += 3) {
        //     this.modelData.push(unpackedVerts[i]);  // position xyz
        //     this.modelData.push(unpackedVerts[i+1]);
        //     this.modelData.push(unpackedVerts[i+2]);
        //     this.modelData.push(0.0, 0.0);  // dummy UVs
        //     this.modelData.push(unpackedNorms[i]);  // normal xyz
        //     this.modelData.push(unpackedNorms[i+1]);
        //     this.modelData.push(unpackedNorms[i+2]);
        // }
        // console.log("num vertices", this.modelData.length / 8)
        let dummyUVs = unpackedVerts.slice(0, unpackedVerts.length / 3 * 2);
        this.modelData = {
            vertices: new Float32Array(unpackedVerts),
            normals: new Float32Array(unpackedNorms),
            uvs: new Float32Array(dummyUVs)
        }
    }

    render() {
        if (!this.isLoaded) { return; }

        // gl.bufferData(gl.ARRAY_BUFFER, this.modelData, gl.DYNAMIC_DRAW);
        // let FSIZE = this.modelData.BYTES_PER_ELEMENT;

        // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 0);
        // gl.vertexAttribPointer(a_UVCoords, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
        // gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);
        
        //TODO: wish everything in one buffer worked without buffer array size error but whatever
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.uvs, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UVCoords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UVCoords);


        // dummy things since we are only using 1 shader but this has no texture
        gl.uniform1i(u_Sampler, g_texture_sky);
        gl.uniform1i(u_NormOrTex, (g_normVis === "on") ? 0 : 1);
        gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
        gl.uniform1f(u_TexColorWeight, 1);

        // normal matrix = transpose of inverse of model matrix
        let normalMtx = new Matrix4().setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMtx.elements);

        gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertices.length / 3);
    }

    async getFileContent() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) throw new Error(`Could not load file "${this.filePath}". Are you sure the file name/path are correct?`);

            const fileContent = await response.text();
            this.parseModel(fileContent);
        } catch (e) {
            throw new Error(`Something went wrong when loading ${this.filePath}. Error: ${e}`);
        }
    }
}
