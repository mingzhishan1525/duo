// 吃豆人游戏 - 核心逻辑
class PacManGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 移动端适配
        this.setupCanvasSize();
        window.addEventListener('resize', () => this.setupCanvasSize());
        
        // 游戏状态
        this.gameState = 'start';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // 游戏配置
        this.CELL_SIZE = 25;
        this.ROWS = 24;
        this.COLS = 32;
        
        // 渲染优化
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.offscreenCanvas.width = 800;
        this.offscreenCanvas.height = 600;
        this.mazeRendered = false;
        this.lastRenderTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 性能监控
        this.frameCount = 0;
        this.fpsStartTime = Date.now();
        this.currentFPS = 0;
        
        // 内存管理优化
        this.objectPool = new Map();
        this.eventListeners = new Map();
        this.tempObjects = [];
        
        // 初始化对象池
        this.initObjectPools();
        
        // 移动端触屏支持
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30;
        
        // 触摸事件优化
        this.lastTouchTime = 0;
        this.touchThrottle = 100; // 100ms节流
        this.touchEventQueue = [];
        this.isTouchProcessing = false;
        
        // 游戏对象
        this.pacman = null;
        this.ghosts = [];
        this.maze = [];
        this.dots = [];
        this.powerDots = [];
        
        // 动画
        this.animationId = null;
        this.lastTime = 0;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    // 设置画布尺寸适配移动端
    setupCanvasSize() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 20, 800);
        const maxHeight = Math.min(window.innerHeight * 0.6, 600);
        
        // 保持宽高比
        const aspectRatio = 800 / 600;
        let canvasWidth, canvasHeight;
        
        if (maxWidth / maxHeight > aspectRatio) {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
        } else {
            canvasWidth = maxWidth;
            canvasHeight = maxWidth / aspectRatio;
        }
        
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // 更新像素密度
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 800 * dpr;
        this.canvas.height = 600 * dpr;
        this.ctx.scale(dpr, dpr);
        
        // 更新缩放比例
        this.scaleX = canvasWidth / 800;
        this.scaleY = canvasHeight / 600;
    }
    
    // 初始化游戏
    initializeGame() {
        this.createMaze();
        this.createPacman();
        this.createGhosts();
        this.createDots();
        this.updateUI();
    }
    
    // 创建迷宫
    createMaze() {
        // 简化的迷宫布局 (1=墙, 0=空地, 2=豆子, 3=大豆子)
        const mazeLayout = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,1,1,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
            [0,0,0,0,0,1,2,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,2,1,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
            [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,1,2,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,2,1,0,0,0,0,0],
            [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,3,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,1,1,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.maze = mazeLayout;
    }
    
    // 创建Pac-Man
    createPacman() {
        this.pacman = {
            x: 15,
            y: 18,
            direction: 'right',
            nextDirection: 'right',
            speed: 0.15,
            mouthAngle: 0,
            powerMode: false,
            powerModeTimer: 0
        };
    }
    
    // 创建幽灵
    createGhosts() {
        const ghostColors = ['red', 'pink', 'cyan', 'orange'];
        const ghostNames = ['红鬼', '粉鬼', '蓝鬼', '橙鬼'];
        
        this.ghosts = [];
        for (let i = 0; i < 4; i++) {
            this.ghosts.push({
                x: 14 + i,
                y: 11,
                direction: 'up',
                color: ghostColors[i],
                name: ghostNames[i],
                speed: 0.1,
                mode: 'scatter', // 'chase', 'scatter', 'frightened', 'eaten'
                modeTimer: 0,
                targetX: 0,
                targetY: 0
            });
        }
    }
    
    // 创建豆子
    createDots() {
        this.dots = [];
        this.powerDots = [];
        
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.maze[row][col] === 2) {
                    this.dots.push({ x: col, y: row });
                } else if (this.maze[row][col] === 3) {
                    this.powerDots.push({ x: col, y: row });
                }
            }
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 触屏手势控制
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // 防止页面滚动
        document.addEventListener('touchmove', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 按钮事件
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('resumeButton').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainButton').addEventListener('click', () => this.restartGame());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // 虚拟方向键
        this.setupVirtualControls();
    }
    
    // 设置虚拟控制器
    setupVirtualControls() {
        const buttons = [
            { id: 'upBtn', direction: 'up' },
            { id: 'downBtn', direction: 'down' },
            { id: 'leftBtn', direction: 'left' },
            { id: 'rightBtn', direction: 'right' }
        ];
        
        buttons.forEach(({ id, direction }) => {
            const btn = document.getElementById(id);
            
            // 触摸事件
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.setDirection(direction);
                btn.style.transform = 'scale(0.95)';
            }, { passive: false });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.style.transform = 'scale(1)';
            }, { passive: false });
            
            // 点击事件
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.setDirection(direction);
            });
        });
    }
    
    // 处理触屏开始 - 优化版
    handleTouchStart(e) {
        e.preventDefault();
        
        const now = Date.now();
        if (now - this.lastTouchTime < this.touchThrottle) {
            return;
        }
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.lastTouchTime = now;
    }
    
    // 处理触屏移动 - 优化版
    handleTouchMove(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 防止页面滚动和缩放
        if (e.scale && e.scale !== 1) {
            e.preventDefault();
        }
    }
    
    // 处理触屏结束 - 优化版
    handleTouchEnd(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.gameState !== 'playing' || this.isTouchProcessing) return;
        
        this.isTouchProcessing = true;
        
        // 使用requestAnimationFrame延迟处理，防止阻塞
        requestAnimationFrame(() => {
            this.processTouchEnd(e);
            this.isTouchProcessing = false;
        });
    }
    
    // 处理触摸结束逻辑
    processTouchEnd(e) {
        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // 检查是否达到最小滑动距离
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < this.minSwipeDistance) return;
        
        // 判断滑动方向（优化算法）
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
            // 水平滑动
            this.setDirection(deltaX > 0 ? 'right' : 'left');
        } else {
            // 垂直滑动
            this.setDirection(deltaY > 0 ? 'down' : 'up');
        }
    }
    
    // 处理键盘按键
    handleKeyPress(e) {
        if (this.gameState !== 'playing') return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.setDirection('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.setDirection('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.setDirection('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.setDirection('right');
                break;
            case 'Escape':
                this.togglePause();
                break;
        }
        e.preventDefault();
    }
    
    // 设置方向
    setDirection(direction) {
        if (this.gameState === 'playing') {
            this.pacman.nextDirection = direction;
        }
    }
    
    // 开始游戏
    startGame() {
        this.gameState = 'playing';
        document.getElementById('gameOverlay').style.display = 'none';
        this.gameLoop();
    }
    
    // 暂停/继续游戏
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    pauseGame() {
        this.gameState = 'paused';
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('pauseScreen').style.display = 'block';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('levelCompleteScreen').style.display = 'none';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('gameOverlay').style.display = 'none';
        this.gameLoop();
    }
    
    // 重新开始游戏
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.initializeGame();
        this.startGame();
    }
    
    // 下一关
    nextLevel() {
        this.level++;
        this.initializeGame();
        this.startGame();
    }
    
    // 游戏主循环 - 优化版
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        // 帧率控制
        const deltaTime = currentTime - this.lastRenderTime;
        if (deltaTime < this.frameInterval) {
            this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        this.lastRenderTime = currentTime;
        
        // 性能监控
        this.updateFPSCounter();
        
        const gameDelta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(gameDelta);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // FPS计数器
    updateFPSCounter() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.fpsStartTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.fpsStartTime = now;
            
            // 在开发模式下显示FPS
            if (window.location.hostname === 'localhost') {
                console.log(`FPS: ${this.currentFPS}`);
            }
        }
    }
    
    // 更新游戏状态
    update(deltaTime) {
        this.updatePacman(deltaTime);
        this.updateGhosts(deltaTime);
        this.checkCollisions();
        this.checkWinCondition();
    }
    
    // 更新Pac-Man
    updatePacman(deltaTime) {
        // 检查是否可以转向
        const nextX = Math.floor(this.pacman.x + 0.5);
        const nextY = Math.floor(this.pacman.y + 0.5);
        
        if (this.canMove(nextX, nextY, this.pacman.nextDirection)) {
            this.pacman.direction = this.pacman.nextDirection;
        }
        
        // 移动Pac-Man
        const speed = this.pacman.speed * deltaTime;
        switch (this.pacman.direction) {
            case 'up':
                if (this.canMove(this.pacman.x, this.pacman.y - speed, this.pacman.direction)) {
                    this.pacman.y -= speed;
                }
                break;
            case 'down':
                if (this.canMove(this.pacman.x, this.pacman.y + speed, this.pacman.direction)) {
                    this.pacman.y += speed;
                }
                break;
            case 'left':
                if (this.canMove(this.pacman.x - speed, this.pacman.y, this.pacman.direction)) {
                    this.pacman.x -= speed;
                }
                break;
            case 'right':
                if (this.canMove(this.pacman.x + speed, this.pacman.y, this.pacman.direction)) {
                    this.pacman.x += speed;
                }
                break;
        }
        
        // 处理边界穿越
        if (this.pacman.x < 0) this.pacman.x = this.COLS - 1;
        if (this.pacman.x >= this.COLS) this.pacman.x = 0;
        
        // 更新嘴部动画
        this.pacman.mouthAngle += deltaTime * 0.01;
        
        // 更新无敌状态
        if (this.pacman.powerMode) {
            this.pacman.powerModeTimer -= deltaTime;
            if (this.pacman.powerModeTimer <= 0) {
                this.pacman.powerMode = false;
                // 恢复幽灵正常状态
                this.ghosts.forEach(ghost => {
                    if (ghost.mode === 'frightened') {
                        ghost.mode = 'scatter';
                    }
                });
            }
        }
    }
    
    // 检查是否可以移动
    canMove(x, y, direction) {
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);
        
        // 检查边界
        if (cellX < 0 || cellX >= this.COLS || cellY < 0 || cellY >= this.ROWS) {
            return direction === 'left' || direction === 'right'; // 允许左右穿越
        }
        
        return this.maze[cellY][cellX] !== 1;
    }
    
    // 更新UI
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
}

    // 更新幽灵
    updateGhosts(deltaTime) {
        this.ghosts.forEach(ghost => {
            // 更新幽灵移动
            const speed = ghost.speed * deltaTime;
            
            // 简单AI：随机移动
            if (Math.random() < 0.01) {
                const directions = ['up', 'down', 'left', 'right'];
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            }
            
            switch (ghost.direction) {
                case 'up':
                    if (this.canMove(ghost.x, ghost.y - speed, ghost.direction)) {
                        ghost.y -= speed;
                    } else {
                        ghost.direction = 'down';
                    }
                    break;
                case 'down':
                    if (this.canMove(ghost.x, ghost.y + speed, ghost.direction)) {
                        ghost.y += speed;
                    } else {
                        ghost.direction = 'up';
                    }
                    break;
                case 'left':
                    if (this.canMove(ghost.x - speed, ghost.y, ghost.direction)) {
                        ghost.x -= speed;
                    } else {
                        ghost.direction = 'right';
                    }
                    break;
                case 'right':
                    if (this.canMove(ghost.x + speed, ghost.y, ghost.direction)) {
                        ghost.x += speed;
                    } else {
                        ghost.direction = 'left';
                    }
                    break;
            }
            
            // 处理边界穿越
            if (ghost.x < 0) ghost.x = this.COLS - 1;
            if (ghost.x >= this.COLS) ghost.x = 0;
        });
    }
    
    // 检查碰撞 - 优化版
    checkCollisions() {
        const pacmanPos = this.getPooledObject('position');
        pacmanPos.x = Math.floor(this.pacman.x + 0.5);
        pacmanPos.y = Math.floor(this.pacman.y + 0.5);
        
        // 检查豆子碰撞（优化版）
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            if (dot.x === pacmanPos.x && dot.y === pacmanPos.y) {
                this.dots.splice(i, 1);
                this.score += 10;
                this.updateUI();
                this.mazeRendered = false; // 标记需要重新渲染静态元素
            }
        }
        
        // 检查大豆子碰撞（优化版）
        for (let i = this.powerDots.length - 1; i >= 0; i--) {
            const powerDot = this.powerDots[i];
            if (powerDot.x === pacmanPos.x && powerDot.y === pacmanPos.y) {
                this.powerDots.splice(i, 1);
                this.score += 50;
                this.pacman.powerMode = true;
                this.pacman.powerModeTimer = 10000;
                
                // 让幽灵进入恐惧状态
                this.ghosts.forEach(ghost => {
                    ghost.mode = 'frightened';
                });
                
                this.updateUI();
                this.mazeRendered = false; // 标记需要重新渲染静态元素
            }
        }
        
        // 检查幽灵碰撞（优化算法）
        const pacmanX = this.pacman.x;
        const pacmanY = this.pacman.y;
        
        for (let i = 0; i < this.ghosts.length; i++) {
            const ghost = this.ghosts[i];
            const dx = ghost.x - pacmanX;
            const dy = ghost.y - pacmanY;
            const distanceSquared = dx * dx + dy * dy; // 避免开方计算
            
            if (distanceSquared < 0.64) { // 0.8 * 0.8 = 0.64
                if (this.pacman.powerMode && ghost.mode === 'frightened') {
                    // 吃掉幽灵
                    this.score += 200;
                    ghost.x = 15;
                    ghost.y = 11;
                    ghost.mode = 'scatter';
                    this.updateUI();
                } else if (ghost.mode !== 'frightened') {
                    // 被幽灵吃掉
                    this.lives--;
                    this.updateUI();
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPositions();
                    }
                }
            }
        }
        
        // 将位置对象返回池
        this.returnPooledObject('position', pacmanPos);
    }
    
    // 检查胜利条件
    checkWinCondition() {
        if (this.dots.length === 0 && this.powerDots.length === 0) {
            this.levelComplete();
        }
    }
    
    // 重置位置
    resetPositions() {
        this.pacman.x = 15;
        this.pacman.y = 18;
        this.pacman.direction = 'right';
        
        this.ghosts.forEach((ghost, index) => {
            ghost.x = 14 + index;
            ghost.y = 11;
            ghost.direction = 'up';
            ghost.mode = 'scatter';
        });
    }
    
    // 游戏结束
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('levelCompleteScreen').style.display = 'none';
        document.getElementById('finalScore').textContent = this.score;
        
        // 根据分数显示不同消息
        const messages = [
            '再接再厉！',
            '不错的尝试！',
            '你做得很好！',
            '真是太棒了！',
            '你是吃豆人大师！'
        ];
        
        let messageIndex = Math.floor(this.score / 1000);
        messageIndex = Math.min(messageIndex, messages.length - 1);
        document.getElementById('gameOverMessage').textContent = messages[messageIndex];
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    // 关卡完成
    levelComplete() {
        this.gameState = 'levelComplete';
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('levelCompleteScreen').style.display = 'block';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('completedLevel').textContent = this.level;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    // 渲染游戏 - 优化版
    render() {
        // 清空主画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制静态元素到离屏画布（只绘制一次）
        if (!this.mazeRendered) {
            this.renderStaticElements();
            this.mazeRendered = true;
        }
        
        // 将离屏画布的静态元素复制到主画布
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        // 绘制动态元素
        this.renderDynamicElements();
    }
    
    // 绘制静态元素（迷宫和豆子）
    renderStaticElements() {
        // 清空离屏画布
        this.offscreenCtx.fillStyle = '#000';
        this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        
        // 绘制迷宫
        this.renderMazeToOffscreen();
        
        // 绘制豆子
        this.renderDotsToOffscreen();
    }
    
    // 绘制动态元素（Pac-Man和幽灵）
    renderDynamicElements() {
        // 绘制Pac-Man
        this.renderPacman();
        
        // 绘制幽灵
        this.renderGhosts();
        
        // 在开发模式下显示FPS
        if (window.location.hostname === 'localhost') {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`FPS: ${this.currentFPS}`, 10, 25);
        }
    }
    
    // 绘制迷宫到离屏画布
    renderMazeToOffscreen() {
        this.offscreenCtx.fillStyle = '#0000FF';
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.maze[row][col] === 1) {
                    this.offscreenCtx.fillRect(
                        col * this.CELL_SIZE,
                        row * this.CELL_SIZE,
                        this.CELL_SIZE,
                        this.CELL_SIZE
                    );
                }
            }
        }
    }
    
    // 绘制豆子到离屏画布
    renderDotsToOffscreen() {
        // 小豆子
        this.offscreenCtx.fillStyle = '#FFFF00';
        this.dots.forEach(dot => {
            this.offscreenCtx.beginPath();
            this.offscreenCtx.arc(
                dot.x * this.CELL_SIZE + this.CELL_SIZE / 2,
                dot.y * this.CELL_SIZE + this.CELL_SIZE / 2,
                3,
                0,
                Math.PI * 2
            );
            this.offscreenCtx.fill();
        });
        
        // 大豆子
        this.offscreenCtx.fillStyle = '#FFFF00';
        this.powerDots.forEach(powerDot => {
            this.offscreenCtx.beginPath();
            this.offscreenCtx.arc(
                powerDot.x * this.CELL_SIZE + this.CELL_SIZE / 2,
                powerDot.y * this.CELL_SIZE + this.CELL_SIZE / 2,
                8,
                0,
                Math.PI * 2
            );
            this.offscreenCtx.fill();
        });
    }
    
    // 初始化对象池
    initObjectPools() {
        // 初始化位置对象池
        this.objectPool.set('position', []);
        for (let i = 0; i < 50; i++) {
            this.objectPool.get('position').push({ x: 0, y: 0 });
        }
        
        // 初始化距离计算对象池
        this.objectPool.set('distance', []);
        for (let i = 0; i < 20; i++) {
            this.objectPool.get('distance').push({ value: 0 });
        }
    }
    
    // 从对象池获取对象
    getPooledObject(type) {
        const pool = this.objectPool.get(type);
        if (pool && pool.length > 0) {
            return pool.pop();
        }
        
        // 如果池中没有对象，创建新的
        switch (type) {
            case 'position':
                return { x: 0, y: 0 };
            case 'distance':
                return { value: 0 };
            default:
                return null;
        }
    }
    
    // 将对象返回到对象池
    returnPooledObject(type, obj) {
        const pool = this.objectPool.get(type);
        if (pool && pool.length < 100) { // 限制池大小
            pool.push(obj);
        }
    }
    
    // 添加事件监听器
    addEventListenerWithCleanup(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        
        const key = `${element.constructor.name}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({ element, event, handler, options });
    }
    
    // 清理所有事件监听器
    cleanupEventListeners() {
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
    }
    
    // 绘制迷宫
    renderMaze() {
        this.ctx.fillStyle = '#0000FF';
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.maze[row][col] === 1) {
                    this.ctx.fillRect(
                        col * this.CELL_SIZE,
                        row * this.CELL_SIZE,
                        this.CELL_SIZE,
                        this.CELL_SIZE
                    );
                }
            }
        }
    }
    
    // 绘制豆子
    renderDots() {
        // 小豆子
        this.ctx.fillStyle = '#FFFF00';
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(
                dot.x * this.CELL_SIZE + this.CELL_SIZE / 2,
                dot.y * this.CELL_SIZE + this.CELL_SIZE / 2,
                3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
        // 大豆子
        this.ctx.fillStyle = '#FFFF00';
        this.powerDots.forEach(powerDot => {
            this.ctx.beginPath();
            this.ctx.arc(
                powerDot.x * this.CELL_SIZE + this.CELL_SIZE / 2,
                powerDot.y * this.CELL_SIZE + this.CELL_SIZE / 2,
                8,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }
    
    // 绘制Pac-Man
    renderPacman() {
        const x = this.pacman.x * this.CELL_SIZE + this.CELL_SIZE / 2;
        const y = this.pacman.y * this.CELL_SIZE + this.CELL_SIZE / 2;
        const radius = this.CELL_SIZE / 2 - 2;
        
        // Pac-Man颜色
        this.ctx.fillStyle = this.pacman.powerMode ? '#FFD700' : '#FFFF00';
        
        // 计算嘴部角度
        let startAngle = 0;
        let endAngle = Math.PI * 2;
        const mouthSize = Math.abs(Math.sin(this.pacman.mouthAngle)) * 0.7;
        
        switch (this.pacman.direction) {
            case 'right':
                startAngle = mouthSize;
                endAngle = Math.PI * 2 - mouthSize;
                break;
            case 'left':
                startAngle = Math.PI + mouthSize;
                endAngle = Math.PI - mouthSize;
                break;
            case 'up':
                startAngle = Math.PI * 1.5 + mouthSize;
                endAngle = Math.PI * 0.5 - mouthSize;
                break;
            case 'down':
                startAngle = Math.PI * 0.5 + mouthSize;
                endAngle = Math.PI * 1.5 - mouthSize;
                break;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startAngle, endAngle);
        this.ctx.lineTo(x, y);
        this.ctx.fill();
    }
    
    // 绘制幽灵
    renderGhosts() {
        this.ghosts.forEach(ghost => {
            const x = ghost.x * this.CELL_SIZE + this.CELL_SIZE / 2;
            const y = ghost.y * this.CELL_SIZE + this.CELL_SIZE / 2;
            const radius = this.CELL_SIZE / 2 - 2;
            
            // 幽灵颜色
            let color = ghost.color;
            if (ghost.mode === 'frightened') {
                color = this.pacman.powerModeTimer > 2000 ? '#0000FF' : '#FF00FF';
            }
            
            this.ctx.fillStyle = color;
            
            // 绘制幽灵身体
            this.ctx.beginPath();
            this.ctx.arc(x, y - radius / 2, radius, Math.PI, 0);
            this.ctx.rect(x - radius, y - radius / 2, radius * 2, radius * 1.5);
            
            // 绘制幽灵底部锯齿
            for (let i = 0; i < 4; i++) {
                const segmentWidth = (radius * 2) / 4;
                const segmentX = x - radius + i * segmentWidth;
                this.ctx.lineTo(segmentX + segmentWidth / 2, y + radius / 2 + 5);
                this.ctx.lineTo(segmentX + segmentWidth, y + radius / 2);
            }
            
            this.ctx.fill();
            
            // 绘制眼睛
            this.ctx.fillStyle = '#FFF';
            this.ctx.beginPath();
            this.ctx.arc(x - 5, y - 5, 3, 0, Math.PI * 2);
            this.ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (ghost.mode !== 'frightened') {
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(x - 5, y - 5, 1, 0, Math.PI * 2);
                this.ctx.arc(x + 5, y - 5, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    // 销毁游戏实例，清理资源
    destroy() {
        // 停止动画循环
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // 清理事件监听器
        this.cleanupEventListeners();
        
        // 清理对象池
        this.objectPool.clear();
        this.tempObjects.length = 0;
        
        // 清理Canvas上下文
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.offscreenCtx) {
            this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        }
        
        // 清理游戏对象
        this.ghosts.length = 0;
        this.dots.length = 0;
        this.powerDots.length = 0;
        this.maze.length = 0;
        
        console.log('游戏资源已清理');
    }
    
    // 性能监控方法
    getPerformanceStats() {
        return {
            fps: this.currentFPS,
            objectPoolSize: {
                position: this.objectPool.get('position')?.length || 0,
                distance: this.objectPool.get('distance')?.length || 0
            },
            memoryUsage: {
                dots: this.dots.length,
                powerDots: this.powerDots.length,
                ghosts: this.ghosts.length,
                eventListeners: this.eventListeners.size
            }
        };
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new PacManGame();
    
    // 在页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (game && typeof game.destroy === 'function') {
            game.destroy();
        }
    });
    
    // 在开发模式下提供性能监控
    if (window.location.hostname === 'localhost') {
        window.gamePerformance = () => {
            console.log('游戏性能统计:', game.getPerformanceStats());
        };
        
        // 每10秒输出一次性能统计
        setInterval(() => {
            console.log('性能监控:', game.getPerformanceStats());
        }, 10000);
    }
});