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
let g_identityM = new Matrix4();
let g_cameraXAngle = 45;
let g_cameraYAngle = 90;
let g_cameraZoom = 4;

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
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, g_identityM.elements);
}

function addActionsForHtmlUI() {
  let cameraXSlider = document.getElementById("cameraXSlider");
  // use "input" event rather than mouseover!
  cameraXSlider.addEventListener("input", () => {
    g_cameraXAngle = cameraXSlider.value;
    [prevX, prevY] = [0, 0];
  });

  let cameraYSlider = document.getElementById("cameraYSlider");
  cameraYSlider.addEventListener("input", () => {
    g_cameraYAngle = cameraYSlider.value;
    [prevX, prevY] = [0, 0];
  });

  let cameraZoomSlider = document.getElementById("cameraZoomSlider");
  cameraZoomSlider.addEventListener("input", () => {
    g_cameraZoom = cameraZoomSlider.value;
  });
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0,0,0, 1.0);

  // click if mouse held and dragged
  canvas.onmousedown = click;
  canvas.onmousemove = (event) => { if (event.buttons == 1) click(event);};

  setUpScene();
  // start update function
  requestAnimationFrame(tick);
}

// update function that runs every frame
function tick() {
  g_elapsedTime = performance.now() / 1000 - g_startTime;

  // track performance
  let fpsCounter = document.getElementById("fpsCounter");
  let start = performance.now();
  
  renderScene();

  // update performance
  let msElapsed = performance.now() - start; 
  fpsCounter.textContent = (1000 / msElapsed).toFixed(0);

  // repeat as soon as browser can
  requestAnimationFrame(tick);
}

// -- Extra helper funcs/things --

function convertCoordinatesEventToGL(event) {
  // transform browser coords -> canvas coords -> webgl coords
  var x = event.clientX;
  var y = event.clientY;
  var rect = event.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
  y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);

  return [x, y];
}

let prevX = 0, prevY = 0;
function click(event) {
  // use a delta to keep track of which direction the mouse moves in
  // turns out unpacking with [] is BAD and can lead to random string concatenation
  let [x, y] = convertCoordinatesEventToGL(event);
  [x, y] = [(x * -200) % 360, (y * 200) % 360];
  g_cameraXAngle = parseFloat(g_cameraXAngle) + (x - prevX);
  g_cameraYAngle = parseFloat(g_cameraYAngle) + (y - prevY);

  prevX = x, prevY = y;
}

let g_shapesList = {};  // make it an object so it's dict-like
// unfortunately I think all we can really move here is the object construction;
//      their matrices really do need to be reset and recalculated every frame
function setUpScene() {
  g_shapesList["tail2"] = new Cube();
}

// some colors
let LOKI_WHITE = [1,0.97,0.97,1];
let LOKI_DARK_BROWN = [0.2, 0.1, 0.0, 1.0];
let LOKI_MED_BROWN = [0.35, 0.25, 0, 1];
let LOKI_LIGHT_BROWN = [0.75, 0.6, 0.5, 1];
let LOKI_YELLOW = [0.9,0.8,0.3,1];
  
function renderScene() {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // global transform for camera angle
  let globalRotMtx = new Matrix4();
  globalRotMtx.rotate(g_cameraXAngle, 0, 1, 0);
  globalRotMtx.rotate(g_cameraYAngle, 1, 0, 0);
  globalRotMtx.scale(g_cameraZoom/5, g_cameraZoom/5, g_cameraZoom/5);
  globalRotMtx.translate(0,-0.15,0);  // center her
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMtx.elements);

  // set up local refs
  let tail2 = g_shapesList["tail2"];

  tail2.color = [1,0,0,1];
  tail2.matrix.set(g_identityM);
  tail2.render();
}