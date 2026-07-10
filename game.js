/**
 * BUBBLE MATH TRIVIA
 * Core Game Script - Supports Addition, Subtraction, Multiplication, Division
 */

// ==========================================================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================================================
class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
        
        // Try to load muted state from localStorage
        const savedMute = localStorage.getItem('bubble_math_muted');
        if (savedMute !== null) {
            this.muted = savedMute === 'true';
        }
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('bubble_math_muted', this.muted);
        return this.muted;
    }

    playPop() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.09);
    }

    playCorrect() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.22);
    }

    playIncorrect() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.25);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.26);
    }

    playLevelUp() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            
            gain.gain.setValueAtTime(0.1, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.15);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.16);
        });
    }

    playGameOver() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const notes = [392.00, 311.13, 261.63]; // G4, Eb4, C4
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            osc.frequency.linearRampToValueAtTime(freq - 30, now + idx * 0.12 + 0.4);
            
            gain.gain.setValueAtTime(0.15, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.5);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.6);
        });
    }
}

const sfx = new SoundFX();

// ==========================================================================
// BACKGROUND DECORATIONS (Floating Symbols)
// ==========================================================================
function initBackgroundSymbols() {
    const container = document.getElementById('bg-decorations');
    const symbols = ['+', '−', '×', '÷', '=', '?', '∑', 'π', '%'];
    const count = 15;
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'decor-symbol';
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        symbol.style.left = `${Math.random() * 100}%`;
        symbol.style.animationDelay = `${Math.random() * -25}s`;
        symbol.style.animationDuration = `${20 + Math.random() * 20}s`;
        symbol.style.fontSize = `${1.2 + Math.random() * 2}rem`;
        
        container.appendChild(symbol);
    }
}

