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
let g_autoAnim = "on";
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

  let autoAnimToggles = document.getElementsByName("autoAnimToggle");
  autoAnimToggles.forEach(s => {
    s.addEventListener("click", () => {
      g_autoAnim = s.value;
    });
  });
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.2, 0.0, 1.0);

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

  g_shapesList["neck"] = new Cube();
  g_shapesList["jaw"] = new Jaw();

  g_shapesList["leftArmTop"] = new Cube();
  g_shapesList["leftArmMiddle"] = new Cube();
  g_shapesList["leftArmPaw"] = new Cube();
  g_shapesList["rightArmTop"] = new Cube();
  g_shapesList["rightArmMiddle"] = new Cube();
  g_shapesList["rightArmPaw"] = new Cube();

  g_shapesList["leftLegTop"] = new Cube();
  g_shapesList["leftLegMiddle"] = new Cube();
  g_shapesList["leftLegPaw"] = new Cube();
  g_shapesList["rightLegTop"] = new Cube();
  g_shapesList["rightLegMiddle"] = new Cube();
  g_shapesList["rightLegPaw"] = new Cube();
}


let g_tailBaseAngle = 0;
let g_jawAngle = 0;
let g_armTopAngle = 0;
let g_armMiddleAngle = 0;
let g_armPawAngle = 0;
let g_legTopAngle = 0;
let g_legMiddleAngle = 0;
let g_legPawAngle = 0;
let g_bodyBobHeight = 0;

// if animation is on, update things here rather than in render function
//TODO: when turning these on they may snap because the animation is just based
//      on time rather than current position plus any kind of time...
function updateAnimatedTransforms() {
  if (g_autoAnim === "on") {
    g_tailBaseAngle = Math.sin(g_elapsedTime) * 30;
    g_jawAngle = -Math.abs(Math.sin(g_elapsedTime) * 30);
    g_bodyBobHeight = Math.sin(10 * g_elapsedTime) * 0.01;

    // sin(2x) = 2x frequency
    // sin(x) * y = y amplitude (degree output)
    g_armTopAngle = Math.sin(5 * g_elapsedTime) * 25;
    g_armMiddleAngle = Math.cos(5 * g_elapsedTime) * 25;
    g_armPawAngle = -Math.cos(5 * g_elapsedTime) * 20;

    g_legTopAngle = Math.cos(5 * g_elapsedTime) * 25;
    g_legMiddleAngle = Math.sin(5 * g_elapsedTime) * 25;
    g_legPawAngle = -Math.sin(5 * g_elapsedTime) * 20;
  }
}
  
