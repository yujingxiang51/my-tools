// 游戏类集合
class Games {
    constructor() {
        this.container = document.getElementById('game-container');
        this.backBtn = document.getElementById('backBtn');
        this.gameMenu = document.querySelector('.game-menu');
        this.currentGame = null;

        this.init();
    }

    init() {
        // 绑定游戏卡片点击事件
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameName = card.dataset.game;
                this.startGame(gameName);
            });
        });

        // 绑定返回按钮事件
        this.backBtn.addEventListener('click', () => {
            this.stopGame();
        });
    }

    startGame(gameName) {
        this.gameMenu.style.display = 'none';
        this.container.style.display = 'block';
        this.container.classList.add('active');
        this.backBtn.style.display = 'block';

        switch(gameName) {
            case 'whack-a-mole':
                this.currentGame = new WhackAMole(this.container);
                break;
            case 'number-guess':
                this.currentGame = new NumberGuess(this.container);
                break;
            case 'memory-match':
                this.currentGame = new MemoryMatch(this.container);
                break;
            case 'breakout':
                this.currentGame = new Breakout(this.container);
                break;
        }
    }

    stopGame() {
        if (this.currentGame) {
            this.currentGame.destroy();
            this.currentGame = null;
        }
        this.container.style.display = 'none';
        this.container.classList.remove('active');
        this.container.innerHTML = '';
        this.backBtn.style.display = 'none';
        this.gameMenu.style.display = 'grid';
    }
}

// 打地鼠游戏
class WhackAMole {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.isPlaying = false;
        this.interval = null;
        this.moleTimeout = null;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h2>🔨 打地鼠</h2>
                <p>快速点击出现的地鼠！</p>
            </div>
            <div class="game-stats">
                <div class="stat-item">
                    <span id="mole-score">0</span>
                    <label>得分</label>
                </div>
                <div class="stat-item">
                    <span id="mole-time">30</span>
                    <label>剩余时间</label>
                </div>
            </div>
            <button class="game-start-btn" id="mole-start-btn">开始游戏</button>
            <div class="mole-grid">
                ${Array(9).fill().map((_, i) => `
                    <div class="mole-hole" data-index="${i}">
                        <div class="mole">🐹</div>
                    </div>
                `).join('')}
            </div>
        `;

        this.scoreDisplay = document.getElementById('mole-score');
        this.timeDisplay = document.getElementById('mole-time');
        this.holes = document.querySelectorAll('.mole-hole');

        document.getElementById('mole-start-btn').addEventListener('click', () => this.startGame());
        this.holes.forEach(hole => {
            hole.addEventListener('click', () => this.whackMole(hole));
        });
    }

    startGame() {
        this.score = 0;
        this.isPlaying = true;
        this.scoreDisplay.textContent = '0';
        this.timeDisplay.textContent = '30';
        document.getElementById('mole-start-btn').style.display = 'none';

        let timeLeft = 30;
        this.interval = setInterval(() => {
            timeLeft--;
            this.timeDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);

        this.showMole();
    }

    showMole() {
        if (!this.isPlaying) return;

        const mole = document.querySelector('.mole');
        mole.classList.remove('up');

        this.moleTimeout = setTimeout(() => {
            const randomHole = Math.floor(Math.random() * this.holes.length);
            const mole = this.holes[randomHole].querySelector('.mole');
            mole.classList.add('up');

            setTimeout(() => {
                mole.classList.remove('up');
                this.showMole();
            }, 800 + Math.random() * 400);
        }, 200 + Math.random() * 300);
    }

    whackMole(hole) {
        const mole = hole.querySelector('.mole');
        if (mole.classList.contains('up') && this.isPlaying) {
            mole.classList.remove('up');
            this.score += 10;
            this.scoreDisplay.textContent = this.score;

            // 添加点击效果
            hole.style.transform = 'scale(0.9)';
            setTimeout(() => {
                hole.style.transform = 'scale(1)';
            }, 100);
        }
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.interval);
        clearTimeout(this.moleTimeout);
        document.querySelectorAll('.mole').forEach(mole => mole.classList.remove('up'));
        document.getElementById('mole-start-btn').style.display = 'block';
        document.getElementById('mole-start-btn').textContent = '再玩一次';
        alert(`游戏结束！你的得分是：${this.score}`);
    }

    destroy() {
        clearInterval(this.interval);
        clearTimeout(this.moleTimeout);
        this.isPlaying = false;
    }
}

// 数字猜谜游戏
class NumberGuess {
    constructor(container) {
        this.container = container;
        this.targetNumber = Math.floor(Math.random() * 100) + 1;
        this.guesses = [];
        this.maxGuesses = 7;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h2>🔢 数字猜谜</h2>
                <p>猜一个1-100之间的数字</p>
            </div>
            <div class="game-stats">
                <div class="stat-item">
                    <span id="guess-remaining">${this.maxGuesses}</span>
                    <label>剩余次数</label>
                </div>
            </div>
            <div class="guess-container">
                <input type="number" class="guess-input" id="guess-input" min="1" max="100" placeholder="?">
                <button class="game-start-btn" id="guess-submit">猜一猜</button>
                <p class="guess-message" id="guess-message"></p>
                <div class="guess-history">
                    <h3>历史记录：</h3>
                    <p id="guess-history-list">暂无记录</p>
                </div>
            </div>
        `;

