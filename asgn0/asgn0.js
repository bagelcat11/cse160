function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('canvas');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw black background
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, 400, 400);

  // draw a vector
  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, "red");
}

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
