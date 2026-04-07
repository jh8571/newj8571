document.addEventListener('DOMContentLoaded', () => {
    let fortuneData = null;
    const container = document.getElementById('fortune-container');

    // 고화질 메이저 아르카나 이미지
    const tarotImages = [
        "https://www.sacred-texts.com/tarot/pkt/img/ar00.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar01.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar02.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar03.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar04.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar05.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar06.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar07.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar08.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar09.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar10.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar11.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar12.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar13.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar14.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar15.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar16.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar17.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar18.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar19.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar20.jpg",
        "https://www.sacred-texts.com/tarot/pkt/img/ar21.jpg"
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
        else if (type === 'face') renderFace();
    };

    let selectedCardsCount = 0;

    window.renderTarot = function() {
        selectedCardsCount = 0; // 초기화
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">당신의 운명을 선택하세요</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">깊게 숨을 들이마시고, 가장 끌리는 카드 3장을 클릭하세요. (과거/현재/미래)</p>
            <div class="tarot-grid" id="tarot-cards-container">
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
        const frontFace = document.getElementById(`front-${index}`);
        
        frontFace.innerHTML = `<img src="${tarotImages[randomIndex]}" alt="${cardData.name}" style="width:100%; height:100%; object-fit:cover;">`;
        
        cardElement.classList.add('flipped');

        if (selectedCardsCount === 3) {
            setTimeout(showTarotTotalResult, 1000);
        }
    };

    function showTarotTotalResult() {
        const resultDisplay = document.getElementById('tarot-result-display');
        resultDisplay.innerHTML = `
            <div class="fortune-result-box">
                <h3 style="color:var(--primary-color); margin-bottom:20px;"><i class="fas fa-scroll"></i> 통합 타로 해석 리포트</h3>
                <p style="font-size:1.15rem; line-height:1.9; color:#334155;">
                    귀하가 선택한 세 장의 흐름은 <strong>'변화와 적응, 그리고 결실'</strong>로 요약됩니다. 
                    과거의 어려움이 현재의 기회로 전환되는 강력한 에너지가 포착되었습니다. 
                    미래 카드에 따르면, 조만간 뜻밖의 소식이 전해질 것이며 이를 통해 금전적인 안정을 찾게 될 것입니다. 
                    자신의 직관을 믿고 추진력을 발휘해 보세요.
                </p>
                <button class="calc-btn" style="width:100%; margin-top:30px;" onclick="window.renderTarot()">새로운 운세 보기</button>
            </div>
        `;
        window.scrollTo({ top: resultDisplay.offsetTop - 100, behavior: 'smooth' });
    }

    function renderSaju() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">심층 사주 분석</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">태어난 시를 포함한 정밀 분석으로 당신의 대운을 확인하세요.</p>
            <div class="input-form">
                <div class="input-item"><label>생년월일</label><input type="date" id="birth-date"></div>
                <div class="input-group-row">
                    <div class="input-item">
                        <label>태어난 시간</label>
                        <select id="birth-time">
                            ${Array(24).fill(0).map((_, i) => `<option value="${i}">${i}시 (${i % 2 === 1 ? (i === 23 ? '자시' : ['축','인','묘','진','사','오','미','신','유','술','해'][Math.floor(i/2)]) : ''})</option>`).join('')}
                        </select>
                    </div>
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
        const elements = ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"];
        const myElement = elements[new Date(date).getFullYear() % 5];

        resultDiv.innerHTML = `
            <div class="fortune-result-box">
                <h3 style="color:var(--primary-color); margin-bottom:15px;"><i class="fas fa-yin-yang"></i> 운명적 지표: ${myElement}의 성질</h3>
                <p style="margin-bottom:25px; line-height:1.8;">${fortuneData.saju.descriptions.elements[myElement]}</p>
                <h4 style="color:var(--primary-color); margin-bottom:10px;">전문가 정밀 리포트</h4>
                <p style="font-size:1.1rem; line-height:1.9; color:#475569;">${fortuneData.saju.descriptions.professional_analysis}</p>
                <div style="margin-top:30px; display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                    <div style="background:#fff; padding:20px; border-radius:15px; border:1px solid #e2e8f0; text-align:center;">
                        <span style="display:block; color:#94a3b8; font-size:0.85rem;">행운의 색</span>
                        <strong>${myElement==='금(金)'?'은색':(myElement==='화(火)'?'빨강':'초록')}</strong>
                    </div>
                    <div style="background:#fff; padding:20px; border-radius:15px; border:1px solid #e2e8f0; text-align:center;">
                        <span style="display:block; color:#94a3b8; font-size:0.85rem;">행운의 방위</span>
                        <strong>남서쪽</strong>
                    </div>
                </div>
            </div>
        `;
        window.scrollTo({ top: resultDiv.offsetTop - 100, behavior: 'smooth' });
    };

    function renderFace() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">AI 사진 관상 판독</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">사진을 드래그하여 업로드하세요. 눈매와 안광을 정밀 분석합니다.</p>
            <div style="max-width:550px; margin:0 auto;">
                <div id="drop-zone" style="border:3px dashed #cbd5e1; padding:80px 20px; border-radius:32px; background:#f8fafc; cursor:pointer; transition:0.3s;" 
                     onclick="document.getElementById('face-upload').click()"
                     ondragover="handleDragOver(event)"
                     ondragleave="handleDragLeave(event)"
                     ondrop="handleDrop(event)">
                    <i class="fas fa-camera-retro" style="font-size:4.5rem; color:#94a3b8; margin-bottom:25px;"></i>
                    <p style="font-weight:700; color:#475569; font-size:1.1rem;">여기에 사진을 드래그하거나 클릭하세요</p>
                    <p style="font-size:0.9rem; color:#94a3b8; margin-top:12px;">정면 사진일수록 분석 정확도가 높습니다.</p>
                </div>
                <input type="file" id="face-upload" style="display:none;" onchange="previewAndAnalyze(this.files[0])">
                <div id="preview-container" style="display:none; margin-top:30px; position:relative;">
                    <img id="face-preview" src="" style="width:200px; height:200px; object-fit:cover; border-radius:50%; border:5px solid var(--accent-color); box-shadow:0 10px 20px rgba(0,0,0,0.1);">
                    <div id="scanning-line" style="position:absolute; width:200px; height:2px; background:var(--accent-color); left:50%; transform:translateX(-50%); top:0; box-shadow:0 0 15px var(--accent-color); animation:scan 2s infinite;"></div>
                </div>
                <div id="analysis-progress" style="display:none; margin-top:30px;">
                    <p id="progress-text" style="font-weight:700; color:var(--primary-color);">AI 엔진 가동 중...</p>
                    <div style="width:100%; height:12px; background:#e2e8f0; border-radius:6px; overflow:hidden; margin-top:10px;">
                        <div id="progress-bar" style="width:0%; height:100%; background:var(--accent-color); transition:0.4s;"></div>
                    </div>
                </div>
            </div>
            <div id="face-result-deep"></div>
        `;
    }

    window.handleDragOver = function(e) {
        e.preventDefault();
        const zone = document.getElementById('drop-zone');
        if (zone) {
            zone.style.borderColor = 'var(--accent-color)';
            zone.style.background = '#f0f9ff';
        }
    };
    window.handleDragLeave = function(e) {
        e.preventDefault();
        const zone = document.getElementById('drop-zone');
        if (zone) {
            zone.style.borderColor = '#cbd5e1';
            zone.style.background = '#f8fafc';
        }
    };
    window.handleDrop = function(e) {
        e.preventDefault();
        window.handleDragLeave(e);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) window.previewAndAnalyze(file);
    };

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
        const progress = document.getElementById('analysis-progress');
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');
        progress.style.display = 'block';

        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            bar.style.width = p + '%';
            if (p === 20) text.innerText = "상안, 중안, 하안 비율 대조 중...";
            if (p === 50) text.innerText = "이목구비 조화도 및 안광 수치 분석 중...";
            if (p === 80) text.innerText = "사주 오행 데이터와 매칭 중...";
            if (p >= 100) {
                clearInterval(interval);
                showFaceResult();
            }
        }, 150);
    }

    function showFaceResult() {
        const resultDiv = document.getElementById('face-result-deep');
        resultDiv.innerHTML = `
            <div class="fortune-result-box" style="margin-top:20px;">
                <h3 style="color:var(--primary-color); margin-bottom:25px; text-align:center;"><i class="fas fa-microchip"></i> AI 관상 종합 감정서</h3>
                <p style="font-size:1.15rem; line-height:2.0; color:#334155; margin-bottom:20px;">
                    ${fortuneData.physiognomy.pro_text}
                </p>
                <p style="font-size:1.1rem; line-height:2.0; color:#334155;">
                    종합적으로 볼 때, 귀하의 관상은 <strong>'재물이 샘솟고 명예가 뒤따르는 대길(大吉)의 상'</strong>입니다. 
                    특히 눈매에서 뿜어져 나오는 강한 안광은 목표를 향한 집념과 성공운을 동시에 상징합니다. 
                    현재 진행 중인 프로젝트나 계획이 있다면 주저하지 말고 추진하십시오. 
                    관상학적 기운이 귀하의 결단을 강력하게 뒷받침하고 있습니다.
                </p>
                <button class="calc-btn" style="width:100%; margin-top:40px;" onclick="renderFace()">다른 사진으로 분석</button>
            </div>
        `;
        window.scrollTo({ top: resultDiv.offsetTop - 100, behavior: 'smooth' });
    }
});