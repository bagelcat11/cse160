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
let g_cameraAngle = 45;

let g_blueAngle = 0;
let g_greenAngle = 0;
let g_bobAnim = "on";
let g_pinkHeight = 0;

let g_startTime = performance.now() / 1000;
let g_elapsedTime = performance.now() / 1000 - g_startTime;

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
  // use "input" event rather than mouseover!
  cameraSlider.addEventListener("input", () => {
    g_cameraAngle = cameraSlider.value;
  });

  let blueSlider = document.getElementById("blueSlider");
  blueSlider.addEventListener("input", () => {
    g_blueAngle = blueSlider.value;
  });

  let greenSlider = document.getElementById("greenSlider");
  greenSlider.addEventListener("input", () => {
    g_greenAngle = greenSlider.value;
  });

  let bobAnimToggles = document.getElementsByName("bobAnimToggle");
  bobAnimToggles.forEach(s => {
    s.addEventListener("click", () => {
      g_bobAnim = s.value;
    });
  });
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  setUpScene();
  // start update function
  requestAnimationFrame(tick);
}

// update function that runs every frame
function tick() {
  g_elapsedTime = performance.now() / 1000 - g_startTime;
  // console.log(g_elapsedTime);

  // before rendering, update animated values based on current time
  updateAnimatedTransforms();
  renderScene();

  // repeat as soon as browser can
  requestAnimationFrame(tick);
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

  return [x, y];
}

//TODO: move things here if possible??
function setUpScene() {
  
}

// if animation is on, update things here rather than in render function
function updateAnimatedTransforms() {
  if (g_bobAnim === "on") {
    g_pinkHeight = -0.25 * Math.sin(g_elapsedTime) - 1;
  }
}
  
function renderScene() {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // global transform for camera angle
  let globalRotMtx = new Matrix4().rotate(g_cameraAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMtx.elements);

  // make any transforms from the sliders
  // g_shapesList[1].matrix.rotate(g_blueAngle, 1, 0, 0);
  let testcube = new Cube();
  testcube.color = [1.0, 0.0, 1.0, 1.0];
  testcube.matrix.scale(0.5, 0.5, 0.5);
  // degrees, rotation axis xyz
  testcube.matrix.rotate(-15, 1, 0, 0);
  // testcube.matrix.rotate(-15, 0, 1, 0); 
  
  // bobbing over time!!!
  testcube.matrix.translate(-0.5, g_pinkHeight, 0);
  // g_shapesList.push(testcube);

  let testcube2 = new Cube();
  testcube2.matrix = new Matrix4().set(testcube.matrix);  // copy
  testcube2.color = [0.0, 0.0, 1.0, 1.0];
  testcube2.matrix.rotate(g_blueAngle, 1, 0, 0);
  //TODO: can save checkpoints like let bluecoords = copy test2 to ref later
  testcube2.matrix.scale(0.5, 1, 0.5);
  testcube2.matrix.translate(0.5, 1, 0);
  // g_shapesList.push(testcube2);

  let testcube3 = new Cube();
  testcube3.matrix = new Matrix4().set(testcube2.matrix);  // copy
  testcube3.color = [0.5, 1.0, 0.5, 1.0];
  testcube3.matrix.scale(1, 0.5, 2);
  testcube3.matrix.translate(0, 2, 0.25);
  testcube3.matrix.rotate(g_greenAngle, 0, 0, 1);
  // g_shapesList.push(testcube3);

  // render!
  // for (let i = 0; i < g_shapesList.length; i++) {
  //   g_shapesList[i].render();
  // }

  testcube.render();
  testcube2.render();
  testcube3.render();
}