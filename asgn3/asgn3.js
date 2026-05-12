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
      // 'if (texColor[3] < 0.3) discard; \n' + // don't render transparent things!
      'gl_FragColor = (1.0 - u_TexColorWeight) * u_BaseColor + u_TexColorWeight * texColor;\n' +  // set color with texture!
  '}\n';

// -- GLOBALS --
let canvas;
let gl;
let a_Position;
let u_BaseColor;
let u_TexColorWeight;
let u_ModelMatrix;

let u_ProjectionMatrix; // this and viewmtx get handled by Camera class 
let u_ViewMatrix;

let a_UVCoords;
let u_Sampler;
let u_GlobalRotateMatrix;
let g_identityM = new Matrix4();

let g_camera; // this will be the Camera class
// these ones are actually rotating world
let g_cameraXAngle = 0;
let g_cameraYAngle = 0;
let g_cameraZoom = 4;

let g_startTime = performance.now() / 1000;
let g_elapsedTime = performance.now() / 1000 - g_startTime;

let g_conwayActive = false;
let g_conwaySlowdown = 20;
let g_cursorVisible = true;

// -- Setup helpers --
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {
    preserveDrawingBuffer: true,
  });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // for 3D
  gl.enable(gl.DEPTH_TEST);
  // transparency!
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // gl.enable(gl.CULL_FACE);
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
  let moveSpeedSlider = document.getElementById("moveSpeedSlider");
  moveSpeedSlider.addEventListener("input", () => {
    g_camera.maxSpeed = moveSpeedSlider.value / 10;
  });
  let conwaySpeedSlider = document.getElementById("conwaySpeedSlider");
  conwaySpeedSlider.addEventListener("input", () => {
    g_conwaySlowdown = conwaySpeedSlider.value;
  });
}

let g_texture_loki;
let g_texture_uv;
let g_texture_cursor;
function setupAllTextures() {
  initTexture("img/test_loki.png", gl.TEXTURE0);
  g_texture_loki = 0;
  initTexture("img/test_uv.jpg", gl.TEXTURE1);
  g_texture_uv = 1;
  initTexture("img/cursor_texture.png", gl.TEXTURE2);
  g_texture_cursor = 2;
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  setupAllTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0,0,0, 1.0);

  // set up click handler to enter mouse capture mode
  canvas.onmousedown = handleMouseClick;
  // register and unregister mousemove listener depending on if locked
  // https://github.com/mdn/dom-examples/blob/main/pointer-lock/app.js
  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement) {
      // register mouse move listener
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
    }
  });

  // key bindings for non-camera things
  document.addEventListener("keydown", (event) => handleKeyboard(event));

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
  
  // update camera, then render
  g_camera.cameraTick();
  renderScene();

  // update performance
  let msElapsed = performance.now() - start; 
  fpsCounter.textContent = (1000 / msElapsed).toFixed(0);

  // repeat as soon as browser can
  requestAnimationFrame(tick);
}

// -- Extra helper funcs/things --

// let prevX = 0, prevY = 0;
async function handleMouseClick(event) {
  // enter pointer lock mode and disable mouse accel
  if (!document.pointerLockElement) {
    await canvas.requestPointerLock({unadjustedMovement: true});
  }
}

function handleMouseMove(event) {
  let [x, y] = [event.movementX, event.movementY];
  let sens = 0.005;
  g_camera.changeLook(x * sens, y * sens);
}

function handleKeyboard(event) {
  switch (event.key) {
    case "p":
      // toggle conway
      g_conwayActive = !g_conwayActive;
      break;
    case "r":
      // clear world
      clearBoard(g_map);
      break;
    case "o":
      // toggle cursor
      g_cursorVisible = !g_cursorVisible;
      break;

    // conway presets
    case "1":
      loadPattern(g_map, 1);
      break;
    case "2":
      loadPattern(g_map, 2);
      break;

    default:
      break;
  }
}

