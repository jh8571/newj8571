let currentQuestion = 0;
let score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
let mbtiData = null;

async function initMbti() {
    try {
        const response = await fetch('mbti_data.json');
        mbtiData = await response.json();
    } catch (error) {
        console.error('Failed to load MBTI data:', error);
    }
}

initMbti();

window.startMbtiTest = function() {
    if (!mbtiData) return;
    document.getElementById('intro-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    currentQuestion = 0;
    score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    updateQuestion();
};

function updateQuestion() {
    const q = mbtiData.questions[currentQuestion];
    document.getElementById('question-text').innerText = q.q;
    
    // In the JSON, weight 1 means the first letter of the type, -1 means the second letter.
    // E.g., type "EI", weight 1 -> E, weight -1 -> I
    const typeA = q.weight > 0 ? q.type[0] : q.type[1];
    const typeB = q.weight > 0 ? q.type[1] : q.type[0];

    document.getElementById('opt-a').innerText = "그렇다";
    document.getElementById('opt-b').innerText = "아니다";
    
    const progress = ((currentQuestion) / mbtiData.questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    document.getElementById('opt-a').onclick = () => handleAnswer(typeA);
    document.getElementById('opt-b').onclick = () => handleAnswer(typeB);
}

function handleAnswer(type) {
    score[type]++;
    currentQuestion++;
    
    if (currentQuestion < mbtiData.questions.length) {
        updateQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quiz-section').style.display = 'none';
    const resultSection = document.getElementById('result-section');
    resultSection.style.display = 'block';

    const mbti = 
        (score.E >= score.I ? 'E' : 'I') +
        (score.S >= score.N ? 'S' : 'N') +
        (score.T >= score.F ? 'T' : 'F') +
        (score.J >= score.P ? 'J' : 'P');

    const resultData = mbtiData.types[mbti];

    resultSection.innerHTML = `
        <div class="luxury-report" style="text-align: center;">
            <div style="background: var(--accent-color); color: white; display: inline-block; padding: 10px 30px; border-radius: 50px; font-weight: 900; margin-bottom: 20px;">YOUR TYPE</div>
            <h2 style="font-size: 1.5rem; color: var(--text-muted); margin-bottom: 10px;">${resultData.title}</h2>
            <h2 style="font-size: 4rem; font-weight: 900; color: var(--primary-color); margin-bottom: 20px;">${mbti}</h2>
            <p style="font-size: 1.1rem; color: var(--text-main); margin-bottom: 30px; line-height: 1.8; max-width: 600px; margin-left: auto; margin-right: auto;">
                ${resultData.desc}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; margin-top: 40px;">
                <div style="background: var(--bg-color); padding: 25px; border-radius: 20px;">
                    <h4 style="color: var(--accent-color); margin-bottom: 10px;"><i class="fas fa-star"></i> 주요 특징</h4>
                    <ul style="list-style: none; font-size: 0.9rem; padding: 0;">
                        ${resultData.traits.map(t => `<li style="margin-bottom: 5px;">• ${t}</li>`).join('')}
                    </ul>
                </div>
                <div style="background: var(--bg-color); padding: 25px; border-radius: 20px;">
                    <h4 style="color: var(--success-color); margin-bottom: 10px;"><i class="fas fa-briefcase"></i> 추천 직업</h4>
                    <p style="font-size: 0.9rem;">${resultData.careers.join(', ')}</p>
                </div>
            </div>

            <div style="margin-top: 30px; background: var(--card-bg); border: 1px solid var(--border-color); padding: 25px; border-radius: 20px; text-align: left;">
                <h4 style="color: var(--primary-color); margin-bottom: 15px;"><i class="fas fa-heart"></i> 건강 및 웰니스 팁</h4>
                <p style="font-size: 0.9rem; color: var(--text-main);">
                    ${mbti.includes('E') ? '활발한 외부 활동과 사교 모임을 통해 에너지를 얻으세요. 하지만 과도한 일정은 피로를 유발할 수 있으니 주의하세요.' : '혼자만의 정적인 시간을 통해 내면의 에너지를 회복하는 것이 중요합니다. 명상이나 독서를 추천합니다.'}
                    ${mbti.includes('S') ? '규칙적인 식습관과 검증된 운동 방법을 실천하는 것이 건강 유지에 효과적입니다.' : '새로운 운동 트렌드나 건강법을 시도해보는 것에서 즐거움을 찾을 수 있습니다.'}
                    ${mbti.includes('P') ? '지나치게 계획에 얽매이기보다 그날의 컨디션에 맞춰 유연하게 활동하는 것이 정신 건강에 좋습니다.' : '일일 건강 계획을 세우고 이를 지켜나가는 과정에서 성취감과 안정을 느낄 것입니다.'}
                </p>
            </div>

            <button class="luxury-btn" onclick="location.reload()" style="margin-top: 40px;">테스트 다시하기</button>
            ${window.getShareUI(`나의 MBTI 건강 성향: ${mbti}`, `${resultData.title}인 제게 어울리는 웰니스 가이드를 확인했어요!`)}
        </div>
    `;
}
