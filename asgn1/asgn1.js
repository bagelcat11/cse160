// -- Vertex shader program --
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
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Set the point color
  '}\n';


function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders");
    return;
  }

  // get storage locations of attribute vars from gl.program, which can
  // only be referenced after initShaders is called
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  var a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");

  // set up click listener to pass click positions to attribute var
  // defining it like this means on click, anon(event) is called, then our click function with our params
  canvas.onmousedown = function(event) { click(event, gl, canvas, a_Position); };

  // pass a position to it
  gl.vertexAttrib3f(a_Position, 0.0, 0.5, 0.0); // 3f so that 4th homogenous coord is default 1.0
  gl.vertexAttrib1f(a_PointSize, 5.0);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a point
  // mode, first vertex to draw from, number of vertices to draw
  gl.drawArrays(gl.POINTS, 0, 1);
}

// -- Helper funcs/things --

// global array for mouse click points
// we need to store all points since buffer gets cleared on draw
var g_points = [];

// define click handler
function click(event, gl, canvas, a_Position) {
  // transform browser coords -> canvas coords -> webgl coords
  var x = event.clientX;
  var y = event.clientY;
  var rect = event.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
  y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);

  // push components to array and clear screen
  g_points.push([x, y]);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // for each point, set position attribute with x and y and then draw
  for (let i = 0; i < g_points.length; i++) {
    var xy = g_points[i]
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0)
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}