// ==========================================================================
// BUBBLE BURST PARTICLE EFFECT (HTML5 Canvas)
// ==========================================================================
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    spawn(x, y, color) {
        const count = 12 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                radius: 3 + Math.random() * 6,
                color: color,
                alpha: 1.0,
                decay: 0.015 + Math.random() * 0.02
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.alpha -= p.decay;
            p.radius = Math.max(0, p.radius - 0.05);

            if (p.alpha <= 0 || p.radius <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
}

// ==========================================================================
// GAME STATE MANAGEMENT & DIFFICULTY CONFIGS
// ==========================================================================
const GAME_CONFIG = {
    addition: {
        themeColor: '#a855f7',
        levels: {
            1: { min: 1, max: 9, speed: 0.7, spawnRate: 3800, maxActive: 2, desc: "1-Digit Addition" },
            2: { min: 1, max: 9, speed: 1.0, spawnRate: 3200, maxActive: 3, desc: "Fast 1-Digit" },
            3: { min1: 10, max1: 49, min2: 1, max2: 9, speed: 1.2, spawnRate: 2900, maxActive: 3, desc: "2-Digit + 1-Digit" },
            4: { min: 10, max: 99, speed: 1.5, spawnRate: 2600, maxActive: 3, desc: "2-Digit Addition" },
            5: { min1: 100, max1: 499, min2: 10, max2: 99, speed: 1.9, spawnRate: 2300, maxActive: 4, desc: "3-Digit + 2-Digit" }
        }
    },
    subtraction: {
        themeColor: '#ff9f1c',
        levels: {
            1: { min: 1, max: 9, speed: 0.7, spawnRate: 3800, maxActive: 2, desc: "1-Digit Subtraction" },
            2: { min: 1, max: 9, speed: 1.0, spawnRate: 3200, maxActive: 3, desc: "Fast 1-Digit" },
            3: { min1: 10, max1: 49, min2: 1, max2: 9, speed: 1.2, spawnRate: 2900, maxActive: 3, desc: "2-Digit − 1-Digit" },
            4: { min: 10, max: 99, speed: 1.5, spawnRate: 2600, maxActive: 3, desc: "2-Digit Subtraction" },
            5: { min1: 100, max1: 499, min2: 10, max2: 99, speed: 1.9, spawnRate: 2300, maxActive: 4, desc: "3-Digit − 2-Digit" }
        }
    },
    multiplication: {
        themeColor: '#4cc9f0',
        levels: {
            1: { min: 2, max: 9, speed: 0.6, spawnRate: 4600, maxActive: 2, desc: "1-Digit Multiplication" },
            2: { min1: 10, max1: 12, min2: 2, max2: 9, speed: 0.9, spawnRate: 4200, maxActive: 2, desc: "Easy Multipliers" },
            3: { min1: 10, max1: 15, min2: 2, max2: 9, speed: 1.1, spawnRate: 3800, maxActive: 2, desc: "Up to 15 × 9" },
            4: { min1: 10, max1: 15, min2: 10, max2: 12, speed: 1.3, spawnRate: 3500, maxActive: 3, desc: "2-Digit × 2-Digit (Max 3 Bubbles)" },
            5: { min1: 10, max1: 25, min2: 2, max2: 15, speed: 1.6, spawnRate: 3200, maxActive: 3, desc: "Challenging Products" }
        }
    },
    division: {
        themeColor: '#06d6a0',
        levels: {
            1: { minAns: 2, maxAns: 9, minDivisor: 2, maxDivisor: 9, speed: 0.6, spawnRate: 4600, maxActive: 2, desc: "1-Digit Division" },
            2: { minAns: 10, maxAns: 12, minDivisor: 2, maxDivisor: 9, speed: 0.9, spawnRate: 4200, maxActive: 2, desc: "Easy Divisors" },
            3: { minAns: 10, maxAns: 12, minDivisor: 2, maxDivisor: 12, speed: 1.1, spawnRate: 3800, maxActive: 2, desc: "Up to 144 ÷ 12" },
            4: { minAns: 10, maxAns: 15, minDivisor: 5, maxDivisor: 12, speed: 1.3, spawnRate: 3500, maxActive: 3, desc: "2-Digit Factors (Max 3 Bubbles)" },
            5: { minAns: 10, maxAns: 25, minDivisor: 5, maxDivisor: 15, speed: 1.6, spawnRate: 3200, maxActive: 3, desc: "Challenging Dividends" }
        }
    }
};

const state = {
    mode: 'addition', // addition | subtraction | multiplication | division
    score: 0,
    streak: 0,
    lives: 3,
    level: 1,
    bubbles: [],
    spawnTimer: null,
    isPlaying: false,
    highScores: {
        addition: 0,
        subtraction: 0,
        multiplication: 0,
        division: 0
    },
    particles: null,
    bubbleIdCounter: 0,
    streakMilestone: 5
};

// DOM Cache
const screens = {
    landing: document.getElementById('landing-page'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen')
};

const dom = {
    soundToggle: document.getElementById('sound-toggle'),
    modeAddition: document.getElementById('mode-addition'),
    modeSubtraction: document.getElementById('mode-subtraction'),
    modeMultiplication: document.getElementById('mode-multiplication'),
    modeDivision: document.getElementById('mode-division'),
    startBtn: document.getElementById('start-game-btn'),
    score: document.getElementById('game-score'),
    streak: document.getElementById('game-streak'),
    multiplierBadge: document.getElementById('multiplier-badge'),
    level: document.getElementById('level-display'),
    modeDisplay: document.getElementById('game-mode-display'),
    livesBox: document.getElementById('lives-box'),
    playField: document.getElementById('play-field'),
    bubbleContainer: document.getElementById('bubble-container'),
    announcement: document.getElementById('announcement'),
    answerInput: document.getElementById('answer-input'),
    
    // High scores
    hsAddition: document.getElementById('high-score-addition'),
    hsSubtraction: document.getElementById('high-score-subtraction'),
    hsMultiplication: document.getElementById('high-score-multiplication'),
    hsDivision: document.getElementById('high-score-division'),
    
    // Results
    resultsTitle: document.getElementById('results-title'),
    resultsMode: document.getElementById('results-mode'),
    finalScore: document.getElementById('final-score'),
    finalStreak: document.getElementById('final-streak'),
    finalBurst: document.getElementById('final-burst'),
    finalLevel: document.getElementById('final-level'),
    newHighScoreBanner: document.getElementById('new-high-score-banner'),
    retryBtn: document.getElementById('retry-btn'),
    menuBtn: document.getElementById('menu-btn')
};

// ==========================================================================
// CORE FUNCTIONS
// ==========================================================================

// Initialize Application
function init() {
    initBackgroundSymbols();
    loadHighScores();
    updateMuteUI();
    
    state.particles = new ParticleSystem('particle-canvas');
    
    // Wire up events
    dom.soundToggle.addEventListener('click', toggleMute);
    
    // Mode Select Cards
    dom.modeAddition.addEventListener('click', () => setMode('addition'));
    dom.modeSubtraction.addEventListener('click', () => setMode('subtraction'));
    dom.modeMultiplication.addEventListener('click', () => setMode('multiplication'));
    dom.modeDivision.addEventListener('click', () => setMode('division'));
    
    // Nav Buttons
    dom.startBtn.addEventListener('click', startGame);
    dom.retryBtn.addEventListener('click', startGame);
    dom.menuBtn.addEventListener('click', showMainMenu);
    
    // Input Handling
    dom.answerInput.addEventListener('input', handleInput);
    dom.answerInput.addEventListener('keydown', handleKeydown);
    
    // Start drawing particles loop
    requestAnimationFrame(renderLoop);
}

// Load high scores from localStorage
function loadHighScores() {
    const scores = localStorage.getItem('bubble_math_high_scores');
    if (scores) {
        try {
            state.highScores = JSON.parse(scores);
        } catch(e) {
            console.error('Failed to parse high scores:', e);
        }
    }
    
    dom.hsAddition.innerText = state.highScores.addition || 0;
    dom.hsSubtraction.innerText = state.highScores.subtraction || 0;
    dom.hsMultiplication.innerText = state.highScores.multiplication || 0;
    dom.hsDivision.innerText = state.highScores.division || 0;
}

// Save high scores to localStorage
function saveHighScore(mode, newScore) {
    // Standardize key in case of legacy items
    if (!state.highScores[mode]) {
        state.highScores[mode] = 0;
    }
    
    if (newScore > state.highScores[mode]) {
        state.highScores[mode] = newScore;
        localStorage.setItem('bubble_math_high_scores', JSON.stringify(state.highScores));
        loadHighScores();
        return true; // New high score
    }
    return false;
}

// Sound Control
function toggleMute() {
    const isMuted = sfx.toggleMute();
    updateMuteUI(isMuted);
}

function updateMuteUI(isMuted) {
    const muted = isMuted !== undefined ? isMuted : sfx.muted;
    const soundOnIcon = dom.soundToggle.querySelector('.sound-on');
    const soundOffIcon = dom.soundToggle.querySelector('.sound-off');
    
    if (muted) {
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    } else {
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
    }
}

// Navigation Screens
function switchScreen(screenKey) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenKey].classList.add('active');
    
    if (screenKey === 'game') {
        dom.answerInput.value = '';
        setTimeout(() => dom.answerInput.focus(), 100);
    }
}

