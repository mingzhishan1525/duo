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
        
        // 移动端触屏支持
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30;
        
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
    
    // 处理触屏开始
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    // 处理触屏移动
    handleTouchMove(e) {
        e.preventDefault();
    }
    
    // 处理触屏结束
    handleTouchEnd(e) {
        e.preventDefault();
        
        if (this.gameState !== 'playing') return;
        
        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // 检查是否达到最小滑动距离
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < this.minSwipeDistance) return;
        
        // 判断滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0) {
                this.setDirection('right');
            } else {
                this.setDirection('left');
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                this.setDirection('down');
            } else {
                this.setDirection('up');
            }
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
    
    // 游戏主循环
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
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
    
    // 检查碰撞
    checkCollisions() {
        const pacmanX = Math.floor(this.pacman.x + 0.5);
        const pacmanY = Math.floor(this.pacman.y + 0.5);
        
        // 检查豆子碰撞
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            if (dot.x === pacmanX && dot.y === pacmanY) {
                this.dots.splice(i, 1);
                this.score += 10;
                this.updateUI();
            }
        }
        
        // 检查大豆子碰撞
        for (let i = this.powerDots.length - 1; i >= 0; i--) {
            const powerDot = this.powerDots[i];
            if (powerDot.x === pacmanX && powerDot.y === pacmanY) {
                this.powerDots.splice(i, 1);
                this.score += 50;
                this.pacman.powerMode = true;
                this.pacman.powerModeTimer = 10000; // 10秒无敌时间
                
                // 让幽灵进入恐惧状态
                this.ghosts.forEach(ghost => {
                    ghost.mode = 'frightened';
                });
                
                this.updateUI();
            }
        }
        
        // 检查幽灵碰撞
        this.ghosts.forEach(ghost => {
            const distance = Math.sqrt(
                Math.pow(ghost.x - this.pacman.x, 2) + 
                Math.pow(ghost.y - this.pacman.y, 2)
            );
            
            if (distance < 0.8) {
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
        });
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
    
    // 渲染游戏
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制迷宫
        this.renderMaze();
        
        // 绘制豆子
        this.renderDots();
        
        // 绘制Pac-Man
        this.renderPacman();
        
        // 绘制幽灵
        this.renderGhosts();
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
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new PacManGame();
});