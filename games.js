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
                    <div id="tetris-level" style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-top:4px;">Lv.1</div>
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
            const lv = Math.floor(player.score / 200) + 1;
            const lvEl = document.getElementById('tetris-level');
            if (lvEl) lvEl.innerText = `Lv.${lv}`;
        }

        // ── game loop ─────────────────────────────────────────────────
        let dropCounter = 0, dropInterval = 1000, lastTime = 0;

        function update(time = 0) {
            const dt = time - lastTime;
            lastTime = time;
            dropCounter += dt;
            dropInterval = Math.max(80, 1000 - Math.floor(player.score / 200) * 100);
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
        let count = 0, time = 10, combo = 1, lastClick = 0;
        container.innerHTML = `
            <div style="text-align:center; width:100%;">
                <div style="display:flex; justify-content:center; gap:24px; margin-bottom:10px; font-size:0.9rem;">
                    <div>${t('시간','Time')}: <strong id="ct">10</strong>s</div>
                    <div>${t('점수','Score')}: <strong id="cc" style="color:var(--accent-color);">0</strong></div>
                    <div>${t('콤보','Combo')}: <strong id="cmb" style="color:#f59e0b;">x1</strong></div>
                </div>
                <button id="b" style="width:160px; height:160px; border-radius:50%; font-size:1.4rem; font-weight:900;
                    background:var(--accent-color); color:white; border:none; cursor:pointer; transition:transform 0.05s;
                    box-shadow:0 8px 30px rgba(99,102,241,0.45); user-select:none;">${t('클릭!','CLICK!')}</button>
                <p id="cmsg" style="height:22px; font-size:0.95rem; font-weight:800; color:#f59e0b; margin-top:8px;"></p>
            </div>`;
        const b = document.getElementById('b');
        const MSGS = ['','','DOUBLE!','TRIPLE!','QUAD!!','MAX COMBO!!!'];
        b.addEventListener('click', () => {
            if (time <= 0) return;
            const now = Date.now();
            combo = (now - lastClick < 350) ? Math.min(combo + 1, 5) : 1;
            lastClick = now;
            count += combo;
            document.getElementById('cc').innerText = count;
            document.getElementById('cmb').innerText = `x${combo}`;
            document.getElementById('cmsg').innerText = combo >= 2 ? MSGS[combo] : '';
            b.style.transform = 'scale(0.88)';
            b.style.boxShadow = combo >= 3 ? '0 0 30px #f59e0b' : '0 8px 30px rgba(99,102,241,0.45)';
            setTimeout(() => { b.style.transform = 'scale(1)'; b.style.boxShadow = '0 8px 30px rgba(99,102,241,0.45)'; }, 80);
        });
        gameInterval = setInterval(() => {
            document.getElementById('ct').innerText = --time;
            if (time <= 0) {
                clearInterval(gameInterval);
                const stars = count < 20 ? 1 : count < 50 ? 2 : count < 80 ? 3 : count < 120 ? 4 : 5;
                setTimeout(() => alert(t(`완료! 점수: ${count}점 ${'⭐'.repeat(stars)}`, `Done! ${count} pts ${'⭐'.repeat(stars)}`)), 50);
                closeGame();
            }
        }, 1000);
    }

    // 4. Math
    function startMath() {
        title.innerText = t("암산왕", "Mental Math");
        let score = 0, mathTimer = null;

        function makeQ(s) {
            let a, b, op, ans;
            if (s < 5) {
                a = Math.floor(Math.random()*20); b = Math.floor(Math.random()*20); op='+'; ans=a+b;
            } else if (s < 10) {
                a = Math.floor(Math.random()*30)+1; b = Math.floor(Math.random()*a)+1;
                op = Math.random()>0.5?'+':'-'; ans = op==='+'? a+b : a-b;
            } else if (s < 20) {
                const r=Math.random();
                if(r<0.4){a=Math.floor(Math.random()*40);b=Math.floor(Math.random()*40);op='+';ans=a+b;}
                else if(r<0.7){a=Math.floor(Math.random()*40)+1;b=Math.floor(Math.random()*a)+1;op='-';ans=a-b;}
                else{a=Math.floor(Math.random()*12)+1;b=Math.floor(Math.random()*12)+1;op='×';ans=a*b;}
            } else {
                const r=Math.random();
                if(r<0.25){a=Math.floor(Math.random()*50);b=Math.floor(Math.random()*50);op='+';ans=a+b;}
                else if(r<0.5){a=Math.floor(Math.random()*50)+1;b=Math.floor(Math.random()*a)+1;op='-';ans=a-b;}
                else if(r<0.75){a=Math.floor(Math.random()*12)+1;b=Math.floor(Math.random()*12)+1;op='×';ans=a*b;}
                else{b=Math.floor(Math.random()*11)+2;ans=Math.floor(Math.random()*11)+2;a=b*ans;op='÷';}
            }
            return {a,b,op,ans};
        }

        function ask() {
            if (mathTimer) clearInterval(mathTimer);
            const totalSec = Math.max(5, 10 - Math.floor(score/5));
            let timeLeft = totalSec;
            const q = makeQ(score);
            const stage = score<5?t('덧셈','Addition'):score<10?t('덧셈/뺄셈','±'):score<20?t('사칙','× ÷ ±'):t('고난도','Expert');
            container.innerHTML = `
                <div style="text-align:center; width:100%;">
                    <div style="display:flex; justify-content:center; gap:20px; font-size:0.85rem; color:var(--text-muted); margin-bottom:6px;">
                        <span>${t('점수','Score')}: <strong style="color:var(--accent-color);">${score}</strong></span>
                        <span>${stage}</span>
                        <span id="mt">${timeLeft}s</span>
                    </div>
                    <div style="height:6px; background:var(--border-color); border-radius:3px; margin-bottom:16px;">
                        <div id="mbar" style="height:100%; width:100%; background:var(--accent-color); border-radius:3px; transition:width 0.08s linear;"></div>
                    </div>
                    <h1 style="font-size:2.8rem; margin:10px 0; letter-spacing:3px;">${q.a} ${q.op} ${q.b} = ?</h1>
                    <input type="number" id="mans" style="padding:12px; font-size:1.6rem; width:130px; text-align:center; margin:8px 0;" autofocus>
                    <br>
                    <button id="msub" class="calc-btn" style="max-width:160px; padding:12px; margin-top:8px;">${t('확인','Submit')}</button>
                </div>`;
            document.getElementById('mans').focus();
            const submit = () => {
                clearInterval(mathTimer);
                if (parseInt(document.getElementById('mans').value) === q.ans) { score++; ask(); }
                else { alert(t(`틀렸습니다! 정답: ${q.ans} / 최종 점수: ${score}`,`Wrong! Answer: ${q.ans} / Score: ${score}`)); closeGame(); }
            };
            document.getElementById('msub').onclick = submit;
            document.getElementById('mans').onkeyup = e => { if(e.key==='Enter') submit(); };
            mathTimer = setInterval(() => {
                timeLeft -= 0.1;
                const bar = document.getElementById('mbar'), te = document.getElementById('mt');
                if (bar) bar.style.width = `${Math.max(0,(timeLeft/totalSec)*100)}%`;
                if (te) te.innerText = Math.ceil(timeLeft)+'s';
                if (timeLeft <= 0) { clearInterval(mathTimer); alert(t(`시간 초과! 정답: ${q.ans} / 점수: ${score}`,`Time up! Answer: ${q.ans} / Score: ${score}`)); closeGame(); }
            }, 100);
        }
        ask();
    }

    // 5. Reaction
    function startReaction() {
        title.innerText = t("반응 속도", "Reaction Speed");
        const ROUNDS = 5;
        let round = 0, results = [];

        function nextRound() {
            round++;
            container.innerHTML = `
                <div style="text-align:center; font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">
                    ${t(`라운드 ${round} / ${ROUNDS}`, `Round ${round} / ${ROUNDS}`)}
                    ${results.length ? ` &nbsp;·&nbsp; ${t('직전','Last')}: <strong>${results[results.length-1]}ms</strong>` : ''}
                </div>
                <div id="rbox" style="width:100%; height:240px; background:#ef4444; color:white;
                    display:flex; align-items:center; justify-content:center; cursor:pointer;
                    border-radius:16px; font-size:1.4rem; font-weight:800; user-select:none; transition:background 0.15s;">
                    ${t('초록으로 바뀌면 클릭!','Wait for green, then click!')}
                </div>`;
            const box = document.getElementById('rbox');
            let start = 0;
            const wait = setTimeout(() => {
                box.style.background = '#22c55e';
                box.innerText = t('지금 클릭!!!', 'CLICK NOW!!!');
                start = Date.now();
            }, 1500 + Math.random() * 3000);
            box.onclick = () => {
                if (!start) {
                    clearTimeout(wait);
                    box.style.background = '#f59e0b'; box.onclick = null;
                    box.innerText = t('너무 빨랐어요! 다시...', 'Too early! Retrying...');
                    round--;
                    setTimeout(nextRound, 1400);
                    return;
                }
                const ms = Date.now() - start;
                results.push(ms);
                box.onclick = null;
                if (results.length < ROUNDS) {
                    box.style.background = '#6366f1';
                    box.innerText = `${ms}ms! ${t('다음 라운드...', 'Next round...')}`;
                    setTimeout(nextRound, 1100);
                } else {
                    showResult();
                }
            };
        }

        function showResult() {
            const avg = Math.round(results.reduce((a,b)=>a+b,0)/results.length);
            const best = Math.min(...results);
            const grade = avg<180?'S':avg<250?'A':avg<350?'B':avg<500?'C':'D';
            const gc = {S:'#facc15',A:'#4ade80',B:'#60a5fa',C:'#fb923c',D:'#f87171'}[grade];
            container.innerHTML = `
                <div style="text-align:center; width:100%;">
                    <div style="font-size:4.5rem; font-weight:900; color:${gc}; line-height:1;">${grade}</div>
                    <p style="color:var(--text-muted); margin:8px 0 16px; font-size:0.9rem;">
                        ${t(`평균 ${avg}ms · 최고 ${best}ms`, `Avg ${avg}ms · Best ${best}ms`)}
                    </p>
                    <div style="display:flex; flex-direction:column; gap:5px; max-width:240px; margin:0 auto 16px;">
                        ${results.map((r,i) => {
                            const c = r<250?'#4ade80':r<400?'#facc15':'#f87171';
                            return `<div style="display:flex; justify-content:space-between; padding:6px 12px;
                                background:var(--card-bg); border-radius:8px; font-size:0.85rem; border:1px solid var(--border-color);">
                                <span>${t(`라운드 ${i+1}`,`Round ${i+1}`)}</span>
                                <strong style="color:${c};">${r}ms</strong></div>`;
                        }).join('')}
                    </div>
                    <button class="calc-btn" style="max-width:160px; padding:12px;" onclick="startGame('reaction')">${t('다시 하기','Play Again')}</button>
                </div>`;
        }
        nextRound();
    }

    // 6. Snake
    function startSnake() {
        title.innerText = t("스네이크", "Snake");
        container.innerHTML = `
            <div style="text-align:center;">
                <div style="display:flex; justify-content:center; gap:20px; margin-bottom:8px; font-size:0.85rem; color:var(--text-muted);">
                    <span>${t('점수','Score')}: <strong id="snake-score" style="color:var(--accent-color);">0</strong></span>
                    <span>${t('레벨','Lv')}: <strong id="snake-lv" style="color:#f59e0b;">1</strong></span>
                </div>
                <canvas id="snake" width="300" height="300" style="border-radius:10px; background:#111;"></canvas>
                <div style="margin-top:10px; display:grid; grid-template-columns:repeat(3,1fr); gap:6px; max-width:150px; margin-left:auto; margin-right:auto;">
                    <div></div><button id="s-up" class="calc-btn" style="padding:10px;">↑</button><div></div>
                    <button id="s-left" class="calc-btn" style="padding:10px;">←</button>
                    <div></div>
                    <button id="s-right" class="calc-btn" style="padding:10px;">→</button>
                    <div></div><button id="s-down" class="calc-btn" style="padding:10px;">↓</button><div></div>
                </div>
                <p style="font-size:0.72rem; color:var(--text-muted); margin-top:6px;">${t('5점마다 속도 증가!','Speed up every 5 points!')}</p>
            </div>`;
        const canvas = document.getElementById('snake');
        const ctx = canvas.getContext('2d');
        let snake = [{x:10,y:10}], food = {x:15,y:15}, dx = 1, dy = 0, snakeScore = 0, level = 1;

        const move = (ndx, ndy) => {
            if (ndx !== 0 && dx === 0) { dx=ndx; dy=0; }
            if (ndy !== 0 && dy === 0) { dx=0; dy=ndy; }
        };
        document.onkeydown = e => {
            if(e.keyCode===37){e.preventDefault();move(-1,0);}
            if(e.keyCode===38){e.preventDefault();move(0,-1);}
            if(e.keyCode===39){e.preventDefault();move(1,0);}
            if(e.keyCode===40){e.preventDefault();move(0,1);}
        };
        document.getElementById('s-up').onclick    = () => move(0,-1);
        document.getElementById('s-down').onclick  = () => move(0,1);
        document.getElementById('s-left').onclick  = () => move(-1,0);
        document.getElementById('s-right').onclick = () => move(1,0);

        function spawnFood() {
            let pos;
            do { pos = {x:Math.floor(Math.random()*20), y:Math.floor(Math.random()*20)}; }
            while (snake.some(s=>s.x===pos.x&&s.y===pos.y));
            return pos;
        }

        function tick() {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            if (head.x<0||head.x>=20||head.y<0||head.y>=20||snake.some(s=>s.x===head.x&&s.y===head.y)) {
                clearInterval(gameInterval);
                ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,300,300);
                ctx.fillStyle='#fff'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
                ctx.fillText(t('Game Over','Game Over'), 150, 125);
                ctx.font='16px sans-serif';
                ctx.fillText(`${t('점수','Score')}: ${snakeScore}  ${t('레벨','Lv')}: ${level}`, 150, 158);
                return;
            }
            snake.unshift(head);
            if (head.x===food.x && head.y===food.y) {
                snakeScore++;
                document.getElementById('snake-score').innerText = snakeScore;
                food = spawnFood();
                const newLv = Math.floor(snakeScore/5) + 1;
                if (newLv !== level) {
                    level = newLv;
                    document.getElementById('snake-lv').innerText = level;
                    clearInterval(gameInterval);
                    gameInterval = setInterval(tick, Math.max(45, 120 - (level-1)*12));
                }
            } else snake.pop();

            ctx.fillStyle='#111'; ctx.fillRect(0,0,300,300);
            // draw grid hint
            ctx.strokeStyle='rgba(255,255,255,0.03)';
            for(let i=0;i<=20;i++){ctx.beginPath();ctx.moveTo(i*15,0);ctx.lineTo(i*15,300);ctx.stroke();}
            // food
            ctx.fillStyle='#f87171'; ctx.beginPath(); ctx.arc(food.x*15+7,food.y*15+7,6,0,Math.PI*2); ctx.fill();
            // snake
            snake.forEach((s,i)=>{
                ctx.fillStyle = i===0?'#22c55e':'#4ade80';
                ctx.beginPath(); ctx.roundRect(s.x*15+1,s.y*15+1,12,12,3); ctx.fill();
            });
        }
        gameInterval = setInterval(tick, 120);
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
                        const stars = tries <= 10 ? 5 : tries <= 13 ? 4 : tries <= 16 ? 3 : tries <= 20 ? 2 : 1;
                        setTimeout(() => alert(`🎉 ${t('완성!','Complete!')} ${'⭐'.repeat(stars)}\n${tries}${t('번 시도',' tries')} · ${elapsed}${t('초','s')}`), 300);
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
        let score = 0, colorTimer = null;
        function ask() {
            if (colorTimer) clearInterval(colorTimer);
            const timeSec = Math.max(2, 6 - Math.floor(score / 4));
            let timeLeft = timeSec;
            container.innerHTML = `
                <div style="text-align:center; margin-bottom:6px; font-size:0.85rem; color:var(--text-muted);">
                    ${t('점수','Score')}: <strong style="color:var(--accent-color);">${score}</strong>
                    &nbsp;·&nbsp; ${t('레벨','Level')} ${score+1}
                    &nbsp;·&nbsp; <span id="ctimer" style="color:#f59e0b; font-weight:700;">${timeSec}s</span>
                </div>
                <div style="height:5px; background:var(--border-color); border-radius:3px; margin-bottom:10px; width:300px; max-width:100%;">
                    <div id="cbar" style="height:100%; width:100%; background:#f59e0b; border-radius:3px; transition:width 0.08s linear;"></div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; width:300px; max-width:100%;" id="g"></div>`;
            const g = document.getElementById('g');
            const r=Math.floor(Math.random()*180), gr=Math.floor(Math.random()*180), b=Math.floor(Math.random()*180);
            const diff = Math.max(12, 42 - score * 2);
            const target = Math.floor(Math.random()*9);
            for (let i=0; i<9; i++) {
                const box = document.createElement('div');
                box.style.cssText = `height:80px; border-radius:10px; cursor:pointer; transition:transform 0.1s;
                    background:rgb(${i===target?Math.min(r+diff,255):r},${i===target?Math.min(gr+diff,255):gr},${i===target?Math.min(b+diff,255):b})`;
                box.onmouseover = () => { box.style.transform = 'scale(1.04)'; };
                box.onmouseout  = () => { box.style.transform = 'scale(1)'; };
                box.onclick = () => {
                    clearInterval(colorTimer);
                    if (i===target) { score++; ask(); }
                    else { alert(t('탈락! 점수: ','Game over! Score: ')+score); closeGame(); }
                };
                g.appendChild(box);
            }
            colorTimer = setInterval(() => {
                timeLeft -= 0.1;
                const bar = document.getElementById('cbar'), te = document.getElementById('ctimer');
                if (bar) bar.style.width = `${Math.max(0,(timeLeft/timeSec)*100)}%`;
                if (te) te.innerText = Math.ceil(timeLeft)+'s';
                if (timeLeft <= 0) { clearInterval(colorTimer); alert(t('시간 초과! 점수: ','Time out! Score: ')+score); closeGame(); }
            }, 100);
        }
        ask();
    }

    // 9. Typing
    function startTyping() {
        title.innerText = t("타이핑 챌린지", "Typing Challenge");
        const lang = localStorage.getItem('lang') || 'ko';
        const poolKo = [
            ['건강','운동','수면','식단','물'],
            ['바나나','포도','치타','코끼리','컴퓨터'],
            ['자바스크립트','웰니스','밸런스','비타민','미네랄'],
            ['영양소','단백질','탄수화물','면역력','집중력']
        ];
        const poolEn = [
            ['run','rest','diet','sleep','water'],
            ['banana','grapes','cheetah','elephant','computer'],
            ['wellness','balance','vitamin','mineral','protein'],
            ['javascript','nutrition','immunity','exercise','endurance']
        ];
        const pool = lang === 'en' ? poolEn : poolKo;
        let score = 0, totalChars = 0, startTime = Date.now(), typingTimer = null;

        function ask() {
            if (typingTimer) clearInterval(typingTimer);
            const tier = Math.min(Math.floor(score / 5), pool.length - 1);
            const wordList = pool[tier];
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            const timeSec = Math.max(4, 10 - score);
            let timeLeft = timeSec;
            const elapsed = ((Date.now() - startTime) / 60000);
            const wpm = elapsed > 0 ? Math.round((score / elapsed)) : 0;

            container.innerHTML = `
                <div style="text-align:center; width:100%;">
                    <div style="display:flex; justify-content:center; gap:20px; font-size:0.85rem; color:var(--text-muted); margin-bottom:6px;">
                        <span>${t('점수','Score')}: <strong style="color:var(--accent-color);">${score}</strong></span>
                        <span>WPM: <strong style="color:#10b981;">${wpm}</strong></span>
                        <span id="ttime" style="color:#f59e0b; font-weight:700;">${timeSec}s</span>
                    </div>
                    <div style="height:5px; background:var(--border-color); border-radius:3px; margin-bottom:14px;">
                        <div id="tbar" style="height:100%; width:100%; background:#f59e0b; border-radius:3px; transition:width 0.08s linear;"></div>
                    </div>
                    <div style="font-size:2.6rem; font-weight:900; letter-spacing:4px; margin:10px 0;
                        color:var(--primary-color);">${word}</div>
                    <input id="tin" style="padding:12px; font-size:1.4rem; text-align:center; width:200px; margin:8px 0;" autofocus placeholder="${t('여기에 입력...','type here...')}">
                    <br>
                    <button id="tok" class="calc-btn" style="max-width:140px; padding:10px; margin-top:6px;">${t('입력 (Enter)','Submit (Enter)')}</button>
                </div>`;
            const input = document.getElementById('tin');
            input.focus();

            // live character highlight
            input.oninput = () => {
                const val = input.value;
                input.style.borderColor = word.startsWith(val) ? '#10b981' : '#ef4444';
            };

            const check = () => {
                clearInterval(typingTimer);
                if (input.value === word) { score++; totalChars += word.length; ask(); }
                else { alert(t(`틀렸습니다! 정답: "${word}"\n점수: ${score}  WPM: ${wpm}`, `Wrong! Answer: "${word}"\nScore: ${score}  WPM: ${wpm}`)); closeGame(); }
            };
            document.getElementById('tok').onclick = check;
            input.onkeyup = e => { if(e.key==='Enter') check(); };

            typingTimer = setInterval(() => {
                timeLeft -= 0.1;
                const bar = document.getElementById('tbar'), te = document.getElementById('ttime');
                if (bar) bar.style.width = `${Math.max(0,(timeLeft/timeSec)*100)}%`;
                if (te) te.innerText = Math.ceil(timeLeft)+'s';
                if (timeLeft <= 0) { clearInterval(typingTimer); alert(t(`시간 초과! 점수: ${score}  WPM: ${wpm}`,`Time up! Score: ${score}  WPM: ${wpm}`)); closeGame(); }
            }, 100);
        }
        ask();
    }

    // 10. Number
    function startNumber() {
        title.innerText = t("숫자 맞추기", "Number Guess");
        const target = Math.floor(Math.random()*100)+1;
        let tries = 0, lo = 1, hi = 100;

        function render(hint, heatPct, heatColor) {
            container.innerHTML = `
                <div style="text-align:center; width:100%;">
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:4px;">
                        ${t(`범위: ${lo} ~ ${hi}  시도: ${tries}회`, `Range: ${lo}–${hi}  Tries: ${tries}`)}
                    </p>
                    <div style="height:12px; background:var(--border-color); border-radius:6px; margin-bottom:14px; overflow:hidden;">
                        <div style="height:100%; width:${heatPct}%; background:${heatColor}; border-radius:6px; transition:width 0.4s, background 0.4s;"></div>
                    </div>
                    <div id="hint-msg" style="font-size:1.3rem; font-weight:800; min-height:36px; margin-bottom:12px;
                        color:${heatColor};">${hint}</div>
                    <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
                        <input type="number" id="n" min="1" max="100" placeholder="1~100"
                            style="padding:12px; font-size:1.3rem; width:110px; text-align:center;" autofocus>
                        <button id="go" style="padding:12px 20px; background:var(--accent-color); color:white; border:none;
                            border-radius:12px; font-size:1rem; font-weight:700; cursor:pointer;">Go</button>
                    </div>
                </div>`;
            const input = document.getElementById('n');
            input.focus();
            const submit = () => {
                const v = parseInt(input.value);
                if (!v || v < 1 || v > 100) return;
                tries++;
                const dist = Math.abs(v - target);
                const pct = Math.round((1 - dist/100) * 100);
                const color = dist===0?'#facc15':dist<=5?'#f87171':dist<=15?'#fb923c':dist<=30?'#facc15':'#60a5fa';
                if (v === target) {
                    const grade = tries<=5?'S':tries<=8?'A':tries<=12?'B':tries<=18?'C':'D';
                    const gc = {S:'#facc15',A:'#4ade80',B:'#60a5fa',C:'#fb923c',D:'#f87171'}[grade];
                    setTimeout(() => alert(t(`🎉 정답! ${target} / ${tries}번 만에 등급: ${grade}`,`🎉 Correct! ${target} in ${tries} tries — Grade ${grade}`)), 50);
                    closeGame();
                    return;
                }
                if (v < target) { lo = Math.max(lo, v+1); render(t(`⬆ 더 높아요! (${v})`,`⬆ Higher! (${v})`), pct, color); }
                else { hi = Math.min(hi, v-1); render(t(`⬇ 더 낮아요! (${v})`,`⬇ Lower! (${v})`), pct, color); }
            };
            document.getElementById('go').onclick = submit;
            input.onkeyup = e => { if(e.key==='Enter') submit(); };
        }
        render(t('1~100 사이 숫자를 맞춰보세요!','Guess the number between 1 and 100!'), 50, '#60a5fa');
    }
});