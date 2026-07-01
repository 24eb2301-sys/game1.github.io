let paddle;
let balls = [];
let blocks = [];
let items = [];

let reflector = false;
let reflectorTimer = 0;

let gameOver = false;
let gameClear = false;

const rows = 5;
const cols = 10;

function setup() {
  createCanvas(800, 600);

  paddle = {
    x: width / 2,
    y: height - 40,
    w: 120,
    h: 15,
    speed: 8
  };

  balls.push(new Ball(width / 2, height - 70));

  let margin = 40;
  let bw = (width - margin * 2) / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      blocks.push(new Block(
        margin + c * bw,
        50 + r * 30,
        bw - 5,
        20
      ));
    }
  }
}

function draw() {

  background(20);

  if (gameOver) {
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(40);
    text("GAME OVER", width / 2, height / 2);
    return;
  }

  if (gameClear) {
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(40);
    text("GAME CLEAR!", width / 2, height / 2);
    return;
  }

  updatePaddle();

  // reflector
  if (reflector) {
    reflectorTimer--;

    fill(100, 255, 255);
    rect(0, height - 5, width, 5);

    if (reflectorTimer <= 0) {
      reflector = false;
    }
  }

  // paddle
  fill(255);
  rectMode(CENTER);
  rect(paddle.x, paddle.y, paddle.w, paddle.h);

  // blocks
  let remain = 0;
  for (let b of blocks) {
    if (!b.dead) {
      b.show();
      remain++;
    }
  }

  if (remain == 0) gameClear = true;

  // balls
  for (let i = balls.length - 1; i >= 0; i--) {

    let ball = balls[i];

    ball.update();
    ball.show();

    ball.hitPaddle();

    if (reflector && ball.y + ball.r > height - 5) {
      ball.vy *= -1;
      ball.y = height - 5 - ball.r;
    }

    for (let block of blocks) {
      if (!block.dead && block.hit(ball)) {

        if (random() < 0.35) {

          let t = floor(random(4));

          items.push(new Item(
            block.x + block.w / 2,
            block.y + block.h / 2,
            t
          ));
        }
      }
    }

    if (ball.out()) {
      balls.splice(i, 1);
    }
  }

  if (balls.length == 0) {
    gameOver = true;
  }

  // items
  for (let i = items.length - 1; i >= 0; i--) {

    let item = items[i];

    item.update();
    item.show();

    if (item.catch()) {

      item.apply();

      items.splice(i, 1);

    } else if (item.y > height + 20) {

      items.splice(i, 1);

    }

  }

}

function updatePaddle() {

  if (keyIsDown(LEFT_ARROW)) {
    paddle.x -= paddle.speed;
  }

  if (keyIsDown(RIGHT_ARROW)) {
    paddle.x += paddle.speed;
  }

  paddle.x = constrain(
    paddle.x,
    paddle.w / 2,
    width - paddle.w / 2
  );

}

class Ball {

  constructor(x, y) {

    this.x = x;
    this.y = y;
    this.r = 8;

    let angle = random(-PI / 4, PI / 4);

    this.vx = 5 * sin(angle);
    this.vy = -5 * cos(angle);

  }

  update() {

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.r) {
      this.x = this.r;
      this.vx *= -1;
    }

    if (this.x > width - this.r) {
      this.x = width - this.r;
      this.vx *= -1;
    }

    if (this.y < this.r) {
      this.y = this.r;
      this.vy *= -1;
    }

  }

  hitPaddle() {

    if (
      this.y + this.r > paddle.y - paddle.h / 2 &&
      this.y - this.r < paddle.y + paddle.h / 2 &&
      this.x > paddle.x - paddle.w / 2 &&
      this.x < paddle.x + paddle.w / 2 &&
      this.vy > 0
    ) {

      let diff = (this.x - paddle.x) / (paddle.w / 2);

      let angle = diff * PI / 3;

      let speed = sqrt(this.vx * this.vx + this.vy * this.vy);

      this.vx = speed * sin(angle);
      this.vy = -speed * cos(angle);

    }

  }

  show() {

    fill(255, 200, 0);
    circle(this.x, this.y, this.r * 2);

  }

  out() {

    return this.y > height + 30;

  }

}

class Block {

  constructor(x, y, w, h) {

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.dead = false;

  }

  show() {

    fill(100, 180, 255);
    rectMode(CORNER);
    rect(this.x, this.y, this.w, this.h);

  }

  hit(ball) {

    if (
      ball.x + ball.r > this.x &&
      ball.x - ball.r < this.x + this.w &&
      ball.y + ball.r > this.y &&
      ball.y - ball.r < this.y + this.h
    ) {

      this.dead = true;
      ball.vy *= -1;
      return true;

    }

    return false;

  }

}

class Item {

  constructor(x, y, type) {

    this.x = x;
    this.y = y;
    this.type = type;

    this.size = 20;
    this.speed = 3;

  }

  update() {

    this.y += this.speed;

  }

  show() {

    if (this.type == 0)
      fill(255, 255, 0);

    if (this.type == 1)
      fill(0, 255, 0);

    if (this.type == 2)
      fill(255, 0, 0);

    if (this.type == 3)
      fill(0, 255, 255);

    circle(this.x, this.y, this.size);

  }

  catch() {

    return (
      this.y + this.size / 2 > paddle.y - paddle.h / 2 &&
      this.y - this.size / 2 < paddle.y + paddle.h / 2 &&
      this.x > paddle.x - paddle.w / 2 &&
      this.x < paddle.x + paddle.w / 2
    );

  }

  apply() {

    switch (this.type) {

      case 0:
        let b = balls[0];

        if (b) {

          let nb = new Ball(b.x, b.y);

          nb.vx = -b.vx;
          nb.vy = b.vy;

          balls.push(nb);

        }
        break;

      case 1:
        paddle.w = min(paddle.w + 40, 220);
        break;

      case 2:
        paddle.w = max(paddle.w - 30, 50);
        break;

      case 3:
        reflector = true;
        reflectorTimer = 600;
        break;

    }

  }

}
