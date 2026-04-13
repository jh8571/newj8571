let exerciseData = null;

async function initExercise() {
    try {
        const response = await fetch('exercise_data.json');
        exerciseData = await response.json();
    } catch (error) {
        console.error('Failed to load exercise data:', error);
    }
}

initExercise();

window.calculateBMI = function() {
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    const resultArea = document.getElementById('exercise-result-area');

    if (!height || !weight) {
        alert('신장과 체중을 모두 입력해 주세요.');
        return;
    }

    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
    let key = '';
    let color = '';

    if (bmi < 18.5) { key = 'underweight'; color = '#38bdf8'; }
    else if (bmi < 23) { key = 'normal'; color = '#10b981'; }
    else if (bmi < 25) { key = 'overweight'; color = '#f59e0b'; }
    else { key = 'obesity'; color = '#ef4444'; }

    const guide = exerciseData.bmi_guide[key];
    const program = exerciseData.programs.find(p => p.id === guide.programId);
    
    renderExerciseReport(bmi, guide, program, color);
};

function renderExerciseReport(bmi, guide, program, color) {
    const resultArea = document.getElementById('exercise-result-area');
    
    let html = `
        <div class="luxury-report-card">
            <div class="report-header">
                <div class="report-badge" style="background: ${color}22; color: ${color};">Health Analysis</div>
                <h2 style="font-size: 3rem; font-weight: 900; margin-bottom: 10px;">BMI ${bmi}</h2>
                <p style="font-size: 1.25rem; font-weight: 700; color: ${color};">${guide.label} 상태 : ${guide.desc}</p>
            </div>

            <div style="padding: 40px;">
                <div style="background: var(--bg-color); padding: 30px; border-radius: 24px; margin-bottom: 40px; border-left: 8px solid ${color};">
                    <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: var(--primary-color);"><i class="fas fa-running"></i> 추천 프로그램: ${program.title}</h3>
                    <p style="color: var(--text-muted);">${program.desc}</p>
                </div>

                <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-list-check" style="color: var(--accent-color);"></i> 상세 운동 루틴 설계
                </h4>
                
                <div style="display: grid; gap: 20px;">
                    ${program.exerciseIds.map(id => {
                        const ex = exerciseData.exercises.find(e => e.id === id);
                        return `
                            <div class="focus-item" style="background: white; border: 1px solid var(--border-color); padding: 25px; border-radius: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                    <div>
                                        <span style="font-size: 0.75rem; background: var(--accent-color); color: white; padding: 4px 10px; border-radius: 50px; font-weight: 800; margin-bottom: 8px; display: inline-block;">${ex.category}</span>
                                        <h5 style="font-size: 1.25rem; font-weight: 900; color: var(--primary-color);">${ex.name}</h5>
                                    </div>
                                    <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">난이도: ${ex.difficulty}</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <p style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 5px;">[수행 방법]</p>
                                    <ul style="padding-left: 20px; font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">
                                        ${ex.steps.map(step => `<li>${step}</li>`).join('')}
                                    </ul>
                                </div>
                                <div style="background: #fffbeb; padding: 15px; border-radius: 12px; font-size: 0.85rem; color: #92400e; border: 1px solid #fef3c7;">
                                    <strong><i class="fas fa-lightbulb"></i> 포스처 팁:</strong> ${ex.posture_tips}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f0fdf4; padding: 25px; border-radius: 20px; border: 1px solid #dcfce7;">
                        <h5 style="color: #166534; font-weight: 800; margin-bottom: 10px;"><i class="fas fa-utensils"></i> 맞춤 식단 제안</h5>
                        <p style="font-size: 0.9rem; color: #14532d; line-height: 1.6;">${program.diet_tip}</p>
                    </div>
                    <div style="background: #eff6ff; padding: 25px; border-radius: 20px; border: 1px solid #dbeafe;">
                        <h5 style="color: #1e40af; font-weight: 800; margin-bottom: 10px;"><i class="fas fa-clock"></i> 권장 운동 시간</h5>
                        <p style="font-size: 0.9rem; color: #1e3a8a; line-height: 1.6;">주 3~5회, 회당 40~60분 수행을 권장합니다. 운동 전후 충분한 스트레칭을 잊지 마세요.</p>
                    </div>
                </div>

                ${window.getShareUI('나의 맞춤형 운동 처방', `VitalRest에서 분석한 저의 운동 루틴은 '${program.title}'입니다. 함께 운동해요!`)}
            </div>
        </div>
    `;

    resultArea.innerHTML = html;
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.showQuickRoutine = function(type) {
    if (!exerciseData) return;
    const program = exerciseData.programs.find(p => p.id === type);
    if (program) {
        renderExerciseReport('-', { label: 'Quick Guide', desc: '선택하신 루틴 정보입니다.', programId: type }, program, '#818cf8');
    }
};
