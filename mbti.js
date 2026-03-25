let mbtiData = null;
let currentQuestionIndex = 0;
let userAnswers = [];

const introSection = document.getElementById('intro-section');
const testSection = document.getElementById('test-section');
const resultSection = document.getElementById('result-section');
const progressBar = document.getElementById('progress-bar');
const questionContainer = document.getElementById('question-container');

// Load Data
fetch('mbti_data.json')
    .then(r => r.json())
    .then(data => { mbtiData = data; });

window.startMbtiTest = function() {
    introSection.style.display = 'none';
    testSection.style.display = 'block';
    renderQuestion();
};

function renderQuestion() {
    const q = mbtiData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / mbtiData.questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    questionContainer.innerHTML = `
        <div class="question-box active">
            <div class="question-text">${q.q}</div>
            <div class="mbti-options">
                <button class="mbti-opt-btn" onclick="answerQuestion(2)">매우 그렇다</button>
                <button class="mbti-opt-btn" onclick="answerQuestion(1)">그렇다</button>
                <button class="mbti-opt-btn" onclick="answerQuestion(0)">보통이다</button>
                <button class="mbti-opt-btn" onclick="answerQuestion(-1)">아니다</button>
                <button class="mbti-opt-btn" onclick="answerQuestion(-2)">매우 아니다</button>
            </div>
        </div>
    `;
}

window.answerQuestion = function(score) {
    userAnswers.push({
        type: mbtiData.questions[currentQuestionIndex].type,
        weight: mbtiData.questions[currentQuestionIndex].weight,
        score: score
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < mbtiData.questions.length) {
        renderQuestion();
    } else {
        progressBar.style.width = `100%`;
        showAnalysis();
    }
};

function showAnalysis() {
    testSection.style.display = 'none';
    resultSection.style.display = 'block';

    let scores = { "EI": 0, "SN": 0, "TF": 0, "JP": 0 };
    let counts = { "EI": 0, "SN": 0, "TF": 0, "JP": 0 };

    userAnswers.forEach(ans => {
        // weight * score (-2 to 2)
        scores[ans.type] += (ans.weight * ans.score);
        counts[ans.type]++;
    });

    // Calculate Percentages (Max score per type is 6 * 2 = 12 if 6 questions)
    // Scale to 0-100%
    const getPercent = (type) => {
        const raw = scores[type];
        const max = 6 * 2; // 각 타입별 질문 6개 * 가중치 최대 2
        let p = ((raw + max) / (max * 2)) * 100;
        return Math.min(Math.max(Math.round(p), 0), 100);
    };

    const pEI = getPercent("EI");
    const pSN = getPercent("SN");
    const pTF = getPercent("TF");
    const pJP = getPercent("JP");

    let resultType = "";
    resultType += pEI >= 50 ? "E" : "I";
    resultType += pSN >= 50 ? "N" : "S";
    resultType += pTF >= 50 ? "T" : "F";
    resultType += pJP >= 50 ? "J" : "P";

    const info = mbtiData.types[resultType];

    resultSection.innerHTML = `
        <div style="text-align:center; margin-bottom:40px;">
            <h3 style="color:var(--primary-color); font-weight:800; font-size:1.2rem;">분석 결과</h3>
            <h1 style="font-size: 4rem; color: var(--secondary-color); margin: 10px 0;">${resultType}</h1>
            <h2 style="color: var(--primary-color);">"${info.title}"</h2>
        </div>

        <div class="analysis-chart">
            <div class="chart-row">
                <span class="chart-label">I</span>
                <div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pEI}%"></div></div>
                <span class="chart-label">E</span>
                <span class="chart-percent">${pEI}%</span>
            </div>
            <div class="chart-row">
                <span class="chart-label">S</span>
                <div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pSN}%"></div></div>
                <span class="chart-label">N</span>
                <span class="chart-percent">${pSN}%</span>
            </div>
            <div class="chart-row">
                <span class="chart-label">F</span>
                <div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pTF}%"></div></div>
                <span class="chart-label">T</span>
                <span class="chart-percent">${pTF}%</span>
            </div>
            <div class="chart-row">
                <span class="chart-label">P</span>
                <div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pJP}%"></div></div>
                <span class="chart-label">J</span>
                <span class="chart-percent">${pJP}%</span>
            </div>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 20px; margin-top: 40px;">
            <h4 style="margin-bottom:15px;"><i class="fas fa-quote-left"></i> 성격 특징</h4>
            <p style="line-height:1.8; color:var(--text-main);">${info.desc}</p>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:20px;">
                ${info.traits.map(t => `<span style="background:white; padding:5px 15px; border-radius:20px; border:1px solid #ddd; font-size:0.9rem;">#${t}</span>`).join('')}
            </div>
        </div>

        <div style="margin-top:40px;">
            <h4 style="margin-bottom:20px;"><i class="fas fa-briefcase"></i> 추천 직무 및 커리어</h4>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                ${info.careers.map(c => `<div style="background:#f1f5f9; padding:15px; border-radius:12px; text-align:center; font-weight:600;">${c}</div>`).join('')}
            </div>
        </div>

        <div style="margin-top:40px; display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div class="highlight-box" style="border-left-color: #2ecc71;">
                <label style="color:#27ae60;">환상의 궁합</label>
                <p style="font-size:1.5rem; font-weight:800; margin-top:10px;">${info.good.join(', ')}</p>
            </div>
            <div class="highlight-box" style="border-left-color: #e74c3c;">
                <label style="color:#c0392b;">주의가 필요한 궁합</label>
                <p style="font-size:1.5rem; font-weight:800; margin-top:10px;">${info.bad.join(', ')}</p>
            </div>
        </div>

        <div style="text-align:center; margin-top:60px;">
            <button class="search-container" style="display:inline-block; border:none; background:var(--secondary-color); color:white; padding:15px 40px; font-size:1.1rem; cursor:pointer; border-radius:50px;" onclick="location.reload()">
                다시 테스트하기
            </button>
        </div>
    `;
}