// Set mode selection
function setMode(selectedMode) {
    state.mode = selectedMode;
    
    // Clear active classes
    dom.modeAddition.classList.remove('active');
    dom.modeSubtraction.classList.remove('active');
    dom.modeMultiplication.classList.remove('active');
    dom.modeDivision.classList.remove('active');
    
    // Assign active class
    if (selectedMode === 'addition') dom.modeAddition.classList.add('active');
    else if (selectedMode === 'subtraction') dom.modeSubtraction.classList.add('active');
    else if (selectedMode === 'multiplication') dom.modeMultiplication.classList.add('active');
    else if (selectedMode === 'division') dom.modeDivision.classList.add('active');
    
    sfx.playPop();
}

// Start Game Play
function startGame() {
    sfx.init();
    
    state.score = 0;
    state.streak = 0;
    state.lives = 3;
    state.level = 1;
    state.isPlaying = true;
    state.bubbles = [];
    state.bubbleIdCounter = 0;
    
    // Clear display elements
    dom.bubbleContainer.innerHTML = '';
    dom.score.innerText = '0';
    dom.streak.innerText = 'x1';
    dom.multiplierBadge.className = 'stat-badge';
    
    // Update labels
    dom.level.innerText = `Level 1`;
    
    // Map mode displays
    let modeText = 'Addition';
    if (state.mode === 'subtraction') modeText = 'Subtraction';
    else if (state.mode === 'multiplication') modeText = 'Multiplication';
    else if (state.mode === 'division') modeText = 'Division';
    dom.modeDisplay.innerText = modeText;
    
    updateLivesUI();
    switchScreen('game');
    
    // Trigger first bubble spawn and start timer
    spawnBubble();
    resetSpawnInterval();
    
    sfx.playLevelUp(); // play initial sound
}

