const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');

let score = 0;
let timeLeft = 30; // 秒

const target = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 25,
  vx: 150, // px/s
  vy: 100,
};

let last = null;
let running = true;

function rand(min, max) { return Math.random() * (max - min) + min; }

function update(dt) {
  // 移動
  target.x += target.vx * dt;
  target.y += target.vy * dt;
  // 壁で反射
  if (target.x - target.r < 0) { target.x = target.r; target.vx *= -1; }
  if (target.x + target.r > canvas.width) { target.x = canvas.width - target.r; target.vx *= -1; }
  if (target.y - target.r < 0) { target.y = target.r; target.vy *= -1; }
  if (target.y + target.r > canvas.height) { target.y = canvas.height - target.r; target.vy *= -1; }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // target
  ctx.beginPath();
  ctx.fillStyle = '#e74c3c';
  ctx.arc(target.x, target.y, target.r, 0, Math.PI*2);
  ctx.fill();
}

function loop(t) {
  if (!last) last = t;
  const dt = (t - last) / 1000;
  last = t;
  if (running) {
    update(dt);
    draw();
  }
  requestAnimationFrame(loop);
}

canvas.addEventListener('click', (e) => {
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const dx = x - target.x;
  const dy = y - target.y;
  if (dx*dx + dy*dy <= target.r*target.r) {
    score += 1;
    scoreEl.textContent = `Score: ${score}`;
    // ヒットしたら少し速くして位置をランダムにする
    const speedUp = 1.05;
    target.vx *= -speedUp;
    target.vy *= -speedUp;
    target.x = rand(target.r, canvas.width - target.r);
    target.y = rand(target.r, canvas.height - target.r);
  }
});

// タイマー
setInterval(() => {
  if (!running) return;
  timeLeft -= 1;
  timeEl.textContent = `Time: ${timeLeft}`;
  if (timeLeft <= 0) {
    running = false;
    alert(`Time's up! Score: ${score}`);
  }
}, 1000);

requestAnimationFrame(loop);
