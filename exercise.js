document.addEventListener('DOMContentLoaded', () => {
    let exerciseData = null;
    let currentCategory = '전체';

    // Load data
    fetch('exercise_data.json')
        .then(r => r.json())
        .then(data => { 
            exerciseData = data; 
        })
        .catch(e => console.error("Exercise data load error:", e));

    window.calculateBMI = function() {
        const height = parseFloat(document.getElementById('height').value) / 100;
        const weight = parseFloat(document.getElementById('weight').value);

        if (!height || !weight || height <= 0 || weight <= 0) {
            alert('정확한 신장과 체중을 입력해 주세요.');
            return;
        }

        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmi-score').innerText = bmi;
        
        let category = '';
        let courseKey = '';
        if (bmi < 18.5) {
            category = '저체중 (Underweight)';
            courseKey = 'ectomorph';
        } else if (bmi < 23) {
            category = '정상 (Normal)';
            courseKey = 'mesomorph';
        } else if (bmi < 25) {
            category = '과체중 (Overweight)';
            courseKey = 'endomorph';
        } else {
            category = '비만 (Obesity)';
            courseKey = 'endomorph';
        }

        document.getElementById('bmi-category').innerText = category;
        document.getElementById('result-card').style.display = 'block';
        
        if (exerciseData) {
            renderRecommendation(courseKey);
        }
    };

    window.filterExercises = function(category) {
        currentCategory = category;
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'white';
            btn.style.color = 'inherit';
            if (btn.innerText === category) {
                btn.classList.add('active');
                btn.style.background = 'var(--primary-color)';
                btn.style.color = 'white';
            }
        });
        renderExerciseList();
    };

    function renderRecommendation(key) {
        const course = exerciseData.courses[key];
        document.getElementById('course-title').innerText = course.title;
        document.getElementById('course-desc').innerText = course.description || "당신의 체형에 최적화된 전문 트레이닝 차트입니다.";
        
        document.getElementById('breakfast-text').innerText = course.meals.breakfast;
        document.getElementById('lunch-text').innerText = course.meals.lunch;
        document.getElementById('dinner-text').innerText = course.meals.dinner;
        document.getElementById('nutrition-tip').innerText = course.meals.nutrition_tip;

        document.getElementById('recommendation-section').style.display = 'block';
        renderExerciseList();

        window.scrollTo({
            top: document.getElementById('recommendation-section').offsetTop - 50,
            behavior: 'smooth'
        });
    }

    function renderExerciseList() {
        const exerciseList = document.getElementById('exercise-steps-grid');
        exerciseList.innerHTML = '';

        const filtered = exerciseData.exercises.filter(ex => 
            currentCategory === '전체' || ex.category === currentCategory
        );

        filtered.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'exercise-step-card';
            card.style.cursor = 'zoom-in';
            card.onclick = () => window.open(ex.main_image, '_blank'); // 클릭 시 이미지 원본 보기

            card.innerHTML = `
                <div class="main-chart-box" style="margin-bottom: 20px; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
                    <img src="${ex.main_image}" alt="${ex.name}" 
                        style="width:100%; height:auto; display:block;"
                        onerror="this.src='https://via.placeholder.com/600x800?text=Chart+Loading...'">
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <span style="font-size:0.8rem; color:var(--accent-color); font-weight:800; border:1px solid var(--accent-color); padding:2px 8px; border-radius:4px;">전문가용 차트</span>
                    <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${ex.category} | ${ex.difficulty}</span>
                </div>
                <h4 style="font-size:1.4rem; margin-bottom:10px; color:var(--primary-color);">${ex.name}</h4>
                <p style="color: #475569; font-size: 0.95rem; line-height:1.6; margin-bottom:15px;">${ex.desc}</p>
                <div style="padding:15px; background:#fff9db; border-radius:12px; font-size:0.9rem; color:#856404; line-height:1.5;">
                    <strong><i class="fas fa-lightbulb"></i> 트레이닝 팁:</strong> ${ex.posture_tips}
                </div>
                <p style="margin-top:10px; font-size:0.8rem; color:#94a3b8; text-align:center;">* 이미지를 클릭하면 크게 볼 수 있습니다.</p>
            `;
            exerciseList.appendChild(card);
        });
    }
});