// Update Lives UI
function updateLivesUI() {
    const hearts = dom.livesBox.children;
    for (let i = 0; i < 3; i++) {
        const heart = hearts[i];
        if (i < state.lives) {
            heart.className = 'heart active';
        } else {
            if (heart.classList.contains('active')) {
                heart.className = 'heart lost';
            } else {
                heart.className = 'heart';
            }
        }
    }
}

// Show Main Menu
function showMainMenu() {
    switchScreen('landing');
    sfx.playPop();
}

// ==========================================================================
// GAMEPLAY MECHANICS & LOOPS
// ==========================================================================

// Get config for current mode and level
function getLevelConfig() {
    const modeConfig = GAME_CONFIG[state.mode];
    const maxLevel = Object.keys(modeConfig.levels).length;
    const currentLevel = Math.min(state.level, maxLevel);
    return modeConfig.levels[currentLevel];
}

// Reset spawn interval based on current level configuration
function resetSpawnInterval() {
    if (state.spawnTimer) clearInterval(state.spawnTimer);
    
    const config = getLevelConfig();
    state.spawnTimer = setInterval(() => {
        if (state.isPlaying) {
            spawnBubble();
        }
    }, config.spawnRate);
}

// Spawn a new bubble
function spawnBubble() {
    const config = getLevelConfig();
    
    // Check if we already have max concurrent bubbles
    const activeBubbles = state.bubbles.filter(b => !b.isEscaping && !b.isPopped);
    if (activeBubbles.length >= config.maxActive) {
        return;
    }
    
    // Generate math expression based on mode rules
    let num1, num2, ans, expressionText;
    let bubbleClass = '';
    
    if (state.mode === 'addition') {
        if (config.min1 !== undefined) {
            num1 = Math.floor(Math.random() * (config.max1 - config.min1 + 1)) + config.min1;
            num2 = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2;
        } else {
            num1 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
            num2 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        }
        ans = num1 + num2;
        expressionText = `${num1} + ${num2}`;
    } 
    else if (state.mode === 'subtraction') {
        bubbleClass = 'subtraction-bubble';
        let valA, valB;
        if (config.min1 !== undefined) {
            valA = Math.floor(Math.random() * (config.max1 - config.min1 + 1)) + config.min1;
            valB = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2;
        } else {
            valA = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
            valB = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        }
        // Always make first operand bigger to ensure positive results
        num1 = Math.max(valA, valB);
        num2 = Math.min(valA, valB);
        ans = num1 - num2;
        expressionText = `${num1} − ${num2}`; // nice visual minus symbol
    } 
    else if (state.mode === 'multiplication') {
        bubbleClass = 'multiplication-bubble';
        if (config.min1 !== undefined) {
            num1 = Math.floor(Math.random() * (config.max1 - config.min1 + 1)) + config.min1;
            num2 = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2;
        } else {
            num1 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
            num2 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        }
        
        if (Math.random() > 0.5) {
            const temp = num1;
            num1 = num2;
            num2 = temp;
        }
        
        ans = num1 * num2;
        expressionText = `${num1} × ${num2}`;
    } 
    else if (state.mode === 'division') {
        bubbleClass = 'division-bubble';
        // division is calculated backward: generate quotient (ans) and divisor (num2), then calculate dividend (num1)
        const qVal = Math.floor(Math.random() * (config.maxAns - config.minAns + 1)) + config.minAns;
        const dVal = Math.floor(Math.random() * (config.maxDivisor - config.minDivisor + 1)) + config.minDivisor;
        
        num2 = dVal; // Divisor
        ans = qVal;  // Quotient (Target Answer)
        num1 = ans * num2; // Dividend (numerator)
        expressionText = `${num1} ÷ ${num2}`;
    }
    
    // Calculate bubble size (w/ overflow expansion styling)
    const bubbleSize = 75 + Math.min(expressionText.length * 6, 25);
    
    // Create bubble DOM element
    const el = document.createElement('div');
    el.className = `math-bubble ${bubbleClass}`;
    el.style.width = `${bubbleSize}px`;
    el.style.height = `${bubbleSize}px`;
    
    // Position bubble horizontally, avoiding clipping off side edges
    const minLeft = 5;
    const maxLeft = 85 - (bubbleSize / 5);
    const leftPercent = minLeft + Math.random() * (maxLeft - minLeft);
    el.style.left = `${leftPercent}%`;
    
    // Add text element
    const content = document.createElement('div');
    content.className = 'math-bubble-content';
    content.style.fontSize = bubbleSize > 90 ? '1.1rem' : '1rem';
    content.innerText = expressionText;
    el.appendChild(content);
    
    dom.bubbleContainer.appendChild(el);
    
    // Create bubble state object
    const bubbleId = state.bubbleIdCounter++;
    const bubbleObj = {
        id: bubbleId,
        element: el,
        ans: ans,
        size: bubbleSize,
        xPercent: leftPercent,
        yPercent: -15, // Starts just below playfield
        speed: config.speed * (0.85 + Math.random() * 0.3),
        swaySpeed: 0.015 + Math.random() * 0.02,
        swayAmount: 15 + Math.random() * 20,
        swayOffset: Math.random() * Math.PI * 2,
        wobbleProgress: 0,
        isEscaping: false,
        isPopped: false
    };
    
    state.bubbles.push(bubbleObj);
}

