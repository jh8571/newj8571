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

window.calculateBMI = function () {
    if (!exerciseData) {
        alert('운동 데이터를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
        return;
    }
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = document.getElementById('age') ? parseInt(document.getElementById('age').value) || 30 : 30;
    const resultArea = document.getElementById('exercise-result-area');

    if (!height || !weight) {
        alert('신장과 체중을 모두 입력해 주세요.');
        return;
    }

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let key = '', color = '';

    if (bmi < 18.5)      { key = 'underweight'; color = '#38bdf8'; }
    else if (bmi < 23)   { key = 'normal';       color = '#10b981'; }
    else if (bmi < 25)   { key = 'overweight';   color = '#f59e0b'; }
    else                  { key = 'obesity';       color = '#ef4444'; }

    const guide = exerciseData.bmi_guide[key];
    const program = exerciseData.programs.find(p => p.id === guide.programId);

    renderExerciseReport(bmi, guide, program, color, height, weight, age);
};

function calcBMR(height, weight, age) {
    // Mifflin-St Jeor (male/female average)
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

function renderExerciseReport(bmi, guide, program, color, height, weight, age) {
    const resultArea = document.getElementById('exercise-result-area');
    const bmr = calcBMR(height, weight, age);
    const tdee = Math.round(bmr * 1.55); // moderate activity
    const idealWeightMin = (1.65 * (height / 100) * (height / 100)).toFixed(1);
    const idealWeightMax = (1.85 * (height / 100) * (height / 100)).toFixed(1);

    const weeklySchedule = getWeeklySchedule(guide.programId);
    const nutritionTips = getNutritionTips(guide.programId, bmi);

    let html = `
        <div class="luxury-report-card">
            <div class="report-header">
                <div class="report-badge" style="background:${color}22; color:${color};">Health Analysis · ${new Date().toLocaleDateString('ko-KR')}</div>
                <h2 style="font-size:3.5rem; font-weight:900; margin-bottom:8px; color:var(--primary-color);">BMI ${bmi}</h2>
                <p style="font-size:1.2rem; font-weight:800; color:${color};">${guide.label} — ${guide.desc}</p>
            </div>

            <div style="padding:40px;">
                <!-- BMI Scale Visual -->
                <div style="background:var(--bg-color); padding:25px; border-radius:20px; margin-bottom:30px;">
                    <h4 style="color:var(--primary-color); margin-bottom:18px; font-size:0.95rem;"><i class="fas fa-ruler"></i> BMI 측정 결과</h4>
                    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:15px; text-align:center;">
                        ${[
                            { label: '저체중', range: '~18.4', c: '#38bdf8', active: bmi < 18.5 },
                            { label: '정상', range: '18.5~22.9', c: '#10b981', active: bmi >= 18.5 && bmi < 23 },
                            { label: '과체중', range: '23~24.9', c: '#f59e0b', active: bmi >= 23 && bmi < 25 },
                            { label: '비만', range: '25+', c: '#ef4444', active: bmi >= 25 }
                        ].map(s => `
                            <div style="padding:12px 8px; border-radius:12px; background:${s.active ? s.c + '22' : 'var(--card-bg)'}; border:2px solid ${s.active ? s.c : 'var(--border-color)'};">
                                <div style="font-size:0.75rem; font-weight:800; color:${s.active ? s.c : 'var(--text-muted)'};">${s.label}</div>
                                <div style="font-size:0.7rem; color:var(--text-muted);">${s.range}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; text-align:center;">
                        <div style="background:var(--card-bg); padding:15px; border-radius:14px;">
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">기초대사량 (BMR)</div>
                            <div style="font-size:1.3rem; font-weight:900; color:var(--primary-color);">${bmr} kcal</div>
                        </div>
                        <div style="background:var(--card-bg); padding:15px; border-radius:14px;">
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">일일권장칼로리 (TDEE)</div>
                            <div style="font-size:1.3rem; font-weight:900; color:var(--primary-color);">${tdee} kcal</div>
                        </div>
                        <div style="background:var(--card-bg); padding:15px; border-radius:14px;">
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">이상 체중 범위</div>
                            <div style="font-size:1.1rem; font-weight:900; color:${color};">${idealWeightMin}~${idealWeightMax} kg</div>
                        </div>
                    </div>
                </div>

                <!-- Recommended Program -->
                <div style="background:var(--bg-color); padding:25px; border-radius:24px; margin-bottom:30px; border-left:6px solid ${color};">
                    <h3 style="font-size:1.3rem; margin-bottom:8px; color:var(--primary-color);">
                        <i class="fas fa-running" style="color:${color};"></i> 추천 프로그램: ${program.title}
                    </h3>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${program.desc}</p>
                </div>

                <!-- Exercise Routines -->
                <h4 style="font-size:1.15rem; font-weight:800; margin-bottom:20px;">
                    <i class="fas fa-list-check" style="color:var(--accent-color);"></i> 맞춤 운동 루틴 (${program.exerciseIds.length}종)
                </h4>
                <div style="display:grid; gap:20px; margin-bottom:30px;">
                    ${program.exerciseIds.map((id, idx) => {
                        const ex = exerciseData.exercises.find(e => e.id === id);
                        if (!ex) return '';
                        return `
                            <div class="exercise-focus-item">
                                <div class="exercise-image-wrapper">
                                    <img src="${ex.image}" alt="${ex.name}" onerror="this.style.display='none'">
                                </div>
                                <div style="flex:1;">
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                                        <div>
                                            <div style="display:flex; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
                                                <span style="font-size:0.72rem; background:${color}22; color:${color}; padding:3px 10px; border-radius:50px; font-weight:800;">${ex.category}</span>
                                                <span style="font-size:0.72rem; background:var(--bg-color); color:var(--text-muted); padding:3px 10px; border-radius:50px; font-weight:700;">${ex.target}</span>
                                            </div>
                                            <h5 style="font-size:1.15rem; font-weight:900; color:var(--primary-color);">
                                                <span style="color:${color};">${idx + 1}.</span> ${ex.name}
                                            </h5>
                                        </div>
                                        <span style="font-size:0.8rem; background:var(--card-bg); color:var(--text-muted); padding:4px 10px; border-radius:20px; font-weight:700; white-space:nowrap;">난이도: ${ex.difficulty}</span>
                                    </div>
                                    <div style="margin-bottom:12px;">
                                        <p style="font-size:0.85rem; font-weight:800; color:var(--text-main); margin-bottom:6px;">수행 방법</p>
                                        <ol style="padding-left:18px; font-size:0.88rem; color:var(--text-muted); line-height:1.8; margin:0;">
                                            ${ex.steps.map(step => `<li>${step}</li>`).join('')}
                                        </ol>
                                    </div>
                                    <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7); padding:12px 15px; border-radius:12px; font-size:0.83rem; color:#92400e; border:1px solid #fef3c7;">
                                        <strong><i class="fas fa-lightbulb"></i> 자세 포인트:</strong> ${ex.posture_tips}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Weekly Schedule -->
                <div style="background:var(--bg-color); padding:25px; border-radius:20px; margin-bottom:25px; border:1px solid var(--border-color);">
                    <h4 style="color:var(--primary-color); margin-bottom:18px;"><i class="fas fa-calendar-week"></i> 주간 운동 스케줄 권장안</h4>
                    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:8px; text-align:center;">
                        ${weeklySchedule.map(day => `
                            <div style="padding:10px 5px; border-radius:12px; background:${day.active ? color + '22' : 'var(--card-bg)'}; border:1px solid ${day.active ? color + '44' : 'var(--border-color)'};">
                                <div style="font-size:0.75rem; font-weight:800; color:${day.active ? color : 'var(--text-muted)'}; margin-bottom:4px;">${day.day}</div>
                                <div style="font-size:0.7rem; color:var(--text-muted); line-height:1.3;">${day.label}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Nutrition + Rest Grid -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:25px;">
                    <div style="background:#f0fdf4; padding:22px; border-radius:18px; border:1px solid #dcfce7;">
                        <h5 style="color:#166534; font-weight:800; margin-bottom:12px;"><i class="fas fa-utensils"></i> 맞춤 영양 전략</h5>
                        ${nutritionTips.map(tip => `<p style="font-size:0.85rem; color:#14532d; line-height:1.7; margin-bottom:6px;">✅ ${tip}</p>`).join('')}
                    </div>
                    <div style="background:#eff6ff; padding:22px; border-radius:18px; border:1px solid #dbeafe;">
                        <h5 style="color:#1e40af; font-weight:800; margin-bottom:12px;"><i class="fas fa-bed"></i> 회복 & 수면 전략</h5>
                        <p style="font-size:0.85rem; color:#1e3a8a; line-height:1.7; margin-bottom:6px;">✅ 운동 후 48시간 이상 동일 근육군 휴식</p>
                        <p style="font-size:0.85rem; color:#1e3a8a; line-height:1.7; margin-bottom:6px;">✅ 하루 7~9시간 수면으로 성장호르몬 분비 촉진</p>
                        <p style="font-size:0.85rem; color:#1e3a8a; line-height:1.7;">✅ 냉온탕 교대 샤워로 피로 회복 극대화</p>
                    </div>
                </div>

                <!-- Progress Tips -->
                <div style="background:linear-gradient(135deg,${color}15,${color}05); border:1px solid ${color}33; padding:22px; border-radius:18px; margin-bottom:25px;">
                    <h5 style="color:${color}; margin-bottom:12px;"><i class="fas fa-chart-line"></i> 진행 상황 체크 방법</h5>
                    <ul style="list-style:none; padding:0; font-size:0.88rem; color:var(--text-main); line-height:2;">
                        <li>📸 매주 같은 시간·각도에서 체형 사진을 찍어 변화를 기록하세요</li>
                        <li>📊 2~4주마다 체중·체지방률 측정 (매일 측정은 오히려 스트레스 유발)</li>
                        <li>💪 운동 일지 작성: 세트 수, 반복 횟수, 무게 기록</li>
                        <li>🎯 4주마다 강도를 5~10% 점진적으로 증가</li>
                    </ul>
                </div>

                ${window.getShareUI ? window.getShareUI(`내 BMI ${bmi} 맞춤 운동 처방`, `VitalRest가 분석한 맞춤 운동 루틴은 [${program.title}]입니다. 함께 건강해져요!`) : ''}
            </div>
        </div>
    `;

    resultArea.innerHTML = html;
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getWeeklySchedule(programId) {
    const schedules = {
        office_worker: [
            { day: '월', label: '스트레칭', active: true },
            { day: '화', label: '휴식', active: false },
            { day: '수', label: '코어', active: true },
            { day: '목', label: '휴식', active: false },
            { day: '금', label: '스트레칭', active: true },
            { day: '토', label: '유산소', active: true },
            { day: '일', label: '완전 휴식', active: false }
        ],
        fat_loss: [
            { day: '월', label: '유산소', active: true },
            { day: '화', label: '근력', active: true },
            { day: '수', label: '유산소', active: true },
            { day: '목', label: '휴식', active: false },
            { day: '금', label: '유산소', active: true },
            { day: '토', label: '근력', active: true },
            { day: '일', label: '완전 휴식', active: false }
        ],
        muscle_gain: [
            { day: '월', label: '상체', active: true },
            { day: '화', label: '하체', active: true },
            { day: '수', label: '휴식', active: false },
            { day: '목', label: '등·어깨', active: true },
            { day: '금', label: '코어', active: true },
            { day: '토', label: '전신', active: true },
            { day: '일', label: '완전 휴식', active: false }
        ]
    };
    return schedules[programId] || schedules.office_worker;
}

function getNutritionTips(programId, bmi) {
    const tips = {
        office_worker: [
            '정제 탄수화물(흰쌀, 빵) 대신 통곡물·현미로 대체',
            '하루 채소 5색 섭취로 항산화 영양소 충전',
            '식후 10~15분 가벼운 산책으로 혈당 스파이크 완화',
            '물은 하루 1.5~2L, 커피는 오후 2시 이전 섭취'
        ],
        fat_loss: [
            `일일 칼로리 목표: 약 ${Math.round(calcBMR(170, parseFloat(bmi) < 25 ? 70 : 80, 30) * 1.2)} kcal (결핍 식이)`,
            '단백질 체중 1kg당 1.6~2g 섭취로 근손실 방지',
            '식사는 하루 3~4회, 최소 4시간 간격 유지',
            '취침 3시간 전 탄수화물 섭취 제한'
        ],
        muscle_gain: [
            '단백질 체중 1kg당 2~2.5g 섭취 (닭가슴살, 두부, 계란)',
            '운동 후 30분 이내 단백질+탄수화물 1:2 비율 섭취',
            '크레아틴 보충제 3~5g/일 고려 (전문가 상담 후)',
            '열량 잉여 상태 유지: TDEE + 200~300 kcal'
        ]
    };
    return tips[programId] || tips.office_worker;
}

window.showQuickRoutine = function (type) {
    if (!exerciseData) return;
    const program = exerciseData.programs.find(p => p.id === type);
    if (program) {
        renderExerciseReport('-', { label: 'Quick Guide', desc: '선택하신 루틴 정보입니다.', programId: type }, program, '#818cf8', 170, 65, 30);
    }
};
