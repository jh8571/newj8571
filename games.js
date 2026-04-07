document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('game-modal');
    const container = document.getElementById('game-container');
    const title = document.getElementById('game-title');

    window.startGame = function(type) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        container.innerHTML = '';

        if (type === 'clicker') startClicker();
        else if (type === 'math') startMath();
        else if (type === 'reaction') startReaction();
        else if (type === 'number') startNumber();
        else {
            container.innerHTML = `
                <div style="padding:50px;">
                    <i class="fas fa-tools" style="font-size:3rem; color:#ccc; margin-bottom:20px;"></i>
                    <p>이 게임은 현재 고도화 작업 중입니다. <br>곧 더 멋진 모습으로 찾아뵙겠습니다!</p>
                    <button class="calc-btn" style="margin-top:20px;" onclick="closeGame()">다른 게임 선택</button>
                </div>
            `;
        }
    };

    window.closeGame = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        container.innerHTML = '';
    };

    // 1. Clicker Master
    function startClicker() {
        title.innerText = "클릭커 마스터";
        let count = 0;
        let timeLeft = 10;
        container.innerHTML = `
            <div style="text-align:center;">
                <p style="font-size:1.2rem; margin-bottom:10px;">남은 시간: <span id="time-left">${timeLeft}</span>초</p>
                <h3 style="font-size:2rem; margin-bottom:20px;">점수: <span id="click-count">0</span></h3>
                <button id="main-click-btn" style="width:150px; height:150px; border-radius:50%; border:none; background:var(--accent-color); color:white; font-size:1.5rem; cursor:pointer; box-shadow:0 10px 0 #0284c7;">클릭!</button>
            </div>
        `;

        const btn = document.getElementById('main-click-btn');
        btn.addEventListener('mousedown', () => {
            if (timeLeft <= 0) return;
            count++;
            document.getElementById('click-count').innerText = count;
            btn.style.transform = 'translateY(5px)';
            btn.style.boxShadow = '0 5px 0 #0284c7';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 10px 0 #0284c7';
        });

        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('time-left').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                container.innerHTML = `
                    <div style="text-align:center;">
                        <h2>게임 종료!</h2>
                        <p style="font-size:1.5rem; margin:20px 0;">최종 점수: ${count}회</p>
                        <button class="calc-btn" onclick="startGame('clicker')">다시 하기</button>
                    </div>
                `;
            }
        }, 1000);
    }

    // 2. Math King
    function startMath() {
        title.innerText = "암산왕";
        let score = 0;
        function nextQuestion() {
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
            let ans = 0;
            if (op === '+') ans = a + b;
            else if (op === '-') ans = a - b;
            else ans = a * b;

            container.innerHTML = `
                <div style="text-align:center;">
                    <p style="font-size:1.2rem;">점수: ${score}</p>
                    <h3 style="font-size:3rem; margin:30px 0;">${a} ${op} ${b} = ?</h3>
                    <input type="number" id="math-ans" style="padding:15px; font-size:1.5rem; width:150px; text-align:center; border-radius:10px; border:2px solid #ddd;" autofocus>
                    <button class="calc-btn" id="math-submit" style="margin-left:10px;">확인</button>
                </div>
            `;

            document.getElementById('math-submit').onclick = check;
            document.getElementById('math-ans').onkeyup = (e) => { if(e.key === 'Enter') check(); };

            function check() {
                const userAns = parseInt(document.getElementById('math-ans').value);
                if (userAns === ans) {
                    score++;
                    nextQuestion();
                } else {
                    container.innerHTML = `
                        <div style="text-align:center;">
                            <h2>틀렸습니다!</h2>
                            <p style="font-size:1.5rem; margin:20px 0;">최종 점수: ${score}점</p>
                            <button class="calc-btn" onclick="startGame('math')">다시 하기</button>
                        </div>
                    `;
                }
            }
        }
        nextQuestion();
    }

    // 3. Reaction Time
    function startReaction() {
        title.innerText = "반응 속도 테스트";
        container.innerHTML = `
            <div id="reaction-box" style="width:100%; height:300px; background:#ef4444; color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:15px; font-size:1.5rem; font-weight:700;">
                배경이 초록색이 되면 클릭하세요!
            </div>
        `;
        const box = document.getElementById('reaction-box');
        let startTime, timer;

        setTimeout(() => {
            box.style.background = '#22c55e';
            box.innerText = "지금 클릭!!!";
            startTime = Date.now();
        }, 2000 + Math.random() * 3000);

        box.onclick = () => {
            if (startTime) {
                const endTime = Date.now();
                const diff = endTime - startTime;
                container.innerHTML = `
                    <div style="text-align:center;">
                        <h2>당신의 반응 속도</h2>
                        <p style="font-size:3rem; color:var(--accent-color); margin:20px 0;">${diff}ms</p>
                        <button class="calc-btn" onclick="startGame('reaction')">다시 하기</button>
                    </div>
                `;
            } else {
                alert('너무 빨랐습니다! 초록색이 될 때까지 기다리세요.');
                startGame('reaction');
            }
        };
    }

    // 4. Number Guesser
    function startNumber() {
        title.innerText = "숫자 맞추기 (1~100)";
        const target = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;
        
        container.innerHTML = `
            <div style="text-align:center;">
                <p id="num-hint" style="font-size:1.2rem; margin-bottom:20px;">어떤 숫자일까요?</p>
                <input type="number" id="num-input" style="padding:15px; font-size:1.5rem; width:100px; text-align:center; border-radius:10px; border:2px solid #ddd;" autofocus>
                <button class="calc-btn" id="num-btn" style="margin-left:10px;">입력</button>
                <p style="margin-top:20px; color:#64748b;">시도 횟수: <span id="num-tries">0</span></p>
            </div>
        `;

        document.getElementById('num-btn').onclick = () => {
            const val = parseInt(document.getElementById('num-input').value);
            if (!val) return;
            attempts++;
            document.getElementById('num-tries').innerText = attempts;
            const hint = document.getElementById('num-hint');
            if (val === target) {
                container.innerHTML = `
                    <div style="text-align:center;">
                        <h2 style="color:var(--accent-color);">정답입니다!</h2>
                        <p style="font-size:1.5rem; margin:20px 0;">${attempts}번 만에 맞췄습니다.</p>
                        <button class="calc-btn" onclick="startGame('number')">다시 하기</button>
                    </div>
                `;
            } else if (val < target) hint.innerText = "더 큰 숫자입니다! (UP)";
            else hint.innerText = "더 작은 숫자입니다! (DOWN)";
            document.getElementById('num-input').value = '';
            document.getElementById('num-input').focus();
        };
    }
});