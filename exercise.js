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
        
        // Update button UI
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'white';
            btn.style.color = 'inherit';
            if (btn.innerText === category || (category === '전문차트' && btn.innerText === '전문 차트')) {
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
        document.getElementById('course-desc').innerText = course.description || "당신의 체형에 최적화된 운동 루틴입니다.";
        
        // Render Meals
        document.getElementById('breakfast-text').innerText = course.meals.breakfast;
        document.getElementById('lunch-text').innerText = course.meals.lunch;
        document.getElementById('dinner-text').innerText = course.meals.dinner;
        document.getElementById('nutrition-tip').innerText = course.meals.nutrition_tip;

        document.getElementById('recommendation-section').style.display = 'block';
        
        // Initial render
        renderExerciseList();

        window.scrollTo({
            top: document.getElementById('recommendation-section').offsetTop - 50,
            behavior: 'smooth'
        });
    }

    function renderExerciseList() {
        const exerciseList = document.getElementById('exercise-steps-grid');
        exerciseList.innerHTML = '';

        if (currentCategory === '전문차트') {
            exerciseData.full_charts.forEach(chart => {
                const card = document.createElement('div');
                card.className = 'exercise-step-card';
                card.innerHTML = `
                    <div class="full-chart-box" style="margin-bottom: 20px;">
                        <img src="${chart.image}" alt="${chart.name}" style="width:100%; border-radius:12px; border: 1px solid #eee;">
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.8rem; color:var(--accent-color); font-weight:700;">${chart.category} | 전문 가이드</span>
                    </div>
                    <h4 style="font-size:1.3rem; margin:10px 0; color:var(--primary-color);">${chart.name}</h4>
                    <p style="color: #64748b; font-size: 0.95rem;">${chart.desc}</p>
                `;
                exerciseList.appendChild(card);
            });
            return;
        }

        const filtered = exerciseData.exercises.filter(ex => 
            currentCategory === '전체' || ex.category === currentCategory
        );

        filtered.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'exercise-step-card';
            
            let imagesHTML = '';
            if (ex.steps_images) {
                imagesHTML = `
                    <div class="steps-gallery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                        ${ex.steps_images.map(img => `
                            <div class="step-img-box">
                                <img src="${img.url}" alt="${img.desc}" 
                                    style="width:100%; height:120px; object-fit:cover; border-radius:8px;"
                                    onerror="this.src='https://via.placeholder.com/300x300?text=Image+Error'">
                                <p style="font-size:0.7rem; color:#64748b; margin-top:5px; text-align:center; line-height:1.2;">${img.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            card.innerHTML = `
                ${imagesHTML}
                <div style="display:flex; justify-content:space-between; align-items:center; margin:15px 0;">
                    <span style="font-size:0.8rem; color:var(--accent-color); font-weight:700;">${ex.category} | ${ex.difficulty}</span>
                    <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${ex.target}</span>
                </div>
                <h4 style="font-size:1.3rem; margin-bottom:15px; color:var(--primary-color);">${ex.name}</h4>
                <ul class="step-list">
                    ${ex.steps.map(s => `<li>${s}</li>`).join('')}
                </ul>
                <div style="margin-top:20px; padding:15px; background:#fff9db; border-radius:12px; font-size:0.9rem; color:#856404;">
                    <strong><i class="fas fa-lightbulb"></i> 자세 팁:</strong> ${ex.posture_tips}
                </div>
            `;
            exerciseList.appendChild(card);
        });
    }
});