        this.input = document.getElementById('guess-input');
        this.message = document.getElementById('guess-message');
        this.history = document.getElementById('guess-history-list');
        this.remainingDisplay = document.getElementById('guess-remaining');

        document.getElementById('guess-submit').addEventListener('click', () => this.makeGuess());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
    }

    makeGuess() {
        const guess = parseInt(this.input.value);

        if (isNaN(guess) || guess < 1 || guess > 100) {
            this.message.textContent = '请输入1-100之间的数字';
            this.message.style.color = '#666';
            return;
        }

        if (this.guesses.includes(guess)) {
            this.message.textContent = '这个数字已经猜过了';
            this.message.style.color = '#666';
            return;
        }

        this.guesses.push(guess);
        const remaining = this.maxGuesses - this.guesses.length;
        this.remainingDisplay.textContent = remaining;

        if (guess === this.targetNumber) {
            this.message.textContent = `🎉 恭喜你！答案是 ${this.targetNumber}！`;
            this.message.style.color = '#28a745';
            this.endGame(true);
        } else if (remaining === 0) {
            this.message.textContent = `😢 游戏结束！答案是 ${this.targetNumber}`;
            this.message.style.color = '#dc3545';
            this.endGame(false);
        } else if (guess < this.targetNumber) {
            this.message.textContent = '太大了，再小一点！';
            this.message.style.color = '#ffc107';
        } else {
            this.message.textContent = '太小了，再大一点！';
            this.message.style.color = '#ffc107';
        }

        this.updateHistory();
        this.input.value = '';
        this.input.focus();
    }

    updateHistory() {
        if (this.guesses.length === 0) {
            this.history.textContent = '暂无记录';
        } else {
            const history = this.guesses.map(g => {
                const relation = g < this.targetNumber ? ' < ' : ' > ';
                return `${g} ${relation} 目标`;
            }).join(', ');
            this.history.textContent = history;
        }
    }

    endGame(won) {
        this.input.disabled = true;
        document.getElementById('guess-submit').textContent = '再玩一次';
        document.getElementById('guess-submit').onclick = () => {
            this.targetNumber = Math.floor(Math.random() * 100) + 1;
            this.guesses = [];
            this.input.disabled = false;
            this.input.value = '';
            this.message.textContent = '';
            this.history.textContent = '暂无记录';
            this.remainingDisplay.textContent = this.maxGuesses;
            document.getElementById('guess-submit').onclick = () => this.makeGuess();
            document.getElementById('guess-submit').textContent = '猜一猜';
            this.input.focus();
        };
    }

    destroy() {
        // 清理资源
    }
}

