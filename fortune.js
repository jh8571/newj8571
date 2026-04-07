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
        document.querySelectorAll('.fortune-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.includes(type === 'tarot' ? '타로' : type === 'saju' ? '사주' : '관상')) {
                btn.classList.add('active');
            }
        });

        if (type === 'tarot') window.renderTarot();
        else if (type === 'saju') renderSaju();
        else if (type === 'face') window.renderFace();
    };

    let selectedCardsCount = 0;
    let selectedCardsData = [];

    window.renderTarot = function() {
        selectedCardsCount = 0; selectedCardsData = [];
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">당신의 운명을 선택하세요</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">깊게 숨을 들이마시고, 가장 끌리는 카드 3장을 클릭하세요.</p>
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
        let resultHTML = `<div class="fortune-result-box" style="margin-top:50px;"><h3 style="text-align:center; margin-bottom:30px;">3카드 스프레드 심층 해석</h3><div style="display:grid; gap:20px;">`;
        selectedCardsData.forEach((card, i) => {
            resultHTML += `<div style="padding:15px; background:white; border-radius:12px; border:1px solid #eee;"><span style="font-weight:700; color:var(--accent-color);">${["과거","현재","미래"][i]}</span><h4>${card.name}</h4><p>${card.meaning}</p></div>`;
        });
        resultHTML += `</div><button class="calc-btn" style="width:100%; margin-top:30px;" onclick="window.renderTarot()">새로운 운세 보기</button></div>`;
        resultDisplay.innerHTML = resultHTML;
        window.scrollTo({ top: resultDisplay.offsetTop - 50, behavior: 'smooth' });
    }

    function renderSaju() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">심층 사주 분석</h2>
            <div class="input-form">
                <div class="input-item"><label>생년월일</label><input type="date" id="birth-date"></div>
                <div class="input-group-row">
                    <div class="input-item"><label>태어난 시간</label><select id="birth-time">${Array(24).fill(0).map((_, i) => `<option value="${i}">${i}시</option>`).join('')}</select></div>
                    <div class="input-item"><label>성별</label><select id="gender"><option value="male">남성</option><option value="female">여성</option></select></div>
                </div>
                <button class="calc-btn" style="width:100%; margin-top:20px;" onclick="analyzeSajuDeep()">분석 시작</button>
            </div>
            <div id="saju-result-deep"></div>
        `;
    }

    window.analyzeSajuDeep = function() {
        const date = document.getElementById('birth-date').value;
        if (!date) { alert('날짜를 입력해 주세요.'); return; }
        const resultDiv = document.getElementById('saju-result-deep');
        resultDiv.innerHTML = `<div class="fortune-result-box"><h3>${fortuneData.saju.descriptions.professional_analysis}</h3></div>`;
        window.scrollTo({ top: resultDiv.offsetTop - 100, behavior: 'smooth' });
    };

    window.renderFace = function() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">AI 사진 관상 판독</h2>
            <div style="max-width:550px; margin:0 auto;">
                <div id="drop-zone" style="border:3px dashed #cbd5e1; padding:60px 20px; border-radius:32px; background:#f8fafc; cursor:pointer;" 
                     onclick="document.getElementById('face-upload').click()"
                     ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)">
                    <i class="fas fa-camera-retro" style="font-size:4rem; color:#94a3b8; margin-bottom:20px;"></i>
                    <p style="font-weight:700;">사진을 드래그하거나 클릭하여 업로드</p>
                </div>
                <input type="file" id="face-upload" style="display:none;" onchange="previewAndAnalyze(this.files[0])">
                <div id="preview-container" style="display:none; margin-top:30px; position:relative; text-align:center;">
                    <img id="face-preview" src="" style="width:200px; height:200px; object-fit:cover; border-radius:50%; border:5px solid var(--accent-color);">
                    <div id="scanning-line" style="position:absolute; width:200px; height:2px; background:var(--accent-color); left:50%; transform:translateX(-50%); top:0; animation:scan 2s infinite;"></div>
                </div>
                <div id="analysis-progress" style="display:none; margin-top:30px;">
                    <p id="progress-text" style="font-weight:700;">AI 분석 중...</p>
                    <div style="width:100%; height:10px; background:#e2e8f0; border-radius:5px; overflow:hidden;"><div id="progress-bar" style="width:0%; height:100%; background:var(--accent-color); transition:0.3s;"></div></div>
                </div>
            </div>
            <div id="face-result-deep"></div>
        `;
    };

    window.handleDragOver = function(e) { e.preventDefault(); const zone = document.getElementById('drop-zone'); if (zone) zone.style.borderColor = 'var(--accent-color)'; };
    window.handleDragLeave = function(e) { e.preventDefault(); const zone = document.getElementById('drop-zone'); if (zone) zone.style.borderColor = '#cbd5e1'; };
    window.handleDrop = function(e) { e.preventDefault(); window.handleDragLeave(e); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) window.previewAndAnalyze(file); };

    window.previewAndAnalyze = function(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('drop-zone').style.display = 'none';
            document.getElementById('preview-container').style.display = 'block';
            document.getElementById('face-preview').src = e.target.result;
            startFaceAnalysis();
        };
        reader.readAsDataURL(file);
    };

    function startFaceAnalysis() {
        const bar = document.getElementById('progress-bar');
        const progress = document.getElementById('analysis-progress');
        progress.style.display = 'block';
        let p = 0;
        const itv = setInterval(() => {
            p += 5; bar.style.width = p + '%';
            if (p >= 100) { clearInterval(itv); showFaceResult(); }
        }, 100);
    }

    function showFaceResult() {
        const resultDiv = document.getElementById('face-result-deep');
        const report = fortuneData.physiognomy.reports[Math.floor(Math.random() * fortuneData.physiognomy.reports.length)];
        resultDiv.innerHTML = `
            <div class="fortune-result-box" style="margin-top:20px;">
                <h3 style="text-align:center; color:var(--primary-color); margin-bottom:20px;">AI 관상 정밀 판독서</h3>
                <h4 style="color:var(--accent-color); margin-bottom:15px;">${report.title}</h4>
                <p style="line-height:1.9; font-size:1.1rem; color:#334155; margin-bottom:20px;">${report.text}</p>
                <button class="calc-btn" style="width:100%; margin-top:20px;" onclick="window.renderFace()">다른 사진으로 분석</button>
            </div>
        `;
        window.scrollTo({ top: resultDiv.offsetTop - 100, behavior: 'smooth' });
    }
});