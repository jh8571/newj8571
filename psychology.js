document.addEventListener('DOMContentLoaded', () => {
    let testData = [];
    let currentTest = null;
    let currentQuestionIndex = 0;
    let totalScore = 0;

    const testListElement = document.getElementById('test-list');
    const modal = document.getElementById('test-modal');
    const modalContent = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');

    if (!testListElement) return;

    // Load Tests
    fetch('tests.json')
        .then(r => r.json())
        .then(data => {
            testData = data;
            renderTestList();
        })
        .catch(e => console.error("Test data load error:", e));

    function renderTestList() {
        testListElement.innerHTML = '';
        testData.forEach(test => {
            const card = document.createElement('div');
            card.className = 'test-card';
            card.innerHTML = `
                <div class="test-icon"><i class="fas fa-brain"></i></div>
                <h3 class="card-name">${test.title}</h3>
                <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 20px; line-height: 1.5;">${test.description}</p>
                <button class="detail-btn" onclick="startTest(${test.id})">테스트 시작</button>
            `;
            testListElement.appendChild(card);
        });
    }

    window.startTest = function(id) {
        currentTest = testData.find(t => t.id === id);
        if (!currentTest) return;

        currentQuestionIndex = 0;
        totalScore = 0;
        renderQuestion();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    function renderQuestion() {
        const q = currentTest.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / currentTest.questions.length) * 100;

        modalContent.innerHTML = `
            <div class="test-header">
                <div class="progress-bar-container" style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; margin-bottom:20px;">
                    <div class="progress-bar" style="width:${progress}%; height:100%; background:var(--accent-color); border-radius:4px; transition:0.3s;"></div>
                </div>
                <span style="font-size:0.9rem; color:var(--accent-color); font-weight:700;">Question ${currentQuestionIndex + 1} / ${currentTest.questions.length}</span>
                <h2 style="margin-top:15px; font-size: 1.5rem; color: var(--primary-color);">${q.q}</h2>
            </div>
            <div class="options-container" style="display:grid; gap:12px; margin-top:30px;">
                ${q.options.map((opt, idx) => `
                    <button class="option-btn" onclick="selectOption(${opt.score})" style="padding:15px 25px; text-align:left; border:1px solid #e2e8f0; border-radius:12px; background:white; cursor:pointer; font-size:1rem; transition:0.2s;">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    window.selectOption = function(score) {
        totalScore += score;
        currentQuestionIndex++;

        if (currentQuestionIndex < currentTest.questions.length) {
            renderQuestion();
        } else {
            showResult();
        }
    };

    function showResult() {
        let resultText = "";
        for (const range in currentTest.results) {
            const [min, max] = range.split('-').map(Number);
            if (totalScore >= min && totalScore <= max) {
                resultText = currentTest.results[range];
                break;
            }
        }

        modalContent.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div style="font-size:4rem; color:var(--accent-color); margin-bottom:20px;"><i class="fas fa-clipboard-check"></i></div>
                <h2 style="font-size:2rem; color:var(--primary-color); margin-bottom:15px;">분석 결과</h2>
                <div style="background:#f8fafc; padding:30px; border-radius:20px; border-left:5px solid var(--accent-color); margin-bottom:30px; text-align:left;">
                    <p style="font-size:1.2rem; line-height:1.8; color:var(--text-main);">${resultText}</p>
                </div>
                <button class="calc-btn" onclick="location.reload()">다른 테스트 하기</button>
            </div>
        `;
    }

    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
});