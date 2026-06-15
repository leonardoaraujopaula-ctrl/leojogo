const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');

let score = 0;
let timeLeft = 60;
let gameRunning = false;
let targets = [];
let timer;
let highscore = localStorage.getItem('highscore') || 0;
highscoreEl.textContent = highscore;

class Target {
  constructor() {
    this.radius = Math.random() * 25 + 25;
    this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
    this.y = this.radius + Math.random() * (canvas.height - this.radius * 2);
    this.life = 90;
    this.points = Math.floor(100 / this.radius * 10);
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2222';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0000';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }
}

function spawnTarget() {
  if (!gameRunning) return;
  targets.push(new Target());
  
  const spawnRate = Math.max(350, 1100 - score * 6);
  setTimeout(spawnTarget, spawnRate);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    t.draw();
    t.life--;

    if (t.life <= 0) {
      targets.splice(i, 1);
    }
  }
}

function gameLoop() {
  if (!gameRunning) return;
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    const dist = Math.hypot(t.x - clickX, t.y - clickY);

    if (dist < t.radius + 5) {
      score += t.points;
      scoreEl.textContent = score;

      // Efeito visual de acerto
      ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.fillRect(clickX - 15, clickY - 15, 30, 30);

      targets.splice(i, 1);
      return;
    }
  }

  // Penalidade por erro
  score = Math.max(0, score - 8);
  scoreEl.textContent = score;
});

function startGame() {
  score = 0;
  timeLeft = 60;
  targets = [];
  scoreEl.textContent = '0';
  timeEl.textContent = '60';
  gameRunning = true;
  
  startBtn.style.display = 'none';
  
  spawnTarget();
  gameLoop();

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(timer);
  
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('highscore', highscore);
    highscoreEl.textContent = highscore;
    alert(`🎉 NOVO RECORDE! Você fez ${score} pontos!`);
  } else {
    alert(`⏰ Tempo acabou! Sua pontuação: ${score}`);
  }
  
  startBtn.textContent = "Jogar Novamente";
  startBtn.style.display = 'inline-block';
}

startBtn.addEventListener('click', startGame);
