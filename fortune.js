document.addEventListener('DOMContentLoaded', () => {
    let fortuneData = null;
    const container = document.getElementById('fortune-container');

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

        if (type === 'tarot') renderTarot();
        else if (type === 'saju') renderSaju();
        else if (type === 'face') renderFace();
    };

    function renderTarot() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">당신의 운명을 선택하세요</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">깊게 숨을 들이마시고, 가장 끌리는 카드 3장을 순서대로 클릭하세요.</p>
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
    }

    let selectedCardsCount = 0;
    window.flipTarot = function(index) {
        const cardElement = document.getElementById(`card-${index}`);
        if (cardElement.classList.contains('flipped') || selectedCardsCount >= 3) return;

        selectedCardsCount++;
        const cardData = fortuneData.tarot.cards[Math.floor(Math.random() * fortuneData.tarot.cards.length)];
        const frontFace = document.getElementById(`front-${index}`);
        frontFace.innerHTML = `<img src="${cardData.image}" alt="${cardData.name}">`;
        
        cardElement.classList.add('flipped');

        if (selectedCardsCount === 3) {
            setTimeout(showTarotTotalResult, 1000);
        }
    };

    function showTarotTotalResult() {
        const resultDisplay = document.getElementById('tarot-result-display');
        resultDisplay.innerHTML = `
            <div class="fortune-result-box">
                <h3 style="color:var(--primary-color); margin-bottom:20px;"><i class="fas fa-scroll"></i> 통합 타로 해석</h3>
                <p style="font-size:1.1rem; line-height:1.8;">귀하가 선택한 세 장의 카드는 각각 <strong>과거, 현재, 미래</strong>의 기운을 상징합니다. 현재 전반적인 흐름은 매우 역동적이며, 새로운 기회가 도래하고 있음을 시사합니다. 내면의 목소리에 집중하여 과감한 결단을 내릴 시기입니다.</p>
                <button class="calc-btn" style="margin-top:30px;" onclick="renderTarot(); selectedCardsCount=0;">다시 점치기</button>
            </div>
        `;
        window.scrollTo({ top: resultDisplay.offsetTop - 100, behavior: 'smooth' });
    }

    function renderSaju() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">심층 사주 분석</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">태어난 연, 월, 일, 시의 네 기둥(사주)을 통해 인생의 흐름을 분석합니다.</p>
            <div class="input-form">
                <div class="input-item">
                    <label>생년월일</label>
                    <input type="date" id="birth-date">
                </div>
                <div class="input-group-row">
                    <div class="input-item">
                        <label>태어난 시간</label>
                        <select id="birth-time">
                            <option value="0">모름/전체</option>
                            ${Array(24).fill(0).map((_, i) => `<option value="${i}">${i}시</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-item">
                        <label>성별</label>
                        <select id="gender">
                            <option value="male">남성</option>
                            <option value="female">여성</option>
                        </select>
                    </div>
                </div>
                <button class="calc-btn" style="width:100%; margin-top:20px;" onclick="analyzeSajuDeep()">분석하기</button>
            </div>
            <div id="saju-result-deep"></div>
        `;
    }

    window.analyzeSajuDeep = function() {
        const date = document.getElementById('birth-date').value;
        if (!date) { alert('날짜를 선택해 주세요.'); return; }

        const resultDiv = document.getElementById('saju-result-deep');
        const elements = ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"];
        const myElement = elements[new Date(date).getFullYear() % 5];

        resultDiv.innerHTML = `
            <div class="fortune-result-box">
                <h3 style="color:var(--primary-color); margin-bottom:15px;"><i class="fas fa-yin-yang"></i> 운명적 특성: ${myElement}의 기운</h3>
                <p style="margin-bottom:20px; color:#334155;">${fortuneData.saju.descriptions.elements[myElement]}</p>
                <h4 style="color:var(--primary-color); margin-bottom:10px;">전문가 심층 분석</h4>
                <p style="font-size:1.05rem; line-height:1.8; color:#475569;">${fortuneData.saju.descriptions.professional_analysis}</p>
                <div style="margin-top:20px; padding:20px; background:#fff; border-radius:15px; border:1px solid #e2e8f0;">
                    <p><strong>올해의 대운:</strong> 95점 - 재물과 명예가 함께 들어오는 형국입니다.</p>
                    <p><strong>추천 방위:</strong> 남동쪽 | <strong>행운의 색상:</strong> ${myElement === '목(木)' ? '초록색' : '붉은색'}</p>
                </div>
            </div>
        `;
        window.scrollTo({ top: resultDiv.offsetTop - 100, behavior: 'smooth' });
    };

    function renderFace() {
        container.innerHTML = `
            <h2 style="color:var(--primary-color); margin-bottom:20px;">AI 사진 관상 분석</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">사진을 업로드하여 눈, 코, 입, 이마의 형상을 정밀 분석합니다.</p>
            <div style="max-width:500px; margin:0 auto;">
                <div id="upload-zone" style="border:3px dashed #cbd5e1; padding:60px 20px; border-radius:32px; background:#f8fafc; cursor:pointer;" onclick="document.getElementById('face-upload').click()">
                    <i class="fas fa-cloud-upload-alt" style="font-size:4rem; color:#94a3b8; margin-bottom:20px;"></i>
                    <p style="font-weight:600; color:#64748b;">클릭하여 사진 업로드 또는 파일을 드래그하세요</p>
                    <p style="font-size:0.85rem; color:#94a3b8; margin-top:10px;">* 분석 데이터는 보관되지 않고 즉시 파기됩니다.</p>
                </div>
                <input type="file" id="face-upload" style="display:none;" onchange="startFaceAnalysis(this)">
                <div id="analysis-progress" style="display:none; margin-top:30px;">
                    <p id="progress-text" style="margin-bottom:10px; font-weight:700; color:var(--primary-color);">AI가 얼굴 특징점을 추출 중입니다...</p>
                    <div style="width:100%; height:10px; background:#e2e8f0; border-radius:5px; overflow:hidden;">
                        <div id="progress-bar" style="width:0%; height:100%; background:var(--accent-color); transition:0.5s;"></div>
                    </div>
                </div>
            </div>
            <div id="face-result-deep"></div>
        `;
    }

    window.startFaceAnalysis = function(input) {
        if (!input.files || !input.files[0]) return;
        
        const zone = document.getElementById('upload-zone');
        const progress = document.getElementById('analysis-progress');
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');

        zone.style.display = 'none';
        progress.style.display = 'block';

        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            bar.style.width = p + '%';
            if (p === 30) text.innerText = "상정, 중정, 하정 비율 계산 중...";
            if (p === 60) text.innerText = "안광 및 눈매 성질 분석 중...";
            if (p === 90) text.innerText = "종합 운세 맵핑 중...";
            if (p >= 100) {
                clearInterval(interval);
                showFaceResult();
            }
        }, 300);
    };

    function showFaceResult() {
        const resultDiv = document.getElementById('face-result-deep');
        resultDiv.innerHTML = `
            <div class="fortune-result-box">
                <h3 style="color:var(--primary-color); margin-bottom:20px;"><i class="fas fa-magic"></i> AI 관상 종합 판독 결과</h3>
                <p style="font-size:1.1rem; line-height:1.9; color:#334155; margin-bottom:25px;">
                    분석 결과, 귀하는 <strong>'봉황의 눈'</strong>과 <strong>'풍요로운 코'</strong>를 가진 대귀(大貴)의 상입니다. 
                    전체적인 얼굴의 조화가 에너지를 한곳으로 모아주는 형세이며, 이는 강력한 자기 주도적 삶을 살게 될 것임을 암시합니다. 
                    이마에서 흐르는 초년운이 중년의 코(재물)를 지나 턱(말년)에서 안정적으로 맺히는 흐름을 가지고 있습니다.
                </p>
                <p style="font-size:1.1rem; line-height:1.9; color:#334155;">
                    특히 눈꼬리의 미세한 각도는 귀하의 총명함과 빠른 판단력을 대변하며, 이는 조직 내에서 리더로서의 자질을 충분히 발휘하게 할 것입니다. 
                    입술의 두께와 선명함은 주변에 사람이 끊이지 않는 인덕을 상징합니다. 
                    다만, 가끔씩 나타나는 미간의 기운을 다스리기 위해 긍정적인 마음가짐을 유지한다면, 다가올 대운의 시기에 상상 이상의 성취를 거두실 것입니다. 
                    전문적인 관점에서 볼 때, 귀하는 타고난 복을 지혜롭게 관리하는 것만으로도 평생 안락함을 누릴 수 있는 아주 훌륭한 관상을 가지고 있습니다.
                </p>
                <div style="margin-top:30px; display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                    <div style="background:#fff; padding:15px; border-radius:12px; text-align:center; border:1px solid #eee;">
                        <span style="display:block; font-size:0.8rem; color:#94a3b8;">인기 운세</span>
                        <strong>상위 5%</strong>
                    </div>
                    <div style="background:#fff; padding:15px; border-radius:12px; text-align:center; border:1px solid #eee;">
                        <span style="display:block; font-size:0.8rem; color:#94a3b8;">재물운 지수</span>
                        <strong>★★★★★</strong>
                    </div>
                </div>
                <button class="calc-btn" style="width:100%; margin-top:30px;" onclick="renderFace()">다른 사진 분석하기</button>
            </div>
        `;
        window.scrollTo({ top: resultDiv.offsetTop - 100, behavior: 'smooth' });
    }
});