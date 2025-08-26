// 游戏主程序
let game = null;

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('找不到游戏画布元素');
        return;
    }
    
    // 检查浏览器是否支持Canvas
    if (!canvas.getContext) {
        alert('您的浏览器不支持HTML5 Canvas，请升级浏览器！');
        return;
    }
    
    // 设置画布自适应大小
    setupCanvasSize(canvas);
    
    // 初始化移动端控制
    setupMobileControls();
    
    // 初始化游戏
    try {
        game = new Game(canvas);
        game.start();
        console.log('游戏初始化成功！');
    } catch (error) {
        console.error('游戏初始化失败：', error);
        alert('游戏初始化失败，请刷新页面重试！');
    }
});

// 设置画布自适应大小
function setupCanvasSize(canvas) {
    const container = canvas.parentElement;
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // 移动端适配
        const maxWidth = Math.min(window.innerWidth - 20, 600);
        const maxHeight = Math.min(window.innerHeight * 0.6, 450);
        
        // 保持16:10的宽高比
        let width = maxWidth;
        let height = (maxWidth * 10) / 16;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = (maxHeight * 16) / 10;
        }
        
        canvas.width = Math.floor(width / 20) * 20; // 确保是20的倍数
        canvas.height = Math.floor(height / 20) * 20;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
    } else {
        // 桌面端保持原始大小
        canvas.width = 800;
        canvas.height = 600;
    }
}

// 移动端控制设置
function setupMobileControls() {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isMobile) return;
    
    // 显示移动端控制器
    const mobileControls = document.querySelector('.mobile-controls');
    const actionButtons = document.querySelector('.action-buttons');
    
    if (mobileControls) mobileControls.style.display = 'block';
    if (actionButtons) actionButtons.style.display = 'block';
    
    // 方向控制
    const dpadButtons = document.querySelectorAll('.dpad-button[data-direction]');
    dpadButtons.forEach(button => {
        const direction = button.getAttribute('data-direction');
        
        // 触摸开始
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (game && game.state === 'PLAYING') {
                handleDirectionInput(direction);
            }
            button.style.transform = button.style.transform.replace('scale(0.95)', '') + ' scale(0.95)';
        });
        
        // 触摸结束
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.transform = button.style.transform.replace(' scale(0.95)', '');
        });
        
        // 防止触摸取消
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            button.style.transform = button.style.transform.replace(' scale(0.95)', '');
        });
    });
    
    // 暂停按钮
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (game) {
                if (game.state === 'MENU' || game.state === 'GAME_OVER') {
                    game.startGame();
                } else {
                    game.togglePause();
                }
            }
        });
    }
    
    // 禁用页面滚动和缩放
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // 阻止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// 处理方向输入
function handleDirectionInput(direction) {
    if (!game) return;
    
    // 如果在菜单或游戏结束状态，先开始游戏
    if (game.state === 'MENU' || game.state === 'GAME_OVER') {
        game.startGame();
        return;
    }
    
    // 如果游戏正在进行，设置移动方向
    if (game.state === 'PLAYING' && game.player) {
        switch (direction) {
            case 'up':
                game.player.setDirection(0, -1);
                break;
            case 'down':
                game.player.setDirection(0, 1);
                break;
            case 'left':
                game.player.setDirection(-1, 0);
                break;
            case 'right':
                game.player.setDirection(1, 0);
                break;
        }
    }
}

// 处理窗口大小变化
window.addEventListener('resize', function() {
    if (game && game.canvas) {
        setupCanvasSize(game.canvas);
        // 重新计算游戏对象的尺寸
        if (game.maze) {
            game.cellSize = 20;
            game.rows = game.canvas.height / game.cellSize;
            game.cols = game.canvas.width / game.cellSize;
            game.setupLevel(); // 重新设置关卡
        }
    }
});

// 处理页面失去焦点时自动暂停
document.addEventListener('visibilitychange', function() {
    if (game && document.hidden && game.state === 'PLAYING') {
        game.togglePause();
    }
});

