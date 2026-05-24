// -- Vertex shader program --
// we use \n and + so that errors give us line numbers
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +  // attributes: external vars that can vary for each vertex
  'uniform mat4 u_ModelMatrix;\n'+  // for rotating parts of the model
  'uniform mat4 u_GlobalRotateMatrix;\n' +  // for the camera
  'attribute vec2 a_UVCoords;\n' +  // for textures!
  'attribute vec3 a_Normal;\n' +
  'varying vec2 v_UVCoords;\n'+
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_VertPos;\n' +
  'uniform mat4 u_ProjectionMatrix;\n' + // for camera (look at)!
  'uniform mat4 u_ViewMatrix;\n' +       // (perspective)
  'uniform mat4 u_NormalMatrix;\n' +  // for rotating normals
  
  'void main() {\n' +
  '   gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' + // now transformable with mtx!
  '   v_UVCoords = a_UVCoords;\n' + // set varying to attrib

  // 'v_Normal = a_Normal;\n'+
  '   v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));\n' +
  '   v_VertPos = u_ModelMatrix * a_Position;\n' +  // in world space
  '}\n';

// -- Fragment shader program --
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_BaseColor;\n' + // color filter for texture
  'uniform float u_TexColorWeight;\n' + // 0 = all base color, 1 = all texture color
  'uniform sampler2D u_Sampler;\n' +  // for textures!
  'varying vec2 v_UVCoords;\n' +  
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_VertPos;\n' + // for light!
  'uniform int u_NormOrTex;\n' +
  'uniform vec3 u_LightPos;\n' +  // for light!
  'uniform vec3 u_CameraPos;\n' +
  'uniform bool u_LightOn;\n' +
  'uniform vec3 u_LightColor;\n' +
  '\n' +
  'void main() {\n' + //TODO: maybe make multiple shaders instead
      'vec4 texColor = texture2D(u_Sampler, v_UVCoords);\n'+

      'if (u_NormOrTex == 0) { gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); }\n' +
      'else if (u_NormOrTex == 1) { gl_FragColor = (1.0 - u_TexColorWeight) * u_BaseColor + u_TexColorWeight * texColor; }\n' +

      'vec3 lightVec = u_LightPos - vec3(v_VertPos);\n' +
      'float r = length(lightVec);\n' +
      // 'gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);\n' + // lighting falloff

      // diffuse + ambient
      'vec3 L = normalize(lightVec);\n' +
      'vec3 N = normalize(v_Normal);\n' +
      'float nDotL = max(dot(N, L), 0.0);\n' +

      'vec3 diffuse = vec3(gl_FragColor) * nDotL * u_LightColor;\n' + // give diffuse color
      'vec3 ambient = vec3(gl_FragColor) * 0.2;\n' +

      // specular
      'vec3 R = reflect(-L, N);\n' +
      'vec3 E = normalize(u_CameraPos - vec3(v_VertPos));\n' +

      'vec3 specular = pow(max(dot(E, R), 0.0), 20.0) * u_LightColor;\n' +  // give specular color
      
      'if (u_LightOn) {\n'+
      '   if (u_TexColorWeight <= 0.0) { gl_FragColor = vec4(diffuse + ambient, 1.0); }\n' + // no specular for non textured, TODO: make this not conditional
      '   else { gl_FragColor = vec4(diffuse + ambient + specular, 1.0); }\n' +
      '}\n' +
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
let a_Normal;
let u_NormOrTex;
let g_normVis = "off";
let g_identityM = new Matrix4();

let u_LightPos;
let g_lightX = 0;
let g_lightY = 16;
let g_lightZ = 0;
let g_lightAnim = "on";
let u_CameraPos;
let u_LightOn;
let g_lightOn = "on";
let u_NormalMatrix;

let g_camera; // this will be the Camera class
// these ones are actually rotating world
let g_cameraXAngle = 0;
let g_cameraYAngle = 0;
let g_cameraZoom = 4;

let g_startTime = performance.now() / 1000;
let g_elapsedTime = performance.now() / 1000 - g_startTime;

let g_mapSize = 32;

let g_lightRed = 1;
let g_lightGreen = 1;
let g_lightBlue = 1;
let u_LightColor;

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
  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  u_NormOrTex = gl.getUniformLocation(gl.program, "u_NormOrTex");
  u_LightPos = gl.getUniformLocation(gl.program, "u_LightPos");
  u_CameraPos = gl.getUniformLocation(gl.program, "u_CameraPos");
  u_LightOn = gl.getUniformLocation(gl.program, "u_LightOn");
  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, g_identityM.elements);
}

