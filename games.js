document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('game-modal');
    const container = document.getElementById('game-container');
    const title = document.getElementById('game-title');
    let gameInterval = null;

    window.startGame = function(type) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        container.innerHTML = '';
        if (gameInterval) { clearInterval(gameInterval); cancelAnimationFrame(gameInterval); }
        document.onkeydown = null;

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
        if (gameInterval) {
            clearInterval(gameInterval);
            cancelAnimationFrame(gameInterval);
        }
        document.onkeydown = null;
        container.innerHTML = '';
    };

    const t = window.t;

    // 1. Tetris
    function startTetris() {
        title.innerText = t("클래식 테트리스", "Classic Tetris");

        const COLORS = ['#000','#f87171','#60a5fa','#4ade80','#facc15','#c084fc','#fb923c','#f472b6'];

        container.innerHTML = `
            <div style="display:flex; gap:8px; justify-content:center; align-items:flex-start;">
                <div style="text-align:center;">
                    <p style="font-size:0.65rem; color:var(--text-muted); margin:0 0 3px; font-weight:700;">
                        HOLD (C)
                    </p>
                    <canvas id="hold-cv" width="56" height="56"
                        style="background:#111; border-radius:6px; display:block;"></canvas>
                    <p style="font-size:0.65rem; color:var(--text-muted); margin:8px 0 3px; font-weight:700;">
                        ${t('점수','SCORE')}
                    </p>
                    <div id="score" style="font-size:0.9rem; font-weight:800; color:var(--accent-color);">0</div>
                </div>
                <canvas id="tetris" width="240" height="400"
                    style="display:block; background:#111; border-radius:6px;"></canvas>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; max-width:240px; margin:10px auto 0;">
                <button id="tb-left"  class="calc-btn" style="padding:12px; font-size:1.1rem;">←</button>
                <button id="tb-rot"   class="calc-btn" style="padding:12px; font-size:1.1rem;">↑</button>
                <button id="tb-right" class="calc-btn" style="padding:12px; font-size:1.1rem;">→</button>
                <button id="tb-hold"  class="calc-btn" style="padding:12px; font-size:0.8rem; font-weight:800;">HOLD</button>
                <button id="tb-down"  class="calc-btn" style="padding:12px; font-size:1.1rem;">↓</button>
                <button id="tb-hard"  class="calc-btn" style="padding:12px; font-size:1.1rem;">⬇</button>
            </div>
            <p style="font-size:0.72rem; color:var(--text-muted); text-align:center; margin-top:5px;">
                ${t('↑회전 | C홀드 | Space하드드롭 | ↓소프트드롭','↑rotate | C hold | Space hard-drop | ↓soft-drop')}
            </p>`;

        const canvas   = document.getElementById('tetris');
        const holdCv   = document.getElementById('hold-cv');
        const ctx      = canvas.getContext('2d');
        const holdCtx  = holdCv.getContext('2d');
        ctx.scale(20, 20);

        // ── helpers ───────────────────────────────────────────────────
        function createMatrix(w, h) {
            const m = [];
            while (h--) m.push(new Array(w).fill(0));
            return m;
        }

        function createPiece(type) {
            if (type === 'T') return [[0,0,0],[1,1,1],[0,1,0]];
            if (type === 'O') return [[2,2],[2,2]];
            if (type === 'L') return [[0,3,0],[0,3,0],[0,3,3]];
            if (type === 'J') return [[0,4,0],[0,4,0],[4,4,0]];
            if (type === 'I') return [[0,0,0,0],[5,5,5,5],[0,0,0,0],[0,0,0,0]];
            if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
            if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
        }

        function collide(arena, player) {
            const [m, o] = [player.matrix, player.pos];
            for (let y = 0; y < m.length; ++y)
                for (let x = 0; x < m[y].length; ++x)
                    if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
            return false;
        }

        function merge(arena, player) {
            player.matrix.forEach((row, y) =>
                row.forEach((val, x) => { if (val) arena[y + player.pos.y][x + player.pos.x] = val; })
            );
        }

        function rotate(matrix, dir) {
            for (let y = 0; y < matrix.length; ++y)
                for (let x = 0; x < y; ++x)
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            if (dir > 0) matrix.forEach(r => r.reverse());
            else matrix.reverse();
        }

        // ── ghost piece ───────────────────────────────────────────────
        function getGhostY() {
            const ghost = { pos: { x: player.pos.x, y: player.pos.y }, matrix: player.matrix };
            while (!collide(arena, { pos: { x: ghost.pos.x, y: ghost.pos.y + 1 }, matrix: ghost.matrix }))
                ghost.pos.y++;
            return ghost.pos.y;
        }

        // ── draw ──────────────────────────────────────────────────────
        function drawBlock(matrix, offset, alpha) {
            ctx.globalAlpha = alpha;
            matrix.forEach((row, y) =>
                row.forEach((val, x) => {
                    if (val) {
                        ctx.fillStyle = COLORS[val];
                        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                    }
                })
            );
            ctx.globalAlpha = 1;
        }

        function draw() {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawBlock(arena, {x:0,y:0}, 1);
            // ghost
            const gy = getGhostY();
            if (gy !== player.pos.y) drawBlock(player.matrix, {x: player.pos.x, y: gy}, 0.22);
            drawBlock(player.matrix, player.pos, 1);
        }

        function drawHold() {
            holdCtx.fillStyle = '#111';
            holdCtx.fillRect(0, 0, 56, 56);
            if (!holdMatrix) return;
            const scale = 12;
            const ox = ((4 - holdMatrix[0].length) / 2) * scale + 2;
            const oy = ((4 - holdMatrix.length) / 2) * scale + 2;
            holdMatrix.forEach((row, y) =>
                row.forEach((val, x) => {
                    if (val) {
                        holdCtx.fillStyle = COLORS[val];
                        holdCtx.fillRect(ox + x * scale, oy + y * scale, scale - 1, scale - 1);
                    }
                })
            );
        }

        // ── player actions ────────────────────────────────────────────
        function playerReset() {
            const pieces = 'ILJOTSZ';
            player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
            player.pos.y = 0;
            player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
            canHold = true;
            if (collide(arena, player)) {
                arena.forEach(row => row.fill(0));
                player.score = 0;
                holdMatrix = null;
                drawHold();
                updateScore();
            }
        }

        function playerMove(dir) {
            player.pos.x += dir;
            if (collide(arena, player)) player.pos.x -= dir;
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

        function hardDrop() {
            while (!collide(arena, { pos: { x: player.pos.x, y: player.pos.y + 1 }, matrix: player.matrix }))
                player.pos.y++;
            merge(arena, player);
            playerReset();
            arenaSweep();
            dropCounter = 0;
        }

        function playerHold() {
            if (!canHold) return;
            canHold = false;
            if (holdMatrix === null) {
                holdMatrix = player.matrix;
                playerReset();
            } else {
                const tmp = holdMatrix;
                holdMatrix = player.matrix;
                player.matrix = tmp;
                player.pos.y = 0;
                player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
            }
            drawHold();
        }

        function arenaSweep() {
            let rowCount = 1;
            outer: for (let y = arena.length - 1; y > 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) if (arena[y][x] === 0) continue outer;
                const row = arena.splice(y, 1)[0].fill(0);
                arena.unshift(row);
                ++y;
                player.score += rowCount * 10;
                rowCount *= 2;
            }
            updateScore();
        }

        function updateScore() {
            document.getElementById('score').innerText = player.score;
        }

        // ── game loop ─────────────────────────────────────────────────
        let dropCounter = 0, dropInterval = 1000, lastTime = 0;

        function update(time = 0) {
            const dt = time - lastTime;
            lastTime = time;
            dropCounter += dt;
            if (dropCounter > dropInterval) playerDrop();
            draw();
            gameInterval = requestAnimationFrame(update);
        }

        // ── init ──────────────────────────────────────────────────────
        const arena = createMatrix(12, 20);
        const player = { pos: {x:0,y:0}, matrix: null, score: 0 };
        let holdMatrix = null;
        let canHold = true;

        // keyboard
        document.onkeydown = e => {
            if (e.keyCode === 37)                        { e.preventDefault(); playerMove(-1); }
            else if (e.keyCode === 39)                   { e.preventDefault(); playerMove(1); }
            else if (e.keyCode === 38)                   { e.preventDefault(); playerRotate(1); }
            else if (e.keyCode === 40)                   { e.preventDefault(); playerDrop(); }
            else if (e.keyCode === 32)                   { e.preventDefault(); hardDrop(); }
            else if (e.keyCode === 67)                   { e.preventDefault(); playerHold(); } // C
            else if (e.keyCode === 81) playerRotate(-1); // Q
            else if (e.keyCode === 87) playerRotate(1);  // W
        };

        // mobile buttons
        document.getElementById('tb-left').onclick  = () => playerMove(-1);
        document.getElementById('tb-right').onclick = () => playerMove(1);
        document.getElementById('tb-rot').onclick   = () => playerRotate(1);
        document.getElementById('tb-down').onclick  = () => playerDrop();
        document.getElementById('tb-hard').onclick  = () => hardDrop();
        document.getElementById('tb-hold').onclick  = () => playerHold();

        playerReset();
        drawHold();
        updateScore();
        update();
    }

    // 2. Sudoku
    function startSudoku() {
        title.innerText = t("정통 스도쿠", "Sudoku");

        // ── board generator (shared) ──────────────────────────────────
        function canPlace(board, pos, num) {
            const row = Math.floor(pos / 9), col = pos % 9;
            for (let c = 0; c < 9; c++) if (board[row * 9 + c] === num) return false;
            for (let r = 0; r < 9; r++) if (board[r * 9 + col] === num) return false;
            const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
                if (board[(br + r) * 9 + (bc + c)] === num) return false;
            return true;
        }
        function fillBoard(board, pos = 0) {
            if (pos === 81) return true;
            if (board[pos] !== 0) return fillBoard(board, pos + 1);
            for (const num of [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5)) {
                if (canPlace(board, pos, num)) {
                    board[pos] = num;
                    if (fillBoard(board, pos + 1)) return true;
                    board[pos] = 0;
                }
            }
            return false;
        }

        // ── step 1: difficulty selection ──────────────────────────────
        const diffLevels = [
            { label: t('🟢 초급 (쉬움)', '🟢 Beginner'), remove: 35, hint: t('힌트 46개', '46 clues') },
            { label: t('🟡 중급 (보통)', '🟡 Intermediate'), remove: 46, hint: t('힌트 35개', '35 clues') },
            { label: t('🔴 고급 (어려움)', '🔴 Advanced'), remove: 54, hint: t('힌트 27개', '27 clues') },
        ];

        container.innerHTML = `
            <div style="text-align:center; padding:10px 0;">
                <p style="font-size:1rem; font-weight:800; color:var(--primary-color); margin-bottom:20px;">
                    ${t('난이도를 선택하세요', 'Select Difficulty')}
                </p>
                <div style="display:flex; flex-direction:column; gap:12px; max-width:220px; margin:0 auto;">
                    ${diffLevels.map((d, i) => `
                        <button id="sd-${i}" style="padding:14px 20px; background:var(--card-bg); border:2px solid var(--border-color);
                            border-radius:16px; cursor:pointer; font-size:0.95rem; font-weight:700; color:var(--text-main);
                            display:flex; justify-content:space-between; align-items:center; transition:0.2s;">
                            <span>${d.label}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${d.hint}</span>
                        </button>`).join('')}
                </div>
            </div>`;

        diffLevels.forEach((d, i) => {
            document.getElementById(`sd-${i}`).addEventListener('click', () => buildBoard(d.remove));
        });

        // ── step 2: build & render board ──────────────────────────────
        function buildBoard(removeCount) {
            const solution = Array(81).fill(0);
            fillBoard(solution);
            const puzzle = [...solution];
            Array.from({length: 81}, (_, i) => i)
                .sort(() => Math.random() - 0.5)
                .slice(0, removeCount)
                .forEach(i => { puzzle[i] = 0; });

            const cs = window.innerWidth <= 480 ? 30 : 34;
            const BOX  = '2.5px solid var(--primary-color)';
            const THIN = '1px solid var(--border-color)';

            container.innerHTML = `
                <div style="overflow-x:auto; width:100%; text-align:center;">
                    <table id="s-tbl" style="border-collapse:collapse; border:2.5px solid var(--primary-color); margin:0 auto; table-layout:fixed;"></table>
                </div>
                <div id="s-pad" style="display:flex; gap:5px; justify-content:center; margin-top:10px; flex-wrap:wrap; max-width:340px;">
                    ${[1,2,3,4,5,6,7,8,9].map(n =>
                        `<button data-n="${n}" style="width:${cs}px;height:${cs}px;padding:0;font-size:0.9rem;font-weight:700;
                            background:var(--card-bg);border:2px solid var(--border-color);border-radius:8px;
                            cursor:pointer;color:var(--text-main);">${n}</button>`
                    ).join('')}
                    <button data-n="0" style="width:${cs}px;height:${cs}px;padding:0;font-size:1rem;
                        background:var(--card-bg);border:2px solid var(--border-color);border-radius:8px;
                        cursor:pointer;color:var(--text-muted);">✕</button>
                </div>
                <p style="font-size:0.72rem;color:var(--text-muted);margin:5px 0 0;text-align:center;">
                    ${t('셀 선택 → 숫자 입력 또는 키보드 1~9','Select cell → tap number or press 1–9')}
                </p>
                <div style="display:flex; gap:8px; margin-top:10px; justify-content:center; flex-wrap:wrap;">
                    <button id="s-check" style="padding:10px 18px; background:#6366f1; color:white; border:none;
                        border-radius:12px; font-size:0.85rem; font-weight:700; cursor:pointer;">
                        ${t('정답 확인','Check Answers')}
                    </button>
                    <button onclick="startGame('sudoku')" style="padding:10px 18px; background:var(--card-bg);
                        color:var(--text-main); border:2px solid var(--border-color); border-radius:12px;
                        font-size:0.85rem; font-weight:700; cursor:pointer;">
                        ${t('새 게임','New Game')}
                    </button>
                </div>`;

            const cells = [];
            let selIdx = -1;
            let answered = false;
            const tbl = document.getElementById('s-tbl');

            for (let r = 0; r < 9; r++) {
                const tr = tbl.insertRow();
                for (let c = 0; c < 9; c++) {
                    const idx = r * 9 + c;
                    const td = tr.insertCell();
                    const isFixed = puzzle[idx] !== 0;
                    td.style.cssText = [
                        `width:${cs}px`, `height:${cs}px`,
                        'text-align:center', 'vertical-align:middle',
                        `font-size:${cs <= 30 ? '0.85' : '1'}rem`, 'font-weight:700',
                        `cursor:${isFixed ? 'default' : 'pointer'}`,
                        'border-top:none', 'border-left:none',
                        `border-right:${(c === 2 || c === 5) ? BOX : (c === 8 ? 'none' : THIN)}`,
                        `border-bottom:${(r === 2 || r === 5) ? BOX : (r === 8 ? 'none' : THIN)}`,
                        `background:${isFixed ? 'var(--bg-color)' : 'var(--card-bg)'}`,
                        `color:${isFixed ? 'var(--primary-color)' : 'var(--text-muted)'}`,
                        'user-select:none', 'transition:background 0.15s'
                    ].join(';');
                    td.textContent = puzzle[idx] || '';
                    td.dataset.fixed = isFixed ? '1' : '0';
                    cells.push(td);

                    if (!isFixed) {
                        td.addEventListener('click', () => {
                            if (answered) return;
                            if (selIdx >= 0 && cells[selIdx].dataset.fixed === '0')
                                cells[selIdx].style.background = 'var(--card-bg)';
                            selIdx = idx;
                            td.style.background = 'rgba(99,102,241,0.18)';
                        });
                    }
                }
            }

            // ── number input ──────────────────────────────────────────
            function inputNum(n) {
                if (answered || selIdx < 0 || cells[selIdx].dataset.fixed === '1') return;
                const cell = cells[selIdx];
                cell.textContent = n || '';
                cell.style.color = 'var(--text-muted)';
            }

            document.getElementById('s-pad').querySelectorAll('[data-n]').forEach(btn => {
                btn.addEventListener('click', () => inputNum(parseInt(btn.dataset.n)));
            });

            document.onkeydown = e => {
                const k = parseInt(e.key);
                if (k >= 1 && k <= 9) { e.preventDefault(); inputNum(k); }
                else if (e.key === 'Backspace' || e.key === 'Delete') inputNum(0);
            };

            // ── answer check ──────────────────────────────────────────
            document.getElementById('s-check').addEventListener('click', () => {
                answered = true;
                if (selIdx >= 0 && cells[selIdx].dataset.fixed === '0')
                    cells[selIdx].style.background = 'var(--card-bg)';
                selIdx = -1;
                document.onkeydown = null;

                let correct = 0, wrong = 0, empty = 0;
                cells.forEach((td, i) => {
                    if (puzzle[i] !== 0) return; // fixed cell, skip
                    const entered = parseInt(td.textContent);
                    if (!entered) {
                        // empty — show correct answer in grey
                        td.textContent = solution[i];
                        td.style.color = '#94a3b8';
                        td.style.background = 'rgba(148,163,184,0.12)';
                        empty++;
                    } else if (entered === solution[i]) {
                        td.style.color = '#10b981';
                        td.style.background = 'rgba(16,185,129,0.12)';
                        correct++;
                    } else {
                        // wrong — show correct answer in red
                        td.textContent = solution[i];
                        td.style.color = '#ef4444';
                        td.style.background = 'rgba(239,68,68,0.12)';
                        wrong++;
                    }
                });

                const checkBtn = document.getElementById('s-check');
                checkBtn.disabled = true;
                checkBtn.style.opacity = '0.5';

                const total = correct + wrong + empty;
                if (wrong === 0 && empty === 0) {
                    setTimeout(() => alert(t(`🎉 완벽합니다! ${total}칸 전부 정답!`, `🎉 Perfect! All ${total} correct!`)), 100);
                } else {
                    const msg = t(
                        `결과: ✅ ${correct}개 정답 / ❌ ${wrong}개 오답 / ⬜ ${empty}개 미입력`,
                        `Result: ✅ ${correct} correct / ❌ ${wrong} wrong / ⬜ ${empty} empty`
                    );
                    setTimeout(() => alert(msg), 100);
                }
            });
        }
    }

    // 3. Clicker
    function startClicker() {
        title.innerText = t("클릭커 마스터", "Clicker Master");
        let count = 0; let time = 10;
        container.innerHTML = `<div style="text-align:center;"><h3>${t('남은 시간','Time Left')}: <span id="t">${time}</span></h3><h2 id="c" style="font-size:3rem; margin:20px 0;">0</h2><button id="b" class="calc-btn" style="width:150px; height:150px; border-radius:50%;">${t('클릭!','Click!')}</button></div>`;
        const b = document.getElementById('b');
        b.onclick = () => { if(time>0) document.getElementById('c').innerText = ++count; };
        gameInterval = setInterval(() => {
            document.getElementById('t').innerText = --time;
            if(time<=0) { clearInterval(gameInterval); alert(t('종료! 점수: ','Done! Score: ') + count); closeGame(); }
        }, 1000);
    }

    // 4. Math
    function startMath() {
        title.innerText = t("암산왕", "Mental Math");
        let score = 0;
        function ask() {
            const a = Math.floor(Math.random()*20); const b = Math.floor(Math.random()*20);
            const ans = a + b;
            container.innerHTML = `<div style="text-align:center;"><h3>${t('점수','Score')}: ${score}</h3><h1>${a} + ${b} = ?</h1><input type="number" id="ans" style="padding:10px; font-size:1.5rem; width:100px;"><button id="sub" class="calc-btn">${t('확인','Submit')}</button></div>`;
            document.getElementById('sub').onclick = () => {
                if(parseInt(document.getElementById('ans').value) === ans) { score++; ask(); }
                else { alert(t('틀렸습니다! 최종 점수: ','Wrong! Final score: ') + score); closeGame(); }
            };
        }
        ask();
    }

    // 5. Reaction
    function startReaction() {
        title.innerText = t("반응 속도", "Reaction Speed");
        container.innerHTML = `<div id="box" style="width:100%; height:300px; background:red; color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:16px; font-size:1.5rem; font-weight:700;">${t('기다리세요...','Wait...')}</div>`;
        const box = document.getElementById('box');
        let start = 0;
        const wait = setTimeout(() => {
            box.style.background = 'green'; box.innerText = t('클릭!!!','Click NOW!'); start = Date.now();
        }, 2000 + Math.random()*3000);
        box.onclick = () => {
            if(start) { alert((Date.now()-start) + 'ms!'); closeGame(); }
            else { clearTimeout(wait); alert(t('너무 빨랐습니다!','Too early!')); closeGame(); }
        };
    }

    // 6. Snake
    function startSnake() {
        title.innerText = t("스네이크", "Snake");
        container.innerHTML = `
            <div style="text-align:center;">
                <div style="margin-bottom:10px; font-size:0.85rem; color:var(--text-muted);">${t('점수','Score')}: <span id="snake-score">0</span></div>
                <canvas id="snake" width="300" height="300" style="border-radius:10px;"></canvas>
                <div style="margin-top:12px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; max-width:150px; margin-left:auto; margin-right:auto;">
                    <div></div>
                    <button id="s-up" class="calc-btn" style="padding:10px;">↑</button>
                    <div></div>
                    <button id="s-left" class="calc-btn" style="padding:10px;">←</button>
                    <div></div>
                    <button id="s-right" class="calc-btn" style="padding:10px;">→</button>
                    <div></div>
                    <button id="s-down" class="calc-btn" style="padding:10px;">↓</button>
                    <div></div>
                </div>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">${t('키보드 화살표 또는 버튼으로 조작','Use arrow keys or buttons to control')}</p>
            </div>
        `;
        const canvas = document.getElementById('snake');
        const ctx = canvas.getContext('2d');
        let snake = [{x:10, y:10}]; let food = {x:15, y:15}; let dx = 1; let dy = 0; let snakeScore = 0;
        const move = (ndx, ndy) => {
            if(ndx !== 0 && dx === 0) { dx=ndx; dy=0; }
            if(ndy !== 0 && dy === 0) { dx=0; dy=ndy; }
        };
        document.onkeydown = e => {
            if(e.keyCode===37) move(-1,0);
            if(e.keyCode===38) move(0,-1);
            if(e.keyCode===39) move(1,0);
            if(e.keyCode===40) move(0,1);
        };
        document.getElementById('s-up').onclick = () => move(0,-1);
        document.getElementById('s-down').onclick = () => move(0,1);
        document.getElementById('s-left').onclick = () => move(-1,0);
        document.getElementById('s-right').onclick = () => move(1,0);
        gameInterval = setInterval(() => {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            if(head.x<0 || head.x>=20 || head.y<0 || head.y>=20 || snake.some(s=>s.x===head.x&&s.y===head.y)) {
                clearInterval(gameInterval);
                ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,300,300);
                ctx.fillStyle='white'; ctx.font='bold 24px sans-serif'; ctx.textAlign='center';
                ctx.fillText(t('Game Over','Game Over'), 150, 140);
                ctx.font='16px sans-serif';
                ctx.fillText(t('점수','Score') + ': ' + snakeScore, 150, 170);
                return;
            }
            snake.unshift(head);
            if(head.x === food.x && head.y === food.y) {
                snakeScore++;
                document.getElementById('snake-score').innerText = snakeScore;
                food = {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)};
            } else snake.pop();
            ctx.fillStyle='#111'; ctx.fillRect(0,0,300,300);
            ctx.fillStyle='#4ade80'; snake.forEach((s,i) => { ctx.fillStyle = i===0 ? '#22c55e' : '#4ade80'; ctx.fillRect(s.x*15, s.y*15, 13, 13); });
            ctx.fillStyle='#f87171'; ctx.beginPath(); ctx.arc(food.x*15+7, food.y*15+7, 6, 0, Math.PI*2); ctx.fill();
        }, 120);
    }

    // 7. Memory
    function startMemory() {
        title.innerText = t("기억력 카드", "Memory Cards");
        const emojis = ['🍎','🍊','🍋','🍇','🍓','🍒','🥝','🍑'];
        const pairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        let tries = 0, matched = 0, first = null, locked = false;
        const startTime = Date.now();

        container.innerHTML = `
            <div style="text-align:center; width:100%;">
                <div style="display:flex; justify-content:center; gap:30px; margin-bottom:15px; font-size:0.9rem; color:var(--text-muted);">
                    <span>${t('시도','Tries')}: <strong id="mem-tries">0</strong></span>
                    <span>${t('맞춤','Matched')}: <strong id="mem-matched">0</strong>/8</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; max-width:320px; margin:0 auto;" id="mem-grid"></div>
            </div>
        `;
        const grid = document.getElementById('mem-grid');
        pairs.forEach((emoji, i) => {
            const card = document.createElement('div');
            card.style.cssText = 'height:70px; background:var(--card-bg); border:2px solid var(--border-color); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; cursor:pointer; transition:0.2s; user-select:none;';
            card.dataset.val = emoji;
            card.dataset.flipped = 'false';
            card.innerHTML = '<span style="font-size:1.4rem;">❓</span>';
            card.onclick = () => {
                if (locked || card.dataset.flipped === 'true') return;
                card.innerHTML = emoji;
                card.style.background = 'var(--accent-color)22';
                card.dataset.flipped = 'true';
                if (!first) { first = card; return; }
                locked = true; tries++;
                document.getElementById('mem-tries').innerText = tries;
                if (first.dataset.val === card.dataset.val) {
                    first.style.background = '#10b98122';
                    card.style.background = '#10b98122';
                    first.style.borderColor = '#10b981';
                    card.style.borderColor = '#10b981';
                    matched++;
                    document.getElementById('mem-matched').innerText = matched;
                    first = null; locked = false;
                    if (matched === 8) {
                        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                        setTimeout(() => alert(`🎉 ${t('완성!','Complete!')} ${tries}${t('번 시도',' tries')} · ${elapsed}${t('초','s')}`), 300);
                    }
                } else {
                    setTimeout(() => {
                        first.innerHTML = '<span style="font-size:1.4rem;">❓</span>';
                        card.innerHTML = '<span style="font-size:1.4rem;">❓</span>';
                        first.style.background = 'var(--card-bg)';
                        card.style.background = 'var(--card-bg)';
                        first.dataset.flipped = 'false';
                        card.dataset.flipped = 'false';
                        first = null; locked = false;
                    }, 700);
                }
            };
            grid.appendChild(card);
        });
    }

    // 8. Color
    function startColor() {
        title.innerText = t("색상 차이 찾기", "Spot the Color");
        let score = 0;
        function ask() {
            container.innerHTML = `
                <div style="text-align:center; margin-bottom:10px; font-size:0.9rem; color:var(--text-muted);">${t('점수','Score')}: <strong>${score}</strong> — ${t('레벨','Level')} ${score + 1}</div>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; width:300px;" id="g"></div>`;
            const g = document.getElementById('g');
            const r = Math.floor(Math.random()*180); const gr = Math.floor(Math.random()*180); const b = Math.floor(Math.random()*180);
            const diff = Math.max(15, 40 - score * 2); // diff stays >= 15, decreases as score rises
            const target = Math.floor(Math.random()*9);
            for(let i=0; i<9; i++) {
                const box = document.createElement('div');
                box.style.cssText = `height:80px; border-radius:10px; cursor:pointer; background:rgb(${i===target?Math.min(r+diff,255):r},${i===target?Math.min(gr+diff,255):gr},${i===target?Math.min(b+diff,255):b})`;
                box.onclick = () => { if(i===target) { score++; ask(); } else { alert(t('탈락! 점수: ','Game over! Score: ') + score); closeGame(); } };
                g.appendChild(box);
            }
        }
        ask();
    }

    // 9. Typing
    function startTyping() {
        title.innerText = t("타이핑 챌린지", "Typing Challenge");
        const wordsKo = ['바나나','포도','치타','코끼리','컴퓨터','자바스크립트','웰니스','밸런스','건강','운동'];
        const wordsEn = ['banana','grapes','cheetah','elephant','computer','javascript','wellness','balance','health','exercise'];
        const lang = localStorage.getItem('lang') || 'ko';
        const words = lang === 'en' ? wordsEn : wordsKo;
        let score = 0;
        function ask() {
            const word = words[Math.floor(Math.random()*words.length)];
            container.innerHTML = `<div style="text-align:center;"><h3>${t('점수','Score')}: ${score}</h3><h1 style="font-size:3rem; margin:20px 0;">${word}</h1><input id="in" style="padding:10px; font-size:1.5rem;"><button id="ok" class="calc-btn">${t('입력','Submit')}</button></div>`;
            const input = document.getElementById('in');
            input.focus();
            const check = () => { if(input.value === word) { score++; ask(); } else { alert(t('최종 점수: ','Final score: ') + score); closeGame(); } };
            document.getElementById('ok').onclick = check;
            input.onkeyup = e => { if(e.key==='Enter') check(); };
        }
        ask();
    }

    // 10. Number
    function startNumber() {
        title.innerText = t("숫자 맞추기", "Number Guess");
        const target = Math.floor(Math.random()*100)+1;
        container.innerHTML = `<div style="text-align:center;"><input type="number" id="n" placeholder="1~100" style="padding:10px;"><button id="go" class="calc-btn">Go</button><p id="h">${t('과연 숫자는?','What is the number?')}</p></div>`;
        document.getElementById('go').onclick = () => {
            const v = parseInt(document.getElementById('n').value);
            const h = document.getElementById('h');
            if(v === target) { alert(t('정답!','Correct!')); closeGame(); }
            else if(v < target) h.innerText = 'Up!';
            else h.innerText = 'Down!';
        };
    }
});