document.addEventListener('DOMContentLoaded', () => {
    let exerciseData = null;
    let currentCategory = '전체';

    // 부위별 백업 로컬 이미지 매칭 (e1 폴더 활용)
    const backupImages = {
        "가슴": "e1/017.png",
        "등": "e1/019.png",
        "어깨": "e1/009.png",
        "하체": "e1/002.png",
        "복근": "e1/011.png",
        "팔": "e1/012.png",
        "전신": "e1/001.png",
        "스트레칭": "e1/015.png",
        "유산소": "e1/006.png"
    };

    fetch('exercise_data.json')
        .then(r => r.json())
        .then(data => { exerciseData = data; })
        .catch(e => console.error("Exercise data load error:", e));

    window.calculateBMI = function() {
        const h = parseFloat(document.getElementById('height').value) / 100;
        const w = parseFloat(document.getElementById('weight').value);
        if (!h || !w) return alert('신장과 체중을 입력하세요.');
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
            
            let imagesHTML = `<div class="steps-gallery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">`;
            ex.steps_images.forEach(img => {
                imagesHTML += `
                    <div class="step-img-box">
                        <img src="${img.url}" alt="${img.desc}" 
                            style="width:100%; height:120px; object-fit:cover; border-radius:8px;"
                            onerror="this.onerror=null; this.src='${backupImages[ex.category] || backupImages['전신']}'; this.style.objectFit='contain';">
                        <p style="font-size:0.65rem; color:#64748b; margin-top:5px; text-align:center;">${img.desc.split(':')[0]}</p>
                    </div>`;
            });
            imagesHTML += `</div>`;

            card.innerHTML = `
                ${imagesHTML}
                <div style="display:flex; justify-content:space-between; align-items:center; margin:15px 0;">
                    <span style="font-size:0.8rem; color:var(--accent-color); font-weight:700;">${ex.category} | ${ex.difficulty}</span>
                    <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${ex.target}</span>
                </div>
                <h4 style="font-size:1.3rem; margin-bottom:12px; color:var(--primary-color);">${ex.name}</h4>
                <ul class="step-list" style="margin-bottom:15px;">
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