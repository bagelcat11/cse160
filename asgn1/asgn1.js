// -- Vertex shader program --
// we use \n and + so that errors give us line numbers
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +  // attributes: external vars that can vary for each vertex
  'uniform float u_PointSize;\n'+
  '\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' + // Set the vertex coordinates of the point
  '  gl_PointSize = u_PointSize;\n' +                    // Set the point size
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
let u_PointSize;
let u_FragColor;

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
  // console.log("init a pos", a_Position);
  // get location of uniform var
  u_PointSize = gl.getUniformLocation(gl.program, "u_PointSize");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  // console.log("init size", u_PointSize);
}

// globals for HTML selections
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedShape = "point";
let g_numSegments = 16;
let g_partyModeSelector;

function addActionsForHtmlUI() {
  let redSlider = document.getElementById("redSlider");
  let greenSlider = document.getElementById("greenSlider");
  let blueSlider = document.getElementById("blueSlider");
  redSlider.addEventListener("mouseup", () => {
    g_selectedColor[0] = redSlider.value / 100.0;
  });
  greenSlider.addEventListener("mouseup", () => {
    g_selectedColor[1] = greenSlider.value / 100;
  });
  blueSlider.addEventListener("mouseup", () => {
    g_selectedColor[2] = blueSlider.value / 100;
  });

  let sizeSlider = document.getElementById("sizeSlider");
  sizeSlider.addEventListener("mouseup", () => {
    g_selectedSize = sizeSlider.value;
  });

  let clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", () => {
    // clear canvas by clearing shapes list
    g_shapesList = [];
    renderAllShapes();
  });

  let shapeSelectors = document.getElementsByName("shapeSelect");
  //TODO: curiosity: looping with for loop didn't work (clicking any button made
  // it be circle) because of something to do with maybe needing closures?
  // https://stackoverflow.com/a/19586183
  // but it seems forEach captures scope properly...
  shapeSelectors.forEach(s => {
    s.addEventListener("click", () => {
      g_selectedShape = s.value;
    });
  });

  let segmentCountSlider = document.getElementById("segmentCountSlider");
  segmentCountSlider.addEventListener("mouseup", () => {
    g_numSegments = segmentCountSlider.value;
  });

  g_partyModeSelector = document.getElementById("partyModeSelect");
  g_partyModeSelector.value = "off";  // default

  let lynnPicButton = document.getElementById("lynnPicButton");
  lynnPicButton.addEventListener("click", addLynnPictureShapes);
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // set up click listener to call click handler
  canvas.onmousedown = click;
  // click if mouse held and dragged
  canvas.onmousemove = (event) => { if (event.buttons == 1) click(event);};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// -- Extra helper funcs/things --

// global array for all drawn shapes, which need to be stored
// since buffer is cleared on draw
var g_shapesList = [];

// define click handler
function click(event) {
   // track performance
  let msCounter = document.getElementById("msCounter");
  let start = performance.now();
  
  let [x, y] = convertCoordinatesEventToGL(event);

  // set up a new shape depending on selector, and add it to the shapes list
  let shape;
  switch (g_selectedShape) {
    case "point":
      shape = new Point();
      break;
    case "triangle":
      shape = new Triangle();
      break;
    case "circle":
      shape = new Circle();
      shape.segments = g_numSegments;
      break;
    default:
      break;
  }
  shape.position = [x, y];
  shape.color = g_selectedColor.slice();  // slice to send copy
  shape.size = g_selectedSize;

  g_shapesList.push(shape);
  renderAllShapes();

  // update performance
  let msElapsed = performance.now() - start; 
  msCounter.textContent = (msElapsed).toFixed(0) + " ms";
}

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
  gl.clear(gl.COLOR_BUFFER_BIT);

  // each shape knows how to render itself
  for (let i = 0; i < g_shapesList.length; i++) {
    g_shapesList[i].render();
  }
}

