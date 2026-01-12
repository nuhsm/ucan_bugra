const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score-display');
const startBtn = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over-screen');

// İnternet üzerinden Sesler - Hata vermemesi için korumalı
const sounds = {
    bg: new Audio('https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3'),
    chirp: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_502394c86b.mp3'),
    click: new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c330c6798e.mp3'),
    crash: new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_13803153c3.mp3'),
    fail: new Audio('https://cdn.pixabay.com/audio/2022/03/24/audio_3232814867.mp3')
};
sounds.bg.loop = true;
sounds.bg.volume = 0.3;

let playerY = window.innerHeight / 2;
let velocity = 0;
let gravity = 0.45;
let isGameActive = false;
let score = 0;
let pipes = [];
let frame = 0;

function startGame() {
    if(isGameActive) return; // Zaten başladıysa tekrar başlama

    // Sesleri başlat (Safari için kullanıcı etkileşimi şart)
    try {
        sounds.click.play();
        sounds.bg.play().catch(() => console.log("Müzik için dokunma bekleniyor"));
    } catch(e) {}

    // İçe çekilme animasyonu
    startBtn.style.transition = "0.5s";
    document.getElementById('game-title').style.transition = "0.5s";
    startBtn.style.transform = "scale(0)";
    document.getElementById('game-title').style.transform = "scale(0)";
    
    setTimeout(() => {
        startBtn.style.display = 'none';
        player.style.display = 'block';
        scoreDisplay.style.display = 'flex';
        isGameActive = true;
        createWing();
        requestAnimationFrame(update);
    }, 500);
}

function createWing() {
    if(document.getElementById('wing')) return;
    const wing = document.createElement('div');
    wing.id = 'wing';
    wing.style.cssText = "position:absolute; left:-15px; top:20px; width:25px; height:15px; background:white; border-radius:50%; transition:0.1s; border:1px solid gray;";
    player.appendChild(wing);
}

function flap(e) {
    if(e) e.preventDefault(); // Sayfanın kaymasını önle
    if(!isGameActive) return;
    
    velocity = -7.5;
    try {
        sounds.chirp.currentTime = 0;
        sounds.chirp.play();
    } catch(e) {}
    
    if(navigator.vibrate) navigator.vibrate(20);
    
    const w = document.getElementById('wing');
    if(w) {
        w.style.transform = "rotate(-40deg)";
        setTimeout(() => { w.style.transform = "rotate(20deg)"; }, 100);
    }
}

function update() {
    if(!isGameActive) return;

    velocity += gravity;
    playerY += velocity;
    player.style.top = playerY + 'px';
    player.style.left = '20%';

    frame++;
    gameContainer.style.backgroundPositionX = -(frame * 2) + 'px';

    if(frame % 110 === 0) createPipe();

    pipes.forEach((p, i) => {
        p.x -= 3.5;
        p.top.style.left = p.x + 'px';
        p.bottom.style.left = p.x + 'px';

        let pRect = player.getBoundingClientRect();
        let tRect = p.top.getBoundingClientRect();
        let bRect = p.bottom.getBoundingClientRect();

        // Daha hassas çarpışma (Kutu daraltma)
        if(pRect.right > tRect.left + 10 && pRect.left < tRect.right - 10 && (pRect.top < tRect.bottom - 5 || pRect.bottom > bRect.top + 5) || playerY > window.innerHeight || playerY < -50) {
            endGame();
        }

        if(!p.passed && p.x < pRect.left) {
            score++;
            scoreDisplay.innerText = score;
            p.passed = true;
        }
        if(p.x < -100) {
            p.top.remove(); p.bottom.remove();
            pipes.splice(i, 1);
        }
    });
    requestAnimationFrame(update);
}

function createPipe() {
    let gap = 180; // Geçiş boşluğu (karakterin 3 katı civarı)
    let pos = Math.random() * (window.innerHeight - gap - 150) + 75;
    let t = document.createElement('div'); t.className = 'pipe'; t.style.height = pos + 'px'; t.style.top = 0;
    let b = document.createElement('div'); b.className = 'pipe'; b.style.height = (window.innerHeight - pos - gap) + 'px'; b.style.bottom = 0;
    let x = window.innerWidth;
    t.style.left = x + 'px'; b.style.left = x + 'px';
    gameContainer.appendChild(t); gameContainer.appendChild(b);
    pipes.push({top: t, bottom: b, x: x, passed: false});
}

function endGame() {
    if(!isGameActive) return;
    isGameActive = false;
    try {
        sounds.bg.pause();
        sounds.crash.play();
        setTimeout(() => { sounds.fail.play(); }, 400);
    } catch(e) {}
    gameOverScreen.style.display = 'flex';
    document.getElementById('final-score').innerText = score;
}

// Hem dokunma hem tıklama dinleyicileri
startBtn.addEventListener('click', startGame);
startBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); });

window.addEventListener('touchstart', flap, {passive: false});
window.addEventListener('mousedown', flap);