// Input text handling (Real-time auto pop matching)
function handleInput(e) {
    const inputVal = parseInt(dom.answerInput.value.trim());
    if (isNaN(inputVal)) return;
    
    // Find all bubbles that match the answer value and aren't already popping
    const matchingBubbles = state.bubbles.filter(b => b.ans === inputVal && !b.isPopped && !b.isEscaping);
    
    if (matchingBubbles.length > 0) {
        // If there are matches, pop the one closest to the top of screen (highest yPercent value)
        matchingBubbles.sort((a, b) => b.yPercent - a.yPercent);
        const target = matchingBubbles[0];
        
        popBubble(target);
        dom.answerInput.value = ''; // Reset input immediately
    }
}

// Keydown handler (for submission failures on Enter)
function handleKeydown(e) {
    if (e.key === 'Enter') {
        const inputStr = dom.answerInput.value.trim();
        if (!inputStr) return;
        
        const inputVal = parseInt(inputStr);
        
        const matches = state.bubbles.some(b => b.ans === inputVal && !b.isPopped && !b.isEscaping);
        
        if (!matches) {
            handleIncorrectAttempt();
        }
    }
}

// Flash input red, play error sound, reset streak
function handleIncorrectAttempt() {
    const wrapper = dom.answerInput.parentElement;
    wrapper.classList.add('incorrect');
    sfx.playIncorrect();
    
    state.streak = 0;
    updateStreakUI();
    
    setTimeout(() => {
        wrapper.classList.remove('incorrect');
        dom.answerInput.value = '';
    }, 400);
}

