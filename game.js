// Sayfa yüklendiğinde çalışacak ana yapı
const startBtn = document.getElementById('start-button');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over-screen');

// Sesler (Hata vermemesi için korumalı)
const sounds = {
    bg: new Audio('https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3'),
    chirp: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_502394c86b.mp3'),
    click: new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c330c6798e.mp3'),
    crash: new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_13803153c3.mp3'),
    fail: new Audio('https://cdn.pixabay.com/audio/2022/03/24/audio_3232814867.mp3')
};
sounds.bg.loop = true;

let playerY = window.innerHeight / 2;
let velocity = 0;
let gravity = 0.45;
let isGameActive = false;
let score = 0;
let pipes = [];
let frame = 0;

// OYUNU BAŞLATMA FONKSİYONU
function startGame(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (isGameActive) return;

    // Sesleri zorla oynatmayı dene
    try {
        sounds.click.play();
        sounds.bg.play().catch(() => {});
    } catch(err) {}

    // Görsel geçiş
    startBtn.style.display = 'none';
    document.getElementById('game-title').style.display = 'none';
    player.style.display = 'block';
    scoreDisplay.style.display = 'flex';
    
    isGameActive = true;
    createWing();
    requestAnimationFrame(update);
}

// ZIPLAMA FONKSİYONU
function flap(e) {
    if (!isGameActive) return;
    if (e) e.preventDefault();
    
    velocity = -7.5;
    try {
        sounds.chirp.currentTime = 0;
        sounds.chirp.play();
    } catch(err) {}
    
    if (navigator.vibrate) navigator.vibrate(20);
    
    const w = document.getElementById('wing');
    if (w) {
        w.style.transform = "rotate(-40deg)";
        setTimeout(() => { w.style.transform = "rotate(20deg)"; }, 100);
    }
}

// OYUN DÖNGÜSÜ
function update() {
    if (!isGameActive) return;

    velocity += gravity;
    playerY += velocity;
    player.style.top = playerY + 'px';
    player.style.left = '20%';

    frame++;
    document.getElementById('game-container').style.backgroundPositionX = -(frame * 2) + 'px';

    if (frame % 110 === 0) createPipe();

    pipes.forEach((p, i) => {
        p.x -= 3.5;
        p.top.style.left = p.x + 'px';
        p.bottom.style.left = p.x + 'px';

        let pRect = player.getBoundingClientRect();
        let tRect = p.top.getBoundingClientRect();
        let bRect = p.bottom.getBoundingClientRect();

        if (pRect.right > tRect.left + 10 && pRect.left < tRect.right - 10 && (pRect.top < tRect.bottom - 5 || pRect.bottom > bRect.top + 5) || playerY > window.innerHeight || playerY < -50) {
            endGame();
        }

        if (!p.passed && p.x < pRect.left) {
            score++;
            scoreDisplay.innerText = score;
            p.passed = true;
        }
        if (p.x < -100) {
            p.top.remove(); p.bottom.remove();
            pipes.splice(i, 1);
        }
    });
    requestAnimationFrame(update);
}

function createPipe() {
    let gap = 180;
    let pos = Math.random() * (window.innerHeight - gap - 150) + 75;
    let t = document.createElement('div'); t.className = 'pipe'; t.style.height = pos + 'px'; t.style.top = 0;
    let b = document.createElement('div'); b.className = 'pipe'; b.style.height = (window.innerHeight - pos - gap) + 'px'; b.style.bottom = 0;
    let x = window.innerWidth;
    t.style.left = x + 'px'; b.style.left = x + 'px';
    document.getElementById('game-container').appendChild(t); 
    document.getElementById('game-container').appendChild(b);
    pipes.push({top: t, bottom: b, x: x, passed: false});
}

function createWing() {
    if (document.getElementById('wing')) return;
    const wing = document.createElement('div');
    wing.id = 'wing';
    wing.style.cssText = "position:absolute; left:-15px; top:20px; width:25px; height:15px; background:white; border-radius:50%; transition:0.1s; border:1px solid gray;";
    player.appendChild(wing);
}

function endGame() {
    isGameActive = false;
    try {
        sounds.bg.pause();
        sounds.crash.play();
        setTimeout(() => { sounds.fail.play(); }, 400);
    } catch(err) {}
    gameOverScreen.style.display = 'flex';
    document.getElementById('final-score').innerText = score;
}

// OLAY DİNLEYİCİLERİ - EN GENİŞ KAPSAMDA
// Butona hem dokunma hem tıklama
startBtn.onclick = startGame;
startBtn.ontouchstart = startGame;

// Tüm ekrana dokunma ve tıklama (Zıplama için)
window.onmousedown = flap;
window.ontouchstart = flap;
