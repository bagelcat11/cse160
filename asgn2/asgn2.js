// -- Vertex shader program --
// we use \n and + so that errors give us line numbers
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +  // attributes: external vars that can vary for each vertex
  'uniform mat4 u_ModelMatrix;\n'+  // for rotating parts of the model
  'uniform mat4 u_GlobalRotateMatrix;\n' +  // for the camera
  '\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' + // now transformable with mtx!
  '}\n';

// -- Fragment shader program --
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + // uniform var: external var that is the same for all fragments
  '\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' + // Set the point color
  '}\n';

// -- GLOBALS --
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_cameraAngle = 0;

// -- Setup helpers --
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // for 3D
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders");
    return;
  }

  // get storage locations of attribute vars from gl.program, which can
  // only be referenced after initShaders is called
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  // get location of uniform var
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  
  // set up identity mtx by default
  let identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  let cameraSlider = document.getElementById("cameraSlider");
  //TODO: this really redraws whenever the mouse moves over, not clicks and drags, so it's a little wasteful
  cameraSlider.addEventListener("mousemove", () => {
    g_cameraAngle = cameraSlider.value;
    renderAllShapes();
  });
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  renderAllShapes();
}

// -- Extra helper funcs/things --

// global array for all drawn shapes, which need to be stored
// since buffer is cleared on draw
var g_shapesList = [];

function convertCoordinatesEventToGL(event) {
  // transform browser coords -> canvas coords -> webgl coords
  var x = event.clientX;
  var y = event.clientY;
  var rect = event.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
  y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);

  return [x, y]
}

function renderAllShapes() {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // each shape knows how to render itself
  // for (let i = 0; i < g_shapesList.length; i++) {
  //   g_shapesList[i].render();
  // }

  // global transform for camera angle
  let globalRotMtx = new Matrix4().rotate(g_cameraAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMtx.elements);

  let testcube = new Cube();
  testcube.color = [1.0, 0.0, 1.0, 1.0];
  // degrees, rotation axis xyz
  testcube.matrix.rotate(45, 1, 1, 0); 
  testcube.matrix.translate(-1, -1, 0);
  testcube.render();
}