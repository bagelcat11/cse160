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
  let opButton = document.getElementById("opButton");
  opButton.addEventListener("click", handleDrawOperationEvent);

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

function angleBetween(v1, v2) {
    // formula: dot(v1, v2) = ||v1|| * ||v2|| * cos(theta)
    let res = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
    // convert to degrees
    return res * (180 / Math.PI);
}

// -- handler definitions --
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

function handleDrawOperationEvent() {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let v1x = document.getElementById("v1x");
    let v1y = document.getElementById("v1y");
    let v2x = document.getElementById("v2x");
    let v2y = document.getElementById("v2y");
    let v1 = new Vector3([v1x.value, v1y.value, 0]);
    let v2 = new Vector3([v2x.value, v2y.value, 0]);
    // draw the two input vectors first
    handleDrawEvent();

    // draw extra green vector(s) to show results
    let op = document.getElementById("op");
    let scalar = document.getElementById("scalar");
    let resultVecs = [];
    switch (op.value) {
        case "add":
            var res = new Vector3();
            res.set(v1.add(v2));
            resultVecs.push(res);
            break;
        case "sub":
            var res = new Vector3();    // this has to be var and not let??
            res.set(v1.sub(v2));
            resultVecs.push(res);
            break;
        case "mul":
            var res1 = new Vector3();
            var res2 = new Vector3();
            res1.set(v1.mul(scalar.value));
            res2.set(v2.mul(scalar.value));
            resultVecs.push(res1);
            resultVecs.push(res2);
            break;
        case "div":
            var res1 = new Vector3();
            var res2 = new Vector3();
            res1.set(v1.div(scalar.value));
            res2.set(v2.div(scalar.value ));
            resultVecs.push(res1);
            resultVecs.push(res2);
            break;
        case "magnitude":
            console.log("Magnitude v1:", v1.magnitude());
            console.log("Magnitude v2:", v2.magnitude());
            break;
        case "normalize":
            var res1 = new Vector3();
            var res2 = new Vector3();
            res1.set(v1.normalize());
            res2.set(v2.normalize());
            resultVecs.push(res1);
            resultVecs.push(res2);
            break;
        case "angle":
            console.log("Angle:", angleBetween(v1, v2));
            break;
        case "area":
            // ||a x b|| = parallelogram area, so divide by 2 for triangle
            console.log("Triangle area:", Vector3.cross(v1, v2).magnitude() / 2);
            break;
        default:
            break;
    }

    for (let i = 0; i < resultVecs.length; i++) {
        drawVector(resultVecs[i], "green");
    }
}
