const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const gameOver = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const highScoreEl = document.getElementById('highScore');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let timeLeft = 30;
let game = null;

// simple WebAudio beep
let hitSound = null;
function playBeep() {
  try {
    if (hitSound) {
      hitSound.currentTime = 0;
      hitSound.play().catch(() => {});
    }
  } catch (e) {
    // ignore
  }
}

class MainScene extends Phaser.Scene {
  constructor() {
    super('main');
  }
  preload() {
    /* noop */
  }
  create() {
    const w = 640,
      h = 480;
    this.target = this.add.circle(w / 2, h / 2, 25, 0xff4c3c);
    this.target.setInteractive(
      new Phaser.Geom.Circle(0, 0, 25),
      Phaser.Geom.Circle.Contains
    );
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (gameObject === this.target) {
        score += 1;
        scoreEl.textContent = `Score: ${score}`;
        playBeep();
        this.target.x = Phaser.Math.Between(25, w - 25);
        this.target.y = Phaser.Math.Between(25, h - 25);
      }
    });

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        timeLeft -= 1;
        timeEl.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
          // notify host page
          window.onGameOver(score);
          this.scene.pause();
        }
      },
    });
  }
  update() {
    /* noop */
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  parent: 'game-container',
  scene: [MainScene],
  backgroundColor: '#f8f8f8',
};

function createGame() {
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = `Score: ${score}`;
  timeEl.textContent = `Time: ${timeLeft}`;
  // create Phaser game instance
  game = new Phaser.Game(config);
}

window.onGameOver = function (finalScore) {
  finalScoreEl.textContent = `Score: ${finalScore}`;
  const key = 'simple-browser-game-highscore';
  const prev = parseInt(localStorage.getItem(key) || '0', 10);
  if (finalScore > prev) {
    localStorage.setItem(key, String(finalScore));
  }
  highScoreEl.textContent = `Highscore: ${localStorage.getItem(key) || '0'}`;
  gameOver.classList.remove('hidden');
};

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  // prepare sound on first user gesture
  if (!hitSound) {
    hitSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    hitSound.volume = 0.18;
    hitSound.preload = 'auto';
  }
  createGame();
});

restartBtn.addEventListener('click', () => {
  gameOver.classList.add('hidden');
  // destroy previous game instance if exists
  if (game) {
    try {
      game.destroy(true);
    } catch (e) {
      /* ignore destroy errors */
    }
    game = null;
  }
  createGame();
});

// populate highscore display initially
(function () {
  const key = 'simple-browser-game-highscore';
  document.getElementById('highScore').textContent = `Highscore: ${
    localStorage.getItem(key) || '0'
  }`;
})();
