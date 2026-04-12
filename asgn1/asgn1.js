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

// awesome "zen board" feature: shapes fade away over time
  // var alphaFadeTimer = setTimeout(alphaFader, 10);
  
  // function alphaFader() {
  //   let numToRemove = 0;
  //   g_shapesList.forEach(shape => {
  //     if (shape.color[3] > 0) {
  //       shape.color[3] -= 0.01;
  //     } else {
  //       numToRemove++;
  //     }
  //   });

  //   for (let i = 0; i < numToRemove; i++) {
  //     g_shapesList.pop();
  //   }

  //   // console.log("in timer")
  //   alphaFadeTimer = setTimeout(alphaFader, 10);
  // }


// -- Extra helper funcs/things --

// global array for all drawn shapes, which need to be stored
// since buffer is cleared on draw
var g_shapesList = [];

// define click handler
function click(event) {
   // track performance
  let fpsCounter = document.getElementById("fpsCounter");
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
  fpsCounter.textContent = (1000 / msElapsed).toFixed(0);
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