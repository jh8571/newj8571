const gameModal = document.getElementById('game-modal');
const gameBody = document.getElementById('game-body');
let gameInterval;

window.openGame = function(gameType) {
    gameModal.style.display = 'block';
    gameBody.innerHTML = '';
    
    if (gameType === 'tetris') {
        initTetris();
    } else if (gameType === 'sudoku') {
        initSudoku();
    }
};

window.closeGame = function() {
    gameModal.style.display = 'none';
    if (gameInterval) clearInterval(gameInterval);
};

// --- TETRIS LOGIC ---
function initTetris() {
    gameBody.innerHTML = `
        <h3>테트리스</h3>
        <p>방향키: 이동, 상: 회전, 하: 가속</p>
        <canvas id="tetris" width="240" height="400"></canvas>
        <div id="tetris-score" style="margin-top:10px; font-size:1.2rem; font-weight:bold;">Score: 0</div>
    `;
    
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    context.scale(20, 20);

    function arenaSweep() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) continue outer;
            }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            player.score += rowCount * 10;
            rowCount *= 2;
        }
        updateScore();
    }

    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
            }
        }
        return false;
    }

    function createMatrix(w, h) {
        const matrix = [];
        while (h--) matrix.push(new Array(w).fill(0));
        return matrix;
    }

    function createPiece(type) {
        if (type === 'T') return [[0,0,0],[1,1,1],[0,1,0]];
        if (type === 'O') return [[2,2],[2,2]];
        if (type === 'L') return [[0,3,0],[0,3,0],[0,3,3]];
        if (type === 'J') return [[0,4,0],[0,4,0],[4,4,0]];
        if (type === 'I') return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
        if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
        if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
    }

    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(arena, {x: 0, y: 0});
        drawMatrix(player.matrix, player.pos);
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
            });
        });
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
        }
        dropCounter = 0;
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) player.pos.x -= dir;
    }

    function playerReset() {
        const pieces = 'ILJOTSZ';
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        if (collide(arena, player)) {
            arena.forEach(row => row.fill(0));
            player.score = 0;
            updateScore();
        }
    }

    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) matrix.forEach(row => row.reverse());
        else matrix.reverse();
    }

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) playerDrop();
        draw();
        gameInterval = requestAnimationFrame(update);
    }

    function updateScore() {
        document.getElementById('tetris-score').innerText = `Score: ${player.score}`;
    }

    const colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
    const arena = createMatrix(12, 20);
    const player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };

    document.onkeydown = event => {
        if (event.keyCode === 37) playerMove(-1);
        else if (event.keyCode === 39) playerMove(1);
        else if (event.keyCode === 40) playerDrop();
        else if (event.keyCode === 38) playerRotate(1);
    };

    playerReset();
    updateScore();
    update();
}

// --- SUDOKU LOGIC ---
function initSudoku() {
    gameBody.innerHTML = `
        <h3>스도쿠</h3>
        <p>빈 칸을 채워보세요!</p>
        <div id="game-area"><div id="sudoku-board"></div></div>
        <button class="detail-btn" onclick="checkSudoku()">정답 확인</button>
    `;
    
    const board = document.getElementById('sudoku-board');
    const puzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ];

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.className = 'sudoku-cell';
            if (i % 3 === 2 && i < 8) cell.classList.add('row-divider');
            if (puzzle[i][j] !== 0) {
                cell.value = puzzle[i][j];
                cell.readOnly = true;
                cell.classList.add('fixed');
            }
            board.appendChild(cell);
        }
    }

    window.checkSudoku = function() {
        alert("기능 구현 중입니다. 모든 숫자를 채우고 규칙에 맞는지 확인해 보세요!");
    };
}
