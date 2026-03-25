let testData = [];
let mbtiData = null;
let searchQuery = '';

const testListElement = document.getElementById('test-list');
const searchInput = document.getElementById('test-search-input');
const modal = document.getElementById('test-modal');
const modalContent = document.getElementById('test-modal-body');
const closeModal = document.querySelector('.close');

let currentTest = null;
let currentScores = [];
let isMBTI = false;

// Fetch Datasets
Promise.all([
    fetch('tests.json').then(r => r.json()),
    fetch('mbti_data.json').then(r => r.json())
]).then(([tests, mbti]) => {
    testData = tests;
    mbtiData = mbti;
    renderTests();
}).catch(error => console.error('Error fetching tests:', error));

// Search functionality
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTests();
    });
}

function renderTests() {
    testListElement.innerHTML = '';
    
    // Add MBTI Card First
    const mbtiCard = document.createElement('div');
    mbtiCard.className = 'test-card';
    mbtiCard.style.border = '2px solid #004e92';
    mbtiCard.innerHTML = `
        <span style="background:#004e92; color:white; padding:2px 8px; border-radius:4px; font-size:12px;">HOT</span>
        <h3 class="card-name" style="margin-top:10px;">MBTI 성격 유형 테스트</h3>
        <p style="color:#666; font-size:14px; margin-bottom:15px;">나의 성격 유형과 잘 맞는 직업, 궁합까지 상세하게 알아보세요.</p>
        <button class="detail-btn" onclick="startMBTI()">테스트 시작</button>
    `;
    testListElement.appendChild(mbtiCard);

    const filteredTests = testData.filter(test => {
        return test.title.toLowerCase().includes(searchQuery) || 
               test.description.toLowerCase().includes(searchQuery);
    });

    filteredTests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.innerHTML = `
            <h3 class="card-name">${test.title}</h3>
            <p style="color:#666; font-size:14px; margin-bottom:15px;">${test.description}</p>
            <button class="detail-btn" onclick="startTest(${test.id})">테스트 시작</button>
        `;
        testListElement.appendChild(card);
    });
}

