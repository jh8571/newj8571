let testData = [];
let searchQuery = '';

const testListElement = document.getElementById('test-list');
const searchInput = document.getElementById('test-search-input');
const modal = document.getElementById('test-modal');
const modalContent = document.getElementById('test-modal-body');
const closeModal = document.querySelector('.close');

let currentTest = null;
let currentScores = [];

// Fetch large mock dataset
fetch('tests.json')
    .then(response => response.json())
    .then(data => {
        testData = data;
        renderTests();
    })
    .catch(error => {
        console.error('Error fetching tests:', error);
        testListElement.innerHTML = '<div class="no-results">데이터를 불러오는 데 실패했습니다.</div>';
    });

// Search functionality
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTests();
    });
}

function renderTests() {
    const filteredTests = testData.filter(test => {
        return test.title.toLowerCase().includes(searchQuery) || 
               test.description.toLowerCase().includes(searchQuery);
    });

    testListElement.innerHTML = '';
    
    if (filteredTests.length === 0) {
        testListElement.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        return;
    }

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

window.startTest = function(id) {
    currentTest = testData.find(d => d.id === id);
    if (!currentTest) return;
    currentScores = new Array(currentTest.questions.length).fill(0);
    renderTestForm();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

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

    html += `
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="detail-btn" style="padding: 10px 20px; font-size: 16px;" onclick="showResult()">결과 보기</button>
        </div>
    `;
    modalContent.innerHTML = html;
}

window.selectOption = function(qIndex, score) {
    currentScores[qIndex] = score;
    renderTestForm(); // re-render to update selected state
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
        <div class="detail-header" style="text-align:center;">
            <h2>테스트 결과</h2>
        </div>
        <div style="padding: 40px 20px; text-align:center;">
            <h3 style="color:#3498db; margin-bottom: 20px;">당신의 총점: ${totalScore}점</h3>
            <p style="font-size: 18px; line-height: 1.6;">${resultText}</p>
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="detail-btn" onclick="closeTest()">닫기</button>
        </div>
    `;
}

window.closeTest = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeModal.onclick = closeTest;

window.onclick = function(event) {
    if (event.target == modal) {
        closeTest();
    }
};