// -- Vertex shader program --
// we use \n and + so that errors give us line numbers
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +  // attributes: external vars that can vary for each vertex
  'attribute float a_PointSize;\n'+
  '\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' + // Set the vertex coordinates of the point
  '  gl_PointSize = a_PointSize;\n' +                    // Set the point size
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
let a_PointSize;
let u_FragColor;

// -- Setup helpers --
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
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
  a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
  // get location of uniform var
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
}


// -- MAIN --
function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // set up click listener to call click handler
  canvas.onmousedown = click;

  // pass a position to it
  gl.vertexAttrib3f(a_Position, 0.0, 0.5, 0.0); // 3f so that 4th homogenous coord is default 1.0
  gl.vertexAttrib1f(a_PointSize, 10.0);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


// -- Extra helper funcs/things --

// global array for mouse click points
// we need to store all points since buffer gets cleared on draw
var g_points = [];
var g_colors = [];

// define click handler
function click(event) {
  let [x, y] = convertCoordinatesEventToGL(event);

  // push xy components
  g_points.push([x, y]);

  // push colors
  if (x >= 0 && y > 0) {  // Q1 = red
    g_colors.push([1.0, 0.0, 0.0, 1.0]);
  } else if (x < 0 && y < 0) {  // Q3 = green
    g_colors.push([0.0, 1.0, 0.0, 1.0]);
  } else {  // others = white
    g_colors.push([0.0, 0.0, 0.0, 0.0]);
  }
  
  renderAllShapes();
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

  // for each point, set position attribute with x and y, color uniform, and then draw
  for (let i = 0; i < g_points.length; i++) {
    var xy = g_points[i];
    var rgba = g_colors[i];
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Draw a point
    // mode, first vertex to draw from, number of vertices to draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}