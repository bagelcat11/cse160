/*
converting her cube parts into this project was fine, but the head, etc. would definitely have to be rewritten from the ground up unfortunately
*/


function setUpLoki() {
    // g_shapesList["head"] = new Head();
    // g_shapesList["earLeft"] = new Ear();
    // g_shapesList["earRight"] = new Ear();
    g_shapesList["body"] = new Body();
    // g_shapesList["jaw"] = new Jaw();
    g_shapesList["eyeLeft"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["eyeRight"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["pupilLeft"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["pupilRight"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["whiskerTopLeft"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["whiskerMidLeft"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["whiskerBottomLeft"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["whiskerTopRight"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["whiskerMidRight"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["whiskerBottomRight"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);

    g_shapesList["tail1"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["tail2"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["tail3"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["tail4"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);

    g_shapesList["neck"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);

    g_shapesList["leftArmTop"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["leftArmMiddle"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["leftArmPaw"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["rightArmTop"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["rightArmMiddle"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["rightArmPaw"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);

    g_shapesList["leftLegTop"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["leftLegMiddle"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["leftLegPaw"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["rightLegTop"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["rightLegMiddle"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
    g_shapesList["rightLegPaw"] = new NormalledTexturedCube(g_texture_loki, [1,1,1,1], 0);
}

let LOKI_WHITE = [1,0.97,0.97,1];
let LOKI_DARK_BROWN = [0.2, 0.1, 0.0, 1.0];
let LOKI_MED_BROWN = [0.35, 0.25, 0, 1];
let LOKI_LIGHT_BROWN = [0.75, 0.6, 0.5, 1];
let LOKI_YELLOW = [0.9,0.8,0.3,1];

let g_tail1Angle, g_tail2Angle, g_tail3Angle, g_tail4Angle, g_armTopAngle, g_armMidAngle, g_armPawAngle, g_legTopAngle, g_legMidAngle, g_legPawAngle, g_bodyBobHeight;

let LOKI_IDENTITY = new Matrix4();
LOKI_IDENTITY.translate(-5,1,-5);
LOKI_IDENTITY.rotate(90, 1,0,0);
LOKI_IDENTITY.rotate(135, 0,0,1);

function renderLoki() {
    g_tail1Angle = Math.sin(g_elapsedTime) * 20;
    g_tail2Angle = g_tail3Angle = g_tail4Angle = g_tail1Angle;
    g_bodyBobHeight = Math.sin(10 * g_elapsedTime) * 0.01;

    // sin(2x) = 2x frequency
    // sin(x) * y = y amplitude (degree output)
    g_armTopAngle = Math.sin(5 * g_elapsedTime) * 25;
    g_armMidAngle = Math.cos(5 * g_elapsedTime) * 25;
    g_armPawAngle = -Math.cos(5 * g_elapsedTime) * 20;

    g_legTopAngle = Math.cos(5 * g_elapsedTime) * 25;
    g_legMidAngle = Math.sin(5 * g_elapsedTime) * 25;
    g_legPawAngle = -Math.sin(5 * g_elapsedTime) * 20;

//     let head = g_shapesList["head"];
//   let earLeft = g_shapesList["earLeft"];
//   let earRight = g_shapesList["earRight"];
//   let jaw = g_shapesList["jaw"];
    let body = g_shapesList["body"];

      let neck = g_shapesList["neck"];
  let eyeLeft = g_shapesList["eyeLeft"];
  let eyeRight = g_shapesList["eyeRight"];
  let pupilLeft = g_shapesList["pupilLeft"];
  let pupilRight = g_shapesList["pupilRight"];

  let tail1 = g_shapesList["tail1"];
  let tail2 = g_shapesList["tail2"];
  let tail3 = g_shapesList["tail3"];
  let tail4 = g_shapesList["tail4"];

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

  let whiskerTopLeft = g_shapesList["whiskerTopLeft"];
  let whiskerMidLeft = g_shapesList["whiskerMidLeft"];
  let whiskerBottomLeft = g_shapesList["whiskerBottomLeft"];
  let whiskerTopRight = g_shapesList["whiskerTopRight"];
  let whiskerMidRight = g_shapesList["whiskerMidRight"];
  let whiskerBottomRight = g_shapesList["whiskerBottomRight"];

  
  // HEAD
//   head.baseColor = [0.8, 0.4, 0.0, 1.0];
//   head.matrix.set(LOKI_IDENTITY); // reset every frame
//   head.matrix.translate(0, 0, g_bodyBobHeight);
//   head.matrix.rotate(g_headAngle, 1,0,0)
//   head.matrix.scale(0.4, 0.4, 0.37);
//   head.matrix.translate(-0.5, -1.5, 0.5);
//   head.render();

//   earLeft.matrix.set(head.matrix);
//   earLeft.matrix.translate(0.85,0.3,-1.35);
//   earLeft.matrix.rotate(g_earsAngle, 0,0,1);
//   earLeft.matrix.scale(0.9, 1, 1.2);
//   earLeft.render();

//   earRight.matrix.set(head.matrix);
//   earRight.matrix.translate(0.15,0.3,-1.35);
//   earRight.matrix.rotate(-g_earsAngle, 0,0,1);
//   earRight.matrix.scale(0.9, 1, 1.2);
//   earRight.matrix.scale(-1,1,1);
//   earRight.render();

//   jaw.matrix.set(head.matrix);
//   jaw.matrix.translate(0, 0.5, 0.01);
//   jaw.matrix.rotate(g_jawAngle, 1, 0, 0);
//   // offset so it pivots around inner extends
//   jaw.matrix.translate(0, -0.5, 0);
//   jaw.render();

  neck.baseColor = LOKI_WHITE;
  neck.matrix.set(LOKI_IDENTITY);
  neck.matrix.translate(0, 0, g_bodyBobHeight);
  neck.matrix.translate(0, -0.25, 0.2);
  neck.matrix.rotate(60, 1, 0, 0);
  neck.matrix.scale(0.35, 0.35, 0.25);
  neck.render();

//   eyeLeft.baseColor = LOKI_YELLOW;
//   eyeLeft.matrix.set(head.matrix);
//   eyeLeft.matrix.translate(0.77, 0.1, -0.55);
//   let eyeLeftCoords = new Matrix4().set(eyeLeft.matrix);
//   // eyeLeft.matrix.rotate(45, 0,1,0);
//   eyeLeft.matrix.scale(1, 1, g_eyesSquish);
//   eyeLeft.matrix.scale(0.25, 0.25, 0.15);
//   eyeLeft.render();

//   eyeRight.baseColor = LOKI_YELLOW;
//   eyeRight.matrix.set(head.matrix);
//   eyeRight.matrix.translate(0.23, 0.1, -0.55);
//   let eyeRightCoords = new Matrix4().set(eyeRight.matrix);
//   eyeRight.matrix.scale(1, 1, g_eyesSquish);
//   // eyeRight.matrix.rotate(45, 0,1,0);
//   eyeRight.matrix.scale(0.25, 0.25, 0.15);
//   eyeRight.render();

//   whiskerTopRight.baseColor = [1,1,1,1];
//   whiskerTopRight.matrix.set(head.matrix);
//   whiskerTopRight.matrix.translate(0.15,-0.05,-0.95);
//   whiskerTopRight.matrix.rotate(-60, 1,3,0);
//   whiskerTopRight.matrix.scale(0.5, 0.01, 0.01);
//   whiskerTopRight.render();

//   whiskerTopLeft.baseColor = [1,1,1,1];
//   whiskerTopLeft.matrix.set(head.matrix);
//   whiskerTopLeft.matrix.translate(0.85,-0.05,-0.95);
//   whiskerTopLeft.matrix.rotate(180, 1,0,0)
//   whiskerTopLeft.matrix.rotate(-60, 1,3,0);
//   whiskerTopLeft.matrix.scale(-0.5, 0.01, 0.01);
//   whiskerTopLeft.render();

//   whiskerMidRight.baseColor = [1,1,1,1];
//   whiskerMidRight.matrix.set(head.matrix);
//   whiskerMidRight.matrix.translate(0,-0.15,-0.39);
//   whiskerMidRight.matrix.rotate(30,0,0,1);
//   whiskerMidRight.matrix.rotate(-20, 1,2,0);
//   whiskerMidRight.matrix.scale(0.5, 0.01, 0.01);
//   whiskerMidRight.render();

//   whiskerMidLeft.baseColor = [1,1,1,1];
//   whiskerMidLeft.matrix.set(head.matrix);
//   whiskerMidLeft.matrix.translate(1,-0.15,-0.39);
//   whiskerMidLeft.matrix.rotate(-30,0,0,1);
//   whiskerMidLeft.matrix.rotate(180, 0,0,1)
//   whiskerMidLeft.matrix.rotate(-20, 1,2,0);
//   whiskerMidLeft.matrix.scale(0.5, 0.01, 0.01);
//   whiskerMidLeft.render();

//   whiskerBottomRight.baseColor = [1,1,1,1];
//   whiskerBottomRight.matrix.set(head.matrix);
//   whiskerBottomRight.matrix.translate(0,-0.15,-0.19);
//   whiskerBottomRight.matrix.rotate(30,0,0,1);
//   whiskerBottomRight.matrix.rotate(20, 1,2,0);
//   whiskerBottomRight.matrix.scale(0.5, 0.01, 0.01);
//   whiskerBottomRight.render();

//   whiskerBottomLeft.baseColor = [1,1,1,1];
//   whiskerBottomLeft.matrix.set(head.matrix);
//   whiskerBottomLeft.matrix.translate(1,-0.15,-0.19);
//   whiskerBottomLeft.matrix.rotate(-30,0,0,1);
//   whiskerBottomLeft.matrix.rotate(180, 0,0,1)
//   whiskerBottomLeft.matrix.rotate(20, 1,2,0);
//   whiskerBottomLeft.matrix.scale(0.5, 0.01, 0.01);
//   whiskerBottomLeft.render();


  // BODY
  body.matrix.set(LOKI_IDENTITY);
  body.matrix.translate(0, 0, g_bodyBobHeight);
  body.matrix.translate(0, -0.25, 0.25);
  body.render();

  // TAIL
  tail1.baseColor = LOKI_DARK_BROWN;
  tail1.matrix.set(LOKI_IDENTITY);
  tail1.matrix.translate(0, 0, g_bodyBobHeight);
  tail1.matrix.translate(0, 0.75, 0.1);
  tail1.matrix.rotate(g_tail1Angle, 0,0,1); // animated rotate
  tail1.matrix.rotate(25,1,0,0);  // position rotation separate from animation
  let tail1Coords = new Matrix4().set(tail1.matrix);  // set ref after rotating
  tail1.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0); // offset first so that it pivots around origin
  tail1.render();

  tail2.baseColor = tail1.baseColor;
  tail2.matrix.set(tail1Coords);
  tail2.matrix.translate(0, 0.2, 0.05);
  tail2.matrix.rotate(g_tail2Angle, 0,0,1);
  tail2.matrix.rotate(25,1,0,0); 
  let tail2Coords = new Matrix4().set(tail2.matrix);
  tail2.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0);
  tail2.render();

  tail3.baseColor = tail1.baseColor;
  tail3.matrix.set(tail2Coords);
  tail3.matrix.translate(0, 0.2, -0.05);
  tail3.matrix.rotate(g_tail3Angle, 0,0,1);
  tail3.matrix.rotate(-40,1,0,0); 
  let tail3Coords = new Matrix4().set(tail3.matrix);
  tail3.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0);
  tail3.render();

  tail4.baseColor = tail1.baseColor;
  tail4.matrix.set(tail3Coords);
  tail4.matrix.translate(0, 0.2, -0.05);
  tail4.matrix.rotate(g_tail4Angle, 0,0,1);
  tail4.matrix.rotate(-25,1,0,0); 
  tail4.matrix.scale(0.1, 0.25, 0.1);
  tail1.matrix.translate(0,0.25,0);
  tail4.render();

  // ARMS
  leftArmTop.baseColor = LOKI_WHITE;
  leftArmTop.matrix.set(LOKI_IDENTITY);
  leftArmTop.matrix.translate(0.16, -0.2, 0.35)
  leftArmTop.matrix.rotate(g_armTopAngle, 1, 0, 0);
  let leftArmTopCoords = new Matrix4().set(leftArmTop.matrix);
  leftArmTop.matrix.scale(0.15,0.2,0.2);
  leftArmTop.render();

  leftArmMiddle.baseColor = LOKI_DARK_BROWN;
  leftArmMiddle.matrix.set(leftArmTopCoords);
  leftArmMiddle.matrix.translate(-0.01, 0.0, 0.15);
  leftArmMiddle.matrix.rotate(g_armMidAngle, 1, 0, 0);
  let leftMidCoords = new Matrix4().set(leftArmMiddle.matrix)
  leftArmMiddle.matrix.scale(0.12, 0.12, 0.3)
  leftArmMiddle.matrix.translate(0, 0, 0.2); // offset
  leftArmMiddle.render();

  leftArmPaw.baseColor = LOKI_WHITE;
  leftArmPaw.matrix.set(leftMidCoords);
  leftArmPaw.matrix.translate(0, -0.05, 0.18);
  leftArmPaw.matrix.rotate(g_armPawAngle, 1, 0, 0);
  leftArmPaw.matrix.scale(0.15, 0.15, 0.07);
  leftArmPaw.render();

  rightArmTop.baseColor = LOKI_DARK_BROWN;
  rightArmTop.matrix.set(LOKI_IDENTITY);
  rightArmTop.matrix.translate(-0.16, -0.2, 0.35)
  rightArmTop.matrix.rotate(-g_armTopAngle, 1, 0, 0);
  let rightArmTopCoords = new Matrix4().set(rightArmTop.matrix);
  rightArmTop.matrix.scale(0.15,0.2,0.2);
  rightArmTop.render();

  rightArmMiddle.baseColor = LOKI_WHITE;
  rightArmMiddle.matrix.set(rightArmTopCoords);
  rightArmMiddle.matrix.translate(0.01, 0.0, 0.2);
  rightArmMiddle.matrix.rotate(-g_armMidAngle, 1, 0, 0);
  let rightMidCoords = new Matrix4().set(rightArmMiddle.matrix)
  rightArmMiddle.matrix.scale(0.12, 0.12, 0.3)
  rightArmMiddle.matrix.translate(0, 0, 0.2); // offset
  rightArmMiddle.render();

  rightArmPaw.baseColor = LOKI_WHITE;
  rightArmPaw.matrix.set(rightMidCoords);
  rightArmPaw.matrix.translate(0, -0.05, 0.18);
  rightArmPaw.matrix.rotate(-g_armPawAngle, 1, 0, 0);
  rightArmPaw.matrix.scale(0.15, 0.15, 0.07);
  rightArmPaw.render();

  // LEGS
  leftLegTop.baseColor = LOKI_DARK_BROWN;
  leftLegTop.matrix.set(LOKI_IDENTITY);
  leftLegTop.matrix.translate(0.16, 0.65, 0.3)
  leftLegTop.matrix.rotate(g_legTopAngle, 1, 0, 0);
  let leftLegTopCoords = new Matrix4().set(leftLegTop.matrix);
  leftLegTop.matrix.scale(0.15,0.3,0.3);
  leftLegTop.render();

  leftLegMiddle.baseColor = LOKI_DARK_BROWN;
  leftLegMiddle.matrix.set(leftLegTopCoords);
  leftLegMiddle.matrix.translate(-0.01, 0.0, 0.2);
  leftLegMiddle.matrix.rotate(g_legMidAngle, 1, 0, 0);
  let leftLegMidCoords = new Matrix4().set(leftLegMiddle.matrix)
  leftLegMiddle.matrix.scale(0.12, 0.15, 0.3)
  leftLegMiddle.matrix.translate(0, 0, 0.2); // offset
  leftLegMiddle.render();

  leftLegPaw.baseColor = LOKI_WHITE;
  leftLegPaw.matrix.set(leftLegMidCoords);
  leftLegPaw.matrix.translate(0, -0.05, 0.18);
  leftLegPaw.matrix.rotate(g_legPawAngle, 1, 0, 0);
  leftLegPaw.matrix.scale(0.15, 0.15, 0.07);
  leftLegPaw.render();

  rightLegTop.baseColor = leftLegTop.baseColor;
  rightLegTop.matrix.set(LOKI_IDENTITY);
  rightLegTop.matrix.translate(-0.16, 0.65, 0.3)
  rightLegTop.matrix.rotate(-g_legTopAngle, 1, 0, 0);
  let rightLegTopCoords = new Matrix4().set(rightLegTop.matrix);
  rightLegTop.matrix.scale(0.15,0.3,0.3);
  rightLegTop.render();

  rightLegMiddle.baseColor = leftLegMiddle.baseColor;
  rightLegMiddle.matrix.set(rightLegTopCoords);
  rightLegMiddle.matrix.translate(0.01, 0.0, 0.2);
  rightLegMiddle.matrix.rotate(-g_legMidAngle, 1, 0, 0);
  let rightLegMidCoords = new Matrix4().set(rightLegMiddle.matrix)
  rightLegMiddle.matrix.scale(0.12, 0.15, 0.3)
  rightLegMiddle.matrix.translate(0, 0, 0.2); // offset
  rightLegMiddle.render();

  rightLegPaw.baseColor = leftLegPaw.baseColor;
  rightLegPaw.matrix.set(rightLegMidCoords);
  rightLegPaw.matrix.translate(0, -0.05, 0.18);
  rightLegPaw.matrix.rotate(-g_legPawAngle, 1, 0, 0);
  rightLegPaw.matrix.scale(0.15, 0.15, 0.07);
  rightLegPaw.render();
}


// class Body extends NormalledTexturedSphere {
//     constructor(textureNum, baseColor, texColorWeight) {
//         super(textureNum, baseColor, texColorWeight);
//     }

//     render() {
//         let radius = 0.25;
//         let length = 1.0;
//         let numSides = 8
//         // front octagonal prism
//         let v = [0,0,0];
//         let angleStep = 360 / numSides;
//         for (let angle = 0; angle < 360; angle += angleStep) {
//             let angle2 = angle + angleStep;
//             let vec1 = [Math.cos(angle * Math.PI / 180) * radius, Math.sin(angle * Math.PI / 180) * radius];
//             let vec2 = [Math.cos(angle2 * Math.PI / 180) * radius, Math.sin(angle2 * Math.PI / 180) * radius];

//             v.push(vec1[0], 0, vec1[1], vec2[0], 0, vec2[1],);
//         }

//         this.baseColor = LOKI_WHITE;
//         this.drawNormalledTexturedTri(v, gl.TRIANGLE_FAN);

//         // back
//         v = [0,length,0];
//         for (let angle = 0; angle < 360; angle += angleStep) {
//             let angle2 = angle + angleStep;
//             let vec1 = [Math.cos(angle * Math.PI / 180) * radius, Math.sin(angle * Math.PI / 180) * radius];
//             let vec2 = [Math.cos(angle2 * Math.PI / 180) * radius, Math.sin(angle2 * Math.PI / 180) * radius];

//             v.push(vec1[0], length, vec1[1], vec2[0], length, vec2[1],);
//         }

//         this.baseColor = LOKI_MED_BROWN;
//         this.drawNormalledTexturedTri(v, gl.TRIANGLE_FAN);

//         // fill rects (bottom half)
//         for (let i = 1; i < numSides; i++) {
//             let rgba = LOKI_WHITE;
//             this.drawRectangle3D([  v[i*3+0], length, v[i*3+2],
//                                     v[i*3+3], length, v[i*3+5],
//                                     v[i*3+0], 0, v[i*3+2],
//                                     v[i*3+3], 0, v[i*3+5],],
//                                     rgba);
//         }
//         // top half
//         for (let i = numSides; i <= numSides * 2; i++) {
//             let rgba = LOKI_DARK_BROWN;
//             this.drawRectangle3D([  v[i*3+0], length, v[i*3+2],
//                                     v[i*3+3], length, v[i*3+5],
//                                     v[i*3+0], 0, v[i*3+2],
//                                     v[i*3+3], 0, v[i*3+5],],
//                                     rgba);
//         }
//     }
// }