// Burst bubble
function popBubble(bubble) {
    bubble.isPopped = true;
    
    // Audio pop
    sfx.playPop();
    
    // Get bubble client rect for particles coordinate translation
    const rect = bubble.element.getBoundingClientRect();
    const parentRect = dom.playField.getBoundingClientRect();
    const particleX = rect.left - parentRect.left + (rect.width / 2);
    const particleY = rect.top - parentRect.top + (rect.height / 2);
    
    // Spawn particles with mode theme color
    const particleColor = GAME_CONFIG[state.mode].themeColor;
    state.particles.spawn(particleX, particleY, particleColor);
    
    // Remove bubble element from DOM
    bubble.element.remove();
    
    // Scoring & Streak Multipliers
    state.streak++;
    updateStreakUI();
    
    const multiplier = getScoreMultiplier();
    const scoreVal = 10 * multiplier;
    state.score += scoreVal;
    dom.score.innerText = state.score;
    
    // Check level progression thresholds
    checkLevelUp();
}

// Calculate streak multiplier
function getScoreMultiplier() {
    if (state.streak >= 15) return 4;
    if (state.streak >= 10) return 3;
    if (state.streak >= 5) return 2;
    return 1;
}

// Update the Streak indicator UI
function updateStreakUI() {
    dom.streak.innerText = `x${getScoreMultiplier()}`;
    
    const currentMultiplier = getScoreMultiplier();
    
    dom.multiplierBadge.className = 'stat-badge';
    if (currentMultiplier === 2) {
        dom.multiplierBadge.classList.add('streak-x2');
    } else if (currentMultiplier === 3) {
        dom.multiplierBadge.classList.add('streak-x3');
    } else if (currentMultiplier >= 4) {
        dom.multiplierBadge.classList.add('streak-x4');
    }
    
    // Highlight streak milestone effects
    if (state.streak > 0 && state.streak % state.streakMilestone === 0) {
        sfx.playCorrect();
        triggerFloatingNotification(`STREAK x${state.streak}!`, '#f72585');
    }
}

// floating banner inside game for score milestones
function triggerFloatingNotification(text, color) {
    const banner = document.createElement('div');
    banner.style.position = 'absolute';
    banner.style.top = '40%';
    banner.style.left = '50%';
    banner.style.transform = 'translate(-50%, -50%)';
    banner.style.color = color || '#06d6a0';
    banner.style.fontFamily = 'Space Grotesk';
    banner.style.fontWeight = 'bold';
    banner.style.fontSize = '1.3rem';
    banner.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
    banner.style.animation = 'floatFadeNotification 1.2s forwards ease-out';
    banner.style.zIndex = '50';
    banner.innerText = text;
    
    dom.playField.appendChild(banner);
    
    setTimeout(() => {
        banner.remove();
    }, 1250);
}

// Level progression checking
function checkLevelUp() {
    const maxLevel = Object.keys(GAME_CONFIG[state.mode].levels).length;
    
    // Standard level up thresholds
    const thresholds = [0, 80, 200, 400, 700];
    const targetLevel = thresholds.findIndex((th, index) => {
        const nextTh = thresholds[index + 1] || Infinity;
        return state.score >= th && state.score < nextTh;
    }) + 1;
    
    const nextLevel = Math.min(targetLevel, maxLevel);
    
    if (nextLevel > state.level) {
        state.level = nextLevel;
        dom.level.innerText = `Level ${state.level}`;
        
        // Visual Announcement
        const config = getLevelConfig();
        dom.announcement.innerText = `LEVEL UP: ${config.desc}`;
        dom.announcement.classList.remove('hidden');
        dom.announcement.classList.add('show');
        
        sfx.playLevelUp();
        resetSpawnInterval();
        
        setTimeout(() => {
            dom.announcement.classList.remove('show');
            dom.announcement.classList.add('hidden');
        }, 2200);
    }
}

