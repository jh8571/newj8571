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
            case '2048': start2048(); break;
            case 'flappy': startFlappy(); break;
            case 'minesweeper': startMinesweeper(); break;
            case 'breakout': startBreakout(); break;
            case 'whack': startWhackMole(); break;
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
        history.replaceState({}, '', location.pathname);
    };

    // ── Shared result screen with SNS share ───────────────────────
    function showGameResult(gameKey, heading, stats) {
        if (gameInterval) { clearInterval(gameInterval); cancelAnimationFrame(gameInterval); }
        document.onkeydown = null;
        // 게임 점수 Firebase 저장
        const scoreObj = stats.find(s => s.big);
        if (scoreObj && window.vgSaveGame) {
            // score 필드가 있으면 우선 사용, 없으면 value를 숫자로 파싱
            const numScore = scoreObj.score || parseInt(String(scoreObj.value).replace(/,/g, '')) || 0;
            if (numScore > 0) window.vgSaveGame(gameKey, numScore);
        }
        // 결과를 URL에 임베드해서 공유 시 친구도 결과 화면을 볼 수 있게
        const bigVal = scoreObj ? encodeURIComponent(String(scoreObj.value)) : '';
        history.replaceState({}, '', `?g=${gameKey}&s=${bigVal}&h=${encodeURIComponent(heading)}`);

        const emojiMap = {tetris:'🟦',sudoku:'🔢',clicker:'👆',math:'🔢',reaction:'⚡',
                          snake:'🐍',memory:'🃏',color:'🎨',typing:'⌨️',number:'🎯',
                          '2048':'🎲',flappy:'🐦',minesweeper:'💣',breakout:'🧱',whack:'🔨'};
        const emoji = emojiMap[gameKey] || '🎮';
        const gameNameMap = {tetris:t('테트리스','Tetris'),sudoku:t('스도쿠','Sudoku'),
            clicker:t('클릭커','Clicker'),math:t('암산왕','Mental Math'),
            reaction:t('반응속도','Reaction Speed'),snake:t('스네이크','Snake'),
            memory:t('기억력 카드','Memory Cards'),color:t('색상 찾기','Spot the Color'),
            typing:t('타이핑','Typing'),number:t('숫자 맞추기','Number Guess'),
            '2048':t('2048','2048'),flappy:t('플래피버드','Flappy Bird'),
            minesweeper:t('지뢰찾기','Minesweeper'),breakout:t('블록 깨기','Breakout'),
            whack:t('두더지 잡기','Whack-a-Mole')};

        const shareLines = [
            `${emoji} VitalGuide — ${gameNameMap[gameKey]}`,
            ...stats.map(s => `${s.label}: ${s.value}`),
            t('도전해보세요!','Can you beat this?')
        ];
        const shareText = shareLines.join('\n');
        const shareURL  = window.location.href;

        container.innerHTML = `
            <div style="width:100%; text-align:center;">
                <div style="background:var(--card-bg); border:1px solid var(--border-color);
                    border-radius:20px; padding:24px 20px; max-width:320px; margin:0 auto;">
                    <div style="font-size:1.25rem; font-weight:900; color:var(--primary-color); margin-bottom:16px;">
                        ${heading}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0;">
                        ${stats.map(s => `
                            <div style="display:flex; justify-content:space-between; align-items:center;
                                padding:9px 0; border-bottom:1px solid var(--border-color); font-size:0.9rem;">
                                <span style="color:var(--text-muted);">${s.label}</span>
                                <strong style="font-size:${s.big?'1.4':'0.95'}rem; color:${s.color||'var(--primary-color)'};">${s.value}</strong>
                            </div>`).join('')}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:18px;">
                        <button id="rg-share" style="padding:12px; background:#6366f1; color:white; border:none;
                            border-radius:12px; font-weight:700; cursor:pointer; font-size:0.9rem; display:flex;
                            align-items:center; justify-content:center; gap:6px;">
                            📤 ${t('결과 공유하기','Share My Result')}
                        </button>
                        <button id="rg-copy" style="padding:10px; background:var(--card-bg);
                            border:2px solid var(--border-color); border-radius:12px; font-weight:700;
                            cursor:pointer; font-size:0.82rem; color:var(--text-muted);">
                            📋 ${t('텍스트 복사','Copy Text')}
                        </button>
                        <button id="rg-replay" style="padding:10px; background:var(--card-bg);
                            border:2px solid var(--accent-color); border-radius:12px; font-weight:700;
                            cursor:pointer; font-size:0.85rem; color:var(--accent-color);">
                            🔄 ${t('다시 하기','Play Again')}
                        </button>
                        <button id="rg-close" style="padding:8px; background:transparent; border:none;
                            font-size:0.8rem; color:var(--text-muted); cursor:pointer;">
                            ${t('게임 닫기','Close')}
                        </button>
                    </div>
                </div>
            </div>`;

        document.getElementById('rg-replay').onclick = () => window.startGame(gameKey);
        document.getElementById('rg-close').onclick  = closeGame;

        function copyToClip(text, onDone) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(onDone).catch(() => execCopyGame(text, onDone));
            } else { execCopyGame(text, onDone); }
        }
        function execCopyGame(text, onDone) {
            const el = document.createElement('textarea');
            el.value = text; el.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(el); el.focus(); el.select();
            try { document.execCommand('copy'); onDone(); } catch(e) {}
            document.body.removeChild(el);
        }

        document.getElementById('rg-share').onclick = () => {
            const full = shareText + '\n' + shareURL;
            if (navigator.share) {
                navigator.share({ title: `VitalGuide — ${gameNameMap[gameKey]}`, text: shareText, url: shareURL })
                    .catch(err => { if (err?.name !== 'AbortError') copyToClip(full, () => showGameToast(t('✅ 복사됐어요!','✅ Copied!'))); });
            } else {
                copyToClip(full, () => showGameToast(t('✅ 클립보드에 복사됐어요!','✅ Copied to clipboard!')));
            }
        };

        document.getElementById('rg-copy').onclick = () => {
            copyToClip(shareText + '\n' + shareURL, () => {
                const btn = document.getElementById('rg-copy');
                if (btn) btn.innerText = t('✅ 복사됨!','✅ Copied!');
            });
        };

        function showGameToast(msg) {
            const el = document.createElement('div');
            el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:12px 22px;border-radius:12px;font-size:0.9rem;font-weight:700;z-index:99999;white-space:nowrap;';
            el.textContent = msg; document.body.appendChild(el);
            setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity 0.3s'; setTimeout(()=>el.remove(),300); }, 2500);
        }
    }

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
                const finalScore = player.score;
                const lv = Math.floor(finalScore / 50) + 1;
                showGameResult('tetris', t('🟦 테트리스 결과','🟦 Tetris Result'), [
                    { label: t('최종 점수','Final Score'), value: finalScore, big: true, color: 'var(--accent-color)' },
                    { label: t('레벨','Level'), value: `Lv.${lv}` },
                    { label: t('클리어 라인 기여','Score/Line'), value: `${finalScore} pts` },
                ]);
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
            const scoreEl = document.getElementById('score');
            if (!scoreEl) return;
            scoreEl.innerText = player.score;
            const lv = Math.floor(player.score / 50) + 1;
            const lvEl = document.getElementById('tetris-level');
            if (lvEl) lvEl.innerText = `Lv.${lv}`;
        }

        // ── game loop ─────────────────────────────────────────────────
        let dropCounter = 0, dropInterval = 1000, lastTime = 0;

        function update(time = 0) {
            const dt = time - lastTime;
            lastTime = time;
            dropCounter += dt;
            dropInterval = Math.max(120, 1000 - Math.floor(player.score / 100) * 40);
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
            const memoFs = cs <= 30 ? '0.48rem' : '0.55rem';

            let hintsLeft = 3;
            let hintDeduction = 0;
            let memoMode = false;

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
                <div style="display:flex; gap:6px; margin-top:10px; justify-content:center; flex-wrap:wrap;">
                    <button id="s-hint" style="padding:9px 14px;background:var(--card-bg);color:#f59e0b;
                        border:2px solid #f59e0b;border-radius:12px;font-size:0.82rem;font-weight:700;cursor:pointer;">
                        💡 ${t('힌트','Hint')} (3)
                    </button>
                    <button id="s-memo" style="padding:9px 14px;background:var(--card-bg);color:var(--text-muted);
                        border:2px solid var(--border-color);border-radius:12px;font-size:0.82rem;font-weight:700;cursor:pointer;">
                        📝 ${t('메모','Memo')}
                    </button>
                    <button id="s-check" style="padding:9px 16px;background:#6366f1;color:white;border:none;
                        border-radius:12px;font-size:0.82rem;font-weight:700;cursor:pointer;">
                        ${t('정답 확인','Check')}
                    </button>
                    <button onclick="startGame('sudoku')" style="padding:9px 14px;background:var(--card-bg);
                        color:var(--text-main);border:2px solid var(--border-color);border-radius:12px;
                        font-size:0.82rem;font-weight:700;cursor:pointer;">
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
                    td.dataset.fixed   = isFixed ? '1' : '0';
                    td.dataset.hinted  = '0';
                    td.dataset.memo    = '';
                    cells.push(td);

                    if (!isFixed) {
                        td.addEventListener('click', () => {
                            if (answered) return;
                            if (selIdx >= 0 && cells[selIdx].dataset.fixed === '0' && cells[selIdx].dataset.hinted === '0')
                                cells[selIdx].style.background = 'var(--card-bg)';
                            selIdx = idx;
                            td.style.background = 'rgba(99,102,241,0.18)';
                        });
                    }
                }
            }

            // ── 메모 셀 렌더 ──────────────────────────────────────────
            function renderMemo(td, arr) {
                td.dataset.memo = arr.join(',');
                if (arr.length === 0) {
                    td.textContent = '';
                    td.style.color = 'var(--text-muted)';
                    return;
                }
                td.innerHTML = `<span style="color:#ef4444;font-size:${memoFs};line-height:1.2;display:block;word-break:break-all;">${arr.join(',')}</span>`;
            }

            // ── 숫자 입력 ─────────────────────────────────────────────
            function inputNum(n) {
                if (answered || selIdx < 0) return;
                const cell = cells[selIdx];
                if (cell.dataset.fixed === '1' || cell.dataset.hinted === '1') return;

                if (n === 0) {
                    cell.dataset.memo = '';
                    cell.textContent = '';
                    cell.style.color = 'var(--text-muted)';
                    return;
                }

                if (memoMode) {
                    const cur = cell.dataset.memo ? cell.dataset.memo.split(',').map(Number).filter(x => x > 0) : [];
                    const pos = cur.indexOf(n);
                    if (pos >= 0) cur.splice(pos, 1); else { cur.push(n); cur.sort((a,b) => a-b); }
                    renderMemo(cell, cur);
                } else {
                    cell.dataset.memo = '';
                    cell.textContent = n;
                    cell.style.color = 'var(--text-muted)';
                }
            }

            document.getElementById('s-pad').querySelectorAll('[data-n]').forEach(btn => {
                btn.addEventListener('click', () => inputNum(parseInt(btn.dataset.n)));
            });

            document.onkeydown = e => {
                const k = parseInt(e.key);
                if (k >= 1 && k <= 9) { e.preventDefault(); inputNum(k); }
                else if (e.key === 'Backspace' || e.key === 'Delete') inputNum(0);
            };

            // ── 힌트 ─────────────────────────────────────────────────
            document.getElementById('s-hint').addEventListener('click', () => {
                if (hintsLeft <= 0) {
                    alert(t('힌트를 모두 사용했습니다.', 'No hints remaining.'));
                    return;
                }
                if (selIdx < 0 || cells[selIdx].dataset.fixed === '1' || cells[selIdx].dataset.hinted === '1') {
                    alert(t('힌트를 사용할 빈 칸을 선택하세요.', 'Select an empty cell first.'));
                    return;
                }
                const cell = cells[selIdx];
                hintsLeft--;
                hintDeduction += 20;
                cell.dataset.memo   = '';
                cell.dataset.hinted = '1';
                cell.textContent    = solution[selIdx];
                cell.style.color    = '#f59e0b';
                cell.style.background = 'rgba(245,158,11,0.15)';
                cell.style.cursor   = 'default';
                selIdx = -1;

                const hBtn = document.getElementById('s-hint');
                if (hBtn) {
                    hBtn.textContent = `💡 ${t('힌트','Hint')} (${hintsLeft})`;
                    if (hintsLeft === 0) { hBtn.disabled = true; hBtn.style.opacity = '0.4'; }
                }
            });

            // ── 메모 토글 ─────────────────────────────────────────────
            document.getElementById('s-memo').addEventListener('click', () => {
                memoMode = !memoMode;
                const mBtn = document.getElementById('s-memo');
                if (memoMode) {
                    mBtn.style.cssText += ';background:#ef4444;color:white;border-color:#ef4444;';
                    mBtn.textContent = `📝 ${t('메모 ON','Memo ON')}`;
                } else {
                    mBtn.style.background = 'var(--card-bg)';
                    mBtn.style.color      = 'var(--text-muted)';
                    mBtn.style.borderColor = 'var(--border-color)';
                    mBtn.textContent = `📝 ${t('메모','Memo')}`;
                }
            });

            // ── 정답 확인 ─────────────────────────────────────────────
            document.getElementById('s-check').addEventListener('click', () => {
                // 메모 남아있으면 제출 차단
                const hasLeftoverMemo = cells.some((td, i) => puzzle[i] === 0 && td.dataset.hinted === '0' && td.dataset.memo !== '');
                if (hasLeftoverMemo) {
                    cells.forEach((td, i) => {
                        if (puzzle[i] !== 0 || td.dataset.hinted === '1' || td.dataset.memo === '') return;
                        td.style.background = 'rgba(239,68,68,0.2)';
                        setTimeout(() => { td.style.background = selIdx === i ? 'rgba(99,102,241,0.18)' : 'var(--card-bg)'; }, 1400);
                    });
                    alert(t('📝 메모가 남아있는 칸이 있습니다.\n숫자를 하나로 확정한 뒤 제출하세요.',
                            '📝 Some cells still have memo notes.\nPlease finalize before submitting.'));
                    return;
                }

                answered = true;
                if (selIdx >= 0 && cells[selIdx].dataset.fixed === '0')
                    cells[selIdx].style.background = 'var(--card-bg)';
                selIdx = -1;
                document.onkeydown = null;

                let correct = 0, wrong = 0, empty = 0;
                const wrongDetails = [];

                cells.forEach((td, i) => {
                    if (puzzle[i] !== 0) return;
                    if (td.dataset.hinted === '1') {
                        td.style.color      = '#f59e0b';
                        td.style.background = 'rgba(245,158,11,0.15)';
                        correct++;
                        return;
                    }
                    const entered = parseInt(td.textContent);
                    if (!entered) {
                        td.textContent      = solution[i];
                        td.style.color      = '#94a3b8';
                        td.style.background = 'rgba(148,163,184,0.12)';
                        empty++;
                    } else if (entered === solution[i]) {
                        td.style.color      = '#10b981';
                        td.style.background = 'rgba(16,185,129,0.12)';
                        correct++;
                    } else {
                        wrongDetails.push({
                            row: Math.floor(i / 9) + 1,
                            col: (i % 9) + 1,
                            entered,
                            answer: solution[i]
                        });
                        td.textContent      = solution[i];
                        td.style.color      = '#ef4444';
                        td.style.background = 'rgba(239,68,68,0.12)';
                        wrong++;
                    }
                });

                const checkBtn = document.getElementById('s-check');
                if (checkBtn) { checkBtn.disabled = true; checkBtn.style.opacity = '0.5'; }

                const total = correct + wrong + empty;
                const pct   = Math.round((correct / total) * 100);
                const grade = pct===100?'S':pct>=80?'A':pct>=60?'B':pct>=40?'C':'D';
                const gc    = {S:'#facc15',A:'#4ade80',B:'#60a5fa',C:'#fb923c',D:'#f87171'}[grade];
                const diffName = removeCount<=35?t('초급','Easy'):removeCount<=46?t('중급','Medium'):t('고급','Hard');
                const finalScore = Math.max(0, pct * 3 - hintDeduction);

                const stats = [
                    { label: t('등급','Grade'), value: grade, big: true, color: gc, score: finalScore },
                    { label: t('난이도','Difficulty'), value: diffName },
                    { label: t('정답','Correct'), value: `${correct}${t('칸','cells')}`, color: '#10b981' },
                    { label: t('오답','Wrong'),   value: `${wrong}${t('칸','cells')}`,   color: '#ef4444' },
                    { label: t('정답률','Accuracy'), value: `${pct}%` },
                ];
                if (hintDeduction > 0)
                    stats.push({ label: t('힌트 감점','Hint Penalty'), value: `-${hintDeduction}${t('점','pts')}`, color: '#f59e0b' });
                wrongDetails.forEach(w => {
                    stats.push({
                        label: `↳ ${t(`${w.row}행 ${w.col}열`, `R${w.row} C${w.col}`)}`,
                        value: `${w.entered} → ${w.answer}`,
                        color: '#ef4444'
                    });
                });

                setTimeout(() => showGameResult('sudoku', t('🔢 스도쿠 결과','🔢 Sudoku Result'), stats), 100);
            });
        }
    }

    // 3. Clicker
    function startClicker() {
        title.innerText = t("클릭커 마스터", "Clicker Master");
        let count = 0, time = 10, combo = 1, maxCombo = 1, lastClick = 0;
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
            if (combo > maxCombo) maxCombo = combo;
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
                const starStr = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
                showGameResult('clicker', t('👆 클릭커 결과','👆 Clicker Result'), [
                    { label: t('총 점수','Total Score'), value: count, big: true, color: 'var(--accent-color)' },
                    { label: t('최고 콤보','Best Combo'), value: `x${maxCombo}` },
                    { label: t('평가','Rating'), value: starStr, color: '#f59e0b' },
                ]);
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
            const mathEnd = (reason) => {
                clearInterval(mathTimer);
                const tier = score<5?t('덧셈','Addition'):score<10?t('±','±'):score<20?t('사칙','×÷'):t('고난도','Expert');
                showGameResult('math', t('🧮 암산왕 결과','🧮 Mental Math Result'), [
                    { label: t('최종 점수','Final Score'), value: score, big: true, color: 'var(--accent-color)', score: score * 12 },
                    { label: t('도달 난이도','Level Reached'), value: tier },
                    { label: t('종료 이유','Ended by'), value: reason, color: '#f87171' },
                    { label: t('정답','Correct Answer'), value: q.ans, color: '#10b981' },
                ]);
            };
            const submit = () => {
                clearInterval(mathTimer);
                if (parseInt(document.getElementById('mans').value) === q.ans) { score++; ask(); }
                else mathEnd(t('오답','Wrong answer'));
            };
            document.getElementById('msub').onclick = submit;
            document.getElementById('mans').onkeyup = e => { if(e.key==='Enter') submit(); };
            gameInterval = mathTimer = setInterval(() => {
                timeLeft -= 0.1;
                const bar = document.getElementById('mbar'), te = document.getElementById('mt');
                if (bar) bar.style.width = `${Math.max(0,(timeLeft/totalSec)*100)}%`;
                if (te) te.innerText = Math.ceil(timeLeft)+'s';
                if (timeLeft <= 0) mathEnd(t('시간 초과','Time out'));
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
            showGameResult('reaction', t('⚡ 반응속도 결과','⚡ Reaction Speed Result'), [
                { label: t('등급','Grade'), value: grade, big: true, color: gc, score: Math.max(1, Math.round((1000 - avg) / 2)) },
                { label: t('평균 반응속도','Avg Reaction'), value: `${avg}ms` },
                { label: t('최고 기록','Best'), value: `${best}ms`, color: '#10b981' },
                ...results.map((r,i) => ({
                    label: t(`라운드 ${i+1}`,`Round ${i+1}`),
                    value: `${r}ms`,
                    color: r<250?'#4ade80':r<400?'#facc15':'#f87171'
                }))
            ]);
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
                const snakeLen = snake.length;
                showGameResult('snake', t('🐍 스네이크 결과','🐍 Snake Result'), [
                    { label: t('점수','Score'), value: snakeScore, big: true, color: 'var(--accent-color)', score: snakeScore * 8 },
                    { label: t('레벨','Level'), value: `Lv.${level}` },
                    { label: t('뱀 길이','Snake Length'), value: `${snakeLen}칸` },
                ]);
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
                        const starStr = '⭐'.repeat(stars) + '☆'.repeat(5-stars);
                        setTimeout(() => showGameResult('memory', t('🃏 기억력 카드 완성!','🃏 Memory Cards Complete!'), [
                            { label: t('평가','Rating'), value: starStr, big: true, color: '#f59e0b', score: stars * 60 },
                            { label: t('시도 횟수','Tries'), value: `${tries}${t('번','×')}` },
                            { label: t('완료 시간','Time'), value: `${elapsed}${t('초','s')}` },
                        ]), 300);
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
                    else {
                        showGameResult('color', t('🎨 색상 찾기 결과','🎨 Spot the Color Result'), [
                            { label: t('점수','Score'), value: score, big: true, color: 'var(--accent-color)', score: score * 12 },
                            { label: t('도달 레벨','Level Reached'), value: `Lv.${score}` },
                            { label: t('종료','Ended'), value: t('오선택','Wrong pick'), color: '#f87171' },
                        ]);
                    }
                };
                g.appendChild(box);
            }
            gameInterval = colorTimer = setInterval(() => {
                timeLeft -= 0.1;
                const bar = document.getElementById('cbar'), te = document.getElementById('ctimer');
                if (bar) bar.style.width = `${Math.max(0,(timeLeft/timeSec)*100)}%`;
                if (te) te.innerText = Math.ceil(timeLeft)+'s';
                if (timeLeft <= 0) {
                    clearInterval(colorTimer);
                    showGameResult('color', t('🎨 색상 찾기 결과','🎨 Spot the Color Result'), [
                        { label: t('점수','Score'), value: score, big: true, color: 'var(--accent-color)' },
                        { label: t('도달 레벨','Level Reached'), value: `Lv.${score}` },
                        { label: t('종료','Ended'), value: t('시간 초과','Time out'), color: '#f59e0b' },
                    ]);
                }
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

            const typingEnd = (reason) => {
                clearInterval(typingTimer);
                const tierName = ['입문','초급','중급','고급'][Math.min(Math.floor(score/5), 3)];
                showGameResult('typing', t('⌨️ 타이핑 결과','⌨️ Typing Result'), [
                    { label: t('점수','Score'), value: score, big: true, color: 'var(--accent-color)', score: score * 12 },
                    { label: 'WPM', value: wpm, color: '#10b981' },
                    { label: t('난이도','Level'), value: t(tierName, ['Starter','Easy','Medium','Hard'][Math.min(Math.floor(score/5),3)]) },
                    { label: t('종료 이유','Ended by'), value: reason, color: '#f87171' },
                ]);
            };
            const check = () => {
                clearInterval(typingTimer);
                if (input.value === word) { score++; totalChars += word.length; ask(); }
                else typingEnd(t(`오타 ("${word}")`, `Typo ("${word}")`));
            };
            document.getElementById('tok').onclick = check;
            input.onkeyup = e => { if(e.key==='Enter') check(); };

            gameInterval = typingTimer = setInterval(() => {
                timeLeft -= 0.1;
                const bar = document.getElementById('tbar'), te = document.getElementById('ttime');
                if (bar) bar.style.width = `${Math.max(0,(timeLeft/timeSec)*100)}%`;
                if (te) te.innerText = Math.ceil(timeLeft)+'s';
                if (timeLeft <= 0) typingEnd(t('시간 초과','Time out'));
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
                    showGameResult('number', t('🎯 숫자 맞추기 결과','🎯 Number Guess Result'), [
                        { label: t('등급','Grade'), value: grade, big: true, color: gc, score: Math.max(1, 100 - tries * 5) },
                        { label: t('정답','Answer'), value: target, color: '#10b981' },
                        { label: t('시도 횟수','Tries'), value: `${tries}${t('번','×')}` },
                    ]);
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

    // ── 11. 2048 ──────────────────────────────────────────────────────
    function start2048() {
        title.innerText = '2048';
        let grid = Array(16).fill(0), score = 0, over = false;

        const COLORS = {0:'#cdc1b4',2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',
            32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',
            1024:'#edc53f',2048:'#edc22e'};

        function addTile() {
            const empty = grid.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
            if (!empty.length) return;
            grid[empty[Math.floor(Math.random()*empty.length)]] = Math.random()<0.9?2:4;
        }

        function slide(row) {
            const n = row.filter(v=>v!==0);
            for (let i=0;i<n.length-1;i++) {
                if (n[i]===n[i+1]) { n[i]*=2; score+=n[i]; n.splice(i+1,1); }
            }
            while (n.length<4) n.push(0);
            return n;
        }

        function move(dir) {
            if (over) return;
            const prev = [...grid];
            for (let i=0;i<4;i++) {
                let row;
                if (dir==='left')  { row=grid.slice(i*4,i*4+4); const s=slide(row); for(let c=0;c<4;c++) grid[i*4+c]=s[c]; }
                if (dir==='right') { row=grid.slice(i*4,i*4+4).reverse(); const s=slide(row).reverse(); for(let c=0;c<4;c++) grid[i*4+c]=s[c]; }
                if (dir==='up')    { row=[grid[i],grid[4+i],grid[8+i],grid[12+i]]; const s=slide(row); for(let r=0;r<4;r++) grid[r*4+i]=s[r]; }
                if (dir==='down')  { row=[grid[i],grid[4+i],grid[8+i],grid[12+i]].reverse(); const s=slide(row).reverse(); for(let r=0;r<4;r++) grid[r*4+i]=s[r]; }
            }
            if (prev.some((v,i)=>v!==grid[i])) addTile();
            render();
            const max = Math.max(...grid);
            if (max===2048) { over=true; setTimeout(()=>showGameResult('2048',t('🎉 2048 달성!','🎉 2048 Reached!'),[{label:t('점수','Score'),value:score,big:true,color:'#facc15',score:Math.max(1,Math.round(score/40))},{label:t('최고 타일','Best Tile'),value:max}]),200); return; }
            if (!grid.includes(0)) {
                const noMove = [0,1,2,3].every(i=>{
                    for(let j=0;j<4;j++){if(j<3&&grid[i*4+j]===grid[i*4+j+1])return false; if(j<3&&grid[j*4+i]===grid[(j+1)*4+i])return false;} return true;
                });
                if (noMove) { over=true; setTimeout(()=>showGameResult('2048',t('🎲 2048 결과','🎲 2048 Result'),[{label:t('점수','Score'),value:score,big:true,color:'var(--accent-color)',score:Math.max(1,Math.round(score/40))},{label:t('최고 타일','Best Tile'),value:max}]),200); }
            }
        }

        const cs = window.innerWidth<=480?62:70;
        container.innerHTML = `
            <div style="text-align:center; user-select:none;">
                <div style="margin-bottom:8px; font-size:0.9rem;">${t('점수','Score')}: <strong id="s2048" style="color:var(--accent-color);">0</strong></div>
                <div id="g2048" style="display:grid; grid-template-columns:repeat(4,${cs}px); gap:8px;
                    background:#bbada0; border-radius:8px; padding:8px; margin:0 auto; width:fit-content;">
                    ${Array(16).fill(0).map(()=>`<div class="c2048" style="width:${cs}px;height:${cs}px;display:flex;
                        align-items:center;justify-content:center;border-radius:6px;font-weight:900;font-size:1.5rem;"></div>`).join('')}
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:180px;margin:10px auto 0;">
                    <div></div><button id="b2u" class="calc-btn" style="padding:10px;">↑</button><div></div>
                    <button id="b2l" class="calc-btn" style="padding:10px;">←</button><div></div>
                    <button id="b2r" class="calc-btn" style="padding:10px;">→</button>
                    <div></div><button id="b2d" class="calc-btn" style="padding:10px;">↓</button><div></div>
                </div>
                <p style="font-size:0.72rem;color:var(--text-muted);margin-top:5px;">${t('화살표키 또는 스와이프로 이동','Arrow keys or swipe to move')}</p>
            </div>`;

        function render() {
            document.getElementById('s2048').innerText = score;
            document.querySelectorAll('.c2048').forEach((el,i)=>{
                const v = grid[i];
                el.textContent = v||'';
                el.style.background = COLORS[v]||'#3c3a32';
                el.style.color = (v===2||v===4)?'#776e65':'#f9f6f2';
                el.style.fontSize = v>=1000?'1rem':v>=100?'1.2rem':'1.5rem';
            });
        }

        addTile(); addTile(); render();

        document.onkeydown = e => {
            const map = {37:'left',38:'up',39:'right',40:'down'};
            if (map[e.keyCode]) { e.preventDefault(); move(map[e.keyCode]); }
        };
        document.getElementById('b2u').onclick = ()=>move('up');
        document.getElementById('b2d').onclick = ()=>move('down');
        document.getElementById('b2l').onclick = ()=>move('left');
        document.getElementById('b2r').onclick = ()=>move('right');

        let tx=0,ty=0;
        container.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
        container.addEventListener('touchend',e=>{
            const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
            if(Math.abs(dx)>Math.abs(dy)) move(dx>0?'right':'left'); else move(dy>0?'down':'up');
        },{passive:true});
    }

    // ── 12. Flappy Bird ──────────────────────────────────────────────
    function startFlappy() {
        title.innerText = t('플래피 버드','Flappy Bird');
        container.innerHTML = `
            <div style="text-align:center;">
                <canvas id="fcv" width="320" height="400" style="border-radius:12px;cursor:pointer;display:block;margin:0 auto;"></canvas>
                <p style="font-size:0.72rem;color:var(--text-muted);margin-top:6px;">${t('클릭 또는 스페이스바로 날기','Click or Space to flap')}</p>
            </div>`;
        const cv = document.getElementById('fcv'), ctx = cv.getContext('2d');
        const W=320,H=400, GR=0.42, FLAP=-7.5, PW=52, PG=130, PS=2.4;
        let bird={x:70,y:190,vy:0}, pipes=[], score=0, state='wait', frame=0;

        const flap = ()=>{ if(state==='dead') return; state='run'; bird.vy=FLAP; };
        cv.onclick = flap;
        cv.addEventListener('touchstart',e=>{e.preventDefault();flap();},{passive:false});
        document.onkeydown = e=>{ if(e.code==='Space'){e.preventDefault();flap();} };

        function loop() {
            ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,W,340);
            ctx.fillStyle='#5D9B3A'; ctx.fillRect(0,340,W,60);
            ctx.fillStyle='#8B6914'; ctx.fillRect(0,356,W,44);

            if (state==='run') {
                frame++;
                bird.vy+=GR; bird.y+=bird.vy;
                if(frame%85===0) pipes.push({x:W, top:55+Math.random()*(H-55-PG-70)});
                pipes.forEach(p=>p.x-=PS);
                pipes=pipes.filter(p=>p.x>-PW);
                pipes.forEach(p=>{ if(!p.scored&&p.x+PW<bird.x){p.scored=true;score++;} });
                const hit = bird.y-12<0||bird.y+12>340||pipes.some(p=>{
                    const inX=bird.x+12>p.x&&bird.x-12<p.x+PW;
                    return inX&&(bird.y-12<p.top||bird.y+12>p.top+PG);
                });
                if(hit){ state='dead'; cancelAnimationFrame(gameInterval);
                    const grade=score<5?'D':score<10?'C':score<20?'B':score<35?'A':'S';
                    const gc={S:'#facc15',A:'#4ade80',B:'#60a5fa',C:'#fb923c',D:'#f87171'}[grade];
                    setTimeout(()=>showGameResult('flappy',t('🐦 플래피버드 결과','🐦 Flappy Bird Result'),[
                        {label:t('등급','Grade'),value:grade,big:true,color:gc,score:score*6},
                        {label:t('통과 파이프','Pipes'),value:score,color:'var(--accent-color)'},
                    ]),300); return;
                }
            }

            ctx.fillStyle='#4CAF50';
            pipes.forEach(p=>{
                ctx.fillRect(p.x,0,PW,p.top);
                ctx.fillStyle='#388E3C'; ctx.fillRect(p.x-4,p.top-18,PW+8,18);
                ctx.fillStyle='#4CAF50';
                const bot=p.top+PG;
                ctx.fillRect(p.x,bot,PW,H-bot);
                ctx.fillStyle='#388E3C'; ctx.fillRect(p.x-4,bot,PW+8,18);
                ctx.fillStyle='#4CAF50';
            });

            // Bird
            ctx.save(); ctx.translate(bird.x,bird.y);
            ctx.rotate(Math.min(Math.max(bird.vy*3,-25),70)*Math.PI/180);
            ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.ellipse(0,0,13,11,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(6,-3,4,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(7,-3,2,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#FF6B35'; ctx.beginPath(); ctx.moveTo(13,-1); ctx.lineTo(20,0); ctx.lineTo(13,2); ctx.fill();
            ctx.fillStyle='#FFA500'; ctx.beginPath(); ctx.ellipse(-2,frame%20<10?4:8,7,3,-0.3,0,Math.PI*2); ctx.fill();
            ctx.restore();

            ctx.fillStyle='white'; ctx.font='bold 26px sans-serif'; ctx.textAlign='center';
            ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=3;
            ctx.strokeText(score,160,44); ctx.fillText(score,160,44);

            if(state==='wait'){
                ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(70,158,180,50);
                ctx.fillStyle='white'; ctx.font='bold 14px sans-serif';
                ctx.fillText(t('탭/스페이스로 시작','Tap/Space to Start'),160,179);
                ctx.font='12px sans-serif'; ctx.fillText(t('클릭해서 날기!','Click to fly!'),160,197);
            }
            gameInterval = requestAnimationFrame(loop);
        }
        gameInterval = requestAnimationFrame(loop);
    }

    // ── 13. Minesweeper ──────────────────────────────────────────────
    function startMinesweeper() {
        title.innerText = t('지뢰 찾기','Minesweeper');
        const cfgs = [
            {label:t('🟢 초급 (9×9, 10지뢰)','🟢 Easy (9×9, 10 mines)'),rows:9,cols:9,mines:10},
            {label:t('🟡 중급 (12×12, 20지뢰)','🟡 Medium (12×12, 20 mines)'),rows:12,cols:12,mines:20},
            {label:t('🔴 고급 (16×10, 35지뢰)','🔴 Hard (16×10, 35 mines)'),rows:10,cols:16,mines:35},
        ];
        container.innerHTML = `<div style="text-align:center;">
            <p style="font-size:1rem;font-weight:800;color:var(--primary-color);margin-bottom:16px;">${t('난이도 선택','Select Difficulty')}</p>
            <div style="display:flex;flex-direction:column;gap:10px;max-width:260px;margin:0 auto;">
                ${cfgs.map((c,i)=>`<button id="msd${i}" style="padding:13px 18px;background:var(--card-bg);
                    border:2px solid var(--border-color);border-radius:14px;cursor:pointer;
                    font-size:0.9rem;font-weight:700;color:var(--text-main);">${c.label}</button>`).join('')}
            </div></div>`;
        cfgs.forEach((cfg,i)=>{ document.getElementById(`msd${i}`).onclick=()=>playMine(cfg); });

        function playMine({rows,cols,mines}) {
            const total=rows*cols;
            let board=Array(total).fill(0), rev=Array(total).fill(false), flagged=Array(total).fill(false);
            let firstClick=true, dead=false, won=false, t0=0;
            const cs=Math.max(20, Math.min(Math.floor((Math.min(window.innerWidth-60,360))/cols), 36));

            function place(avoid) {
                const pos=Array.from({length:total},(_,i)=>i).filter(i=>i!==avoid).sort(()=>Math.random()-0.5);
                pos.slice(0,mines).forEach(i=>board[i]=-1);
                for(let i=0;i<total;i++){
                    if(board[i]===-1) continue;
                    let n=0; const r=Math.floor(i/cols),c=i%cols;
                    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
                        if(!dr&&!dc) continue;
                        const nr=r+dr,nc=c+dc;
                        if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&board[nr*cols+nc]===-1) n++;
                    }
                    board[i]=n;
                }
            }

            function flood(idx) {
                const q=[idx];
                while(q.length){
                    const id=q.shift();
                    if(rev[id]||flagged[id]) continue;
                    rev[id]=true;
                    if(board[id]===0){
                        const r=Math.floor(id/cols),c=id%cols;
                        for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
                            if(!dr&&!dc) continue;
                            const nr=r+dr,nc=c+dc;
                            if(nr>=0&&nr<rows&&nc>=0&&nc<cols) q.push(nr*cols+nc);
                        }
                    }
                }
            }

            const NC=['','#2563eb','#16a34a','#dc2626','#7c3aed','#92400e','#0891b2','#111827','#6b7280'];

            // 이웃 셀 인덱스 반환
            function neighbors(idx) {
                const r=Math.floor(idx/cols), c=idx%cols, res=[];
                for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
                    if(!dr&&!dc) continue;
                    const nr=r+dr, nc=c+dc;
                    if(nr>=0&&nr<rows&&nc>=0&&nc<cols) res.push(nr*cols+nc);
                }
                return res;
            }

            // 코드 클릭: 숫자 칸에서 양쪽 버튼 → 주변 깃발 수 == 숫자면 자동 열기

            function render() {
                const fl=mines-flagged.filter(Boolean).length;
                const fEl=document.getElementById('msfl'); if(fEl) fEl.innerText=fl;
                document.querySelectorAll('.msc').forEach((el,i)=>{
                    el.style.background=rev[i]?(board[i]===-1?'#ef4444':'var(--bg-color)'):'var(--card-bg)';
                    el.style.border=rev[i]?'1px solid var(--border-color)':'1px solid var(--border-color)';
                    if(rev[i]&&board[i]===-1) { el.textContent='💣'; el.style.fontSize=`${Math.max(12,cs-6)}px`; }
                    else if(rev[i]&&board[i]>0) { el.textContent=board[i]; el.style.color=NC[board[i]]; el.style.fontSize=`${Math.max(11,cs-8)}px`; }
                    else if(rev[i]) { el.textContent=''; }
                    else if(flagged[i]) { el.textContent='🚩'; el.style.fontSize=`${Math.max(12,cs-6)}px`; }
                    else { el.textContent=''; }
                });
            }

            function checkWin() {
                if(rev.filter((r,i)=>r&&board[i]!==-1).length===total-mines){
                    won=true; clearInterval(gameInterval);
                    const sec=Math.floor((Date.now()-t0)/1000);
                    render();
                    // 클리어 점수: 빠를수록 높음 (신기록 시 XP 적립)
                    if(window.vgSaveGame) window.vgSaveGame('minesweeper', Math.max(10, Math.round(mines * 8 + Math.max(0, 120 - sec) * 1.5)));
                    setTimeout(()=>showGameResult('minesweeper',t('🎉 클리어!','🎉 Cleared!'),[
                        {label:t('결과','Result'),value:t('✅ 성공!','✅ Success!'),big:true,color:'#10b981'},
                        {label:t('시간','Time'),value:sec+'s',color:'var(--accent-color)'},
                        {label:t('난이도','Difficulty'),value:`${rows}×${cols} / ${mines}💣`},
                    ]),300);
                }
            }

            container.innerHTML = `<div style="text-align:center;user-select:none;">
                <div style="display:flex;justify-content:center;gap:20px;margin-bottom:8px;font-size:0.85rem;">
                    <span>💣 <strong id="msfl">${mines}</strong></span>
                    <span>⏱ <strong id="mstm">0s</strong></span>
                </div>
                <div style="overflow-x:auto;padding:4px;">
                    <div id="msbrd" style="display:grid;grid-template-columns:repeat(${cols},${cs}px);gap:3px;
                        margin:0 auto;width:fit-content;"></div>
                </div>
                <p style="font-size:0.72rem;color:var(--text-muted);margin-top:6px;">
                    ${t('클릭: 열기 · 우클릭: 깃발 · 양쪽 클릭: 자동 열기','Click: reveal · Right-click: flag · Both buttons: auto-reveal')}</p>
                <button onclick="startGame('minesweeper')" style="margin-top:8px;padding:8px 18px;
                    background:var(--card-bg);border:2px solid var(--border-color);border-radius:10px;
                    font-size:0.8rem;font-weight:700;cursor:pointer;color:var(--text-main);">${t('새 게임','New Game')}</button>
                </div>`;

            const brd=document.getElementById('msbrd');
            for(let i=0;i<total;i++){
                const el=document.createElement('div');
                el.className='msc';
                el.style.cssText=`width:${cs}px;height:${cs}px;background:var(--card-bg);border:1px solid var(--border-color);
                    border-radius:3px;display:flex;align-items:center;justify-content:center;font-weight:800;cursor:pointer;`;
                let leftDown=false, rightDown=false, longPt=null, chording=false;
                const flag=()=>{ if(rev[i]||dead||won) return; flagged[i]=!flagged[i]; render(); };
                const applyChordPress=(on)=>{
                    neighbors(i).forEach(j=>{
                        const ce=brd.children[j];
                        if(ce&&!rev[j]&&!flagged[j]) ce.style.background=on?'var(--border-color)':'var(--card-bg)';
                    });
                };
                const doChord=()=>{
                    if(dead||won||!rev[i]||board[i]<=0) return;
                    const nb=neighbors(i);
                    const fc=nb.filter(j=>flagged[j]).length;
                    if(fc===board[i]){
                        let hitMine=false;
                        nb.forEach(j=>{ if(!rev[j]&&!flagged[j]){ if(board[j]===-1) hitMine=true; flood(j); } });
                        if(hitMine){
                            dead=true;
                            board.forEach((_,j)=>{ if(board[j]===-1) rev[j]=true; });
                            clearInterval(gameInterval); render();
                            setTimeout(()=>showGameResult('minesweeper',t('💣 지뢰 밟음!','💣 Boom!'),[
                                {label:t('결과','Result'),value:t('💀 실패','💀 Failed'),big:true,color:'#ef4444'},
                                {label:t('열린 칸','Revealed'),value:rev.filter(Boolean).length},
                            ]),400); return;
                        }
                        checkWin(); render();
                    }
                };
                const click=()=>{
                    if(flagged[i]||rev[i]||dead||won) return;
                    if(firstClick){ firstClick=false; t0=Date.now(); place(i);
                        gameInterval=setInterval(()=>{ const e=document.getElementById('mstm'); if(e) e.innerText=Math.floor((Date.now()-t0)/1000)+'s'; },1000); }
                    if(board[i]===-1){
                        dead=true; rev[i]=true;
                        board.forEach((_,j)=>{ if(board[j]===-1) rev[j]=true; });
                        clearInterval(gameInterval); render();
                        setTimeout(()=>showGameResult('minesweeper',t('💣 지뢰 밟음!','💣 Boom!'),[
                            {label:t('결과','Result'),value:t('💀 실패','💀 Failed'),big:true,color:'#ef4444'},
                            {label:t('열린 칸','Revealed'),value:rev.filter(Boolean).length},
                        ]),400); return;
                    }
                    flood(i); checkWin(); render();
                };
                el.addEventListener('contextmenu', e=>{ e.preventDefault(); });
                el.addEventListener('mousedown', e=>{
                    if(e.button===0){ leftDown=true; if(!rightDown&&!rev[i]) longPt=setTimeout(()=>{flag();longPt=null;},500); }
                    if(e.button===2){ rightDown=true; }
                    if(leftDown&&rightDown&&!chording){
                        chording=true;
                        if(longPt){clearTimeout(longPt);longPt=null;}
                        if(rev[i]&&board[i]>0) applyChordPress(true);
                    }
                });
                el.addEventListener('mouseup', e=>{
                    if(chording){ applyChordPress(false); doChord(); chording=false; leftDown=false; rightDown=false; return; }
                    if(e.button===0){ leftDown=false; if(longPt){clearTimeout(longPt);longPt=null;} click(); }
                    if(e.button===2){ rightDown=false; flag(); }
                });
                el.addEventListener('mouseleave', ()=>{
                    if(chording) applyChordPress(false);
                    chording=false; leftDown=false; rightDown=false;
                    if(longPt){clearTimeout(longPt);longPt=null;}
                });
                el.addEventListener('touchstart', ()=>{ longPt=setTimeout(()=>{flag();longPt=null;},500); },{passive:true});
                el.addEventListener('touchend', ()=>{ if(longPt!==null){clearTimeout(longPt);longPt=null;click();} });
                brd.appendChild(el);
            }
            render();
        }
    }

    // ── 14. Breakout ─────────────────────────────────────────────────
    function startBreakout() {
        title.innerText = t('블록 깨기','Breakout');
        container.innerHTML = `
            <div style="text-align:center;">
                <div style="display:flex;justify-content:center;gap:20px;margin-bottom:6px;font-size:0.85rem;color:var(--text-muted);">
                    <span>${t('점수','Score')}: <strong id="bscore" style="color:var(--accent-color);">0</strong></span>
                    <span>${t('목숨','Lives')}: <strong id="blives">❤️❤️❤️</strong></span>
                    <span>${t('레벨','Lv')}: <strong id="blv" style="color:#f59e0b;">1</strong></span>
                </div>
                <canvas id="bcv" width="320" height="380" style="border-radius:10px;background:#0f0f1a;display:block;margin:0 auto;cursor:none;"></canvas>
                <p style="font-size:0.72rem;color:var(--text-muted);margin-top:6px;">${t('마우스/터치로 패들 조종 · 클릭/스페이스 발사','Mouse/touch paddle · Click/Space to launch')}</p>
            </div>`;
        const cv=document.getElementById('bcv'), ctx=cv.getContext('2d');
        const W=320,H=380,ROWS=5,COLS=8,BW=Math.floor((W-16)/COLS),BH=18;
        let score=0,lives=3,level=1,blocks=[],waiting=true;
        const PAD={w:70,h:10,y:H-25,x:W/2-35};
        const BALL={r:7,x:W/2,y:H-50,vx:0,vy:0};
        const BC=['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];

        function initBlocks(){
            blocks=[];
            for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++)
                blocks.push({x:8+c*BW,y:38+r*(BH+4),w:BW-4,h:BH,alive:true,color:BC[r]});
        }
        function resetBall(){ BALL.x=PAD.x+PAD.w/2; BALL.y=PAD.y-BALL.r-2; BALL.vx=0; BALL.vy=0; waiting=true; }
        function launch(){ if(!waiting)return; waiting=false; const sp=4+level*0.5; BALL.vx=(Math.random()*2-1)*sp*0.7; BALL.vy=-Math.sqrt(sp*sp-BALL.vx*BALL.vx); }

        cv.addEventListener('mousemove',e=>{ const r=cv.getBoundingClientRect(); PAD.x=Math.max(0,Math.min(W-PAD.w,e.clientX-r.left-PAD.w/2)); if(waiting) BALL.x=PAD.x+PAD.w/2; });
        cv.addEventListener('touchmove',e=>{ e.preventDefault(); const r=cv.getBoundingClientRect(); PAD.x=Math.max(0,Math.min(W-PAD.w,e.touches[0].clientX-r.left-PAD.w/2)); if(waiting) BALL.x=PAD.x+PAD.w/2; },{passive:false});
        cv.addEventListener('click',launch);
        cv.addEventListener('touchstart',e=>{e.preventDefault();launch();},{passive:false});
        document.onkeydown=e=>{ if(e.code==='Space'){e.preventDefault();launch();}
            if(e.keyCode===37){e.preventDefault();PAD.x=Math.max(0,PAD.x-18);if(waiting)BALL.x=PAD.x+PAD.w/2;}
            if(e.keyCode===39){e.preventDefault();PAD.x=Math.min(W-PAD.w,PAD.x+18);if(waiting)BALL.x=PAD.x+PAD.w/2;}
        };

        function updateUI(){
            const se=document.getElementById('bscore'); if(se) se.innerText=score;
            const le=document.getElementById('blives'); if(le) le.innerText='❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives));
        }

        function loop(){
            ctx.fillStyle='#0f0f1a'; ctx.fillRect(0,0,W,H);
            blocks.forEach(b=>{ if(!b.alive)return; ctx.fillStyle=b.color; ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,b.h,4); ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fillRect(b.x+2,b.y+2,b.w-4,4); });
            const g=ctx.createLinearGradient(PAD.x,0,PAD.x+PAD.w,0); g.addColorStop(0,'#6366f1'); g.addColorStop(1,'#8b5cf6');
            ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(PAD.x,PAD.y,PAD.w,PAD.h,5); ctx.fill();
            ctx.fillStyle='#facc15'; ctx.beginPath(); ctx.arc(BALL.x,BALL.y,BALL.r,0,Math.PI*2); ctx.fill();
            if(waiting){ ctx.fillStyle='rgba(255,255,255,0.65)'; ctx.font='13px sans-serif'; ctx.textAlign='center'; ctx.fillText(t('클릭/스페이스로 발사!','Click/Space to launch!'),W/2,H/2+55); }

            if(!waiting){
                BALL.x+=BALL.vx; BALL.y+=BALL.vy;
                if(BALL.x-BALL.r<0){BALL.x=BALL.r;BALL.vx=Math.abs(BALL.vx);}
                if(BALL.x+BALL.r>W){BALL.x=W-BALL.r;BALL.vx=-Math.abs(BALL.vx);}
                if(BALL.y-BALL.r<0){BALL.y=BALL.r;BALL.vy=Math.abs(BALL.vy);}
                if(BALL.y+BALL.r>=PAD.y&&BALL.y-BALL.r<=PAD.y+PAD.h&&BALL.x>=PAD.x-BALL.r&&BALL.x<=PAD.x+PAD.w+BALL.r&&BALL.vy>0){
                    const hit=(BALL.x-(PAD.x+PAD.w/2))/(PAD.w/2);
                    const sp=Math.sqrt(BALL.vx**2+BALL.vy**2);
                    BALL.vx=hit*sp*0.85; BALL.vy=-Math.sqrt(Math.max(1,sp*sp-BALL.vx**2));
                }
                blocks.forEach(b=>{
                    if(!b.alive)return;
                    if(BALL.x+BALL.r>b.x&&BALL.x-BALL.r<b.x+b.w&&BALL.y+BALL.r>b.y&&BALL.y-BALL.r<b.y+b.h){
                        b.alive=false; score+=10*level; updateUI();
                        const fromSide=(BALL.x<b.x||BALL.x>b.x+b.w); if(fromSide) BALL.vx=-BALL.vx; else BALL.vy=-BALL.vy;
                    }
                });
                if(blocks.every(b=>!b.alive)){ level++; const le=document.getElementById('blv'); if(le) le.innerText=level; initBlocks(); resetBall(); }
                if(BALL.y>H+20){
                    lives--; updateUI();
                    if(lives<=0){ cancelAnimationFrame(gameInterval);
                        showGameResult('breakout',t('🧱 블록 깨기 결과','🧱 Breakout Result'),[
                            {label:t('최종 점수','Final Score'),value:score,big:true,color:'var(--accent-color)'},
                            {label:t('레벨','Level'),value:`Lv.${level}`},
                        ]); return;
                    }
                    resetBall();
                }
            }
            gameInterval=requestAnimationFrame(loop);
        }
        initBlocks(); resetBall(); updateUI();
        gameInterval=requestAnimationFrame(loop);
    }

    // ── 15. Whack-a-Mole ─────────────────────────────────────────────
    function startWhackMole() {
        title.innerText = t('두더지 잡기','Whack-a-Mole');
        let score=0, timeLeft=30, running=true, spawnTid=null;
        const active=Array(9).fill(false);

        container.innerHTML = `
            <div style="text-align:center;width:100%;">
                <div style="display:flex;justify-content:center;gap:30px;margin-bottom:14px;font-size:0.95rem;">
                    <span>⏱ <strong id="wmt" style="color:#f59e0b;">30</strong>s</span>
                    <span>${t('점수','Score')}: <strong id="wms" style="color:var(--accent-color);">0</strong></span>
                </div>
                <div id="wmg" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:280px;margin:0 auto;padding:10px;
                    background:var(--bg-color);border-radius:20px;"></div>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-top:12px;font-weight:700;">
                    ${t('🐹 두더지가 나오면 빠르게 클릭!','🐹 Click the moles as fast as you can!')}</p>
            </div>`;

        const grid=document.getElementById('wmg');
        const items=[];

        for(let i=0;i<9;i++){
            const wrap=document.createElement('div');
            wrap.style.cssText='position:relative;height:82px;background:#78553a;border-radius:50% 50% 45% 45%;overflow:hidden;cursor:pointer;box-shadow:inset 0 5px 12px rgba(0,0,0,0.45),0 4px 0 #5a3d26;';
            const mole=document.createElement('div');
            mole.style.cssText='position:absolute;bottom:-90px;left:50%;transform:translateX(-50%);width:64px;height:64px;border-radius:50% 50% 45% 45%;display:flex;align-items:center;justify-content:center;font-size:2.4rem;transition:bottom 0.13s ease-out;user-select:none;pointer-events:none;';
            mole.textContent='🐹';
            wrap.appendChild(mole);

            const hit=()=>{
                if(!active[i]||!running) return;
                active[i]=false; mole.style.bottom='-90px';
                score+=10;
                const se=document.getElementById('wms'); if(se) se.innerText=score;
                mole.textContent='⭐'; wrap.style.background='#4ade8066';
                setTimeout(()=>{ mole.textContent='🐹'; wrap.style.background='#78553a'; },180);
            };
            wrap.addEventListener('click', hit);
            wrap.addEventListener('touchstart', e=>{ e.preventDefault(); hit(); }, {passive:false});
            grid.appendChild(wrap);
            items.push({wrap, mole});
        }

        function popUp(i){
            if(active[i]||!running) return;
            active[i]=true; items[i].mole.style.bottom='5px';
            setTimeout(()=>{
                if(active[i]){ active[i]=false; items[i].mole.style.bottom='-90px'; }
            }, 900+Math.random()*600);
        }

        function spawn(){
            if(!document.getElementById('wmt')){ running=false; return; }
            const free=active.map((v,j)=>v?-1:j).filter(j=>j>=0);
            if(free.length>0) popUp(free[Math.floor(Math.random()*free.length)]);
            if(running) spawnTid=setTimeout(spawn, 520+Math.random()*430);
        }

        spawn();

        gameInterval=setInterval(()=>{
            timeLeft--;
            const te=document.getElementById('wmt'); if(te) te.innerText=timeLeft;
            if(timeLeft<=0){
                running=false; clearInterval(gameInterval); clearTimeout(spawnTid);
                active.fill(false); items.forEach(({mole})=>mole.style.bottom='-90px');
                const grade=score<50?'D':score<100?'C':score<160?'B':score<220?'A':'S';
                const gc={S:'#facc15',A:'#4ade80',B:'#60a5fa',C:'#fb923c',D:'#f87171'}[grade];
                showGameResult('whack',t('🔨 두더지 잡기 결과','🔨 Whack-a-Mole Result'),[
                    {label:t('등급','Grade'),value:grade,big:true,color:gc,score:score},
                    {label:t('최종 점수','Final Score'),value:score,color:'var(--accent-color)'},
                    {label:t('잡은 두더지','Moles hit'),value:score/10+t('마리','')},
                ]);
            }
        },1000);
    }

    // 공유된 게임 결과 URL 감지 (?g=tetris&s=1234&h=...)
    (function(){
        const params = new URLSearchParams(location.search);
        if(!params.has('g') || !params.has('s')) return;
        const gKey = params.get('g');
        const sVal = decodeURIComponent(params.get('s') || '');
        const hVal = decodeURIComponent(params.get('h') || '🎮 공유된 결과');
        if(!sVal) return;
        const gnm = {tetris:t('테트리스','Tetris'),sudoku:t('스도쿠','Sudoku'),
            clicker:t('클릭커','Clicker'),math:t('암산왕','Mental Math'),
            reaction:t('반응속도','Reaction Speed'),snake:t('스네이크','Snake'),
            memory:t('기억력 카드','Memory Cards'),color:t('색상 찾기','Spot the Color'),
            typing:t('타이핑','Typing'),number:t('숫자 맞추기','Number Guess'),
            '2048':t('2048','2048'),flappy:t('플래피버드','Flappy Bird'),
            minesweeper:t('지뢰찾기','Minesweeper'),breakout:t('블록 깨기','Breakout'),
            whack:t('두더지 잡기','Whack-a-Mole')};
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        showGameResult(gKey, hVal, [
            {label:t('게임','Game'), value: gnm[gKey] || gKey},
            {label:t('결과','Result'), value: sVal, big:true, color:'#6366f1'},
            {label:'', value: t('친구가 공유한 결과입니다 🎮','A result shared by a friend 🎮')},
        ]);
    })();

});