function renderScene() {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // global transform for camera angle
  let globalRotMtx = new Matrix4();
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
  let neck = g_shapesList["neck"];
  let jaw = g_shapesList["jaw"];
  let leftArmTop = g_shapesList["leftArmTop"];
  let leftArmMiddle = g_shapesList["leftArmMiddle"];
  let leftArmPaw = g_shapesList["leftArmPaw"];
  let rightArmTop = g_shapesList["rightArmTop"];
  let rightArmMiddle = g_shapesList["rightArmMiddle"];
  let rightArmPaw = g_shapesList["rightArmPaw"];
  let leftLegTop = g_shapesList["leftLegTop"];
  let leftLegMiddle = g_shapesList["leftLegMiddle"];
  let leftLegPaw = g_shapesList["leftLegPaw"];
  let rightLegTop = g_shapesList["rightLegTop"];
  let rightLegMiddle = g_shapesList["rightLegMiddle"];
  let rightLegPaw = g_shapesList["rightLegPaw"];
  
  
  // HEAD
  head.color = [0.8, 0.4, 0.0, 1.0];
  head.matrix.set(g_identityM); // reset every frame
  head.matrix.translate(0, 0, g_bodyBobHeight);
  head.matrix.scale(0.4, 0.4, 0.4);
  head.matrix.translate(-0.5, -1.5, 0.5);
  head.render();

  earLeft.matrix.set(head.matrix);
  earLeft.matrix.translate(0.9,0.2,-1.3);
  earLeft.render();

  earRight.matrix.set(head.matrix);
  earRight.matrix.translate(0.1,0.2,-1.3);
  earRight.matrix.scale(-1,1,1);
  earRight.render();

  jaw.matrix.set(head.matrix);
  jaw.matrix.translate(0, 0.5, 0);
  jaw.matrix.rotate(g_jawAngle, 1, 0, 0);
  // offset so it pivots around inner extends
  jaw.matrix.translate(0, -0.5, 0);
  jaw.render();

  neck.color = [0, 0.5, 0, 1];
  neck.matrix.set(g_identityM);
  neck.matrix.translate(0, 0, g_bodyBobHeight);
  neck.matrix.translate(0, -0.25, 0.2);
  neck.matrix.rotate(60, 1, 0, 0);
  neck.matrix.scale(0.35, 0.35, 0.25);
  neck.render();

  // BODY
  body.matrix.set(g_identityM);
  body.matrix.translate(0, 0, g_bodyBobHeight);
  body.matrix.translate(0, -0.25, 0.25);
  body.render();

  // TAIL
  tail1.color = [0.5, 0.1, 0.0, 1.0];
  tail1.matrix.set(g_identityM);
  tail1.matrix.translate(0, 0, g_bodyBobHeight);
  tail1.matrix.translate(0, 0.75, 0.1);
  tail1.matrix.rotate(g_tailBaseAngle, 1, 0, 0);
  let tail1Coords = new Matrix4().set(tail1.matrix);  // set ref after rotating
  tail1.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0); // offset first so that it pivots around origin
  tail1.render();

  tail2.color = tail1.color;
  tail2.matrix.set(tail1Coords);
  tail2.matrix.translate(0, 0.3, 0);
  tail2.matrix.rotate(g_tailBaseAngle, 1, 0, 0);
  let tail2Coords = new Matrix4().set(tail2.matrix);
  tail2.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0);
  tail2.render();

  tail3.color = tail1.color;
  tail3.matrix.set(tail2Coords);
  tail3.matrix.translate(0, 0.2, 0);
  tail3.matrix.rotate(g_tailBaseAngle, 1, 0, 0);
  let tail3Coords = new Matrix4().set(tail3.matrix);
  tail3.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0);
  tail3.render();

  tail4.color = tail1.color;
  tail4.matrix.set(tail3Coords);
  tail4.matrix.translate(0, 0.2, 0);
  tail4.matrix.rotate(g_tailBaseAngle, 1, 0, 0);
  tail4.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0);
  tail4.render();

  // ARMS
  leftArmTop.color = [0,1,1,1]
  leftArmTop.matrix.set(g_identityM);
  leftArmTop.matrix.translate(0.16, -0.2, 0.3)
  leftArmTop.matrix.rotate(g_armTopAngle, 1, 0, 0);
  let leftArmTopCoords = new Matrix4().set(leftArmTop.matrix);
  leftArmTop.matrix.scale(0.15,0.2,0.3);
  leftArmTop.render();

  leftArmMiddle.color = [0,0.5,1,1]
  leftArmMiddle.matrix.set(leftArmTopCoords);
  leftArmMiddle.matrix.translate(-0.01, 0.0, 0.2);
  leftArmMiddle.matrix.rotate(g_armMiddleAngle, 1, 0, 0);
  let leftMidCoords = new Matrix4().set(leftArmMiddle.matrix)
  leftArmMiddle.matrix.scale(0.12, 0.12, 0.3)
  leftArmMiddle.matrix.translate(0, 0, 0.2); // offset
  leftArmMiddle.render();

  leftArmPaw.color = [0,0.5,0.5,1]
  leftArmPaw.matrix.set(leftMidCoords);
  leftArmPaw.matrix.translate(0, -0.05, 0.18);
  leftArmPaw.matrix.rotate(g_armPawAngle, 1, 0, 0);
  leftArmPaw.matrix.scale(0.15, 0.15, 0.07);
  leftArmPaw.render();

  rightArmTop.color = [0,1,1,1]
  rightArmTop.matrix.set(g_identityM);
  rightArmTop.matrix.translate(-0.16, -0.2, 0.3)
  rightArmTop.matrix.rotate(-g_armTopAngle, 1, 0, 0);
  let rightArmTopCoords = new Matrix4().set(rightArmTop.matrix);
  rightArmTop.matrix.scale(0.15,0.2,0.3);
  rightArmTop.render();

  rightArmMiddle.color = [0,0.5,1,1]
  rightArmMiddle.matrix.set(rightArmTopCoords);
  rightArmMiddle.matrix.translate(0.01, 0.0, 0.2);
  rightArmMiddle.matrix.rotate(-g_armMiddleAngle, 1, 0, 0);
  let rightMidCoords = new Matrix4().set(rightArmMiddle.matrix)
  rightArmMiddle.matrix.scale(0.12, 0.12, 0.3)
  rightArmMiddle.matrix.translate(0, 0, 0.2); // offset
  rightArmMiddle.render();

  rightArmPaw.color = [0,0.5,0.5,1]
  rightArmPaw.matrix.set(rightMidCoords);
  rightArmPaw.matrix.translate(0, -0.05, 0.18);
  rightArmPaw.matrix.rotate(-g_armPawAngle, 1, 0, 0);
  rightArmPaw.matrix.scale(0.15, 0.15, 0.07);
  rightArmPaw.render();

  // LEGS
  leftLegTop.color = [0,1,1,1]
  leftLegTop.matrix.set(g_identityM);
  leftLegTop.matrix.translate(0.16, 0.65, 0.3)
  leftLegTop.matrix.rotate(g_legTopAngle, 1, 0, 0);
  let leftLegTopCoords = new Matrix4().set(leftLegTop.matrix);
  leftLegTop.matrix.scale(0.15,0.3,0.3);
  leftLegTop.render();

  leftLegMiddle.color = [0,0.5,1,1]
  leftLegMiddle.matrix.set(leftLegTopCoords);
  leftLegMiddle.matrix.translate(-0.01, 0.0, 0.2);
  leftLegMiddle.matrix.rotate(g_legMiddleAngle, 1, 0, 0);
  let leftLegMidCoords = new Matrix4().set(leftLegMiddle.matrix)
  leftLegMiddle.matrix.scale(0.12, 0.15, 0.3)
  leftLegMiddle.matrix.translate(0, 0, 0.2); // offset
  leftLegMiddle.render();

  leftLegPaw.color = [0,0.5,0.5,1]
  leftLegPaw.matrix.set(leftLegMidCoords);
  leftLegPaw.matrix.translate(0, -0.05, 0.18);
  leftLegPaw.matrix.rotate(g_legPawAngle, 1, 0, 0);
  leftLegPaw.matrix.scale(0.15, 0.15, 0.07);
  leftLegPaw.render();

  rightLegTop.color = [0,1,1,1]
  rightLegTop.matrix.set(g_identityM);
  rightLegTop.matrix.translate(-0.16, 0.65, 0.3)
  rightLegTop.matrix.rotate(-g_legTopAngle, 1, 0, 0);
  let rightLegTopCoords = new Matrix4().set(rightLegTop.matrix);
  rightLegTop.matrix.scale(0.15,0.3,0.3);
  rightLegTop.render();

  rightLegMiddle.color = [0,0.5,1,1]
  rightLegMiddle.matrix.set(rightLegTopCoords);
  rightLegMiddle.matrix.translate(0.01, 0.0, 0.2);
  rightLegMiddle.matrix.rotate(-g_legMiddleAngle, 1, 0, 0);
  let rightLegMidCoords = new Matrix4().set(rightLegMiddle.matrix)
  rightLegMiddle.matrix.scale(0.12, 0.15, 0.3)
  rightLegMiddle.matrix.translate(0, 0, 0.2); // offset
  rightLegMiddle.render();

  rightLegPaw.color = [0,0.5,0.5,1]
  rightLegPaw.matrix.set(rightLegMidCoords);
  rightLegPaw.matrix.translate(0, -0.05, 0.18);
  rightLegPaw.matrix.rotate(-g_legPawAngle, 1, 0, 0);
  rightLegPaw.matrix.scale(0.15, 0.15, 0.07);
  rightLegPaw.render();

  
  // stress test
  // for (let i = 0; i < 9000; i++) {
  //   g_shapesList.i = new Cube();
  //   g_shapesList.i.matrix.rotate(45, Math.random(), Math.random(), Math.random())
  //   g_shapesList.i.render();
  // }
}