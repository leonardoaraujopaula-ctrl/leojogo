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
    this.radius = Math.max(15, 45 - currentLevel * 2); // fica menor com o nível
    this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
    this.y = this.radius + Math.random() * (canvas.height - this.radius * 2);
    
    this.vx = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1); // velocidade
    this.vy = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1);
    
    this.life = 120; // tempo de vida na tela
    this.points = Math.floor(120 / this.radius * 8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Quicar nas paredes
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.vx *= -1;
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.vy *= -1;
    }
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2222';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff0000';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }
}

function getSpawnRate() {
  return Math.max(250, 1200 - currentLevel * 70);
}

function spawnTarget() {
  if (!gameRunning) return;
  
  targets.push(new Target());
  
  // Limite máximo de alvos na tela
  const maxTargets = 3 + Math.floor(currentLevel / 2);
  if (targets.length < maxTargets) {
    setTimeout(spawnTarget, getSpawnRate());
  }
}

function updateLevel() {
  const newLevel = Math.min(10, Math.floor(score / 150) + 1);
  
  if (newLevel > currentLevel) {
    currentLevel = newLevel;
    levelEl.textContent = currentLevel;
    
    // Feedback visual de level up
    const container = document.getElementById('game-container');
    container.style.borderColor = '#00ff00';
    setTimeout(() => container.style.borderColor = '#ffd700', 800);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    t.update();
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

canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    const dist = Math.hypot(t.x - clickX, t.y - clickY);

    if (dist < t.radius + 8) {
      score += t.points;
      scoreEl.textContent = score;

      // Efeito de acerto
      ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
      ctx.fillRect(clickX - 20, clickY - 20, 40, 40);

      targets.splice(i, 1);
      return;
    }
  }

  // Erro
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
    alert(`🎉 NOVO RECORDE! Nível ${currentLevel} - ${score} pontos!`);
  } else {
    alert(`⏰ Tempo acabou! Nível ${currentLevel} - Pontuação: ${score}`);
  }
  
  startBtn.textContent = "Jogar Novamente";
  startBtn.style.display = 'inline-block';
}

startBtn.addEventListener('click', startGame);
