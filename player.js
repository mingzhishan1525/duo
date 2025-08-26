class Player {
    constructor(x, y, cellSize, speed = 100) {
        this.startX = x;
        this.startY = y;
        this.x = x * cellSize + cellSize / 2;
        this.y = y * cellSize + cellSize / 2;
        this.cellSize = cellSize;
        
        // 移动相关
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
        this.speed = speed; // 可配置速度
        
        // 动画相关
        this.animationTime = 0;
        this.mouthOpen = 0; // 0到1之间，表示嘴巴张开程度
        this.mouthSpeed = 8; // 嘴巴开合速度
        
        // 渲染属性
        this.radius = cellSize * 0.4;
        this.color = '#ffff00';
    }
    
    setDirection(dirX, dirY) {
        this.nextDirX = dirX;
        this.nextDirY = dirY;
    }
    
    update(deltaTime, maze) {
        this.animationTime += deltaTime / 1000;
        
        // 更新嘴巴动画
        this.mouthOpen = (Math.sin(this.animationTime * this.mouthSpeed) + 1) / 2;
        
        // 简化的移动逻辑 - 直接应用方向
        if (this.nextDirX !== 0 || this.nextDirY !== 0) {
            this.dirX = this.nextDirX;
            this.dirY = this.nextDirY;
            // 清除下一个方向
            this.nextDirX = 0;
            this.nextDirY = 0;
        }
        
        // 移动玩家
        const moveDistance = this.speed * (deltaTime / 1000);
        const newX = this.x + this.dirX * moveDistance;
        const newY = this.y + this.dirY * moveDistance;
        
        // 简化的碰撞检测 - 只检查中心点
        const gridX = Math.floor(newX / this.cellSize);
        const gridY = Math.floor(newY / this.cellSize);
        
        if (maze.isWalkable(gridX, gridY)) {
            this.x = newX;
            this.y = newY;
        }
        
        // 处理边界穿越
        this.handleBoundaryWrap(maze);
    }
    
    canMoveTo(x, y, maze) {
        const margin = this.radius - 2;
        
        // 检查四个角点
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
        // 左右边界穿越
        if (this.x < -this.radius) {
            this.x = maze.cols * this.cellSize + this.radius;
        } else if (this.x > maze.cols * this.cellSize + this.radius) {
            this.x = -this.radius;
        }
        
        // 上下边界穿越（通常不需要）
        if (this.y < -this.radius) {
            this.y = maze.rows * this.cellSize + this.radius;
        } else if (this.y > maze.rows * this.cellSize + this.radius) {
            this.y = -this.radius;
        }
    }
    
    reset(gridX, gridY) {
        this.x = gridX * this.cellSize + this.cellSize / 2;
        this.y = gridY * this.cellSize + this.cellSize / 2;
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
    }
    
    render(ctx) {
        ctx.save();
        
        // 移动到玩家位置
        ctx.translate(this.x, this.y);
        
        // 根据移动方向旋转
        if (this.dirX > 0) {
            // 向右
            ctx.rotate(0);
        } else if (this.dirX < 0) {
            // 向左
            ctx.rotate(Math.PI);
        } else if (this.dirY > 0) {
            // 向下
            ctx.rotate(Math.PI / 2);
        } else if (this.dirY < 0) {
            // 向上
            ctx.rotate(-Math.PI / 2);
        }
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(2, 2, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制身体渐变
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, '#ffff99');
        gradient.addColorStop(0.7, '#ffff00');
        gradient.addColorStop(1, '#cccc00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        if (this.mouthOpen > 0.1) {
            // 绘制吃豆人形状（有嘴巴）
            const mouthAngle = Math.PI * 0.3 * this.mouthOpen;
            ctx.arc(0, 0, this.radius, mouthAngle, 2 * Math.PI - mouthAngle);
            ctx.lineTo(0, 0);
        } else {
            // 绘制完整圆形
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        }
        
        ctx.fill();
        
        // 添加边框
        ctx.strokeStyle = '#e6e600';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 绘制眼睛
        if (this.dirY !== 0 || this.dirX === 0) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.15, 0, 2 * Math.PI);
            ctx.fill();
            
            // 眼睛高光
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.35, -this.radius * 0.35, this.radius * 0.05, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // 获取当前网格位置
    getGridPosition() {
        return {
            x: Math.floor(this.x / this.cellSize),
            y: Math.floor(this.y / this.cellSize)
        };
    }
    
    // 获取当前移动方向
    getDirection() {
        return { x: this.dirX, y: this.dirY };
    }
    
    // 检查是否在移动
    isMoving() {
        return this.dirX !== 0 || this.dirY !== 0;
    }
}