window.startMBTI = function() {
    isMBTI = true;
    currentTest = mbtiData;
    currentScores = new Array(mbtiData.questions.length).fill(null);
    renderMBTIForm();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.startTest = function(id) {
    isMBTI = false;
    currentTest = testData.find(d => d.id === id);
    if (!currentTest) return;
    currentScores = new Array(currentTest.questions.length).fill(0);
    renderTestForm();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

function renderMBTIForm() {
    let html = `
        <div class="detail-header">
            <h2 style="color:#004e92;">MBTI 성격 유형 테스트</h2>
            <p>모든 질문에 솔직하게 답변해 주세요.</p>
        </div>
        <div class="test-questions" style="margin-top:20px;">
    `;

    mbtiData.questions.forEach((q, qIndex) => {
        html += `<div class="question-block">
            <h4 style="margin-bottom:10px;">${q.id}. ${q.q}</h4>
        `;
        q.options.forEach((opt, oIndex) => {
            const isSelected = currentScores[qIndex] === opt.score;
            html += `<button class="option-btn ${isSelected ? 'selected' : ''}" onclick="selectMBTI(${qIndex}, ${opt.score})">${opt.text}</button>`;
        });
        html += `</div>`;
    });

    html += `
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="detail-btn" style="padding: 12px 30px; font-size: 1.1rem;" onclick="showMBTIResult()">결과 분석하기</button>
        </div>
    `;
    modalContent.innerHTML = html;
}

window.selectMBTI = function(qIndex, score) {
    currentScores[qIndex] = score;
    renderMBTIForm();
}

window.showMBTIResult = function() {
    if (currentScores.includes(null)) {
        alert("모든 질문에 답변해 주세요!");
        return;
    }

    let scores = { "EI": 0, "SN": 0, "TF": 0, "JP": 0 };
    currentScores.forEach((score, index) => {
        const type = mbtiData.questions[index].type;
        scores[type] += score;
    });

    let resultType = "";
    resultType += scores["EI"] >= 0 ? "E" : "I";
    resultType += scores["SN"] >= 0 ? "N" : "S";
    resultType += scores["TF"] >= 0 ? "T" : "F";
    resultType += scores["JP"] >= 0 ? "J" : "P";

    const info = mbtiData.types[resultType];

    modalContent.innerHTML = `
        <div class="detail-header" style="text-align:center; border-bottom: none;">
            <span style="font-size: 1.2rem; color: #004e92; font-weight: 800;">당신의 유형은</span>
            <h1 style="font-size: 3.5rem; margin: 10px 0; color: #000428;">${resultType}</h1>
            <h2 style="color: #004e92;">"${info.title}"</h2>
        </div>
        <div style="background: #f8fafc; padding: 25px; border-radius: 16px; margin-bottom: 25px;">
            <p style="font-size: 1.1rem; line-height: 1.8; color: #1e293b;">${info.desc}</p>
        </div>
        <div class="detail-grid">
            <div class="detail-item full-width highlight-box">
                <label><i class="fas fa-briefcase"></i> 어울리는 업무 및 직업</label>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;">
                    ${info.careers.map(c => `<span style="background:white; padding:5px 12px; border-radius:20px; font-size:0.9rem; border:1px solid #ddd;">${c}</span>`).join('')}
                </div>
            </div>
            <div class="detail-item">
                <label style="color:#2ecc71;"><i class="fas fa-heart"></i> 최고의 궁합</label>
                <p style="font-weight:700; font-size:1.2rem;">${info.good.join(', ')}</p>
            </div>
            <div class="detail-item">
                <label style="color:#e74c3c;"><i class="fas fa-heart-broken"></i> 아쉬운 궁합</label>
                <p style="font-weight:700; font-size:1.2rem;">${info.bad.join(', ')}</p>
            </div>
        </div>
        <div style="text-align:center; margin-top:40px;">
            <button class="detail-btn" onclick="closeTest()">닫기</button>
        </div>
    `;
};

// ... (existing general test functions) ...
function renderTestForm() {
    let html = `
        <div class="detail-header">
            <h2>${currentTest.title}</h2>
            <p>${currentTest.description}</p>
        </div>
        <div class="test-questions" style="margin-top:20px;">
    `;
    currentTest.questions.forEach((q, qIndex) => {
        html += `<div class="question-block">
            <h4>${q.q}</h4>
        `;
        q.options.forEach((opt, oIndex) => {
            const isSelected = currentScores[qIndex] === opt.score;
            html += `<button class="option-btn ${isSelected ? 'selected' : ''}" onclick="selectOption(${qIndex}, ${opt.score})">${opt.text}</button>`;
        });
        html += `</div>`;
    });
    html += `</div><div style="text-align:center; margin-top:20px;"><button class="detail-btn" onclick="showResult()">결과 보기</button></div>`;
    modalContent.innerHTML = html;
}

window.selectOption = function(qIndex, score) {
    currentScores[qIndex] = score;
    renderTestForm();
}

window.showResult = function() {
    if (currentScores.includes(0)) {
        alert("모든 질문에 답해주세요!");
        return;
    }
    const totalScore = currentScores.reduce((a, b) => a + b, 0);
    let resultText = "결과를 계산할 수 없습니다.";
    for (const [range, text] of Object.entries(currentTest.results)) {
        const [min, max] = range.split('-').map(Number);
        if (totalScore >= min && totalScore <= max) {
            resultText = text;
            break;
        }
    }
    modalContent.innerHTML = `
        <div class="detail-header" style="text-align:center;"><h2>테스트 결과</h2></div>
        <div style="padding: 40px 20px; text-align:center;">
            <h3 style="color:#3498db; margin-bottom: 20px;">총점: ${totalScore}점</h3>
            <p style="font-size: 18px; line-height: 1.6;">${resultText}</p>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="detail-btn" onclick="closeTest()">닫기</button></div>
    `;
}

window.closeTest = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}
closeModal.onclick = closeTest;
window.onclick = (event) => { if (event.target == modal) closeTest(); };