// 记忆翻牌游戏
class MemoryMatch {
    constructor(container) {
        this.container = container;
        this.cards = ['🎈', '🎁', '🎨', '🎭', '🎪', '🎢', '🎡', '🎠'];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h2>🎴 记忆翻牌</h2>
                <p>找出所有配对的卡片</p>
            </div>
            <div class="game-stats">
                <div class="stat-item">
                    <span id="memory-moves">0</span>
                    <label>步数</label>
                </div>
                <div class="stat-item">
                    <span id="memory-pairs">0/8</span>
                    <label>配对</label>
                </div>
            </div>
            <button class="game-start-btn" id="memory-reset">重新开始</button>
            <div class="memory-grid">
                ${this.createCards()}
            </div>
        `;

        this.movesDisplay = document.getElementById('memory-moves');
        this.pairsDisplay = document.getElementById('memory-pairs');

        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });

        document.getElementById('memory-reset').addEventListener('click', () => this.resetGame());
    }

    createCards() {
        const shuffled = [...this.cards, ...this.cards]
            .sort(() => Math.random() - 0.5);
        return shuffled.map((emoji, i) => `
            <div class="memory-card" data-card="${emoji}" data-index="${i}">❓</div>
        `).join('');
    }

    flipCard(card) {
        if (this.isLocked || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        card.textContent = card.dataset.card;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesDisplay.textContent = this.moves;
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;
        const isMatch = card1.dataset.card === card2.dataset.card;

        if (isMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            this.pairsDisplay.textContent = `${this.matchedPairs}/8`;
            this.flippedCards = [];
            this.isLocked = false;

            if (this.matchedPairs === 8) {
                setTimeout(() => {
                    alert(`🎉 恭喜完成！用了 ${this.moves} 步`);
                }, 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.textContent = '❓';
                card2.textContent = '❓';
                this.flippedCards = [];
                this.isLocked = false;
            }, 1000);
        }
    }

    resetGame() {
        this.matchedPairs = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.movesDisplay.textContent = '0';
        this.pairsDisplay.textContent = '0/8';

        const grid = document.querySelector('.memory-grid');
        grid.innerHTML = this.createCards();

        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
    }

    destroy() {
        // 清理资源
    }
}

// 弹球打砖块游戏
class Breakout {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.isPlaying = false;
        this.animationId = null;

        this.ball = { x: 0, y: 0, dx: 4, dy: -4, radius: 8 };
        this.paddle = { width: 100, height: 10, x: 0 };
        this.bricks = [];
        this.score = 0;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h2>🏓 弹球打砖块</h2>
                <p>打破所有砖块！</p>
            </div>
            <div class="game-stats">
                <div class="stat-item">
                    <span id="breakout-score">0</span>
                    <label>得分</label>
                </div>
            </div>
            <div class="breakout-container">
                <canvas id="breakout-canvas" width="400" height="400"></canvas>
                <div class="breakout-controls">
                    <button class="game-start-btn" id="breakout-start">开始游戏</button>
                    <p>使用 ← → 方向键或鼠标移动挡板</p>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('breakout-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('breakout-score');

        document.getElementById('breakout-start').addEventListener('click', () => this.startGame());

        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // 鼠标控制
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.resetGame();
        this.draw();
    }

    resetGame() {
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: 4,
            dy: -4,
            radius: 8
        };
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.score = 0;
        this.scoreDisplay.textContent = '0';
        this.keys = { left: false, right: false };

        // 创建砖块
        this.bricks = [];
        const brickRowCount = 5;
        const brickColumnCount = 8;
        const brickWidth = 45;
        const brickHeight = 20;
        const brickPadding = 5;
        const brickOffsetTop = 30;
        const brickOffsetLeft = 12;

        for (let c = 0; c < brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                this.bricks[c][r] = {
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + brickOffsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    status: 1
                };
            }
        }
    }

    startGame() {
        this.resetGame();
        this.isPlaying = true;
        document.getElementById('breakout-start').style.display = 'none';
        this.gameLoop();
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft') this.keys.left = true;
        if (e.key === 'ArrowRight') this.keys.right = true;
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft') this.keys.left = false;
        if (e.key === 'ArrowRight') this.keys.right = false;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        this.paddle.x = relativeX - this.paddle.width / 2;

        // 限制挡板在画布内
        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.canvas.height - this.paddle.height - 10, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawBricks() {
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];

        for (let c = 0; c < this.bricks.length; c++) {
            for (let r = 0; r < this.bricks[c].length; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    this.ctx.beginPath();
                    this.ctx.rect(brick.x, brick.y, brick.width, brick.height);
                    this.ctx.fillStyle = colors[r];
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
    }

    collisionDetection() {
        for (let c = 0; c < this.bricks.length; c++) {
            for (let r = 0; r < this.bricks[c].length; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    if (this.ball.x > brick.x &&
                        this.ball.x < brick.x + brick.width &&
                        this.ball.y > brick.y &&
                        this.ball.y < brick.y + brick.height) {
                        this.ball.dy = -this.ball.dy;
                        brick.status = 0;
                        this.score += 10;
                        this.scoreDisplay.textContent = this.score;

                        // 检查是否获胜
                        if (this.score === this.bricks.length * this.bricks[0].length * 10) {
                            this.gameOver(true);
                        }
                    }
                }
            }
        }
    }

    movePaddle() {
        const paddleSpeed = 7;
        if (this.keys.left && this.paddle.x > 0) {
            this.paddle.x -= paddleSpeed;
        }
        if (this.keys.right && this.paddle.x + this.paddle.width < this.canvas.width) {
            this.paddle.x += paddleSpeed;
        }
    }

    moveBall() {
        // 墙壁碰撞
        if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius || this.ball.x + this.ball.dx < this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y + this.ball.dy < this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius - 20) {
            // 挡板碰撞
            if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
                this.ball.dy = -this.ball.dy;
            } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
                this.gameOver(false);
            }
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
    }

    gameOver(won) {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationId);
        document.getElementById('breakout-start').style.display = 'block';
        document.getElementById('breakout-start').textContent = '再玩一次';

        if (won) {
            alert('🎉 恭喜你！你赢了！');
        } else {
            alert(`😢 游戏结束！你的得分是：${this.score}`);
        }
    }

    gameLoop() {
        if (!this.isPlaying) return;

        this.draw();
        this.movePaddle();
        this.moveBall();
        this.collisionDetection();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    destroy() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationId);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Games();
});
