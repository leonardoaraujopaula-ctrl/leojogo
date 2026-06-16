const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');

let score = 0;
let lives = 3;
let gameRunning = false;
let player, bullets = [], enemies = [], particles = [];
let keys = {};
let highscore = localStorage.getItem('shooterHighscore') || 0;
highscoreEl.textContent = highscore;

class Player {
  constructor() {
    this.width = 50;
    this.height = 40;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - 60;
    this.speed = 7;
  }

  draw() {
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#00ffaa';
    ctx.fillRect(this.x + 10, this.y - 15, this.width - 20, 25); // cabine
  }

  update() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.x -= this.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) this.x += this.speed;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 6;
    this.height = 18;
    this.speed = 12;
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor() {
    this.width = 45;
    this.height = 35;
    this.x = Math.random() * (canvas.width - this.width);
    this.y = -50;
    this.speed = 2 + Math.random() * 2;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    ctx.fillStyle = '#ff0088';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#ff88cc';
    ctx.fillRect(this.x + 10, this.y + 8, this.width - 20, 15);
  }
}

function createExplosion(x, y) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: Math.random() * 8 - 4,
      vy: Math.random() * 8 - 4,
      life: 25,
      color: '#ff8800'
    });
  }
}

function draw() {
  ctx.fillStyle = '#000022';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Estrelas de fundo (simples)
  ctx.fillStyle = 'white';
  for (let i = 0; i < 80; i++) {
    ctx.fillRect((i * 37) % canvas.width, (i * 23) % canvas.height, 2, 2);
  }

  player.update();
  player.draw();

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.update();
    b.draw();
    if (b.y < 0) bullets.splice(i, 1);
  }

  // Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.update();
    e.draw();

    // Colisão com jogador
    if (e.y + e.height > player.y && 
        e.x < player.x + player.width && 
        e.x + e.width > player.x) {
      lives--;
      livesEl.textContent = lives;
      createExplosion(e.x + e.width/2, e.y + e.height/2);
      enemies.splice(i, 1);
      if (lives <= 0) endGame();
      continue;
    }

    // Colisão com tiros
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (b.x < e.x + e.width && b.x + b.width > e.x &&
          b.y < e.y + e.height && b.y + b.height > e.y) {
        score += 20;
        scoreEl.textContent = score;
        createExplosion(e.x + e.width/2, e.y + e.height/2);
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        break;
      }
    }

    if (e.y > canvas.height) enemies.splice(i, 1);
  }

  // Partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    ctx.globalAlpha = p.life / 25;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 6, 6);
    if (p.life <= 0) particles.splice(i, 1);
  }
  ctx.globalAlpha = 1;
}

function gameLoop() {
  if (!gameRunning) return;
  draw();
  requestAnimationFrame(gameLoop);
}

function spawnEnemy() {
  if (!gameRunning) return;
  enemies.push(new Enemy());
  setTimeout(spawnEnemy, Math.max(400, 1200 - score / 3));
}

// Controles
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

canvas.addEventListener('click', () => {
  if (gameRunning) bullets.push(new Bullet(player.x + player.width/2 - 3, player.y));
});

document.addEventListener('keydown', e => {
  if (e.key === ' ' && gameRunning) {
    bullets.push(new Bullet(player.x + player.width/2 - 3, player.y));
    e.preventDefault();
  }
});

function startGame() {
  score = 0;
  lives = 3;
  bullets = [];
  enemies = [];
  particles = [];
  
  scoreEl.textContent = '0';
  livesEl.textContent = '3';
  gameRunning = true;
  
  player = new Player();
  
  startBtn.style.display = 'none';
  
  spawnEnemy();
  gameLoop();
}

function endGame() {
  gameRunning = false;
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('shooterHighscore', highscore);
    highscoreEl.textContent = highscore;
  }
  alert(`Game Over! Pontuação: ${score}`);
  startBtn.textContent = "Jogar Novamente";
  startBtn.style.display = 'inline-block';
}

startBtn.addEventListener('click', startGame);
