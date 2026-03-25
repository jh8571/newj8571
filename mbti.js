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
    .then(data => { mbtiData = data; })
    .catch(err => console.error("MBTI Data Load Error:", err));

window.startMbtiTest = function() {
    if (!mbtiData) {
        alert("데이터를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
    }
    introSection.style.display = 'none';
    testSection.style.display = 'block';
    currentQuestionIndex = 0;
    userAnswers = [];
    renderQuestion();
};

function renderQuestion() {
    const q = mbtiData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / mbtiData.questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    questionContainer.innerHTML = `
        <div class="question-box active">
            <div class="question-text">${q.id}. ${q.q}</div>
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
    userAnswers.forEach(ans => {
        scores[ans.type] += (ans.weight * ans.score);
    });

    const getPercent = (type) => {
        const raw = scores[type];
        const max = 6 * 2; // 가중치 1 * 점수 2 * 문항 6개 기준
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
            <div class="chart-row"><span class="chart-label">I</span><div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pEI}%"></div></div><span class="chart-label">E</span><span class="chart-percent">${pEI}%</span></div>
            <div class="chart-row"><span class="chart-label">S</span><div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pSN}%"></div></div><span class="chart-label">N</span><span class="chart-percent">${pSN}%</span></div>
            <div class="chart-row"><span class="chart-label">F</span><div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pTF}%"></div></div><span class="chart-label">T</span><span class="chart-percent">${pTF}%</span></div>
            <div class="chart-row"><span class="chart-label">P</span><div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pJP}%"></div></div><span class="chart-label">J</span><span class="chart-percent">${pJP}%</span></div>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 20px; margin-top: 40px;">
            <h4 style="margin-bottom:15px;"><i class="fas fa-quote-left"></i> 성격 특징</h4>
            <p style="line-height:1.8; color:var(--text-main);">${info.desc}</p>
        </div>

        <div style="margin-top:40px;">
            <h4 style="margin-bottom:20px;"><i class="fas fa-briefcase"></i> 추천 직무</h4>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                ${info.careers.map(c => `<div style="background:#f1f5f9; padding:10px; border-radius:8px; text-align:center;">${c}</div>`).join('')}
            </div>
        </div>

        <div style="text-align:center; margin-top:40px;">
            <button class="detail-btn" onclick="location.reload()">다시 하기</button>
        </div>
    `;
}