// 添加一些调试功能（仅在开发模式下）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 添加调试快捷键
    document.addEventListener('keydown', function(e) {
        if (!game) return;
        
        switch (e.code) {
            case 'KeyG': // G键 - 显示网格
                if (e.ctrlKey) {
                    e.preventDefault();
                    toggleDebugGrid();
                }
                break;
            case 'KeyR': // R键 - 重置游戏
                if (e.ctrlKey) {
                    e.preventDefault();
                    game.startGame();
                }
                break;
            case 'KeyL': // L键 - 增加生命
                if (e.ctrlKey && e.shiftKey) {
                    e.preventDefault();
                    game.lives++;
                    game.updateUI();
                }
                break;
            case 'KeyS': // S键 - 增加分数
                if (e.ctrlKey && e.shiftKey) {
                    e.preventDefault();
                    game.score += 1000;
                    game.updateUI();
                }
                break;
            case 'KeyM': // M键 - 切换音效
                if (e.ctrlKey) {
                    e.preventDefault();
                    const enabled = SoundManager.toggle();
                    console.log('音效已' + (enabled ? '开启' : '关闭'));
                }
                break;
        }
    });
    
    let debugGrid = false;
    function toggleDebugGrid() {
        debugGrid = !debugGrid;
        if (debugGrid) {
            console.log('调试网格已开启');
        } else {
            console.log('调试网格已关闭');
        }
    }
    
    // 添加性能监控
    let frameCount = 0;
    let lastFpsTime = performance.now();
    
    function updateFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastFpsTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsTime));
            document.title = `吃豆人游戏 - FPS: ${fps}`;
            frameCount = 0;
            lastFpsTime = currentTime;
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    // 启动FPS监控
    updateFPS();
    
    console.log('调试模式已启用');
    console.log('快捷键:');
    console.log('Ctrl + G: 切换网格显示');
    console.log('Ctrl + R: 重置游戏');
    console.log('Ctrl + Shift + L: 增加生命');
    console.log('Ctrl + Shift + S: 增加分数');
    console.log('Ctrl + M: 切换音效');
}

// 振动反馈管理器
const VibrationManager = {
    enabled: 'vibrate' in navigator,
    
    vibrate: function(pattern) {
        if (this.enabled && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                console.warn('振动功能失败:', e);
            }
        }
    },
    
    // 预定义振动模式
    short: function() {
        this.vibrate(50);
    },
    
    medium: function() {
        this.vibrate(100);
    },
    
    long: function() {
        this.vibrate(200);
    },
    
    pattern: function() {
        this.vibrate([50, 50, 50]);
    }
};

// 性能优化管理器
const PerformanceManager = {
    isLowPerformance: false,
    frameTime: 0,
    frameCount: 0,
    
    checkPerformance: function(deltaTime) {
        this.frameTime += deltaTime;
        this.frameCount++;
        
        if (this.frameCount >= 60) {
            const avgFrameTime = this.frameTime / this.frameCount;
            this.isLowPerformance = avgFrameTime > 20; // 如果平均帧时间超过20ms
            
            this.frameTime = 0;
            this.frameCount = 0;
        }
        
        return this.isLowPerformance;
    },
    
    getOptimizedSettings: function() {
        return {
            reducedEffects: this.isLowPerformance,
            simpleRendering: this.isLowPerformance,
            reducedParticles: this.isLowPerformance
        };
    }
};

// 游戏工具函数
const GameUtils = {
    // 计算两点间距离
    distance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    // 角度转弧度
    toRadians: function(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    // 弧度转角度
    toDegrees: function(radians) {
        return radians * (180 / Math.PI);
    },
    
    // 限制数值在指定范围内
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // 线性插值
    lerp: function(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    // 检查矩形碰撞
    rectCollision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // 检查圆形碰撞
    circleCollision: function(circle1, circle2) {
        const distance = this.distance(circle1.x, circle1.y, circle2.x, circle2.y);
        return distance < circle1.radius + circle2.radius;
    },
    
    // 生成随机整数
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 生成随机浮点数
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // 从数组中随机选择元素
    randomChoice: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// 音效管理器（占位，以后可以添加音效）
const SoundManager = {
    sounds: {},
    enabled: true,
    
    load: function(name, url) {
        // 加载音效文件
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            this.sounds[name] = audio;
        } catch (e) {
            console.warn('音效加载失败:', e);
        }
    },
    
    play: function(name, volume = 0.5) {
        // 播放音效
        if (!this.enabled || !this.sounds[name]) return;
        
        try {
            const audio = this.sounds[name].cloneNode();
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.play().catch(e => {
                console.warn('音效播放失败:', e);
            });
        } catch (e) {
            console.warn('音效播放异常:', e);
        }
    },
    
    // 创建简单的音效（使用Web Audio API）
    createTone: function(frequency, duration, type = 'sine') {
        if (!this.enabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.warn('音效生成失败:', e);
        }
    },
    
    // 游戏音效
    playEatPellet: function() {
        this.createTone(800, 0.1);
    },
    
    playEatPowerPellet: function() {
        this.createTone(400, 0.3);
    },
    
    playEatGhost: function() {
        this.createTone(1000, 0.2);
    },
    
    playDeath: function() {
        this.createTone(200, 0.5, 'sawtooth');
    },
    
    toggle: function() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

// 本地存储管理器
const StorageManager = {
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('保存数据失败:', e);
            return false;
        }
    },
    
    load: function(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('加载数据失败:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('删除数据失败:', e);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('清空数据失败:', e);
            return false;
        }
    }
};

// 导出全局对象（如果需要在其他文件中使用）
window.GameUtils = GameUtils;
window.SoundManager = SoundManager;
window.StorageManager = StorageManager;
window.VibrationManager = VibrationManager;
window.PerformanceManager = PerformanceManager;