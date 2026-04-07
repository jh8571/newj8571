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

        // 1. 전문 차트 우선 렌더링 (e1 폴더 이미지 활용)
        const relevantCharts = exerciseData.full_charts.filter(chart => 
            currentCategory === '전체' || currentCategory === '전문차트' || chart.category === currentCategory
        );

        relevantCharts.forEach(chart => {
            const card = document.createElement('div');
            card.className = 'exercise-step-card';
            card.style.border = '2px solid var(--accent-color)';
            card.innerHTML = `
                <div class="full-chart-box" style="margin-bottom: 20px;">
                    <img src="${chart.image}" alt="${chart.name}" style="width:100%; border-radius:12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.75rem; color:var(--accent-color); font-weight:800; border:1px solid var(--accent-color); padding:2px 8px; border-radius:4px;">PRO CHART</span>
                    <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${chart.category}</span>
                </div>
                <h4 style="font-size:1.3rem; margin:10px 0; color:var(--primary-color);">${chart.name}</h4>
                <p style="color: #64748b; font-size: 0.9rem; line-height:1.5;">${chart.desc}</p>
            `;
            exerciseList.appendChild(card);
        });

        // 2. 개별 운동 자세 렌더링
        if (currentCategory !== '전문차트') {
            const filtered = exerciseData.exercises.filter(ex => 
                currentCategory === '전체' || ex.category === currentCategory
            );

            filtered.forEach(ex => {
                const card = document.createElement('div');
                card.className = 'exercise-step-card';
                
                let imagesHTML = '';
                if (ex.steps_images) {
                    imagesHTML = `
                        <div class="steps-gallery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px;">
                            ${ex.steps_images.map(img => `
                                <div class="step-img-box">
                                    <img src="${img.url}" alt="${img.desc}" 
                                        style="width:100%; height:100px; object-fit:cover; border-radius:8px; border:1px solid #eee;">
                                    <p style="font-size:0.65rem; color:#94a3b8; margin-top:5px; text-align:center; line-height:1.2;">${img.desc.split(': ')[0]}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }

                card.innerHTML = `
                    ${imagesHTML}
                    <div style="display:flex; justify-content:space-between; align-items:center; margin:10px 0;">
                        <span style="font-size:0.8rem; color:var(--accent-color); font-weight:700;">${ex.category} | ${ex.difficulty}</span>
                        <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${ex.target.split(',')[0]}</span>
                    </div>
                    <h4 style="font-size:1.3rem; margin-bottom:12px; color:var(--primary-color);">${ex.name}</h4>
                    <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-bottom:15px;">
                        <p style="font-size:0.9rem; color:#475569; line-height:1.6;"><strong><i class="fas fa-check-circle" style="color:var(--success-color);"></i> 핵심 자세:</strong> ${ex.steps[0]}</p>
                    </div>
                    <div style="padding:15px; background:#fff9db; border-radius:12px; font-size:0.85rem; color:#856404; line-height:1.5;">
                        <strong><i class="fas fa-lightbulb"></i> 전문가 팁:</strong> ${ex.posture_tips}
                    </div>
                    <div style="margin-top:10px; font-size:0.85rem; color:var(--text-muted);">
                        <strong><i class="fas fa-lungs"></i> 호흡:</strong> ${ex.breathing}
                    </div>
                `;
                exerciseList.appendChild(card);
            });
        }
    }
});