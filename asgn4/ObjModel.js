// modified from our codesandbox assignment
class ObjModel {
    constructor(objPath, color) {
        this.filePath = objPath;
        this.baseColor = color;
        this.matrix = new Matrix4();
        this.isLoaded = false;

        this.getFileContent().then(() => {
            this.vertexAndNormalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexAndNormalBuffer);
            gl.enableVertexAttribArray(a_Position);
            gl.enableVertexAttribArray(a_Normal);

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

        this.modelData = [];
        for (let i = 0; i < unpackedVerts.length; i += 3) {
            this.modelData[i] = unpackedVerts[i];
            this.modelData[i+1] = unpackedVerts[i+1];
            this.modelData[i+2] = unpackedVerts[i+2];
            this.modelData[i+3] = unpackedNorms[i];
            this.modelData[i+4] = unpackedNorms[i+1];
            this.modelData[i+5] = unpackedNorms[i+2];
        }
        // {
        //     vertices: new Float32Array(unpackedVerts),
        //     normals: new Float32Array(unpackedNorms)
        // }
    }

    render() {
        if (!this.isLoaded) { return; }

        gl.bufferData(gl.ARRAY_BUFFER, this.modelData, gl.DYNAMIC_DRAW);
        let FSIZE = this.modelData.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 0);
        // gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);

        // dummy things since we are only using 1 shader but this has no texture
        gl.uniform1i(u_Sampler, 0);
        gl.uniform1i(u_NormOrTex, (g_normVis === "on") ? 0 : 1);
        gl.uniform4f(u_BaseColor, this.baseColor[0], this.baseColor[1], this.baseColor[2], this.baseColor[3]);
        gl.uniform1f(u_TexColorWeight, 0);

        // normal matrix = transpose of inverse of model matrix
        let normalMtx = new Matrix4().setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMtx.elements);

        gl.drawArrays(gl.TRIANGLES, 0, this.modelData.length / 6);
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
