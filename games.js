document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('game-modal');
    const container = document.getElementById('game-container');
    const title = document.getElementById('game-title');
    let gameInterval = null;

    window.startGame = function(type) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        container.innerHTML = '';
        if (gameInterval) clearInterval(gameInterval);

        switch(type) {
            case 'tetris': startTetris(); break;
            case 'sudoku': startSudoku(); break;
            case 'clicker': startClicker(); break;
            case 'math': startMath(); break;
            case 'reaction': startReaction(); break;
            case 'snake': startSnake(); break;
            case 'memory': startMemory(); break;
            case 'color': startColor(); break;
            case 'typing': startTyping(); break;
            case 'number': startNumber(); break;
        }
    };

    window.closeGame = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (gameInterval) clearInterval(gameInterval);
        container.innerHTML = '';
    };

    // 1. Tetris
    function startTetris() {
        title.innerText = "클래식 테트리스";
        container.innerHTML = `<canvas id="tetris" width="240" height="400"></canvas><div id="score" style="margin-top:10px; font-size:1.2rem;">점수: 0</div>`;
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
            if (type === 'T') return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
            else if (type === 'O') return [[2, 2], [2, 2]];
            else if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
            else if (type === 'J') return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
            else if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
            else if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
            else if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
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
                        context.fillStyle = ['#000','red','blue','green','yellow','purple','orange','pink'][value];
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
            document.getElementById('score').innerText = `점수: ${player.score}`;
        }

        const arena = createMatrix(12, 20);
        const player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };

        document.onkeydown = event => {
            if (event.keyCode === 37) playerMove(-1);
            else if (event.keyCode === 39) playerMove(1);
            else if (event.keyCode === 40) playerDrop();
            else if (event.keyCode === 81) playerRotate(-1);
            else if (event.keyCode === 87) playerRotate(1);
        };

        playerReset();
        updateScore();
        update();
    }

    // 2. Sudoku (Simplified Generation)
    function startSudoku() {
        title.innerText = "정통 스도쿠";
        container.innerHTML = `<div class="sudoku-grid" id="sudoku"></div><button class="calc-btn" style="margin-top:20px;" onclick="startGame('sudoku')">새 게임</button>`;
        const grid = document.getElementById('sudoku');
        const board = Array(81).fill(0);
        // Fill some random fixed numbers
        for(let i=0; i<25; i++) {
            let idx = Math.floor(Math.random()*81);
            board[idx] = Math.floor(Math.random()*9)+1;
        }
        
        board.forEach((val, i) => {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell' + (val !== 0 ? ' fixed' : '');
            cell.innerText = val !== 0 ? val : '';
            if (val === 0) {
                cell.onclick = () => {
                    let next = (parseInt(cell.innerText) || 0) + 1;
                    if (next > 9) next = '';
                    cell.innerText = next;
                    cell.style.color = 'var(--accent-color)';
                };
            }
            grid.appendChild(cell);
        });
    }

    // 3. Clicker
    function startClicker() {
        title.innerText = "클릭커 마스터";
        let count = 0; let time = 10;
        container.innerHTML = `<div style="text-align:center;"><h3>남은 시간: <span id="t">${time}</span></h3><h2 id="c" style="font-size:3rem; margin:20px 0;">0</h2><button id="b" class="calc-btn" style="width:150px; height:150px; border-radius:50%;">클릭!</button></div>`;
        const b = document.getElementById('b');
        b.onclick = () => { if(time>0) document.getElementById('c').innerText = ++count; };
        gameInterval = setInterval(() => {
            document.getElementById('t').innerText = --time;
            if(time<=0) { clearInterval(gameInterval); alert('종료! 점수: ' + count); closeGame(); }
        }, 1000);
    }

    // 4. Math
    function startMath() {
        title.innerText = "암산왕";
        let score = 0;
        function ask() {
            const a = Math.floor(Math.random()*20); const b = Math.floor(Math.random()*20);
            const ans = a + b;
            container.innerHTML = `<div style="text-align:center;"><h3>점수: ${score}</h3><h1>${a} + ${b} = ?</h1><input type="number" id="ans" style="padding:10px; font-size:1.5rem; width:100px;"><button id="sub" class="calc-btn">확인</button></div>`;
            document.getElementById('sub').onclick = () => {
                if(parseInt(document.getElementById('ans').value) === ans) { score++; ask(); }
                else { alert('틀렸습니다! 최종 점수: ' + score); closeGame(); }
            };
        }
        ask();
    }

    // 5. Reaction
    function startReaction() {
        title.innerText = "반응 속도";
        container.innerHTML = `<div id="box" style="width:100%; height:300px; background:red; color:white; display:flex; align-items:center; justify-content:center; cursor:pointer;">기다리세요...</div>`;
        const box = document.getElementById('box');
        let start = 0;
        const wait = setTimeout(() => {
            box.style.background = 'green'; box.innerText = '클릭!!!'; start = Date.now();
        }, 2000 + Math.random()*3000);
        box.onclick = () => {
            if(start) { alert((Date.now()-start) + 'ms!'); closeGame(); }
            else { clearTimeout(wait); alert('너무 빨랐습니다!'); closeGame(); }
        };
    }

    // 6. Snake
    function startSnake() {
        title.innerText = "스네이크";
        container.innerHTML = `<canvas id="snake" width="300" height="300"></canvas>`;
        const canvas = document.getElementById('snake');
        const ctx = canvas.getContext('2d');
        let snake = [{x:10, y:10}]; let food = {x:15, y:15}; let dx = 1; let dy = 0;
        document.onkeydown = e => {
            if(e.keyCode===37 && dx===0) {dx=-1; dy=0;}
            if(e.keyCode===38 && dy===0) {dx=0; dy=-1;}
            if(e.keyCode===39 && dx===0) {dx=1; dy=0;}
            if(e.keyCode===40 && dy===0) {dx=0; dy=1;}
        };
        gameInterval = setInterval(() => {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            if(head.x<0 || head.x>=20 || head.y<0 || head.y>=20) { clearInterval(gameInterval); alert('Game Over'); closeGame(); return; }
            snake.unshift(head);
            if(head.x === food.x && head.y === food.y) { food = {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)}; }
            else snake.pop();
            ctx.fillStyle='black'; ctx.fillRect(0,0,300,300);
            ctx.fillStyle='lime'; snake.forEach(s => ctx.fillRect(s.x*15, s.y*15, 14, 14));
            ctx.fillStyle='red'; ctx.fillRect(food.x*15, food.y*15, 14, 14);
        }, 100);
    }

    // 7. Memory
    function startMemory() {
        title.innerText = "기억력 테스트";
        container.innerHTML = `<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px;" id="m"></div>`;
        const m = document.getElementById('m');
        let cards = [...'AABBCCDD'].sort(() => Math.random()-0.5);
        let first = null;
        cards.forEach((val, i) => {
            const c = document.createElement('div');
            c.style = "height:80px; background:#ddd; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;";
            c.onclick = () => {
                c.innerText = val; c.style.background = 'white';
                if(!first) first = {val, el:c};
                else {
                    if(first.val === val) { first = null; if([...m.children].every(x=>x.innerText)) alert('성공!'); }
                    else { setTimeout(() => { c.innerText = ''; c.style.background = '#ddd'; first.el.innerText = ''; first.el.style.background = '#ddd'; first = null; }, 500); }
                }
            };
            m.appendChild(c);
        });
    }

    // 8. Color
    function startColor() {
        title.innerText = "색상 차이 찾기";
        let score = 0;
        function ask() {
            container.innerHTML = `<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;" id="g"></div>`;
            const g = document.getElementById('g');
            const r = Math.floor(Math.random()*200); const gr = Math.floor(Math.random()*200); const b = Math.floor(Math.random()*200);
            const diff = 20 - score;
            const target = Math.floor(Math.random()*9);
            for(let i=0; i<9; i++) {
                const box = document.createElement('div');
                box.style = `height:80px; border-radius:10px; cursor:pointer; background:rgb(${i===target?r+diff:r},${i===target?gr+diff:gr},${i===target?b+diff:b})`;
                box.onclick = () => { if(i===target) { score++; ask(); } else { alert('탈락! 점수: ' + score); closeGame(); } };
                g.appendChild(box);
            }
        }
        ask();
    }

    // 9. Typing
    function startTyping() {
        title.innerText = "타이핑 챌린지";
        const words = ['바나나','포도','치타','코끼리','컴퓨터','자바스크립트','웰니스','밸런스','건강','운동'];
        let score = 0;
        function ask() {
            const word = words[Math.floor(Math.random()*words.length)];
            container.innerHTML = `<div style="text-align:center;"><h3>점수: ${score}</h3><h1 style="font-size:3rem; margin:20px 0;">${word}</h1><input id="in" style="padding:10px; font-size:1.5rem;"><button id="ok" class="calc-btn">입력</button></div>`;
            const input = document.getElementById('in');
            input.focus();
            const check = () => { if(input.value === word) { score++; ask(); } else { alert('최종 점수: ' + score); closeGame(); } };
            document.getElementById('ok').onclick = check;
            input.onkeyup = e => { if(e.key==='Enter') check(); };
        }
        ask();
    }

    // 10. Number
    function startNumber() {
        title.innerText = "숫자 맞추기";
        const target = Math.floor(Math.random()*100)+1;
        container.innerHTML = `<div style="text-align:center;"><input type="number" id="n" placeholder="1~100" style="padding:10px;"><button id="go" class="calc-btn">Go</button><p id="h">과연 숫자는?</p></div>`;
        document.getElementById('go').onclick = () => {
            const v = parseInt(document.getElementById('n').value);
            const h = document.getElementById('h');
            if(v === target) { alert('정답!'); closeGame(); }
            else if(v < target) h.innerText = 'Up!';
            else h.innerText = 'Down!';
        };
    }
});