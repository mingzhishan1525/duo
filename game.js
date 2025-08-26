class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 游戏状态
        this.state = 'DIFFICULTY'; // DIFFICULTY, MENU, PLAYING, PAUSED, GAME_OVER, WIN
        this.difficulty = 'human'; // heaven, human, hell
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // 难度配置
        this.difficultySettings = {
            heaven: {
                name: '天堂',
                ghostSpeed: 50,
                ghostScaredSpeed: 30,
                playerSpeed: 120,
                wallDensity: 0.1,
                powerPelletDuration: 15000,
                lives: 5,
                ghostAggression: 0.3
            },
            human: {
                name: '人间',
                ghostSpeed: 80,
                ghostScaredSpeed: 50,
                playerSpeed: 100,
                wallDensity: 0.2,
                powerPelletDuration: 10000,
                lives: 3,
                ghostAggression: 0.6
            },
            hell: {
                name: '地狱',
                ghostSpeed: 120,
                ghostScaredSpeed: 80,
                playerSpeed: 90,
                wallDensity: 0.35,
                powerPelletDuration: 6000,
                lives: 2,
                ghostAggression: 0.9
            }
        };
        
        // 游戏对象
        this.maze = null;
        this.player = null;
        this.ghosts = [];
        this.pellets = [];
        this.powerPellets = [];
        
        // 游戏设置
        this.cellSize = 20;
        this.rows = this.height / this.cellSize;
        this.cols = this.width / this.cellSize;
        
        // 计时器
        this.lastTime = 0;
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.powerModeDuration = 10000; // 将根据难度调整
        
        this.init();
    }
    
    init() {
        this.maze = new Maze(this.cols, this.rows, this.cellSize);
        this.bindEvents();
        this.bindDifficultyEvents();
    }
    
    setDifficulty(difficulty) {
        console.log('Setting difficulty to:', difficulty);
        this.difficulty = difficulty;
        const settings = this.difficultySettings[difficulty];
        this.lives = settings.lives;
        this.state = 'MENU';
        this.setupLevel();
        this.updateUI();
        this.hideDifficultyOverlay();
    }
    
    showDifficultyOverlay() {
        const overlay = document.getElementById('difficultyOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
    
    hideDifficultyOverlay() {
        const overlay = document.getElementById('difficultyOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    bindDifficultyEvents() {
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = button.getAttribute('data-difficulty');
                this.setDifficulty(difficulty);
            });
            
            // 移动端支持
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const difficulty = button.getAttribute('data-difficulty');
                this.setDifficulty(difficulty);
            });
        });
    }
    
    setupLevel() {
        const settings = this.difficultySettings[this.difficulty];
        console.log('Setting up level with difficulty:', this.difficulty, settings);
        
        // 创建迷宫（传入难度设置）
        this.maze = new Maze(this.cols, this.rows, this.cellSize, settings.wallDensity);
        this.maze.generate();
        
        // 找到玩家起始位置
        const playerStart = this.maze.getPlayerStartPosition();
        this.player = new Player(playerStart.x, playerStart.y, this.cellSize, settings.playerSpeed);
        
        // 创建幽灵
        this.ghosts = [];
        const ghostStarts = this.maze.getGhostStartPositions();
        const ghostColors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
        
        for (let i = 0; i < Math.min(4, ghostStarts.length); i++) {
            const start = ghostStarts[i];
            this.ghosts.push(new Ghost(
                start.x, start.y, this.cellSize, ghostColors[i], 
                settings.ghostSpeed, settings.ghostScaredSpeed, settings.ghostAggression
            ));
        }
        
        // 设置能量模式持续时间
        this.powerModeDuration = settings.powerPelletDuration;
        
        // 创建豆子
        this.createPellets();
        
        console.log('Level setup complete for difficulty:', settings.name);
    }
    
    createPellets() {
        this.pellets = [];
        this.powerPellets = [];
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.maze.isWalkable(x, y)) {
                    // 不在玩家和幽灵起始位置放置豆子
                    if (!this.isStartPosition(x, y)) {
                        if (Math.random() < 0.05) { // 5%概率放置能量豆
                            this.powerPellets.push({ x, y });
                        } else if (Math.random() < 0.7) { // 70%概率放置普通豆子
                            this.pellets.push({ x, y });
                        }
                    }
                }
            }
        }
    }
    
    isStartPosition(x, y) {
        const playerStart = this.maze.getPlayerStartPosition();
        if (Math.abs(x - playerStart.x) <= 1 && Math.abs(y - playerStart.y) <= 1) {
            return true;
        }
        
        const ghostStarts = this.maze.getGhostStartPositions();
        for (const start of ghostStarts) {
            if (Math.abs(x - start.x) <= 1 && Math.abs(y - start.y) <= 1) {
                return true;
            }
        }
        
        return false;
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.code, 'Game state:', this.state);
            
            // 在难度选择界面时，使用数字键选择雾度
            if (this.state === 'DIFFICULTY') {
                switch (e.code) {
                    case 'Digit1':
                    case 'Numpad1':
                        this.setDifficulty('heaven');
                        break;
                    case 'Digit2':
                    case 'Numpad2':
                        this.setDifficulty('human');
                        break;
                    case 'Digit3':
                    case 'Numpad3':
                        this.setDifficulty('hell');
                        break;
                    case 'Enter':
                    case 'Space':
                        this.setDifficulty('human'); // 默认人间雾度
                        break;
                }
                return;
            }
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.state === 'MENU' || this.state === 'GAME_OVER') {
                        console.log('Starting game from space key');
                        this.startGame();
                    } else {
                        this.togglePause();
                    }
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    if (this.state === 'MENU' || this.state === 'GAME_OVER') {
                        console.log('Starting game from up key');
                        this.startGame();
                    } else if (this.state === 'PLAYING') {
                        console.log('Moving up');
                        this.player.setDirection(0, -1);
                    }
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    if (this.state === 'MENU' || this.state === 'GAME_OVER') {
                        console.log('Starting game from down key');
                        this.startGame();
                    } else if (this.state === 'PLAYING') {
                        console.log('Moving down');
                        this.player.setDirection(0, 1);
                    }
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    if (this.state === 'MENU' || this.state === 'GAME_OVER') {
                        console.log('Starting game from left key');
                        this.startGame();
                    } else if (this.state === 'PLAYING') {
                        console.log('Moving left');
                        this.player.setDirection(-1, 0);
                    }
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    if (this.state === 'MENU' || this.state === 'GAME_OVER') {
                        console.log('Starting game from right key');
                        this.startGame();
                    } else if (this.state === 'PLAYING') {
                        console.log('Moving right');
                        this.player.setDirection(1, 0);
                    }
                    break;
                case 'Enter':
                    if (this.state === 'MENU' || this.state === 'GAME_OVER') {
                        console.log('Starting game from enter key');
                        this.startGame();
                    }
                    break;
                case 'Escape':
                    if (this.state !== 'DIFFICULTY') {
                        this.state = 'DIFFICULTY';
                        this.showDifficultyOverlay();
                    }
                    break;
            }
        });
    }
    
    startGame() {
        console.log('Starting game...');
        this.state = 'PLAYING';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.setupLevel();
        this.updateUI();
        console.log('Game started, state:', this.state, 'Player position:', this.player ? this.player.x + ',' + this.player.y : 'No player');
    }
    
    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
        } else if (this.state === 'MENU') {
            this.startGame();
        }
    }
    
    update(deltaTime) {
        if (this.state !== 'PLAYING') return;
        
        // 更新能量模式计时器
        if (this.powerMode) {
            this.powerModeTimer -= deltaTime;
            if (this.powerModeTimer <= 0) {
                this.powerMode = false;
                this.ghosts.forEach(ghost => ghost.setScared(false));
            }
        }
        
        // 更新玩家
        this.player.update(deltaTime, this.maze);
        
        // 更新幽灵
        this.ghosts.forEach(ghost => {
            ghost.update(deltaTime, this.maze, this.player);
        });
        
        // 检查碰撞
        this.checkCollisions();
        
        // 检查游戏状态
        this.checkGameState();
    }
    
    checkCollisions() {
        // 检查玩家与豆子的碰撞
        const playerGridX = Math.floor(this.player.x / this.cellSize);
        const playerGridY = Math.floor(this.player.y / this.cellSize);
        
        // 普通豆子
        for (let i = this.pellets.length - 1; i >= 0; i--) {
            const pellet = this.pellets[i];
            if (pellet.x === playerGridX && pellet.y === playerGridY) {
                this.pellets.splice(i, 1);
                this.score += 10;
                this.updateUI();
                
                // 音效和振动反馈
                if (window.SoundManager) {
                    window.SoundManager.playEatPellet();
                }
                if (window.VibrationManager) {
                    window.VibrationManager.short();
                }
            }
        }
        
        // 能量豆子
        for (let i = this.powerPellets.length - 1; i >= 0; i--) {
            const pellet = this.powerPellets[i];
            if (pellet.x === playerGridX && pellet.y === playerGridY) {
                this.powerPellets.splice(i, 1);
                this.score += 50;
                this.activatePowerMode();
                this.updateUI();
                
                // 音效和振动反馈
                if (window.SoundManager) {
                    window.SoundManager.playEatPowerPellet();
                }
                if (window.VibrationManager) {
                    window.VibrationManager.medium();
                }
            }
        }
        
        // 检查玩家与幽灵的碰撞
        this.ghosts.forEach(ghost => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - ghost.x, 2) + 
                Math.pow(this.player.y - ghost.y, 2)
            );
            
            if (distance < this.cellSize * 0.8) {
                if (this.powerMode && ghost.scared) {
                    // 吃掉幽灵
                    ghost.reset();
                    this.score += 200;
                    this.updateUI();
                    
                    // 音效和振动反馈
                    if (window.SoundManager) {
                        window.SoundManager.playEatGhost();
                    }
                    if (window.VibrationManager) {
                        window.VibrationManager.pattern();
                    }
                } else if (!ghost.scared) {
                    // 玩家被抓住
                    this.playerCaught();
                }
            }
        });
    }
    
    activatePowerMode() {
        this.powerMode = true;
        this.powerModeTimer = this.powerModeDuration;
        this.ghosts.forEach(ghost => ghost.setScared(true));
    }
    
    playerCaught() {
        this.lives--;
        this.updateUI();
        
        // 音效和振动反馈
        if (window.SoundManager) {
            window.SoundManager.playDeath();
        }
        if (window.VibrationManager) {
            window.VibrationManager.long();
        }
        
        if (this.lives <= 0) {
            this.state = 'GAME_OVER';
        } else {
            // 重置位置
            const playerStart = this.maze.getPlayerStartPosition();
            this.player.reset(playerStart.x, playerStart.y);
            
            this.ghosts.forEach(ghost => ghost.reset());
            this.powerMode = false;
            this.powerModeTimer = 0;
        }
    }
    
    checkGameState() {
        if (this.pellets.length === 0 && this.powerPellets.length === 0) {
            this.state = 'WIN';
            this.level++;
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            // 绘制迷宫
            this.maze.render(this.ctx);
            
            // 绘制豆子
            this.renderPellets();
            
            // 绘制玩家
            this.player.render(this.ctx);
            
            // 绘制幽灵
            this.ghosts.forEach(ghost => ghost.render(this.ctx));
            
            // 绘制能量模式提示
            if (this.powerMode) {
                this.renderPowerModeIndicator();
            }
        }
        
        // 绘制游戏状态
        this.renderGameState();
    }
    
    renderPellets() {
        // 普通豆子
        this.pellets.forEach(pellet => {
            const x = pellet.x * this.cellSize + this.cellSize / 2;
            const y = pellet.y * this.cellSize + this.cellSize / 2;
            
            // 豆子阴影
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x + 1, y + 1, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 豆子本体
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 豆子高光
            this.ctx.fillStyle = '#ffff99';
            this.ctx.beginPath();
            this.ctx.arc(x - 0.5, y - 0.5, 1, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // 能量豆子（带脉冲动画）
        this.powerPellets.forEach(pellet => {
            const x = pellet.x * this.cellSize + this.cellSize / 2;
            const y = pellet.y * this.cellSize + this.cellSize / 2;
            const pulseScale = 1 + Math.sin(this.lastTime / 200) * 0.2;
            const glowIntensity = 0.3 + Math.sin(this.lastTime / 300) * 0.2;
            
            // 发光效果
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 12 * pulseScale);
            gradient.addColorStop(0, `rgba(255, 255, 0, ${glowIntensity})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 0, ${glowIntensity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12 * pulseScale, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 能量豆阴影
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(x + 2, y + 2, 6 * pulseScale, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 能量豆本体
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6 * pulseScale, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 能量豆高光
            this.ctx.fillStyle = '#ffff99';
            this.ctx.beginPath();
            this.ctx.arc(x - 1, y - 1, 3 * pulseScale, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 内部高光
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x - 2, y - 2, 1.5 * pulseScale, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderPowerModeIndicator() {
        const remaining = this.powerModeTimer / this.powerModeDuration;
        const barWidth = 200;
        const barHeight = 12;
        const x = (this.width - barWidth) / 2;
        const y = 25;
        
        // 背景阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x + 2, y + 2, barWidth, barHeight);
        
        // 背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // 进度条渐变
        const gradient = this.ctx.createLinearGradient(x, y, x + barWidth * remaining, y);
        if (remaining > 0.6) {
            gradient.addColorStop(0, '#00ff00');
            gradient.addColorStop(1, '#7fff00');
        } else if (remaining > 0.3) {
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(1, '#ffa500');
        } else {
            gradient.addColorStop(0, '#ff4500');
            gradient.addColorStop(1, '#ff0000');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, barWidth * remaining, barHeight);
        
        // 内部高光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(x, y, barWidth * remaining, 2);
        
        // 边框
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        // 文本标签
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('能量模式', x + barWidth / 2, y - 5);
        this.ctx.textAlign = 'left';
    }
    
    renderGameState() {
        const overlay = document.getElementById('gameOverlay');
        const message = document.getElementById('gameMessage');
        const difficultyOverlay = document.getElementById('difficultyOverlay');
        
        switch (this.state) {
            case 'DIFFICULTY':
                overlay.classList.add('hidden');
                if (difficultyOverlay) {
                    difficultyOverlay.style.display = 'flex';
                }
                break;
            case 'MENU':
                overlay.classList.remove('hidden');
                if (difficultyOverlay) {
                    difficultyOverlay.style.display = 'none';
                }
                const difficultyName = this.difficultySettings[this.difficulty].name;
                message.textContent = `雾度: ${difficultyName}\n按任意方向键或空格键开始游戏\n按ESC键更改雾度`;
                break;
            case 'PAUSED':
                overlay.classList.remove('hidden');
                if (difficultyOverlay) {
                    difficultyOverlay.style.display = 'none';
                }
                message.textContent = '游戏暂停 - 按空格键继续';
                break;
            case 'GAME_OVER':
                overlay.classList.remove('hidden');
                if (difficultyOverlay) {
                    difficultyOverlay.style.display = 'none';
                }
                const settings = this.difficultySettings[this.difficulty];
                message.textContent = `游戏结束！\n雾度: ${settings.name}\n得分: ${this.score}\n按任意键重新开始`;
                break;
            case 'WIN':
                overlay.classList.remove('hidden');
                if (difficultyOverlay) {
                    difficultyOverlay.style.display = 'none';
                }
                message.textContent = `恭喜通关！得分: ${this.score}\n按任意键进入下一关`;
                break;
            default:
                overlay.classList.add('hidden');
                if (difficultyOverlay) {
                    difficultyOverlay.style.display = 'none';
                }
                break;
        }
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
}