function initTexture(texturePath, glTextureNum) {
  let texture = gl.createTexture();
  let img = new Image();
  // setup callback to load texture once browser loads image
  img.onload = () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip y axis
    gl.activeTexture(glTextureNum);  // set texture unit number
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // set texture params for filter type
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // needed to use any size img!!!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // target, mipmap level, internalformat, texelformat, texel type, img
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  };
  // have browser load image
  img.src = texturePath;
}

let g_mapSize = 32;
let g_map = new Array(g_mapSize);
for (let x = 0; x < g_mapSize; x++) {
  g_map[x] = new Array(g_mapSize);
  for (let y = 0; y < g_mapSize; y++) {
    g_map[x][y] = new Array(g_mapSize);
    for (let z = 0; z < g_mapSize; z++) {
      g_map[x][y][z] = null; // null = no block, otherwise there will be a Cube
    }
  }
}

function setUpScene() {
  g_camera = new Camera();

  g_map[0][0][0] = new TexturedCube(0, [1,1,1,1], 0.75);
  g_map[16][1][16] = new TexturedCube(0, [1,1,1,1], 0.75);
  g_map[15][0][15] = new TexturedCube(0, [1,1,1,1], 0.75);

}

let g_shapesList = {};  // make it an object so it's dict-like
// unfortunately I think all we can really move here is the object construction;
//      their matrices really do need to be reset and recalculated every frame

function renderScene() {
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // global transform for objs
  let globalRotMtx = new Matrix4();
  globalRotMtx.rotate(g_cameraXAngle, 0, 1, 0);
  globalRotMtx.rotate(g_cameraYAngle, 1, 0, 0);
  globalRotMtx.scale(g_cameraZoom/5, g_cameraZoom/5, g_cameraZoom/5);
  globalRotMtx.translate(0,-0.15,0);  // center her
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMtx.elements);

  let floor = new TexturedCube(1, [1,0,0,1], 1);
  floor.matrix.translate(0, -0.5, 0);
  floor.matrix.scale(32, 0.01, 32);
  floor.render();

  let sky = new TexturedCube(0, [0,1,1,1], 0.1);
  sky.matrix.scale(100, 100, 100);
  sky.render();

  let cellFlipList = [];

  for (let x = 0; x < g_mapSize; x++) {
    for (let y = 0; y < g_mapSize; y++) {
      for (let z = 0; z < g_mapSize; z++) {
        let c = g_map[x][y][z];

        // play conway on floor
        if (y == 0 && g_conwayActive && Math.floor(g_elapsedTime * 60) % g_conwaySlowdown == 0) {
          let n = calcNumNeighbors(g_map, x, y, z);
          // if cell is alive and has less than 2 or more than 3 neighbors, die;
          // if dead and has 3 neighbors, be born
          if (c != null && n != 2 && n != 3 ||
              c == null && n == 3) {
            cellFlipList.push([x, y, z]);
          }
        }

        if (c != null) {
          c.matrix.set(g_identityM);  // reset mtx every frame
          let offset = g_mapSize / 2;
          c.matrix.translate(x-offset, y, z-offset); // go from [0-32] to [-16, 16]
          c.matrix.translate(0.5,0,0.5);  // put into [0-1]
          c.render();
        }
      }
    }
  }

  // update the cell grid
  for (let i = 0; i < cellFlipList.length; i++) {
    let x = cellFlipList[i][0], y = cellFlipList[i][1], z = cellFlipList[i][2];
    g_map[x][y][z] = (g_map[x][y][z] == null) ? new TexturedCube(0, [1,1,1,1], 1) : null;
  }

  if (g_cursorVisible) {
    let cursor = new TexturedCube(2, [0.5,0.5,0.5,0.5], 1);
    let cursX = g_camera.cursorAt.elements[0], cursY = g_camera.cursorAt.elements[1], cursZ = g_camera.cursorAt.elements[2];
    cursor.matrix.translate(cursX, cursY, cursZ);
    cursor.matrix.translate(0.5,0,0.5);  // put into [0-1]
    cursor.matrix.scale(1.1,1.1,1.1);
    cursor.render();
  }
}