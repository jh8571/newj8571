document.addEventListener('DOMContentLoaded', () => {
    let fortuneData = null;
    const container = document.getElementById('fortune-container');

    fetch('fortune_data.json')
        .then(r => r.json())
        .then(data => {
            fortuneData = data;
            switchFortune('tarot'); // Default
        })
        .catch(e => console.error("Fortune data load error:", e));

    window.switchFortune = function(type) {
        // Update tabs
        document.querySelectorAll('.fortune-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.includes(type === 'tarot' ? '타로' : type === 'saju' ? '사주' : '관상')) {
                btn.classList.add('active');
            }
        });

        if (type === 'tarot') renderTarot();
        else if (type === 'saju') renderSaju();
        else if (type === 'face') renderFace();
    };

    function renderTarot() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">당신의 운명을 선택하세요</h2>
            <p style="color:var(--text-muted);">마음을 가다듬고 아래 카드 중 한 장을 클릭하세요.</p>
            <div class="tarot-grid">
                ${Array(6).fill(0).map((_, i) => `<div class="tarot-card-back" onclick="drawTarot()"><i class="fas fa-moon"></i></div>`).join('')}
            </div>
            <div id="tarot-result"></div>
        `;
    }

    window.drawTarot = function() {
        const resultDiv = document.getElementById('tarot-result');
        const card = fortuneData.tarot.cards[Math.floor(Math.random() * fortuneData.tarot.cards.length)];
        
        resultDiv.innerHTML = `
            <div class="fortune-result-box">
                <h3 style="color:var(--primary-color); margin-bottom:10px;"><i class="fas fa-sparkles"></i> 뽑은 카드: ${card.name}</h3>
                <p style="font-size:1.1rem; line-height:1.7;">${card.meaning}</p>
            </div>
            <button class="calc-btn" style="margin-top:30px;" onclick="renderTarot()">다시 뽑기</button>
        `;
        window.scrollTo({ top: resultDiv.offsetTop - 100, behavior: 'smooth' });
    };

    function renderSaju() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">정밀 사주 분석</h2>
            <p style="color:var(--text-muted);">태어난 연도와 성별을 기반으로 오늘의 기운을 분석합니다.</p>
            <div style="max-width:400px; margin: 30px auto; display:grid; gap:15px;">
                <input type="number" id="birth-year" placeholder="태어난 연도 (예: 1990)" style="padding:15px; border:1px solid #ddd; border-radius:12px;">
                <select id="gender" style="padding:15px; border:1px solid #ddd; border-radius:12px;">
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                </select>
                <button class="calc-btn" onclick="analyzeSaju()">분석하기</button>
            </div>
            <div id="saju-result"></div>
        `;
    }

    window.analyzeSaju = function() {
        const year = document.getElementById('birth-year').value;
        if (!year) { alert('연도를 입력하세요'); return; }

        const resultDiv = document.getElementById('saju-result');
        const elements = Object.keys(fortuneData.saju.elements);
        const element = elements[year % elements.length];
        const general = fortuneData.saju.general[Math.floor(Math.random() * fortuneData.saju.general.length)];

        resultDiv.innerHTML = `
            <div class="fortune-result-box">
                <h4 style="color:var(--primary-color); margin-bottom:10px;">나의 수호 오행: ${element}</h4>
                <p style="margin-bottom:20px;">${fortuneData.saju.elements[element]}</p>
                <h4 style="color:var(--primary-color); margin-bottom:10px;">오늘의 총운</h4>
                <p style="font-size:1.1rem; line-height:1.7;">${general}</p>
            </div>
        `;
    };

    function renderFace() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">AI 관상 분석</h2>
            <p style="color:var(--text-muted);">얼굴의 주요 특징을 통해 성격과 운세를 분석합니다.</p>
            <div style="margin:40px 0; border:2px dashed #cbd5e1; padding:50px; border-radius:24px; background:#f8fafc;">
                <i class="fas fa-camera" style="font-size:3rem; color:#cbd5e1; margin-bottom:20px;"></i>
                <p>얼굴 사진을 분석하거나 주요 특징을 선택하세요.</p>
                <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
                    ${fortuneData.physiognomy.features.map(f => `<button class="detail-btn" style="width:auto; padding:8px 20px;" onclick="showFaceInfo('${f.part}')">${f.part}</button>`).join('')}
                </div>
            </div>
            <div id="face-result"></div>
        `;
    }

    window.showFaceInfo = function(part) {
        const feature = fortuneData.physiognomy.features.find(f => f.part === part);
        const resultDiv = document.getElementById('face-result');
        resultDiv.innerHTML = `
            <div class="fortune-result-box">
                <h3 style="color:var(--primary-color); margin-bottom:10px;"><i class="fas fa-eye"></i> ${feature.part} 관상 정보</h3>
                <p style="font-size:1.1rem; line-height:1.7;">${feature.desc}</p>
            </div>
        `;
    };
});