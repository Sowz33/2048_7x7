const BOARD_SIZE = 7;
let board = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('bestScore7x7')) || 0;

const tileContainer = document.getElementById('tile-container');
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('best');

function initGame() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    score = 0;
    bestDisplay.textContent = bestScore;
    updateScore(0);
    spawnTile();
    spawnTile();
    renderBoard();
}

function spawnTile() {
    let emptyCells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function formatValue(val) {
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1).replace('.0', '') + 'k';
    return val;
}

function renderBoard() {
    tileContainer.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const value = board[r][c];
            if (value > 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${value}`;
                tile.style.gridRowStart = r + 1;
                tile.style.gridColumnStart = c + 1;
                tile.textContent = formatValue(value);
                tileContainer.appendChild(tile);
            }
        }
    }
}

function updateScore(amount) {
    score += amount;
    scoreDisplay.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestDisplay.textContent = bestScore;
        localStorage.setItem('bestScore7x7', bestScore);
    }
}

function slideRow(row) {
    let arr = row.filter(val => val);
    let missing = BOARD_SIZE - arr.length;
    let zeros = Array(missing).fill(0);
    return arr.concat(zeros);
}

function combineRow(row) {
    let rowScore = 0;
    for (let i = 0; i < BOARD_SIZE - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            rowScore += row[i];
            row[i + 1] = 0;
        }
    }
    return { row: slideRow(row), rowScore };
}

function moveLeft() {
    let changed = false;
    let turnScore = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        let original = [...board[r]];
        let slid = slideRow(original);
        let { row: combined, rowScore } = combineRow(slid);
        turnScore += rowScore;
        board[r] = combined;
        if (JSON.stringify(original) !== JSON.stringify(combined)) changed = true;
    }
    return { changed, turnScore };
}

function rotateBoard() {
    let nextBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            nextBoard[c][BOARD_SIZE - 1 - r] = board[r][c];
        }
    }
    board = nextBoard;
}

function move(direction) {
    let rotations = { 'left': 0, 'down': 1, 'right': 2, 'up': 3 }[direction];
    
    for (let i = 0; i < rotations; i++) rotateBoard();
    let { changed, turnScore } = moveLeft();
    for (let i = 0; i < (4 - rotations) % 4; i++) rotateBoard();

    if (changed) {
        updateScore(turnScore);
        spawnTile();
        renderBoard();
        if (isGameOver()) {
            setTimeout(() => alert('Game Over!'), 300);
        }
    }
}

function isGameOver() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0) return false;
            if (c < BOARD_SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
            if (r < BOARD_SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':  case 'a': case 'A': move('left');  break;
        case 'ArrowRight': case 'd': case 'D': move('right'); break;
        case 'ArrowUp':    case 'w': case 'W': move('up');    break;
        case 'ArrowDown':  case 's': case 'S': move('down');  break;
    }
});

// Fire up the engine!
initGame();
