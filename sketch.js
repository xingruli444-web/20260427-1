let capture;
let handposeModel;
let hands = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  capture = createCapture(VIDEO, () => {
    console.log('攝影機已就緒');
  });
  capture.size(640, 480);
  capture.hide();

  handposeModel = ml5.handPose(capture, () => {
    console.log('handpose 模型已載入');
    // 在模型載入後開始偵測
    handposeModel.detectStart(capture, gotHands);
  });
}

function draw() {
  background('#e7c6ff');

  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(64);
  text('414730365李幸茹', width / 2, height / 2);

  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  if (capture && capture.loadedmetadata) {
    image(capture, x, y, imgW, imgH);
  } else {
    return;
  }

  if (hands.length > 0) {
    hands.forEach(hand => {
      let keypoints = hand.keypoints;
      if (!keypoints && hand.landmarks) {
        keypoints = hand.landmarks.map(pt => ({ x: pt[0], y: pt[1] }));
      }

      if (!keypoints) return;

      keypoints.forEach(keypoint => {
        let px = map(keypoint.x, 0, capture.width, x, x + imgW);
        let py = map(keypoint.y, 0, capture.height, y, y + imgH);
        fill(0, 255, 0);
        noStroke();
        circle(px, py, 10);
      });

      let fingerGroups = [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [17, 18, 19, 20]
      ];

      stroke(255, 255, 0);
      strokeWeight(2);
      noFill();

      fingerGroups.forEach(group => {
        for (let i = 0; i < group.length - 1; i++) {
          let p1 = keypoints[group[i]];
          let p2 = keypoints[group[i + 1]];
          if (!p1 || !p2) continue;

          let x1 = map(p1.x, 0, capture.width, x, x + imgW);
          let y1 = map(p1.y, 0, capture.height, y, y + imgH);
          let x2 = map(p2.x, 0, capture.width, x, x + imgW);
          let y2 = map(p2.y, 0, capture.height, y, y + imgH);
          line(x1, y1, x2, y2);
        }
      });
    });
  }
}

function gotHands(results) {
  hands = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
