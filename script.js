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
let particles = [];
let timer;
let highscore = localStorage.getItem('highscore') || 0;
highscoreEl.textContent = highscore;

class Target {
  constructor() {
    this.radius = Math.max(16, 40 - currentLevel * 2);
    this.resetPosition();
    this.vx = (Math.random() * 5 + 3.8) * (Math.random() < 0.5 ? 1 : -1);
    this.vy = (Math.random() * 5 + 3.8) * (Math.random() < 0.5 ? 1 : -1);
    this.life = 135;
    this.points = Math.floor(140 / this.radius * 9);
  }

  resetPosition() {
    this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
    this.y = this.radius + Math.random() * (canvas.height - this.radius * 2);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width ||
        this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.resetPosition();
      this.vx = (Math.random() * 5 + 3.8) * (Math.random() < 0.5 ? 1 : -1);
      this.vy = (Math.random() * 5 + 3.8) * (Math.random() < 0.5 ? 1 : -1);
    }
  }

  draw() {
    // Círculos concêntricos (bullseye)
    ctx.save();
    ctx.shadowBlur = 35;
    ctx.shadowColor = '#ff0000';

    // Círculo externo
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2222';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.stroke();

    // Círculo médio
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8800';
    ctx.fill();
    ctx.stroke();

    // Centro
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
    ctx.restore();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 5;
    this.vx = Math.random() * 10 - 5;
    this.vy = Math.random() * 10 - 5;
    this.life = 25;
    this.color = ['#ffff00', '#ff8800', '#ff2222'][Math.floor(Math.random()*3)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.vx *= 0.96;
    this.vy *= 0.96;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.life / 25;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

function spawnTarget() {
  if (!gameRunning) return;
  targets.push(new Target());
  
  const maxTargets = 4 + Math.floor(currentLevel / 2);
  if (targets.length < maxTargets) {
    setTimeout(spawnTarget, Math.max(200, 1000 - currentLevel * 75));
  }
}

function updateLevel() {
  const newLevel = Math.min(10, Math.floor(score / 140) + 1);
  if (newLevel > currentLevel) {
    currentLevel = newLevel;
    levelEl.textContent = currentLevel;
    
    const container = document.getElementById('game-container');
    container.style.borderColor = '#00ff00';
    setTimeout(() => container.style.borderColor = '#ffd700', 800);
  }
}

function drawBackground() {
  ctx.fillStyle = '#0a3d0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Linhas do chão (estilo estande de tiro)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 3;
  for (let i = 50; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

function draw() {
  drawBackground();

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    t.update();
    t.draw();
    t.life--;
    if (t.life <= 0) targets.splice(i, 1);
  }

  // Partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function gameLoop() {
  if (!gameRunning) return;
  draw();
  updateLevel();
  requestAnimationFrame(gameLoop);
}

// Clique
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

      // Partículas de explosão
      for (let j = 0; j < 18; j++) {
        particles.push(new Particle(clickX, clickY));
      }

      targets.splice(i, 1);
      return;
    }
  }

  score = Math.max(0, score - 10);
  scoreEl.textContent = score;
});

function startGame() {
  score = 0; timeLeft = 60; currentLevel = 1; targets = []; particles = [];
  
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
