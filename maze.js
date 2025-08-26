class Maze {
    constructor(cols, rows, cellSize, wallDensity = 0.2) {
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        this.wallDensity = wallDensity; // 墙壁密度 0-1
        this.grid = [];
        this.walls = [];
        
        // 迷宫类型定义
        this.EMPTY = 0;
        this.WALL = 1;
        this.PLAYER_START = 2;
        this.GHOST_START = 3;
    }
    
    generate() {
        // 初始化网格
        this.grid = [];
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = this.EMPTY;
            }
        }
        
        // 创建边界墙
        this.createBoundaryWalls();
        
        // 创建内部迷宫结构
        this.createMazeStructure();
        
        // 设置起始位置
        this.setStartPositions();
    }
    
    createBoundaryWalls() {
        // 顶部和底部墙
        for (let x = 0; x < this.cols; x++) {
            this.grid[0][x] = this.WALL;
            this.grid[this.rows - 1][x] = this.WALL;
        }
        
        // 左侧和右侧墙
        for (let y = 0; y < this.rows; y++) {
            this.grid[y][0] = this.WALL;
            this.grid[y][this.cols - 1] = this.WALL;
        }
    }
    
    createMazeStructure() {
        // 创建经典的吃豆人风格迷宫
        console.log('Creating maze with wall density:', this.wallDensity);
        
        // 清理大部分区域，确保有足够的可行走空间
        for (let y = 1; y < this.rows - 1; y++) {
            for (let x = 1; x < this.cols - 1; x++) {
                this.grid[y][x] = this.EMPTY;
            }
        }
        
        // 根据密度调整墙壁数量
        const roomFrequency = Math.max(6, Math.floor(12 - this.wallDensity * 8));
        const roomSize = Math.max(1, Math.floor(3 - this.wallDensity * 2));
        
        // 添加内部墙壁形成通道
        for (let y = 3; y < this.rows - 3; y += roomFrequency) {
            for (let x = 3; x < this.cols - 3; x += roomFrequency) {
                if (Math.random() < this.wallDensity * 2) {
                    this.createRoom(x, y, roomSize, roomSize);
                }
            }
        }
        
        // 水平通道的墙壁
        const horizontalWallChance = this.wallDensity;
        for (let y = 8; y < this.rows - 8; y += Math.max(8, Math.floor(16 - this.wallDensity * 8))) {
            for (let x = 5; x < this.cols - 5; x += 3) {
                if (Math.random() < horizontalWallChance) {
                    this.grid[y][x] = this.WALL;
                }
            }
        }
        
        // 垂直通道的墙壁
        const verticalWallChance = this.wallDensity;
        for (let x = 8; x < this.cols - 8; x += Math.max(8, Math.floor(16 - this.wallDensity * 8))) {
            for (let y = 5; y < this.rows - 5; y += 3) {
                if (Math.random() < verticalWallChance) {
                    this.grid[y][x] = this.WALL;
                }
            }
        }
        
        // 在中央区域创建幽灵屋
        this.createGhostHouse();
        
        // 确保路径连通性
        this.ensureConnectivity();
        
        console.log('Maze structure created with wall density:', this.wallDensity);
    }
    
    createRoom(startX, startY, width, height) {
        for (let y = startY; y < startY + height && y < this.rows; y++) {
            for (let x = startX; x < startX + width && x < this.cols; x++) {
                this.grid[y][x] = this.WALL;
            }
        }
    }
    
    createGhostHouse() {
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);
        
        // 创建中央幽灵屋
        for (let y = centerY - 2; y <= centerY + 2; y++) {
            for (let x = centerX - 3; x <= centerX + 3; x++) {
                if (y === centerY - 2 || y === centerY + 2 || 
                    x === centerX - 3 || x === centerX + 3) {
                    this.grid[y][x] = this.WALL;
                } else {
                    this.grid[y][x] = this.EMPTY;
                }
            }
        }
        
        // 在幽灵屋入口留个口子
        this.grid[centerY - 2][centerX] = this.EMPTY;
    }
    
    ensureConnectivity() {
        // 简单的连通性检查，移除可能阻断路径的墙
        for (let y = 1; y < this.rows - 1; y++) {
            for (let x = 1; x < this.cols - 1; x++) {
                if (this.grid[y][x] === this.WALL) {
                    // 检查是否完全包围了某个区域
                    const neighbors = this.getNeighbors(x, y);
                    const emptyNeighbors = neighbors.filter(n => 
                        this.grid[n.y][n.x] === this.EMPTY
                    );
                    
                    // 如果周围有空地但被隔离，移除这面墙
                    if (emptyNeighbors.length === 1) {
                        this.grid[y][x] = this.EMPTY;
                    }
                }
            }
        }
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];
        
        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;
            
            if (newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
    
    setStartPositions() {
        // 设置玩家起始位置（左下角区域）
        const playerX = Math.floor(this.cols * 0.1);
        const playerY = Math.floor(this.rows * 0.8);
        this.clearArea(playerX, playerY, 3); // 扩大清理区域
        this.grid[playerY][playerX] = this.PLAYER_START;
        
        console.log('Player start position set at:', playerX, playerY);
        console.log('Cleared area around player start');
        
        // 确保玩家起始位置周围至少有一条可行走的路径
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const x = playerX + dx;
                const y = playerY + dy;
                if (x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
                    this.grid[y][x] = this.EMPTY;
                }
            }
        }
        
        // 设置幽灵起始位置（中央区域）
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);
        
        const ghostPositions = [
            { x: centerX - 1, y: centerY },
            { x: centerX + 1, y: centerY },
            { x: centerX, y: centerY - 1 },
            { x: centerX, y: centerY + 1 }
        ];
        
        for (const pos of ghostPositions) {
            if (pos.x >= 0 && pos.x < this.cols && pos.y >= 0 && pos.y < this.rows) {
                this.grid[pos.y][pos.x] = this.GHOST_START;
            }
        }
        
        console.log('Start positions configured');
    }
    
    clearArea(centerX, centerY, radius) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                    if (this.grid[y][x] === this.WALL) {
                        this.grid[y][x] = this.EMPTY;
                    }
                }
            }
        }
    }
    
    isWalkable(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
            return false;
        }
        return this.grid[y][x] !== this.WALL;
    }
    
    getPlayerStartPosition() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === this.PLAYER_START) {
                    console.log('Found player start at:', x, y);
                    return { x, y };
                }
            }
        }
        
        // 如果没找到，返回默认位置
        const defaultX = Math.floor(this.cols * 0.1);
        const defaultY = Math.floor(this.rows * 0.8);
        console.log('Using default player start at:', defaultX, defaultY);
        return { x: defaultX, y: defaultY };
    }
    
    getGhostStartPositions() {
        const positions = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === this.GHOST_START) {
                    positions.push({ x, y });
                }
            }
        }
        
        // 如果没找到，返回默认位置
        if (positions.length === 0) {
            const centerX = Math.floor(this.cols / 2);
            const centerY = Math.floor(this.rows / 2);
            positions.push(
                { x: centerX - 1, y: centerY },
                { x: centerX + 1, y: centerY },
                { x: centerX, y: centerY - 1 },
                { x: centerX, y: centerY + 1 }
            );
        }
        
        return positions;
    }
    
    render(ctx) {
        // 不再在这里设置颜色，由renderWall方法处理
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === this.WALL) {
                    this.renderWall(ctx, x, y);
                }
            }
        }
    }
    
    renderWall(ctx, gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        
        // 检查相邻的墙壁来决定如何绘制
        const hasTop = gridY > 0 && this.grid[gridY - 1][gridX] === this.WALL;
        const hasBottom = gridY < this.rows - 1 && this.grid[gridY + 1][gridX] === this.WALL;
        const hasLeft = gridX > 0 && this.grid[gridY][gridX - 1] === this.WALL;
        const hasRight = gridX < this.cols - 1 && this.grid[gridY][gridX + 1] === this.WALL;
        
        // 创建渐变效果
        const gradient = ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
        gradient.addColorStop(0, '#1e3a8a'); // 深蓝色
        gradient.addColorStop(0.5, '#3b82f6'); // 中蓝色
        gradient.addColorStop(1, '#1e40af'); // 暗蓝色
        
        // 绘制基本方块
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 添加边框和高光效果
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, this.cellSize - 1, this.cellSize - 1);
        
        // 顶部高光
        if (!hasTop) {
            ctx.fillStyle = '#93c5fd';
            ctx.fillRect(x + 1, y, this.cellSize - 2, 2);
        }
        
        // 左侧高光
        if (!hasLeft) {
            ctx.fillStyle = '#93c5fd';
            ctx.fillRect(x, y + 1, 2, this.cellSize - 2);
        }
        
        // 底部阴影
        if (!hasBottom) {
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(x + 1, y + this.cellSize - 2, this.cellSize - 2, 2);
        }
        
        // 右侧阴影
        if (!hasRight) {
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(x + this.cellSize - 2, y + 1, 2, this.cellSize - 2);
        }
    }
    
    // 获取指定位置周围的可行走区域
    getWalkableNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];
        
        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;
            
            if (this.isWalkable(newX, newY)) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
    
    // 计算两点间的曼哈顿距离
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }
    
    // 检查位置是否在边界
    isAtBoundary(x, y) {
        return x === 0 || x === this.cols - 1 || y === 0 || y === this.rows - 1;
    }
}