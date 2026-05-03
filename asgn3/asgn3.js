// -- Vertex shader program --
// we use \n and + so that errors give us line numbers
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +  // attributes: external vars that can vary for each vertex
  'uniform mat4 u_ModelMatrix;\n'+  // for rotating parts of the model
  'uniform mat4 u_GlobalRotateMatrix;\n' +  // for the camera
  'attribute vec2 a_UVCoords;\n' +  // for textures!
  'varying vec2 v_UVCoords;\n'+
  'uniform mat4 u_ProjectionMatrix;\n' + // for camera (look at)!
  'uniform mat4 u_ViewMatrix;\n' +       // (perspective)
  '\n' +
  'void main() {\n' +
  '   gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' + // now transformable with mtx!
  '   v_UVCoords = a_UVCoords;\n' + // set varying to attrib
  '}\n';

// -- Fragment shader program --
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_BaseColor;\n' + // color filter for texture
  'uniform float u_TexColorWeight;\n' + // 0 = all base color, 1 = all texture color
  'uniform sampler2D u_Sampler;\n' +  // for textures!
  'varying vec2 v_UVCoords;\n' +      // read the varying var!
  '\n' +
  'void main() {\n' +
      'vec4 texColor = texture2D(u_Sampler, v_UVCoords);\n'+
      'gl_FragColor = (1.0 - u_TexColorWeight) * u_BaseColor + u_TexColorWeight * texColor;\n' +  // set color with texture!
  '}\n';

// -- GLOBALS --
let canvas;
let gl;
let a_Position;
let u_BaseColor;
let u_TexColorWeight;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let a_UVCoords;
let u_Sampler;
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
  u_BaseColor = gl.getUniformLocation(gl.program, "u_BaseColor");
  u_TexColorWeight = gl.getUniformLocation(gl.program, "u_TexColorWeight");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  a_UVCoords = gl.getAttribLocation(gl.program, "a_UVCoords");
  u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
  
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
let LOKI_YELLOW = [0.9,0.8,0.3,1.0];

// camera globals
let g_eye = [0,0,2];
let g_at = [0,0,-10];
let g_up = [0,1,0];
  
function renderScene() {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // projection and view matrices for camera
  let projMtx = new Matrix4();
  // fov, aspect ratio, near plane dist, far plane dist
  //    plane dist: how close/far you have to be before things clip
  projMtx.setPerspective(60, canvas.width / canvas.height, 0.1, 50);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMtx.elements);

  let viewMtx = new Matrix4();
  // eye position, pos to look at (conventionally, -z), up direction
  viewMtx.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMtx.elements);

  // global transform for camera angle
  let globalRotMtx = new Matrix4();
  globalRotMtx.rotate(g_cameraXAngle, 0, 1, 0);
  globalRotMtx.rotate(g_cameraYAngle, 1, 0, 0);
  globalRotMtx.scale(g_cameraZoom/5, g_cameraZoom/5, g_cameraZoom/5);
  globalRotMtx.translate(0,-0.15,0);  // center her
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMtx.elements);

  // set up local refs  
  // let tail2 = g_shapesList["tail2"];

  // tail2.color = [1,0,0,1];
  // tail2.matrix.set(g_identityM);
  // tail2.render();

  let test = new TexturedCube("img/test_texture.png", LOKI_WHITE, 0.75);
  test.render();
}