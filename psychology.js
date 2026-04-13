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
            card.className = 'drug-card';
            card.innerHTML = `
                <div style="background: var(--accent-color); color: white; width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 1.5rem;">
                    <i class="fas fa-brain"></i>
                </div>
                <h3 class="card-name">${test.title}</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 25px; line-height: 1.6;">${test.description}</p>
                <button class="luxury-btn" style="margin-top: 0; padding: 12px 25px; font-size: 0.9rem;" onclick="startTest(${test.id})">분석 시작하기</button>
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
        const progress = ((currentQuestionIndex) / currentTest.questions.length) * 100;

        modalContent.innerHTML = `
            <div class="report-header" style="padding: 40px 0; background: none; border: none; text-align: left;">
                <div class="progress-container" style="margin-bottom: 30px;">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <div class="report-badge">Question ${currentQuestionIndex + 1} / ${currentTest.questions.length}</div>
                <h2 style="font-size: 1.8rem; line-height: 1.4; color: var(--primary-color);">${q.q}</h2>
            </div>
            <div style="display: grid; gap: 12px; margin-top: 10px;">
                ${q.options.map((opt, idx) => `
                    <button class="selectable-card" onclick="selectOption(${opt.score})" style="padding: 20px; text-align: left; display: flex; align-items: center; gap: 15px;">
                        <span style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem;">${idx + 1}</span>
                        <span style="font-size: 1rem; font-weight: 600;">${opt.text}</span>
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
            <div style="text-align: center; padding: 20px 0;">
                <div class="report-badge">Analysis Completed</div>
                <h2 style="font-size: 2.5rem; font-weight: 900; color: var(--primary-color); margin-bottom: 20px;">심리 분석 리포트</h2>
                <div class="luxury-report" style="text-align: left; padding: 40px; margin-top: 20px; background: var(--bg-color);">
                    <h3 style="color: var(--accent-color); margin-bottom: 15px;"><i class="fas fa-quote-left"></i> 당신을 위한 조언</h3>
                    <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main);">${resultText}</p>
                </div>
                <button class="luxury-btn" onclick="location.reload()" style="margin-top: 40px; max-width: 300px;">다른 테스트 하기</button>
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
