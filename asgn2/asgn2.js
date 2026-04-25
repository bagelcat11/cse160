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

  // let blueSlider = document.getElementById("blueSlider");
  // blueSlider.addEventListener("input", () => {
  //   g_blueAngle = blueSlider.value;
  // });

  // let greenSlider = document.getElementById("greenSlider");
  // greenSlider.addEventListener("input", () => {
  //   g_greenAngle = greenSlider.value;
  // });

  // let bobAnimToggles = document.getElementsByName("bobAnimToggle");
  // bobAnimToggles.forEach(s => {
  //   s.addEventListener("click", () => {
  //     g_bobAnim = s.value;
  //   });
  // });
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.2, 0.0, 1.0);

  //TODO: camera control on canvas click and drag
  // set up click listener to call click handler
  canvas.onmousedown = click;
  // click if mouse held and dragged
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
  
  // before rendering, update animated values based on current time
  updateAnimatedTransforms();
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
// use a delta to keep track of which direction the mouse moves in
// turns out unpacking with [] is BAD and can lead to random string concatenation
function click(event) {
  let [x, y] = convertCoordinatesEventToGL(event);
  [x, y] = [(x * -100) % 360, (y * 100) % 360];
  // console.log("X-PREVX:", x-prevX, "with type", typeof(x-prevX));
  g_cameraXAngle = parseFloat(g_cameraXAngle) + (x - prevX);
  g_cameraYAngle = parseFloat(g_cameraYAngle) + (y - prevY);
  // console.log("X angle type:", typeof(g_cameraXAngle))

  prevX = x, prevY = y;
}

let g_shapesList = {};  // make it an object so it's dict-like
//TODO: unfortunately I think all we can really move here is the object construction;
//      their matrices really do need to be reset and recalculated every frame
function setUpScene() {
  // g_shapesList["testcube"] = new Cube();
  // g_shapesList["testcube2"] = new Cube();
  // g_shapesList["testcube3"] = new Cube();
  g_shapesList["head"] = new Head();
  g_shapesList["earLeft"] = new Ear();
  g_shapesList["earRight"] = new Ear();
  g_shapesList["body"] = new Body();

  // tail is just going to be many segments
  g_shapesList["tail1"] = new Cube();
  g_shapesList["tail2"] = new Cube();
  g_shapesList["tail3"] = new Cube();
  g_shapesList["tail4"] = new Cube();
}

// if animation is on, update things here rather than in render function
//TODO: when turning these on they may snap because the animation is just based
//      on time rather than current position plus any kind of time...
function updateAnimatedTransforms() {
  if (g_bobAnim === "on") {
    g_pinkHeight = -0.25 * Math.sin(g_elapsedTime) - 1;
  }
}
  
function renderScene() {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // global transform for camera angle
  let globalRotMtx = new Matrix4();
  console.log("x angle", g_cameraXAngle)
  console.log("y angle",g_cameraYAngle)
  console.log("prev:", prevX, prevY)
  globalRotMtx.rotate(g_cameraXAngle, 0, 1, 0);
  globalRotMtx.rotate(g_cameraYAngle, 1, 0, 0);
  globalRotMtx.scale(g_cameraZoom/5, g_cameraZoom/5, g_cameraZoom/5);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMtx.elements);

  // set up local refs
  let head = g_shapesList["head"];
  let earLeft = g_shapesList["earLeft"];
  let earRight = g_shapesList["earRight"];
  let body = g_shapesList["body"];
  let tail1 = g_shapesList["tail1"];
  let tail2 = g_shapesList["tail2"];
  let tail3 = g_shapesList["tail3"];
  let tail4 = g_shapesList["tail4"];

  head.color = [0.8, 0.4, 0.0, 1.0];
  head.matrix.set(g_identityM); // reset every frame
  head.matrix.scale(0.5, 0.5, 0.5);
  head.matrix.translate(-0.5, -1.5, 0.5);
  head.render();

  earLeft.matrix.set(head.matrix);
  earLeft.matrix.translate(0.9,0.2,-1.3);
  earLeft.render();

  earRight.matrix.set(head.matrix);
  earRight.matrix.translate(0.1,0.2,-1.3);
  earRight.matrix.scale(-1,1,1);
  earRight.render();

  body.matrix.set(g_identityM);
  body.matrix.translate(0, -0.25, 0.25);
  body.render();

  // tail segments!
  tail1.color = [1.0, 0.0, 0.0, 1.0];
  tail1.matrix.set(g_identityM);
  tail1.matrix.translate(0, 0.75, 0.1);
  let tail1Coords = new Matrix4().set(tail1.matrix);
  // tail1.matrix.rotate(45, 1, 0, 0);
  tail1.matrix.scale(0.1, 0.25, 0.1);
  tail1.render();

  tail2.color = [1.0, 0.0, 0.5, 1.0];
  tail2.matrix.set(tail1Coords);
  tail2.matrix.translate(0, 0.2, 0.1);
  tail2.matrix.rotate(45, 1, 0, 0);
  tail2.matrix.scale(0.1, 0.25, 0.1);
  tail2.render();

  tail2.color = [1.0, 0.0, 0.5, 1.0];
  tail2.matrix.set(tail1Coords);
  tail2.matrix.translate(0, 0.2, 0.1);
  tail2.matrix.rotate(45, 1, 0, 0);
  tail2.matrix.scale(0.1, 0.25, 0.1);
  tail2.render();



  // let t1 = g_shapesList["testcube"];
  // t1.matrix.set(g_identityM);
  // let t2 = g_shapesList["testcube2"];
  // t2.matrix.set(g_identityM);
  // let t3 = g_shapesList["testcube3"];
  // t3.matrix.set(g_identityM);

  // t1.color = [1.0, 0.0, 1.0, 1.0];
  // t1.matrix.scale(0.5, 0.5, 0.5);
  // // degrees, rotation axis xyz
  // t1.matrix.rotate(-15, 1, 0, 0);
  // // bobbing over time!!!
  // t1.matrix.translate(-0.5, g_pinkHeight, 0);
  // t1.render();


  // t2.matrix = new Matrix4().set(t1.matrix);  // copy
  // t2.color = [0.0, 0.0, 1.0, 1.0];
  // t2.matrix.rotate(g_blueAngle, 1, 0, 0);
  // //TODO: can save checkpoints like let bluecoords = copy test2 to ref later
  // t2.matrix.scale(0.5, 1, 0.5);
  // t2.matrix.translate(0.5, 1, 0);
  // t2.render();

  // t3.matrix = new Matrix4().set(t2.matrix);  // copy
  // t3.color = [0.5, 1.0, 0.5, 1.0];
  // t3.matrix.scale(1, 0.5, 2);
  // t3.matrix.translate(0, 2, 0.25);
  // t3.matrix.rotate(g_greenAngle, 0, 0, 1);
  // t3.render();

  
  // stress test
  // for (let i = 0; i < 9000; i++) {
  //   g_shapesList.i = new Cube();
  //   g_shapesList.i.matrix.rotate(45, Math.random(), Math.random(), Math.random())
  //   g_shapesList.i.render();
  // }
}