const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score-display');
const startBtn = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over-screen');

// Sesler
const sounds = {// İnternet üzerinden hazır ses linkleri
const sounds = {
    // Neşeli Arka Plan Müziği
    bg: new Audio('https://pixabay.com/music/download/123987/'), 
    
    // Kuş Ötme / Zıplama Sesi
    chirp: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_502394c86b.mp3'),
    
    // Yumuşak Tıklama Sesi
    click: new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c330c6798e.mp3'),
    
    // Çarpma Sesi (Crash)
    crash: new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_13803153c3.mp3'),
    
    // Eğlenceli Kaybetme Sesi (Game Over)
    fail: new Audio('https://cdn.pixabay.com/audio/2022/03/24/audio_3232814867.mp3')
};

// Ses ayarları
sounds.bg.loop = true;
sounds.bg.volume = 0.3; // Müzik biraz daha kısık olsun};
sounds.bg.loop = true;

let playerY = window.innerHeight / 2;
let velocity = 0;
let gravity = 0.5;
let isGameActive = false;
let score = 0;
let pipes = [];
let frame = 0;

function startGame() {
    sounds.click.play();
    sounds.bg.play();
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
    const wing = document.createElement('div');
    wing.id = 'wing';
    wing.style.cssText = "position:absolute; left:-20px; top:20px; width:30px; height:20px; background:white; border-radius:50%; transition:0.1s; border:1px solid gray;";
    player.appendChild(wing);
}

function flap() {
    if(!isGameActive) return;
    velocity = -8;
    sounds.chirp.play();
    sounds.click.play();
    if(navigator.vibrate) navigator.vibrate(20);
    document.getElementById('wing').style.transform = "rotate(-40deg)";
    setTimeout(() => { document.getElementById('wing').style.transform = "rotate(20deg)"; }, 100);
}

function update() {
    if(!isGameActive) return;

    velocity += gravity;
    playerY += velocity;
    player.style.top = playerY + 'px';
    player.style.left = '20%';

    // Arka planı sağdan sola kaydır
    frame++;
    gameContainer.style.backgroundPositionX = -(frame * 2) + 'px';

    if(frame % 100 === 0) createPipe();

    pipes.forEach((p, i) => {
        p.x -= 4;
        p.top.style.left = p.x + 'px';
        p.bottom.style.left = p.x + 'px';

        // Çarpışma
        let pRect = player.getBoundingClientRect();
        let tRect = p.top.getBoundingClientRect();
        let bRect = p.bottom.getBoundingClientRect();

        if(pRect.right > tRect.left && pRect.left < tRect.right && (pRect.top < tRect.bottom || pRect.bottom > bRect.top) || playerY > window.innerHeight) {
            endGame();
        }

        if(!p.passed && p.x < pRect.left) {
            score++;
            scoreDisplay.innerText = score;
            p.passed = true;
        }
    });

    requestAnimationFrame(update);
}

function createPipe() {
    let gap = 60 * 3;
    let pos = Math.random() * (window.innerHeight - gap - 100) + 50;
    let t = document.createElement('div'); t.className = 'pipe'; t.style.height = pos + 'px'; t.style.top = 0;
    let b = document.createElement('div'); b.className = 'pipe'; b.style.height = (window.innerHeight - pos - gap) + 'px'; b.style.bottom = 0;
    let x = window.innerWidth;
    t.style.left = x + 'px'; b.style.left = x + 'px';
    gameContainer.appendChild(t); gameContainer.appendChild(b);
    pipes.push({top: t, bottom: b, x: x, passed: false});
}

function endGame() {
    isGameActive = false;
    sounds.bg.pause();
    sounds.crash.play();
    setTimeout(() => { sounds.fail.play(); }, 500);
    gameOverScreen.style.display = 'flex';
    document.getElementById('final-score').innerText = score;
}

startBtn.addEventListener('click', startGame);
window.addEventListener('touchstart', flap);
window.addEventListener('mousedown', flap);
