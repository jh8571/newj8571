let currentQuestion = 0;
let answers = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
let mbtiQuestions = [];

fetch('mbti_data.json').then(r => r.json()).then(data => { mbtiQuestions = data; });

window.startMbtiTest = function() {
    document.getElementById('intro-section').style.display = 'none';
    document.getElementById('test-section').style.display = 'block';
    showQuestion();
};

function showQuestion() {
    const q = mbtiQuestions[currentQuestion];
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <h3 style="margin-bottom:30px; font-size:1.5rem; text-align:center;">${q.question}</h3>
        <div style="display:flex; flex-direction:column; gap:15px;">
            <button class="select-btn" onclick="selectAnswer('${q.type}', 1)">${q.a}</button>
            <button class="select-btn" onclick="selectAnswer('${q.type}', -1)">${q.b}</button>
        </div>
    `;
}

window.selectAnswer = function(type, score) {
    if(score > 0) answers[type[0]]++;
    else answers[type[1]]++;

    currentQuestion++;
    if(currentQuestion < mbtiQuestions.length) showQuestion();
    else calculateResult();
};

function calculateResult() {
    const mbti = (answers.E >= answers.I ? 'E':'I') + (answers.S >= answers.N ? 'S':'N') + (answers.T >= answers.F ? 'T':'F') + (answers.J >= answers.P ? 'J':'P');
    displayResults(mbti);
}

function displayResults(mbti) {
    const resultSection = document.getElementById('result-section');
    document.getElementById('test-section').style.display = 'none';
    resultSection.style.display = 'block';

    resultSection.innerHTML = `
        <div class="luxury-report-card">
            <div class="report-header">
                <div class="report-badge">Personality Profile</div>
                <h2 style="font-size:3rem; color:var(--primary-color);">${mbti}</h2>
                <p style="font-size:1.2rem; margin-top:10px; color:#64748b;">당신의 성향 분석 결과입니다.</p>
            </div>
            <div style="padding:40px;">
                <div class="focus-item">
                    <h4 class="focus-name">성격 특징</h4>
                    <p class="focus-info">당신은 ${mbti} 유형으로, 고유한 심리적 특성을 가지고 있습니다. (상세 데이터 로딩 중...)</p>
                </div>
                <div style="margin-top:30px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div class="footer-box"><label>건강 관리</label><p>${mbti} 유형에 맞는 맞춤형 휴식법을 추천합니다.</p></div>
                    <div class="footer-box"><label>스트레스 해소</label><p>혼자만의 시간보다는 활동적인 에너지를 발산해 보세요.</p></div>
                </div>
                <button class="luxury-btn" onclick="location.reload()">테스트 다시하기</button>
            </div>
        </div>
    `;
}
