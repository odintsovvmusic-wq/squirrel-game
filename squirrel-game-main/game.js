const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const bestSpan = document.getElementById('bestScore');
const nutBalanceSpan = document.getElementById('nutBalance');

// Размеры
const WIDTH = 350;
const HEIGHT = 500;

// Скины белок
const SKINS = [
    { id: 'classic', name: 'Классическая', emoji: '🐿️', price: 0, color1: '#C5782B', color2: '#E8C39E', bought: true },
    { id: 'red', name: 'Рыжая', emoji: '🦊', price: 50, color1: '#D4451E', color2: '#F5A97F', bought: false },
    { id: 'dark', name: 'Тёмная', emoji: '🐿️', price: 100, color1: '#4A3728', color2: '#8B7355', bought: false },
    { id: 'golden', name: 'Золотая', emoji: '⭐', price: 200, color1: '#DAA520', color2: '#FFD700', bought: false },
    { id: 'white', name: 'Белая', emoji: '🤍', price: 150, color1: '#E8E8E8', color2: '#FFFFFF', bought: false },
    { id: 'pink', name: 'Розовая', emoji: '🌸', price: 120, color1: '#E87D8C', color2: '#F5B7C5', bought: false }
];

// Загрузка сохранённых данных
let nutBalance = parseInt(localStorage.getItem('squirrelNuts')) || 0;
let currentSkin = localStorage.getItem('squirrelSkin') || 'classic';
let skins = JSON.parse(localStorage.getItem('squirrelSkins')) || SKINS;

// Обновляем купленные скины из сохранения
for (let i = 0; i < skins.length; i++) {
    if (skins[i].id === currentSkin) {
        skins[i].bought = true;
    }
}

nutBalanceSpan.textContent = nutBalance;

// Игровые переменные
let score = 0;
let bestScore = localStorage.getItem('bestSquirrelScore') || 0;
bestSpan.textContent = bestScore;

let gameRunning = true;
let frame = 0;

// Текущий скин
function getCurrentSkin() {
    return skins.find(s => s.id === currentSkin) || skins[0];
}

// Белка
let squirrel = {
    x: WIDTH/2 - 15,
    y: HEIGHT - 100,
    width: 28,
    height: 32,
    vy: 0,
    gravity: 0.3,
    jumpPower: -11,
    onGround: true
};

// Платформы
let platforms = [];
let nuts = [];

// Управление
let targetX = squirrel.x;

// Магазин
const shopBtn = document.getElementById('shopBtn');
const shopPanel = document.getElementById('shopPanel');
const skinsList = document.getElementById('skinsList');

