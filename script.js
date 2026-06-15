const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const levelEl = document.getElementById('level');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');

let score = 0;
let timeLeft = 60;
let currentLevel = 1;
let gameRunning = false;
let targets = [];
let timer;
let highscore = localStorage.getItem('highscore') || 0;
highscoreEl.textContent = highscore;

class Target {
  constructor() {
    this.radius = Math.max(14, 42 - currentLevel * 2.2);
    this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
    this.y = this.radius + Math.random() * (canvas.height - this.radius * 2);
    
    // Velocidade maior e mais visível
    this.vx = (Math.random() * 5.5 + 3.5) * (Math.random() < 0.5 ? 1 : -1);
    this.vy = (Math.random() * 5.5 + 3.5) * (Math.random() < 0.5 ? 1 : -1);
    
    this.life = 140;
    this.points = Math.floor(130 / this.radius * 9);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Quicar nas paredes com mais força
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.vx *= -1.05;
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.vy *= -1.05;
    }
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2222';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff0000';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }
}

function getSpawnRate() {
  return Math.max(220, 1050 - currentLevel * 75);
}

function spawnTarget() {
  if (!gameRunning) return;
  
  targets.push(new Target());
  
  const maxTargets = 4 + Math.floor(currentLevel / 2);
  if (targets.length < maxTargets) {
    setTimeout(spawnTarget, getSpawnRate());
  }
}

function updateLevel() {
  const newLevel = Math.min(10, Math.floor(score / 140) + 1);
  if (newLevel > currentLevel) {
    currentLevel = newLevel;
    levelEl.textContent = currentLevel;
    
    const container = document.getElementById('game-container');
    container.style.borderColor = '#00ff00';
    setTimeout(() => { container.style.borderColor = '#ffd700'; }, 600);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    t.update();        // Movimento
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
  updateLevel();
  requestAnimationFrame(gameLoop);
}

// Clique para atirar
canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    const dist = Math.hypot(t.x - clickX, t.y - clickY);

    if (dist < t.radius + 10) {
      score += t.points;
      scoreEl.textContent = score;

      // Efeito de explosão
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(clickX, clickY, t.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      targets.splice(i, 1);
      return;
    }
  }

  score = Math.max(0, score - 10);
  scoreEl.textContent = score;
});

function startGame() {
  score = 0;
  timeLeft = 60;
  currentLevel = 1;
  targets = [];
  
  scoreEl.textContent = '0';
  timeEl.textContent = '60';
  levelEl.textContent = '1';
  gameRunning = true;
  
  startBtn.style.display = 'none';
  
  spawnTarget();
  gameLoop();

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(timer);
  
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('highscore', highscore);
    highscoreEl.textContent = highscore;
    alert(`🎉 NOVO RECORDE! Nível ${currentLevel} → ${score} pontos`);
  } else {
    alert(`⏰ Tempo acabou! Nível ${currentLevel} - Pontos: ${score}`);
  }
  
  startBtn.textContent = "Jogar Novamente";
  startBtn.style.display = 'inline-block';
}

startBtn.addEventListener('click', startGame);