function addActionsForHtmlUI() {
  let normToggles = document.getElementsByName("normToggle");
  normToggles.forEach(s => {
    s.addEventListener("click", () => {
      g_normVis = s.value;
    });
  });
  let lightAnimToggles = document.getElementsByName("lightAnimToggle");
  lightAnimToggles.forEach(s => {
    s.addEventListener("click", () => {
      g_lightAnim = s.value;
    });
  });
  let lightToggles = document.getElementsByName("lightToggle");
  lightToggles.forEach(s => {
    s.addEventListener("click", () => {
      g_lightOn = s.value;
    });
  });

  let lightXSlider = document.getElementById("lightXSlider");
  lightXSlider.addEventListener("input", () => {
    g_lightX = lightXSlider.value;
    disableAutoAnimWhenDoingSlider();
  });
  let lightYSlider = document.getElementById("lightYSlider");
  lightYSlider.addEventListener("input", () => {
    g_lightY = lightYSlider.value;
    disableAutoAnimWhenDoingSlider();
  });
  let lightZSlider = document.getElementById("lightZSlider");
  lightZSlider.addEventListener("input", () => {
    g_lightZ = lightZSlider.value;
    disableAutoAnimWhenDoingSlider();
  });
  let lightRedSlider = document.getElementById("redSlider");
  lightRedSlider.addEventListener("input", () => {
    g_lightRed = lightRedSlider.value / 100;
  });
  let lightBlueSlider = document.getElementById("blueSlider");
  lightBlueSlider.addEventListener("input", () => {
    g_lightBlue = lightBlueSlider.value / 100;
  });
  let lightGreenSlider = document.getElementById("greenSlider");
  lightGreenSlider.addEventListener("input", () => {
    g_lightGreen = lightGreenSlider.value / 100;
  });
}

function disableAutoAnimWhenDoingSlider() {
  let off = document.getElementById("lightAnimOff");
  off.checked = true;
  g_lightAnim = off.value;
}


let g_texture_sky;
let g_texture_floor;
let g_texture_loki;

// let g_texture_cell_bnw;
function setupAllTextures() {
  initTexture("img/sky.png", gl.TEXTURE0);
  g_texture_sky = 0;
  initTexture("img/floor.png", gl.TEXTURE1);
  g_texture_floor = 1;
  initTexture("img/test_loki.png", gl.TEXTURE2);
  g_texture_loki = 2;

}

// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  setupAllTextures();
  addActionsForHtmlUI();

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

  updateAnimatedTransforms();

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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // needed to use any size img!!!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // target, mipmap level, internalformat, texelformat, texel type, img
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    gl.generateMipmap(gl.TEXTURE_2D); // mipmapping to get rid of moire 
  };
  // have browser load image
  img.src = texturePath;
}

let sphere;
let floor;
let sky;
let c1;
let c2;
let spinner;
let light;
let bunny;
let teapot;

let test;
function setUpScene() {
  g_camera = new Camera();
  sphere = new NormalledTexturedSphere(g_texture_loki, [1,0,0,1], 1);
  floor = new NormalledTexturedCube(g_texture_floor, [1,1,1,1], 1);
  sky = new NormalledTexturedCube(g_texture_sky, [0.5,0.5,1,1], 0);
  c1 = new NormalledTexturedCube(g_texture_loki, [1,0,0,1], 0);
  c2 = new NormalledTexturedCube(g_texture_loki, [0,0,1,1], 0.5);
  spinner = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 1);
  light = new NormalledTexturedSphere(g_texture_loki, [1,1,0,1], 0);
  bunny = new ObjModel("model/bunny.obj", [0,1,0,1]);
  teapot = new ObjModel("model/teapot.obj", [1,0.5,0.7]);

  test = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
}

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

  floor.matrix.set(g_identityM);
  floor.matrix.translate(0,-0.5,0);
  floor.matrix.scale(g_mapSize, 0.01, g_mapSize);
  floor.render();

  sky.matrix.set(g_identityM);
  sky.matrix.scale(g_mapSize * 1, g_mapSize * 1, g_mapSize * 1);
  // sky.normalMatrix.setInverseOf(sky.matrix).transpose();
  // sky.matrix.scale(-1,-1,-1);
  sky.flipped = true;
  sky.render();

  c1.matrix.set(g_identityM);
  c1.matrix.translate(0,0,-6);
  c1.matrix.translate(-0.5,0,-0.5);
  c1.render();

  c2.matrix.set(g_identityM);
  c2.matrix.translate(1,1,-6);
  c2.matrix.translate(-0.5,0,-0.5);
  c2.render();

  sphere.matrix.set(g_identityM);
  sphere.matrix.translate(0,2,-3);
  sphere.render();

  spinner.matrix.set(g_identityM);
  spinner.matrix.translate(-2,2,-5);
  spinner.matrix.rotate(g_elapsedTime * 50, 1,1,1);
  spinner.matrix.rotate(g_elapsedTime * 50, -1,1,1);
  spinner.render();

  light.matrix.set(g_identityM);
  light.matrix.translate(g_lightX, g_lightY, g_lightZ);
  light.flipped = true;
  light.render();

  bunny.matrix.set(g_identityM);
  bunny.matrix.translate(5,0,-5);
  bunny.matrix.scale(0.5,0.5,0.5);
  bunny.render();

  teapot.matrix.set(g_identityM);
  teapot.matrix.translate(-5,0,-5);
  teapot.matrix.scale(0.5,0.5,0.5);
  teapot.render();

  gl.uniform3f(u_LightPos, g_lightX, g_lightY, g_lightZ); // pass to shader!
  gl.uniform3f(u_CameraPos, g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2]);
  gl.uniform1i(u_LightOn, (g_lightOn === "on") ? 1 : 0);
  gl.uniform3f(u_LightColor, g_lightRed, g_lightGreen, g_lightBlue);
}

function updateAnimatedTransforms() {
  if (g_lightAnim === "on") {
    g_lightX = Math.sin(g_elapsedTime / 2) * 12;
    g_lightZ = Math.cos(g_elapsedTime / 2) * 12;
    g_lightY = Math.sin(g_elapsedTime / 2) * 2 + 8;
  }
}