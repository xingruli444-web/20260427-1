let capture;
let handPose;
let hands = [];

function preload() {
  // 載入 handPose 模型
  handPose = ml5.handPose();
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取影像，並加入回呼函式確保啟動成功
  // 使用物件形式定義 constraints，有助於提高某些瀏覽器的相容性
  capture = createCapture({
    video: true,
    audio: false
  }, function(stream) {
    console.log("攝影機已就緒");
    // 確定影像開啟後再開始偵測手部
    handPose.detectStart(capture, gotHands);
  });

  capture.size(640, 480);
  // 隱藏預設的影片元件，我們要在畫布上繪製它
  capture.hide();
}

function draw() {
  background('#e7c6ff');

  // 設定影像寬高為全螢幕的 50%
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  // 計算置中座標
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  // 檢查攝影機是否正常載入，若無影像則顯示提示文字
  if (!capture.loadedmetadata) {
    textAlign(CENTER, CENTER);
    fill(0);
    text("請確認攝影機已連線並允許存取權限...", width / 2, height / 2);
    return;
  }

  // 將擷取的影像畫在畫布中間
  image(capture, x, y, imgW, imgH);

  // 顯示除錯資訊：偵測到的手部數量
  fill(0);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text("偵測到手部數量: " + hands.length, 20, 20);

  // 繪製手部線條
  if (hands.length > 0) {
    hands.forEach(hand => {
      if (hand.keypoints) {
        // 1. 繪製關鍵點（點）
        hand.keypoints.forEach(keypoint => {
          let px = map(keypoint.x, 0, capture.width, x, x + imgW);
          let py = map(keypoint.y, 0, capture.height, y, y + imgH);
          fill(0, 255, 0); // 綠色點
          noStroke();
          circle(px, py, 10); // 畫出點
        });

        // 2. 繪製骨架（線）
        stroke(255, 255, 0); // 改用黃色線條，對比更強
        strokeWeight(2);
        noFill();

        // 根據需求定義關鍵點群組
        let fingerGroups = [
          [0, 1, 2, 3, 4],    // 大拇指
          [5, 6, 7, 8],       // 食指
          [9, 10, 11, 12],    // 中指
          [13, 14, 15, 16],   // 無名指
          [17, 18, 19, 20]    // 小指
        ];

        fingerGroups.forEach(group => {
          for (let j = 0; j < group.length - 1; j++) {
            let p1 = hand.keypoints[group[j]];
            let p2 = hand.keypoints[group[j + 1]];

            if (p1 && p2) {
              // 關鍵：將偵測到的座標映射到畫布中間那張縮放影像的位置
              let x1 = map(p1.x, 0, capture.width, x, x + imgW);
              let y1 = map(p1.y, 0, capture.height, y, y + imgH);
              let x2 = map(p2.x, 0, capture.width, x, x + imgW);
              let y2 = map(p2.y, 0, capture.height, y, y + imgH);

              line(x1, y1, x2, y2);
            }
          }
        });
      }
    });
  }
}

function gotHands(results) {
  hands = results;
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布尺寸
  resizeCanvas(windowWidth, windowHeight);
}