document.addEventListener('DOMContentLoaded', () => {
    let exerciseData = null;
    let currentCategory = '전체';

    fetch('exercise_data.json')
        .then(r => r.json())
        .then(data => { exerciseData = data; })
        .catch(e => console.error("Exercise data load error:", e));

    window.calculateBMI = function() {
        const h = parseFloat(document.getElementById('height').value) / 100;
        const w = parseFloat(document.getElementById('weight').value);
        if (!h || !w) return alert('정확한 신장과 체중을 입력하세요.');
        const bmi = (w / (h * h)).toFixed(1);
        document.getElementById('bmi-score').innerText = bmi;
        let cat = '', key = '';
        if (bmi < 18.5) { cat = '저체중'; key = 'ectomorph'; }
        else if (bmi < 23) { cat = '정상'; key = 'mesomorph'; }
        else if (bmi < 25) { cat = '과체중'; key = 'endomorph'; }
        else { cat = '비만'; key = 'endomorph'; }
        document.getElementById('bmi-category').innerText = cat;
        document.getElementById('result-card').style.display = 'block';
        if (exerciseData) renderRecommendation(key);
    };

    window.filterExercises = function(category) {
        currentCategory = category;
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.innerText === category);
            btn.style.background = btn.innerText === category ? 'var(--primary-color)' : 'white';
            btn.style.color = btn.innerText === category ? 'white' : 'inherit';
        });
        renderExerciseList();
    };

    function renderRecommendation(key) {
        const c = exerciseData.courses[key];
        document.getElementById('course-title').innerText = c.title;
        document.getElementById('breakfast-text').innerText = c.meals.breakfast;
        document.getElementById('lunch-text').innerText = c.meals.lunch;
        document.getElementById('dinner-text').innerText = c.meals.dinner;
        document.getElementById('nutrition-tip').innerText = c.meals.nutrition_tip;
        document.getElementById('recommendation-section').style.display = 'block';
        renderExerciseList();
        window.scrollTo({ top: document.getElementById('recommendation-section').offsetTop - 50, behavior: 'smooth' });
    }

    function renderExerciseList() {
        const list = document.getElementById('exercise-steps-grid');
        list.innerHTML = '';
        const filtered = exerciseData.exercises.filter(ex => currentCategory === '전체' || ex.category === currentCategory);

        filtered.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'exercise-step-card';
            
            // Sprite 계산 (3열 x 4행 기준)
            const cols = 3;
            const row = Math.floor(ex.cell_index / cols);
            const col = ex.cell_index % cols;
            
            // 퍼센트 위치 계산 (0% ~ 100%)
            const posX = (col / (cols - 1)) * 100;
            const posY = (row / 3) * 100;

            const spriteHTML = `
                <div class="sprite-box" style="
                    width: 100%; 
                    height: 200px; 
                    background-image: url('e1/${ex.chart_id}.png');
                    background-size: 300% 400%;
                    background-position: ${posX}% ${posY}%;
                    border-radius: 12px;
                    border: 1px solid #eee;
                    margin-bottom: 20px;
                    background-color: #fff;
                "></div>
            `;

            card.innerHTML = `
                ${spriteHTML}
                <div style="display:flex; justify-content:space-between; align-items:center; margin:15px 0;">
                    <span style="font-size:0.8rem; color:var(--accent-color); font-weight:700;">${ex.category} | ${ex.difficulty}</span>
                    <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${ex.target}</span>
                </div>
                <h4 style="font-size:1.3rem; margin-bottom:12px; color:var(--primary-color);">${ex.name}</h4>
                <ul class="step-list" style="margin-bottom:15px; padding-left: 20px;">
                    ${ex.steps.map(s => `<li style="font-size:0.9rem; color:#475569; margin-bottom:5px;">${s}</li>`).join('')}
                </ul>
                <div style="padding:15px; background:#fff9db; border-radius:12px; font-size:0.85rem; color:#856404;">
                    <strong><i class="fas fa-lightbulb"></i> 자세 팁:</strong> ${ex.posture_tips}
                </div>
            `;
            list.appendChild(card);
        });
    }
});