// Рисуем белку с текущим скином
function drawSquirrel(x, y) {
    const skin = getCurrentSkin();
    const mainColor = skin.color1;
    const bellyColor = skin.color2;
    
    // Тело
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 14, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Животик
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 18, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Голова
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(x + 20, y + 6, 11, 0, Math.PI * 2);
    ctx.fill();
    
    // Уши
    ctx.fillStyle = '#B5651D';
    ctx.beginPath();
    ctx.moveTo(x + 13, y + 0);
    ctx.lineTo(x + 9, y - 6);
    ctx.lineTo(x + 18, y - 1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 27, y + 0);
    ctx.lineTo(x + 32, y - 6);
    ctx.lineTo(x + 25, y - 1);
    ctx.fill();
    
    // Глаза
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + 24, y + 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 16, y + 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.arc(x + 25, y + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 17, y + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Блик
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + 26, y + 3, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 18, y + 3, 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Носик
    ctx.fillStyle = '#5C3317';
    ctx.beginPath();
    ctx.arc(x + 30, y + 7, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Хвост
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 18);
    ctx.quadraticCurveTo(x - 12, y + 5, x + 2, y + 8);
    ctx.fill();
    
    // Щёчки
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.arc(x + 28, y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 12, y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Рисуем платформу
function drawPlatform(x, y, width) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 2, width, 8);
    ctx.fillStyle = '#7CB342';
    ctx.fillRect(x, y, width, 8);
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(x, y - 2, width, 4);
    ctx.fillStyle = '#AED581';
    ctx.fillRect(x + 3, y - 1, width - 6, 2);
}

// Рисуем орех
function drawNut(x, y) {
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 4, 4, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(x + 3, y + 2, 2, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(x + 7, y + 3, 1.5, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// Сохранение прогресса
function saveProgress() {
    localStorage.setItem('squirrelNuts', nutBalance);
    localStorage.setItem('squirrelSkin', currentSkin);
    localStorage.setItem('squirrelSkins', JSON.stringify(skins));
    localStorage.setItem('bestSquirrelScore', bestScore);
}

// Добавление орехов (валюта)
function addNuts(amount) {
    nutBalance += amount;
    nutBalanceSpan.textContent = nutBalance;
    saveProgress();
}

// Покупка скина
function buySkin(skinId) {
    const skin = skins.find(s => s.id === skinId);
    if (!skin || skin.bought) return false;
    if (nutBalance >= skin.price) {
        nutBalance -= skin.price;
        skin.bought = true;
        saveProgress();
        nutBalanceSpan.textContent = nutBalance;
        renderShop();
        return true;
    }
    return false;
}

// Выбор скина
function selectSkin(skinId) {
    const skin = skins.find(s => s.id === skinId);
    if (skin && skin.bought) {
        currentSkin = skinId;
        saveProgress();
        renderShop();
    }
}

// Магазин
function renderShop() {
    skinsList.innerHTML = '';
    for (let skin of skins) {
        const div = document.createElement('div');
        div.className = 'skin-item';
        if (currentSkin === skin.id) div.classList.add('selected');
        if (!skin.bought) div.classList.add('disabled');
        
        div.innerHTML = `
            <div class="skin-emoji">${skin.emoji}</div>
            <div class="skin-name">${skin.name}</div>
            <div class="skin-price">${skin.bought ? '✓' : '🌰 ' + skin.price}</div>
        `;
        
        div.onclick = () => {
            if (skin.bought) {
                selectSkin(skin.id);
            } else {
                if (buySkin(skin.id)) {
                    selectSkin(skin.id);
                } else {
                    alert(`Не хватает орехов! Нужно ${skin.price} 🌰`);
                }
            }
        };
        
        skinsList.appendChild(div);
    }
}

// Инициализация платформ
function initPlatforms() {
    platforms = [];
    let nutsArray = [];
    
    platforms.push({ x: WIDTH/2 - 40, y: HEIGHT - 40, width: 80 });
    
    let y = HEIGHT - 100;
    for (let i = 0; i < 12; i++) {
        let x = Math.random() * (WIDTH - 70);
        if (x < 10) x = 10;
        if (x > WIDTH - 80) x = WIDTH - 80;
        
        platforms.push({ x: x, y: y, width: 55 + Math.random() * 25 });
        
        if (Math.random() > 0.6) {
            nutsArray.push({
                x: x + 20 + Math.random() * 20,
                y: y - 12,
                width: 10,
                height: 10,
                collected: false
            });
        }
        y -= 35 + Math.random() * 20;
    }
    return nutsArray;
}

// Сброс игры
function resetGame() {
    gameRunning = true;
    score = 0;
    scoreSpan.textContent = score;
    squirrel.x = WIDTH/2 - 15;
    squirrel.y = HEIGHT - 100;
    squirrel.vy = 0;
    squirrel.onGround = true;
    targetX = squirrel.x;
    
    nuts = initPlatforms();
}

// Обновление игры
function update() {
    if (!gameRunning) return;
    
    if (targetX < squirrel.x - 5) {
        squirrel.x -= 1.2;
    } else if (targetX > squirrel.x + 5) {
        squirrel.x += 1.2;
    }
    squirrel.x = Math.max(5, Math.min(WIDTH - squirrel.width - 5, squirrel.x));
    
    squirrel.vy += squirrel.gravity;
    squirrel.y += squirrel.vy;
    squirrel.onGround = false;
    
    for (let platform of platforms) {
        if (squirrel.vy > 0 && 
            squirrel.y + squirrel.height > platform.y &&
            squirrel.y + squirrel.height < platform.y + 12 &&
            squirrel.x + squirrel.width - 5 > platform.x &&
            squirrel.x + 5 < platform.x + platform.width) {
            squirrel.y = platform.y - squirrel.height;
            squirrel.vy = squirrel.jumpPower;
            squirrel.onGround = true;
            break;
        }
    }
    
    for (let nut of nuts) {
        if (!nut.collected &&
            squirrel.x + squirrel.width > nut.x &&
            squirrel.x < nut.x + nut.width &&
            squirrel.y + squirrel.height > nut.y &&
            squirrel.y < nut.y + nut.height) {
            nut.collected = true;
            score++;
            scoreSpan.textContent = score;
            
            // Добавляем орех в валюту!
            addNuts(1);
            
            if (score > bestScore) {
                bestScore = score;
                bestSpan.textContent = bestScore;
                saveProgress();
            }
        }
    }
    
    if (squirrel.y < HEIGHT * 0.4) {
        let diff = HEIGHT * 0.4 - squirrel.y;
        squirrel.y += diff;
        
        for (let platform of platforms) {
            platform.y += diff;
        }
        for (let nut of nuts) {
            nut.y += diff;
        }
        
        if (diff > 0) {
            score += Math.floor(diff / 5);
            scoreSpan.textContent = score;
            if (score > bestScore) {
                bestScore = score;
                bestSpan.textContent = bestScore;
                saveProgress();
            }
        }
    }
    
    let highestPlatform = Math.min(...platforms.map(p => p.y));
    while (highestPlatform > 30) {
        let newY = highestPlatform - 35 - Math.random() * 20;
        let newX = Math.random() * (WIDTH - 70);
        if (newX < 10) newX = 10;
        if (newX > WIDTH - 80) newX = WIDTH - 80;
        
        platforms.push({ x: newX, y: newY, width: 55 + Math.random() * 25 });
        
        if (Math.random() > 0.7) {
            nuts.push({
                x: newX + 20 + Math.random() * 20,
                y: newY - 12,
                width: 10,
                height: 10,
                collected: false
            });
        }
        highestPlatform = newY;
    }
    
    platforms = platforms.filter(p => p.y < HEIGHT + 60);
    nuts = nuts.filter(n => n.y < HEIGHT + 60 && !n.collected);
    
    if (squirrel.y > HEIGHT + 40) {
        gameRunning = false;
    }
}

// Отрисовка
function draw() {
    let gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B8E4F0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.ellipse(50 + frame % 300, 50, 30, 25, 0, 0, Math.PI * 2);
    ctx.ellipse(75 + frame % 300, 45, 35, 28, 0, 0, Math.PI * 2);
    ctx.ellipse(30 + frame % 300, 55, 25, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(280 - frame % 250, 90, 28, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(305 - frame % 250, 85, 32, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    
    for (let platform of platforms) {
        drawPlatform(platform.x, platform.y, platform.width);
    }
    
    for (let nut of nuts) {
        if (!nut.collected) {
            drawNut(nut.x, nut.y);
        }
    }
    
    drawSquirrel(squirrel.x, squirrel.y);
    
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', WIDTH/2, HEIGHT/2 - 50);
        ctx.font = 'bold 20px Arial';
        ctx.fillText('🌰 ' + score, WIDTH/2, HEIGHT/2);
        ctx.font = '14px Arial';
        ctx.fillText('Кликни, чтобы начать', WIDTH/2, HEIGHT/2 + 50);
    }
    
    frame++;
}

function handleMove(clientX) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    let canvasX = (clientX - rect.left) * scaleX;
    targetX = canvasX;
}

canvas.addEventListener('mousemove', (e) => {
    if (gameRunning) handleMove(e.clientX);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameRunning) handleMove(e.touches[0].clientX);
});
canvas.addEventListener('click', () => {
    if (!gameRunning) resetGame();
});

shopBtn.onclick = () => {
    shopPanel.classList.toggle('show');
    renderShop();
};

function gameLoop() {
    if (gameRunning) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

resetGame();
renderShop();
gameLoop();