// draw picture with my initials!
function addLynnPictureShapes() {
  console.log("hi")
  // we will just add a ton of colored triangles to the shapes list so they can be rendered as normal
  // GO COUNTER-CLOCKWISE
  let bg = [
    -1, -1,
    1, 1,
    -1, 1,

    -1, -1,
    1, -1,
    1, 1
  ];
  let darkPinkTris_L = [
    -0.6, 0.5,
    -0.5, 0.5,
    -0.5, 0.6,

    -0.6, 0.4,
    -0.5, 0.5,
    -0.6, 0.5,

    -0.7, 0.4,
    -0.6, 0.4,
    -0.6, 0.5,

    -0.7, 0.3,
    -0.6, 0.4,
    -0.7, 0.4,

    -0.7, 0.3,
    -0.6, 0.3,
    -0.6, 0.4,

    -0.6, 0.1,
    -0.6, 0.3,
    -0.8, 0.3,

    -0.6, 0.1,
    -0.8, 0.3,
    -0.8, 0.1,

    -0.9, 0.2,
    -0.8, 0.3,
    -0.9, 0.4,

    -0.8, 0.1,
    -0.8, 0.3,
    -0.9, 0.2,

    -0.7, 0.0,
    -0.6, 0.1,
    -0.8, 0.1,

    -0.7, 0.0,
    -0.6, 0.0,
    -0.6, 0.1,

    -0.6, -0.1,
    -0.5, 0.0,
    -0.6, 0.0,

    -0.4, 0.0,
    -0.5, 0.1,
    -0.6, 0.0,
    
    -0.9, -0.2,
    -0.7, -0.2,
    -0.9, 0.0,

    -0.7, -0.4,
    -0.5, -0.2,
    -0.9, -0.2,

    -0.3, -0.4,
    -0.3, -0.2,
    -0.5, -0.4,

    -0.3, -0.4,
    -0.2, -0.3,
    -0.3, -0.2,

    -0.3, -0.4,
    -0.2, -0.4,
    -0.2, -0.3,

    -0.2, -0.4,
    -0.1, -0.3,
    -0.2, -0.3
  ];
  let orangeTris_L = [
    -0.6, 0.3,
    -0.5, 0.4,
    -0.6, 0.4,

    -0.6, 0.2,
    -0.5, 0.3,
    -0.6, 0.3,

    -0.9, 0.0,
    -0.7, 0.0,
    -0.8, 0.1,

    -0.7, -0.2,
    -0.7, 0.0,
    -0.9, 0.0,

    -0.7, -0.2,
    -0.6, -0.2,
    -0.7, 0.0,

    -0.6, -0.2,
    -0.6, 0.0,
    -0.7, 0.0,

    -0.7, -0.4,
    -0.5, -0.4,
    -0.5, -0.2,

    -0.5, -0.4,
    -0.3, -0.2,
    -0.5, -0.2,

    -0.2, -0.3,
    -0.2, -0.1,
    -0.3, -0.2,

    -0.1, -0.3,
    -0.1, -0.1,
    -0.2, -0.2,

    -0.2, -0.3,
    -0.1, -0.3,
    -0.2, -0.2,
  ];
  let eyes = [
    -0.8, 0.3,
    -0.7, 0.4,
    -0.8, 0.4,

    -0.7, 0.3,
    -0.7, 0.4,
    -0.8, 0.3,

    0.7, 0.3,
    0.8, 0.4,
    0.7, 0.4,

    0.8, 0.3,
    0.8, 0.4,
    0.7, 0.3
  ];

  // colors
  let darkPink = [1.0, 0.0, 1.0, 1.0];
  let orange = [1.0, 0.5, 0.0, 1.0];
  let blue = [0.0, 1.0, 1.0, 1.0];
  let black = [0.1, 0.1, 0.1, 1.0];

  drawManyTriangles(bg, blue);
  drawManyTriangles(darkPinkTris_L, darkPink);
  drawManyTriangles(orangeTris_L, orange);
  drawManyTriangles(eyes, black);
}

function drawManyTriangles(vertices, color) {
  // var n = 3;  // number of vertices

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  gl.drawArrays(gl.TRIANGLES, 0, (vertices.length / 2));
}