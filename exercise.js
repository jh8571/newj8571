let exerciseData = null;

async function loadExerciseData() {
    try {
        const response = await fetch('exercise_data.json');
        exerciseData = await response.json();
    } catch (error) {
        console.error('Failed to load exercise data:', error);
    }
}

function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value) / 100;
    const weight = parseFloat(document.getElementById('weight').value);

    if (!height || !weight) {
        alert('키와 몸무게를 올바르게 입력해주세요.');
        return;
    }

    const bmi = (weight / (height * height)).toFixed(1);
    let category = '';
    let courseKey = '';

    if (bmi < 18.5) {
        category = '저체중';
        courseKey = 'underweight';
    } else if (bmi < 25) {
        category = '정상';
        courseKey = 'normal';
    } else {
        category = '과체중/비만';
        courseKey = 'overweight';
    }

    displayResult(bmi, category, courseKey);
}

function displayResult(bmi, category, courseKey) {
    const resultCard = document.getElementById('result-card');
    const bmiScore = document.getElementById('bmi-score');
    const bmiCategory = document.getElementById('bmi-category');
    
    bmiScore.textContent = bmi;
    bmiCategory.textContent = category;
    resultCard.style.display = 'block';

    renderCourse(courseKey);
}

function renderCourse(courseKey) {
    const course = exerciseData.courses[courseKey];
    const recommendationSection = document.getElementById('recommendation-section');
    
    // Render Header
    document.getElementById('course-title').textContent = course.title;
    document.getElementById('course-desc').textContent = course.description;

    // Render Exercises
    const stepsGrid = document.getElementById('exercise-steps-grid');
    stepsGrid.innerHTML = '';

    course.exerciseIds.forEach(id => {
        const ex = exerciseData.exercises.find(e => e.id === id);
        const card = document.createElement('div');
        card.className = 'exercise-step-card';
        card.innerHTML = `
            <div class="step-img-placeholder">
                <i class="fas ${ex.icon}"></i>
            </div>
            <h3>${ex.name}</h3>
            <p style="color: var(--accent-color); font-weight: 700; margin-bottom: 15px;">${ex.category}</p>
            <ul class="step-list">
                ${ex.steps.map(step => `<li>${step}</li>`).join('')}
            </ul>
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 12px; font-size: 0.9rem; color: var(--text-muted);">
                <strong><i class="fas fa-lightbulb"></i> Tip:</strong> ${ex.tips}
            </div>
        `;
        stepsGrid.appendChild(card);
    });

    // Render Diet
    document.getElementById('breakfast-text').textContent = course.meals.breakfast;
    document.getElementById('lunch-text').textContent = course.meals.lunch;
    document.getElementById('dinner-text').textContent = course.meals.dinner;

    recommendationSection.style.display = 'block';
    
    // Smooth scroll to results
    recommendationSection.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadExerciseData();
});