// Lose a Life when bubble escapes
function escapeBubble(bubble) {
    if (bubble.isEscaping || bubble.isPopped) return;
    bubble.isEscaping = true;
    
    // Add escape CSS red fade-out class
    bubble.element.classList.add('escaping');
    
    // Life deduction
    state.lives--;
    updateLivesUI();
    sfx.playIncorrect();
    
    state.streak = 0;
    updateStreakUI();
    
    setTimeout(() => {
        bubble.element.remove();
    }, 300);
    
    if (state.lives <= 0) {
        endGame();
    }
}

// End Game
function endGame() {
    state.isPlaying = false;
    clearInterval(state.spawnTimer);
    
    sfx.playGameOver();
    
    // Save/Check High Score
    const isNewHighScore = saveHighScore(state.mode, state.score);
    
    // Fill Results Screen
    dom.resultsTitle.innerText = state.lives <= 0 ? "Game Over" : "Finished!";
    
    let modeLabel = 'Addition Mode';
    if (state.mode === 'subtraction') modeLabel = 'Subtraction Mode';
    else if (state.mode === 'multiplication') modeLabel = 'Multiplication Mode';
    else if (state.mode === 'division') modeLabel = 'Division Mode';
    
    dom.resultsMode.innerText = modeLabel;
    dom.finalScore.innerText = state.score;
    dom.finalStreak.innerText = state.streak;
    dom.finalLevel.innerText = state.level;
    
    const poppedCount = state.bubbles.filter(b => b.isPopped).length;
    dom.finalBurst.innerText = poppedCount;
    
    if (isNewHighScore) {
        dom.newHighScoreBanner.classList.remove('hidden');
    } else {
        dom.newHighScoreBanner.classList.add('hidden');
    }
    
    switchScreen('results');
}

// ==========================================================================
// RENDER TICK LOOP (Runs at 60fps)
// ==========================================================================
function renderLoop() {
    state.particles.update();
    state.particles.draw();
    
    if (state.isPlaying) {
        const playfieldHeight = dom.playField.clientHeight;
        
        for (let i = state.bubbles.length - 1; i >= 0; i--) {
            const b = state.bubbles[i];
            
            if (b.isPopped) {
                state.bubbles.splice(i, 1);
                continue;
            }
            
            if (b.isEscaping) {
                continue;
            }
            
            const deltaY = (b.speed / playfieldHeight) * 100;
            b.yPercent += deltaY;
            
            b.wobbleProgress += b.swaySpeed;
            const swayOffset = Math.sin(b.wobbleProgress + b.swayOffset) * (b.swayAmount / dom.playField.clientWidth) * 100;
            
            b.element.style.bottom = `${b.yPercent}%`;
            b.element.style.transform = `translateX(${swayOffset}px)`;
            
            if (b.yPercent > 105) {
                escapeBubble(b);
            }
        }
    }
    
    requestAnimationFrame(renderLoop);
}

// Additional styles injected dynamically for keyframes/streak glows
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes floatFadeNotification {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    20% { transform: translate(-50%, -60%) scale(1.1); opacity: 1; }
    80% { transform: translate(-50%, -80%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -100%) scale(0.9); opacity: 0; }
}
.streak-x2 { border-color: rgba(6, 214, 160, 0.4) !important; background: rgba(6, 214, 160, 0.1) !important; }
.streak-x2 .badge-val { color: var(--success) !important; text-shadow: 0 0 8px var(--success-glow) !important; }
.streak-x3 { border-color: rgba(76, 201, 240, 0.5) !important; background: rgba(76, 201, 240, 0.15) !important; }
.streak-x3 .badge-val { color: var(--accent-multiplication) !important; text-shadow: 0 0 10px rgba(76, 201, 240, 0.45) !important; }
.streak-x4 { border-color: rgba(255, 0, 110, 0.6) !important; background: rgba(255, 0, 110, 0.2) !important; animation: pulseGlowBtn 1s infinite !important; }
.streak-x4 .badge-val { color: var(--danger) !important; text-shadow: 0 0 12px var(--danger-glow) !important; }
`;
document.head.appendChild(styleSheet);

window.onload = init;
