document.addEventListener('DOMContentLoaded', () => {
    let exerciseData = null;

    // Load data
    fetch('exercise_data.json')
        .then(r => r.json())
        .then(data => { exerciseData = data; })
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
        
        if (exerciseData && exerciseData.courses[courseKey]) {
            renderRecommendation(courseKey);
        }
    };

    function renderRecommendation(key) {
        const course = exerciseData.courses[key];
        document.getElementById('course-title').innerText = course.title;
        document.getElementById('course-desc').innerText = course.description;
        document.getElementById('nutrition-tip').innerText = course.nutrition_tip;

        // Render Exercises
        const exerciseList = document.getElementById('exercise-steps-grid');
        exerciseList.innerHTML = '';
        course.exerciseIds.forEach(id => {
            const ex = exerciseData.exercises.find(e => e.id === id);
            if (ex) {
                const card = document.createElement('div');
                card.className = 'exercise-step-card';
                card.innerHTML = `
                    <div class="step-img-placeholder" id="img-container-${ex.id}" style="height:250px;">
                        ${ex.video ? `<iframe width="100%" height="100%" src="${ex.video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:16px;"></iframe>` : 
                          (ex.image ? `<img src="${ex.image}" alt="${ex.name}" 
                            style="width:100%; height:100%; object-fit:cover; border-radius:16px;"
                            onerror="this.parentElement.innerHTML='<i class=\'fas ${ex.icon}\'></i>'">` : 
                            `<i class="fas ${ex.icon}"></i>`)}
                    </div>
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
            }
        });

        // Render Meals
        document.getElementById('breakfast-text').innerText = course.meals.breakfast;
        document.getElementById('lunch-text').innerText = course.meals.lunch;
        document.getElementById('dinner-text').innerText = course.meals.dinner;
        
        const snackCard = document.getElementById('snack-card');
        const snackText = document.getElementById('snack-text');
        if (course.meals.snack) {
            snackCard.style.display = 'block';
            snackText.innerText = course.meals.snack;
        } else {
            snackCard.style.display = 'none';
        }

        document.getElementById('recommendation-section').style.display = 'block';
        window.scrollTo({
            top: document.getElementById('recommendation-section').offsetTop - 50,
            behavior: 'smooth'
        });
    }
});