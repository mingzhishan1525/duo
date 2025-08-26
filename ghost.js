class Ghost {
    constructor(x, y, cellSize, color, speed = 80, scaredSpeed = 50, aggression = 0.6) {
        this.startX = x;
        this.startY = y;
        this.x = x * cellSize + cellSize / 2;
        this.y = y * cellSize + cellSize / 2;
        this.cellSize = cellSize;
        this.color = color;
        
        // 移动相关
        this.dirX = 0;
        this.dirY = 0;
        this.speed = speed; // 可配置速度
        this.scaredSpeed = scaredSpeed; // 恐惧状态下的速度
        
        // AI相关
        this.mode = 'chase'; // chase, scared, returning
        this.scared = false;
        this.target = { x: 0, y: 0 };
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 200; // 最小方向改变间隔
        this.aggression = aggression; // 激进程度 0-1，影响AI行为
        
        // 动画相关
        this.animationTime = 0;
        this.radius = cellSize * 0.4;
        
        // 寻路相关
        this.path = [];
        this.pathIndex = 0;
        this.recalculatePathInterval = Math.floor(500 / aggression); // 激进度越高，重新计算越频繁
        this.lastPathCalculation = 0;
    }
    
    setScared(scared) {
        this.scared = scared;
        this.mode = scared ? 'scared' : 'chase';
        if (scared) {
            // 恐惧时立即改变方向
            this.dirX = -this.dirX;
            this.dirY = -this.dirY;
        }
    }
    
    update(deltaTime, maze, player) {
        this.animationTime += deltaTime / 1000;
        this.lastDirectionChange += deltaTime;
        this.lastPathCalculation += deltaTime;
        
        // 更新目标位置
        this.updateTarget(player);
        
        // 更新路径
        if (this.lastPathCalculation >= this.recalculatePathInterval) {
            this.calculatePath(maze);
            this.lastPathCalculation = 0;
        }
        
        // 移动幽灵
        this.move(deltaTime, maze);
        
        // 处理边界穿越
        this.handleBoundaryWrap(maze);
    }
    
    updateTarget(player) {
        const playerGrid = player.getGridPosition();
        const predictDistance = Math.floor(4 * this.aggression); // 激进度影响预测距离
        
        switch (this.mode) {
            case 'chase':
                // 追踪玩家，激进度越高预测距离越远
                const playerDir = player.getDirection();
                this.target = {
                    x: playerGrid.x + playerDir.x * predictDistance,
                    y: playerGrid.y + playerDir.y * predictDistance
                };
                break;
            case 'scared':
                // 逃离玩家
                const myGrid = this.getGridPosition();
                const escapeDistance = Math.floor(6 * (1 - this.aggression)); // 激进度越高逃跑距离越短
                this.target = {
                    x: myGrid.x + (myGrid.x - playerGrid.x) * escapeDistance,
                    y: myGrid.y + (myGrid.y - playerGrid.y) * escapeDistance
                };
                break;
            case 'returning':
                // 返回起始位置
                this.target = {
                    x: this.startX,
                    y: this.startY
                };
                break;
        }
    }
    
    calculatePath(maze) {
        const start = this.getGridPosition();
        const end = this.target;
        
        // 简单的A*路径查找算法
        this.path = this.findPath(start, end, maze);
        this.pathIndex = 0;
    }
    
    findPath(start, end, maze) {
        // 简化的寻路算法 - 使用广度优先搜索
        const queue = [{ x: start.x, y: start.y, path: [] }];
        const visited = new Set();
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // 到达目标
            if (current.x === end.x && current.y === end.y) {
                return current.path;
            }
            
            // 限制搜索深度
            if (current.path.length > 20) continue;
            
            // 探索邻近节点
            for (const dir of directions) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                const newKey = `${newX},${newY}`;
                
                if (!visited.has(newKey) && maze.isWalkable(newX, newY)) {
                    queue.push({
                        x: newX,
                        y: newY,
                        path: [...current.path, { x: newX, y: newY }]
                    });
                }
            }
        }
        
        return []; // 没有找到路径
    }
    
    move(deltaTime, maze) {
        const currentSpeed = this.scared ? this.scaredSpeed : this.speed;
        const moveDistance = currentSpeed * (deltaTime / 1000);
        
        // 如果有路径，跟随路径移动
        if (this.path.length > 0 && this.pathIndex < this.path.length) {
            const targetCell = this.path[this.pathIndex];
            const targetX = targetCell.x * this.cellSize + this.cellSize / 2;
            const targetY = targetCell.y * this.cellSize + this.cellSize / 2;
            
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 5) {
                // 到达当前路径点，移动到下一个
                this.pathIndex++;
                this.x = targetX;
                this.y = targetY;
            } else {
                // 向目标点移动
                this.dirX = dx / distance;
                this.dirY = dy / distance;
                this.x += this.dirX * moveDistance;
                this.y += this.dirY * moveDistance;
            }
        } else {
            // 没有路径时的随机移动
            this.randomMove(deltaTime, maze);
        }
    }
    
    randomMove(deltaTime, maze) {
        const currentSpeed = this.scared ? this.scaredSpeed : this.speed;
        const moveDistance = currentSpeed * (deltaTime / 1000);
        
        // 如果当前方向被阻挡或需要改变方向
        if (this.lastDirectionChange >= this.directionChangeInterval || 
            !this.canMoveInDirection(this.dirX, this.dirY, maze)) {
            
            this.chooseNewDirection(maze);
            this.lastDirectionChange = 0;
        }
        
        // 移动
        const newX = this.x + this.dirX * moveDistance;
        const newY = this.y + this.dirY * moveDistance;
        
        if (this.canMoveTo(newX, newY, maze)) {
            this.x = newX;
            this.y = newY;
        } else {
            this.chooseNewDirection(maze);
        }
    }
    
    chooseNewDirection(maze) {
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];
        
        // 过滤掉不可行的方向
        const validDirections = directions.filter(dir => 
            this.canMoveInDirection(dir.x, dir.y, maze)
        );
        
        if (validDirections.length > 0) {
            // 避免立即掉头（除非是唯一选择）
            const nonReverseDirections = validDirections.filter(dir =>
                !(dir.x === -this.dirX && dir.y === -this.dirY)
            );
            
            const availableDirections = nonReverseDirections.length > 0 ? 
                nonReverseDirections : validDirections;
            
            // 随机选择方向
            const randomDir = availableDirections[
                Math.floor(Math.random() * availableDirections.length)
            ];
            
            this.dirX = randomDir.x;
            this.dirY = randomDir.y;
        }
    }
    
    canMoveInDirection(dirX, dirY, maze) {
        const testDistance = this.cellSize / 2;
        const newX = this.x + dirX * testDistance;
        const newY = this.y + dirY * testDistance;
        return this.canMoveTo(newX, newY, maze);
    }
    
    canMoveTo(x, y, maze) {
        const margin = this.radius - 2;
        
        const corners = [
            { x: x - margin, y: y - margin },
            { x: x + margin, y: y - margin },
            { x: x - margin, y: y + margin },
            { x: x + margin, y: y + margin }
        ];
        
        for (const corner of corners) {
            const gridX = Math.floor(corner.x / this.cellSize);
            const gridY = Math.floor(corner.y / this.cellSize);
            
            if (!maze.isWalkable(gridX, gridY)) {
                return false;
            }
        }
        
        return true;
    }
    
    handleBoundaryWrap(maze) {
        if (this.x < -this.radius) {
            this.x = maze.cols * this.cellSize + this.radius;
        } else if (this.x > maze.cols * this.cellSize + this.radius) {
            this.x = -this.radius;
        }
    }
    
    reset() {
        this.x = this.startX * this.cellSize + this.cellSize / 2;
        this.y = this.startY * this.cellSize + this.cellSize / 2;
        this.dirX = 0;
        this.dirY = 0;
        this.scared = false;
        this.mode = 'chase';
        this.path = [];
        this.pathIndex = 0;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(2, 2, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // 幽灵身体颜色
        let bodyColor = this.color;
        if (this.scared) {
            bodyColor = Math.floor(this.animationTime * 4) % 2 ? '#4169e1' : '#ffffff';
        }
        
        // 创建渐变效果
        const gradient = ctx.createRadialGradient(0, -this.radius * 0.3, 0, 0, 0, this.radius);
        if (this.scared) {
            gradient.addColorStop(0, bodyColor);
            gradient.addColorStop(1, bodyColor);
        } else {
            gradient.addColorStop(0, this.lightenColor(bodyColor, 30));
            gradient.addColorStop(0.7, bodyColor);
            gradient.addColorStop(1, this.darkenColor(bodyColor, 20));
        }
        
        ctx.fillStyle = gradient;
        
        // 绘制幽灵身体
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.2, this.radius, Math.PI, 0);
        ctx.lineTo(this.radius, this.radius);
        
        // 绘制底部锯齿
        const numTeeth = 4;
        const toothWidth = (this.radius * 2) / numTeeth;
        for (let i = 0; i < numTeeth; i++) {
            const x1 = this.radius - i * toothWidth;
            const x2 = this.radius - (i + 0.5) * toothWidth;
            const x3 = this.radius - (i + 1) * toothWidth;
            ctx.lineTo(x1, this.radius);
            ctx.lineTo(x2, this.radius * 0.7);
            ctx.lineTo(x3, this.radius);
        }
        
        ctx.lineTo(-this.radius, this.radius);
        ctx.closePath();
        ctx.fill();
        
        // 添加边框
        ctx.strokeStyle = this.scared ? '#000' : this.darkenColor(bodyColor, 30);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 绘制眼睛
        if (!this.scared) {
            // 正常状态的眼睛
            ctx.fillStyle = '#ffffff';
            // 左眼
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
            // 右眼
            ctx.beginPath();
            ctx.arc(this.radius * 0.3, -this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 瞳孔
            ctx.fillStyle = '#000000';
            // 左瞳孔
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3 + this.dirX * 3, -this.radius * 0.3 + this.dirY * 3, this.radius * 0.1, 0, Math.PI * 2);
            ctx.fill();
            // 右瞳孔
            ctx.beginPath();
            ctx.arc(this.radius * 0.3 + this.dirX * 3, -this.radius * 0.3 + this.dirY * 3, this.radius * 0.1, 0, Math.PI * 2);
            ctx.fill();
            
            // 眼睛高光
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.35, -this.radius * 0.35, this.radius * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.radius * 0.25, -this.radius * 0.35, this.radius * 0.04, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // 恐惧状态的眼睛
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            // 左眼
            ctx.beginPath();
            ctx.moveTo(-this.radius * 0.4, -this.radius * 0.4);
            ctx.lineTo(-this.radius * 0.2, -this.radius * 0.2);
            ctx.moveTo(-this.radius * 0.2, -this.radius * 0.4);
            ctx.lineTo(-this.radius * 0.4, -this.radius * 0.2);
            ctx.stroke();
            // 右眼
            ctx.beginPath();
            ctx.moveTo(this.radius * 0.2, -this.radius * 0.4);
            ctx.lineTo(this.radius * 0.4, -this.radius * 0.2);
            ctx.moveTo(this.radius * 0.4, -this.radius * 0.4);
            ctx.lineTo(this.radius * 0.2, -this.radius * 0.2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    getGridPosition() {
        return {
            x: Math.floor(this.x / this.cellSize),
            y: Math.floor(this.y / this.cellSize)
        };
    }
    
    // 颜色辅助方法
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
}