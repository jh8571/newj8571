document.addEventListener('DOMContentLoaded', () => {
    let fortuneData = null;
    const container = document.getElementById('fortune-container');

    const tarotImages = [
        "https://www.sacred-texts.com/tarot/pkt/img/ar00.jpg", "https://www.sacred-texts.com/tarot/pkt/img/ar01.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar02.jpg", "https://www.sacred-texts.com/tarot/pkt/img/ar03.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar04.jpg", "https://www.sacred-texts.com/tarot/pkt/img/ar05.jpg"
    ];

    fetch('fortune_data.json')
        .then(r => r.json())
        .then(data => {
            fortuneData = data;
            switchFortune('tarot');
        })
        .catch(e => console.error("Fortune data load error:", e));

    window.switchFortune = function(type) {
        document.querySelectorAll('.selectable-card').forEach(card => {
            card.classList.remove('active');
        });
        const activeCard = document.getElementById(`tab-${type}`);
        if (activeCard) activeCard.classList.add('active');

        if (type === 'tarot') window.renderTarot();
        else if (type === 'saju') renderSaju();
    };

    let selectedCardsCount = 0;
    let selectedCardsData = [];

    window.renderTarot = function() {
        selectedCardsCount = 0; selectedCardsData = [];
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 40px;">
                <div class="report-badge">Fortune Telling</div>
                <h2 style="font-size: 2.5rem; font-weight: 900; color: var(--primary-color); margin-bottom: 15px;">당신의 운명을 선택하세요</h2>
                <p style="color: var(--text-muted); font-size: 1.1rem;">깊게 숨을 들이마시고, 가장 끌리는 카드 3장을 클릭하세요.</p>
            </div>
            <div class="tarot-grid">
                ${Array(12).fill(0).map((_, i) => `
                    <div class="tarot-card-container" id="card-${i}" onclick="flipTarot(${i})">
                        <div class="card-face card-back"><i class="fas fa-sun"></i></div>
                        <div class="card-face card-front" id="front-${i}"></div>
                    </div>
                `).join('')}
            </div>
            <div id="tarot-result-display"></div>
        `;
    };

    window.flipTarot = function(index) {
        const cardElement = document.getElementById(`card-${index}`);
        if (cardElement.classList.contains('flipped') || selectedCardsCount >= 3) return;
        selectedCardsCount++;
        const randomIndex = Math.floor(Math.random() * fortuneData.tarot.cards.length);
        const cardData = fortuneData.tarot.cards[randomIndex];
        selectedCardsData.push(cardData);
        document.getElementById(`front-${index}`).innerHTML = `<img src="${tarotImages[randomIndex] || tarotImages[0]}" style="width:100%; height:100%; object-fit:cover;">`;
        cardElement.classList.add('flipped');
        if (selectedCardsCount === 3) setTimeout(showTarotTotalResult, 800);
    };

    function showTarotTotalResult() {
        const resultDisplay = document.getElementById('tarot-result-display');
        let resultHTML = `
            <div class="luxury-report-card" style="margin-top: 60px;">
                <div class="report-header">
                    <div class="report-badge">In-depth Interpretation</div>
                    <h2 style="font-size: 2rem;">3카드 스프레드 심층 해석</h2>
                </div>
                <div class="nutrient-focus-grid">`;
        
        selectedCardsData.forEach((card, i) => {
            resultHTML += `
                <div class="focus-item">
                    <div style="color: var(--accent-color); font-weight: 900; font-size: 0.8rem; margin-bottom: 10px;">${["과거", "현재", "미래"][i]}</div>
                    <h4 class="focus-name">${card.name}</h4>
                    <p class="focus-info">${card.meaning}</p>
                </div>`;
        });
        
        resultHTML += `
                </div>
                <div style="padding: 40px; text-align: center;">
                    <button class="luxury-btn" style="max-width: 300px; margin-top: 0; margin-bottom: 20px;" onclick="window.renderTarot()">새로운 운세 보기</button>
                    ${window.getShareUI('오늘의 타로 운세', 'VitalRest에서 뽑은 저의 타로 카드가 궁금하신가요?')}
                </div>
            </div>`;
        
        resultDisplay.innerHTML = resultHTML;
        resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderSaju() {
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 40px;">
                <div class="report-badge">Ancient Wisdom</div>
                <h2 style="font-size: 2.5rem; font-weight: 900; color: var(--primary-color); margin-bottom: 15px;">심층 사주 분석</h2>
                <p style="color: var(--text-muted); font-size: 1.1rem;">당신의 생년월일시를 기반으로 인생의 흐름을 분석합니다.</p>
            </div>
            <div style="max-width: 500px; margin: 0 auto;">
                <div style="display: grid; gap: 20px; text-align: left;">
                    <div class="input-field">
                        <label style="font-weight: 800; font-size: 0.9rem; color: var(--text-muted);">생년월일</label>
                        <input type="date" id="birth-date">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="input-field">
                            <label style="font-weight: 800; font-size: 0.9rem; color: var(--text-muted);">태어난 시간</label>
                            <select id="birth-time">${Array(24).fill(0).map((_, i) => `<option value="${i}">${i}시</option>`).join('')}</select>
                        </div>
                        <div class="input-field">
                            <label style="font-weight: 800; font-size: 0.9rem; color: var(--text-muted);">성별</label>
                            <select id="gender"><option value="male">남성</option><option value="female">여성</option></select>
                        </div>
                    </div>
                    <button class="luxury-btn" style="width: 100%; margin-top: 20px;" onclick="analyzeSajuDeep()">분석 시작</button>
                </div>
            </div>
            <div id="saju-result-deep"></div>
        `;
    }

    window.analyzeSajuDeep = function() {
        const date = document.getElementById('birth-date').value;
        if (!date) { alert('날짜를 입력해 주세요.'); return; }
        const resultDiv = document.getElementById('saju-result-deep');
        
        resultDiv.innerHTML = `
            <div class="luxury-report" style="margin-top: 60px; text-align: center; background: var(--bg-color);">
                <div class="report-badge">Analysis Completed</div>
                <h2 style="margin-bottom: 20px;">사주 정밀 분석 리포트</h2>
                <p style="line-height: 1.8; font-size: 1.1rem; color: var(--text-main); text-align: left;">
                    ${fortuneData.saju.descriptions.professional_analysis}
                </p>
                <button class="luxury-btn" style="max-width: 300px; margin-top: 40px; margin-bottom: 20px;" onclick="renderSaju()">다시 분석하기</button>
                ${window.getShareUI('사주 정밀 분석 결과', '인생의 흐름을 읽는 VitalRest 사주 분석! 제 운명의 리포트를 확인해 보세요.')}
            </div>
        `;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
});
