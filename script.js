class Tetris {
    constructor() {
        // 定数
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 20;
        this.INITIAL_SPEED = 1000;

        // ゲーム状態
        this.board = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = true;
        this.dropInterval = this.INITIAL_SPEED;
        this.lastDropTime = 0;

        // テトロミノの定義
        this.pieces = {
            I: {
                shape: [[1, 1, 1, 1]],
                color: 'I',
                startOffset: { x: 3, y: 0 }
            },
            O: {
                shape: [[1, 1], [1, 1]],
                color: 'O',
                startOffset: { x: 4, y: 0 }
            },
            T: {
                shape: [[0, 1, 0], [1, 1, 1]],
                color: 'T',
                startOffset: { x: 3, y: 0 }
            },
            S: {
                shape: [[0, 1, 1], [1, 1, 0]],
                color: 'S',
                startOffset: { x: 3, y: 0 }
            },
            Z: {
                shape: [[1, 1, 0], [0, 1, 1]],
                color: 'Z',
                startOffset: { x: 3, y: 0 }
            },
            J: {
                shape: [[1, 0, 0], [1, 1, 1]],
                color: 'J',
                startOffset: { x: 3, y: 0 }
            },
            L: {
                shape: [[0, 0, 1], [1, 1, 1]],
                color: 'L',
                startOffset: { x: 3, y: 0 }
            }
        };

        // 現在のピースと次のピース
        this.currentPiece = null;
        this.nextPiece = null;

        // DOM要素
        this.gameBoard = document.getElementById('game-board');
        this.nextPieceDisplay = document.getElementById('next-piece-display');
        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.linesDisplay = document.getElementById('lines');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');

        // イベントリスナーの設定
        this.setupEventListeners();
        this.createBoard();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.startButton.addEventListener('click', () => {
            this.startGame();
            this.startButton.style.display = 'none';
            this.restartButton.style.display = 'block';
        });
        this.restartButton.addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }

    createBoard() {
        this.gameBoard.innerHTML = '';
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                this.gameBoard.appendChild(cell);
            }
        }
    }

    startGame() {
        this.isPaused = false;
        this.gameOver = false;
        this.createNextPiece();
        this.createCurrentPiece();
        this.gameLoop();
    }

    resetGame() {
        this.board = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = this.INITIAL_SPEED;
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameOver = false;
        this.updateScore();
        this.createBoard();
    }

    createNextPiece() {
        const types = Object.keys(this.pieces);
        const type = types[Math.floor(Math.random() * types.length)];
        const pieceData = this.pieces[type];
        
        this.nextPiece = {
            type,
            shape: JSON.parse(JSON.stringify(pieceData.shape)),
            color: pieceData.color,
            position: { ...pieceData.startOffset }
        };
        
        this.updateNextPieceDisplay();
    }

    createCurrentPiece() {
        if (!this.nextPiece) {
            this.createNextPiece();
        }
        
        this.currentPiece = this.nextPiece;
        this.currentPiece.position = { ...this.pieces[this.currentPiece.type].startOffset };
        
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.position)) {
            this.gameOver = true;
            alert('ゲームオーバー！');
            return;
        }
        
        this.createNextPiece();
    }

    updateNextPieceDisplay() {
        if (!this.nextPieceDisplay || !this.nextPiece) return;

        // 既存のセルをクリア
        this.nextPieceDisplay.innerHTML = '';

        // プレビューグリッドのサイズを設定
        const previewSize = 4;
        const gridContainer = document.createElement('div');
        gridContainer.className = 'next-piece-grid';

        // テトロミノの形状に基づいて中央配置のオフセットを計算
        const shape = this.nextPiece.shape;
        const offsetY = Math.floor((previewSize - shape.length) / 2);
        const offsetX = Math.floor((previewSize - shape[0].length) / 2);

        // プレビューグリッドを作成
        for (let y = 0; y < previewSize; y++) {
            for (let x = 0; x < previewSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // テトロミノのセルが存在する場合、色を適用
                const pieceY = y - offsetY;
                const pieceX = x - offsetX;
                if (
                    pieceY >= 0 && 
                    pieceY < shape.length && 
                    pieceX >= 0 && 
                    pieceX < shape[0].length && 
                    shape[pieceY][pieceX]
                ) {
                    cell.classList.add(this.nextPiece.color);
                }
                
                gridContainer.appendChild(cell);
            }
        }

        this.nextPieceDisplay.appendChild(gridContainer);
    }

    isValidPosition(shape, position) {
        return shape.every((row, dy) => {
            return row.every((cell, dx) => {
                if (!cell) return true;
                
                const newX = position.x + dx;
                const newY = position.y + dy;
                
                return (
                    newX >= 0 &&
                    newX < this.GRID_WIDTH &&
                    newY < this.GRID_HEIGHT &&
                    (newY < 0 || !this.board[newY][newX])
                );
            });
        });
    }

    handleKeyPress(event) {
        if (this.gameOver || this.isPaused) return;

        switch (event.key) {
            case 'ArrowLeft':
                this.movePiece(-1);
                break;
            case 'ArrowRight':
                this.movePiece(1);
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case ' ':
                this.hardDrop();
                break;
        }
    }

    movePiece(direction) {
        const newPosition = {
            x: this.currentPiece.position.x + direction,
            y: this.currentPiece.position.y
        };

        if (this.isValidPosition(this.currentPiece.shape, newPosition)) {
            this.currentPiece.position = newPosition;
            this.updateBoard();
        }
    }

    moveDown() {
        const newPosition = {
            x: this.currentPiece.position.x,
            y: this.currentPiece.position.y + 1
        };

        if (this.isValidPosition(this.currentPiece.shape, newPosition)) {
            this.currentPiece.position = newPosition;
            this.updateBoard();
            return true;
        }

        // ブロックが最下部に到達した場合のみロック
        if (this.currentPiece.position.y >= 0) {
            this.lockPiece();
        }
        return false;
    }

    hardDrop() {
        let dropped = true;
        while (dropped) {
            dropped = this.moveDown();
        }
    }

    rotatePiece() {
        const rotatedShape = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );

        // 回転後の位置調整オフセットを試行
        const offsets = [
            {x: 0, y: 0},  // 回転のみ
            {x: -1, y: 0}, // 左に1マス
            {x: 1, y: 0},  // 右に1マス
            {x: 0, y: -1}, // 上に1マス
            {x: -2, y: 0}, // 左に2マス
            {x: 2, y: 0},  // 右に2マス
        ];

        for (let offset of offsets) {
            const newPosition = {
                x: this.currentPiece.position.x + offset.x,
                y: this.currentPiece.position.y + offset.y
            };

            if (this.isValidPosition(rotatedShape, newPosition)) {
                this.currentPiece.shape = rotatedShape;
                this.currentPiece.position = newPosition;
                this.updateBoard();
                return;
            }
        }
    }

    lockPiece() {
        // 現在のピースをボードに固定
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    const y = this.currentPiece.position.y + dy;
                    const x = this.currentPiece.position.x + dx;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            });
        });

        // 行の消去を実行
        const linesCleared = this.clearLines();
        
        // 新しいピースを作成
        this.createCurrentPiece();
        
        // ボードを更新
        this.updateBoard();
    }

    clearLines() {
        let linesCleared = 0;
        let y = this.GRID_HEIGHT - 1;
        
        while (y >= 0) {
            if (this.board[y].every(cell => cell !== 0)) {
                // 行を削除し、上の行を下に移動
                this.board.splice(y, 1);
                this.board.unshift(Array(this.GRID_WIDTH).fill(0));
                linesCleared++;
            } else {
                y--;
            }
        }

        if (linesCleared > 0) {
            // スコアの更新
            this.updateScore(linesCleared);
        }

        return linesCleared;
    }

    updateScore(linesCleared) {
        if (linesCleared) {
            const points = [0, 100, 300, 500, 800][linesCleared] || 0;
            this.score += points * this.level;
            this.lines += linesCleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, this.INITIAL_SPEED - (this.level - 1) * 100);
        }

        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;
        this.linesDisplay.textContent = this.lines;
    }

    updateBoard() {
        const cells = this.gameBoard.children;
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                const cell = cells[y * this.GRID_WIDTH + x];
                // 既存のクラスをクリア
                cell.className = 'cell';
                
                // 新しいクラスを追加（必要な場合のみ）
                const value = this.board[y][x];
                if (value) {
                    cell.classList.add(value);
                }
            }
        }

        // 現在のピースを描画
        if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, dy) => {
                row.forEach((cell, dx) => {
                    if (cell) {
                        const y = this.currentPiece.position.y + dy;
                        const x = this.currentPiece.position.x + dx;
                        if (y >= 0 && y < this.GRID_HEIGHT) {
                            const cellElement = cells[y * this.GRID_WIDTH + x];
                            cellElement.classList.add(this.currentPiece.color);
                        }
                    }
                });
            });
        }
    }

    gameLoop(timestamp = 0) {
        if (this.gameOver || this.isPaused) return;

        if (timestamp - this.lastDropTime > this.dropInterval) {
            this.moveDown();
            this.lastDropTime = timestamp;
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// ゲームの初期化
const game = new Tetris(); 