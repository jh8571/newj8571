window.calculateBMI = function() {
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    const resultArea = document.getElementById('exercise-result-area');

    if (!height || !weight) {
        alert('신장과 체중을 모두 입력해 주세요.');
        return;
    }

    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
    let category = '';
    let color = '';

    if (bmi < 18.5) { category = '저체중'; color = '#38bdf8'; }
    else if (bmi < 23) { category = '정상'; color = '#10b981'; }
    else if (bmi < 25) { category = '과체중'; color = '#f59e0b'; }
    else { category = '비만'; color = '#ef4444'; }

    resultArea.innerHTML = `
        <div class="luxury-report-card">
            <div class="report-header">
                <div class="report-badge" style="background: ${color}22; color: ${color};">Analysis Result</div>
                <h2 style="font-size: 2.5rem; margin-bottom: 10px;">BMI: ${bmi}</h2>
                <p style="font-size: 1.2rem; font-weight: 700; color: ${color};">${category} 상태입니다.</p>
            </div>
            <div style="padding: 40px;">
                <h3 style="margin-bottom: 25px; border-left: 4px solid var(--primary-color); padding-left: 15px;">추천 운동 가이드</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    <div class="focus-item">
                        <h4 class="focus-name">유산소 운동</h4>
                        <p class="focus-info">${getExerciseTip(category, 'cardio')}</p>
                    </div>
                    <div class="focus-item">
                        <h4 class="focus-name">근력 운동</h4>
                        <p class="focus-info">${getExerciseTip(category, 'strength')}</p>
                    </div>
                </div>
                <div style="margin-top: 30px; padding: 25px; background: #f8fafc; border-radius: 20px; border: 1px solid #f1f5f9;">
                    <h4 style="margin-bottom: 10px;"><i class="fas fa-utensils"></i> 식단 조언</h4>
                    <p style="font-size: 0.95rem; color: #475569;">${getDietTip(category)}</p>
                </div>
            </div>
        </div>
    `;
    resultArea.scrollIntoView({ behavior: 'smooth' });
};

function getExerciseTip(cat, type) {
    if (cat === '비만' || cat === '과체중') {
        return type === 'cardio' ? '관절에 무리가 없는 수영이나 빠른 걷기를 매일 40분 이상 권장합니다.' : '기초 대사량을 높이기 위해 큰 근육 위주의 스쿼트나 런지를 병행하세요.';
    }
    if (cat === '저체중') {
        return type === 'cardio' ? '가벼운 산책 위주로 하되 무리한 유산소는 피하세요.' : '근육량 증대를 위해 고단백 식단과 함께 고강도 웨이트 트레이닝이 필요합니다.';
    }
    return type === 'cardio' ? '현재의 신체 밸런스를 유지하기 위해 주 3회 인터벌 러닝을 추천합니다.' : '전신 근력 발달을 위한 데드리프트나 플랭크를 추천합니다.';
}

function getDietTip(cat) {
    if (cat === '비만') return '정제 탄수화물을 줄이고 식이섬유가 풍부한 채소 중심의 식단을 구성하세요.';
    if (cat === '저체중') return '끼니를 거르지 말고 복합 탄수화물과 양질의 지방을 충분히 섭취하세요.';
    return '단백질 위주의 균형 잡힌 식단을 유지하며 수분 섭취를 늘리세요.';
}
