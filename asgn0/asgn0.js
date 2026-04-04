function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('canvas');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // set up button listeners
  let drawButton = document.getElementById("drawButton");
  drawButton.addEventListener("click", handleDrawEvent);

  // draw black background
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, 400, 400);

  // draw a default vector
  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, "red");
}

// -- helpers --
function drawVector(v, color) {
    const DRAWING_SCALE = 20;
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    // start path, define line, draw it
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    // draw line from center and invert y to be math-like
    ctx.lineTo(canvas.width / 2 + v.elements[0] * DRAWING_SCALE,
        canvas.height / 2 - v.elements[1] * DRAWING_SCALE);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent() {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let v1x = document.getElementById("v1x");
    let v1y = document.getElementById("v1y");
    let v2x = document.getElementById("v2x");
    let v2y = document.getElementById("v2y");

    // clear canvas
    ctx.fillRect(0, 0, 400, 400);
    // draw vectors from inputs
    let v1 = new Vector3([v1x.value, v1y.value, 0]);
    drawVector(v1, "red");
    let v2 = new Vector3([v2x.value, v2y.value, 0]);
    drawVector(v2, "blue");

    // clear inputs?
    // v1x.value = "";
    // v1y.value = "";
}
