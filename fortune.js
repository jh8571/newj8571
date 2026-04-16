document.addEventListener('DOMContentLoaded', () => {
    let fortuneData = null;
    const container = document.getElementById('fortune-container');

    fetch('fortune_data.json')
        .then(r => r.json())
        .then(data => {
            fortuneData = data;
            switchFortune('tarot');
        })
        .catch(e => console.error('Fortune data load error:', e));

    window.switchFortune = function (type) {
        document.querySelectorAll('.selectable-card').forEach(card => card.classList.remove('active'));
        const activeCard = document.getElementById(`tab-${type}`);
        if (activeCard) activeCard.classList.add('active');

        if (type === 'tarot') window.renderTarot();
        else if (type === 'saju') renderSaju();
    };

    let selectedCardsCount = 0;
    let selectedCardsData = [];
    const usedIndices = new Set();

    window.renderTarot = function () {
        selectedCardsCount = 0;
        selectedCardsData = [];
        usedIndices.clear();

        container.innerHTML = `
            <div style="text-align:center; margin-bottom:40px;">
                <div class="report-badge">프리미엄 타로 리딩</div>
                <h2 style="font-size:2.2rem; font-weight:900; color:var(--primary-color); margin-bottom:12px;">타로 카드를 선택하세요</h2>
                <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">
                    깊게 숨을 들이마시고 마음을 고요히 하세요.<br>
                    22장의 메이저 아르카나 중 직관적으로 끌리는 카드를 <strong>3장</strong> 선택하세요.
                </p>
                <div style="margin-top:15px; display:flex; justify-content:center; gap:15px;">
                    <div style="text-align:center;">
                        <div style="width:36px; height:36px; border-radius:50%; background:#6366f122; display:flex; align-items:center; justify-content:center; margin:0 auto 5px; font-weight:900; color:#6366f1;">1</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">과거</div>
                    </div>
                    <div style="width:40px; height:2px; background:var(--border-color); margin-top:18px;"></div>
                    <div style="text-align:center;">
                        <div style="width:36px; height:36px; border-radius:50%; background:#8b5cf622; display:flex; align-items:center; justify-content:center; margin:0 auto 5px; font-weight:900; color:#8b5cf6;">2</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">현재</div>
                    </div>
                    <div style="width:40px; height:2px; background:var(--border-color); margin-top:18px;"></div>
                    <div style="text-align:center;">
                        <div style="width:36px; height:36px; border-radius:50%; background:#ec489922; display:flex; align-items:center; justify-content:center; margin:0 auto 5px; font-weight:900; color:#ec4899;">3</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">미래</div>
                    </div>
                </div>
            </div>
            <div id="cards-selected-count" style="text-align:center; margin-bottom:20px; font-size:0.9rem; color:var(--accent-color); font-weight:700;">
                0 / 3 선택됨
            </div>
            <div class="tarot-grid" id="tarot-grid">
                ${Array(22).fill(0).map((_, i) => `
                    <div class="tarot-card-container" id="card-${i}" onclick="flipTarot(${i})">
                        <div class="card-face card-back">
                            <i class="fas fa-star" style="font-size:1.5rem; opacity:0.6;"></i>
                            <div style="font-size:0.7rem; margin-top:8px; opacity:0.6;">${i + 1}</div>
                        </div>
                        <div class="card-face card-front" id="front-${i}"></div>
                    </div>
                `).join('')}
            </div>
            <div id="tarot-result-display"></div>
        `;
    };

    window.flipTarot = function (index) {
        if (!fortuneData) return;
        const cardElement = document.getElementById(`card-${index}`);
        if (cardElement.classList.contains('flipped') || selectedCardsCount >= 3) return;

        // Pick a unique random card from the 22 major arcana
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * fortuneData.tarot.cards.length);
        } while (usedIndices.has(randomIndex));
        usedIndices.add(randomIndex);

        selectedCardsCount++;
        const cardData = fortuneData.tarot.cards[randomIndex];
        selectedCardsData.push(cardData);

        const frontEl = document.getElementById(`front-${index}`);
        frontEl.innerHTML = `
            <div style="width:100%; height:100%; overflow:hidden; border-radius:10px; position:relative;">
                <img src="${cardData.image}" alt="${cardData.name}"
                     style="width:100%; height:100%; object-fit:cover;"
                     onerror="this.style.display='none'; this.parentElement.querySelector('.card-fallback').style.display='flex';">
                <div class="card-fallback" style="display:none; position:absolute; inset:0; background:linear-gradient(135deg,#312e81,#7c3aed); align-items:center; justify-content:center; flex-direction:column; padding:8px; text-align:center;">
                    <i class="fas fa-star" style="color:gold; font-size:1.5rem; margin-bottom:8px;"></i>
                    <div style="color:white; font-size:0.7rem; font-weight:700; line-height:1.3;">${cardData.name.split('(')[0]}</div>
                </div>
            </div>
        `;
        cardElement.classList.add('flipped');

        // Update counter
        const counter = document.getElementById('cards-selected-count');
        if (counter) {
            const colors = ['#6366f1', '#8b5cf6', '#ec4899'];
            counter.innerHTML = `<span style="color:${colors[selectedCardsCount-1] || 'var(--accent-color)'};">${selectedCardsCount} / 3 선택됨</span>`;
        }

        if (selectedCardsCount === 3) {
            setTimeout(showTarotTotalResult, 900);
        }
    };

    const positionLabels = [
        { label: '과거', color: '#6366f1', desc: '지금 상황의 뿌리가 된 과거의 에너지' },
        { label: '현재', color: '#8b5cf6', desc: '지금 이 순간 당신을 둘러싼 핵심 에너지' },
        { label: '미래', color: '#ec4899', desc: '앞으로 펼쳐질 가능성과 방향성' }
    ];

    function showTarotTotalResult() {
        const resultDisplay = document.getElementById('tarot-result-display');
        const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

        let resultHTML = `
            <div class="luxury-report-card" style="margin-top:60px;">
                <div class="report-header">
                    <div class="report-badge">심층 해석 · ${today}</div>
                    <h2 style="font-size:2rem; margin-bottom:8px;">3카드 스프레드 심층 해석</h2>
                    <p style="color:var(--text-muted);">과거 · 현재 · 미래의 에너지 흐름을 읽습니다</p>
                </div>
                <div style="padding:40px;">
                    <div style="display:grid; gap:25px; margin-bottom:40px;">
        `;

        selectedCardsData.forEach((card, i) => {
            const pos = positionLabels[i];
            resultHTML += `
                <div style="background:var(--bg-color); border-radius:20px; padding:25px; border-left:5px solid ${pos.color};">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
                        <div style="width:40px; height:40px; border-radius:50%; background:${pos.color}22; display:flex; align-items:center; justify-content:center; font-weight:900; color:${pos.color}; font-size:0.9rem; flex-shrink:0;">${pos.label}</div>
                        <div>
                            <div style="font-size:0.75rem; color:${pos.color}; font-weight:800; margin-bottom:2px;">${pos.desc}</div>
                            <h4 style="font-size:1.1rem; font-weight:900; color:var(--primary-color); margin:0;">${card.name}</h4>
                        </div>
                    </div>
                    <p style="font-size:0.95rem; line-height:1.9; color:var(--text-main); margin-bottom:12px;">${card.meaning}</p>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${card.keywords.split('·').map(kw => `<span style="background:${pos.color}11; color:${pos.color}; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:700;">${kw.trim()}</span>`).join('')}
                    </div>
                </div>
            `;
        });

        // Overall synthesis
        resultHTML += `
                    </div>
                    <!-- Overall Reading -->
                    <div style="background:linear-gradient(135deg, #4f46e522, #7c3aed11); border:1px solid #6366f133; padding:30px; border-radius:20px; margin-bottom:30px;">
                        <h3 style="color:#6366f1; margin-bottom:15px;"><i class="fas fa-wand-magic-sparkles"></i> 종합 메시지</h3>
                        <p style="font-size:1rem; line-height:2; color:var(--text-main);">
                            ${getTarotSynthesis(selectedCardsData)}
                        </p>
                    </div>
                    <!-- Today's Affirmation -->
                    <div style="background:#f0fdf4; border:1px solid #dcfce7; padding:25px; border-radius:20px; margin-bottom:30px; text-align:center;">
                        <h4 style="color:#166534; margin-bottom:10px;"><i class="fas fa-seedling"></i> 오늘의 확언 (Affirmation)</h4>
                        <p style="font-size:1.1rem; font-weight:700; color:#14532d; font-style:italic; line-height:1.8;">"${getTarotAffirmation(selectedCardsData)}"</p>
                    </div>
                    <div style="text-align:center;">
                        <button class="luxury-btn" style="max-width:280px; margin-top:0; margin-bottom:20px;" onclick="window.renderTarot()">새로운 운세 보기</button>
                        ${window.getShareUI ? window.getShareUI('오늘의 타로 운세 3카드', `[${selectedCardsData.map(c => c.name.split('(')[0]).join(' · ')}] — VitalRest 타로에서 오늘의 운명을 읽었어요!`) : ''}
                    </div>
                </div>
            </div>
        `;

        resultDisplay.innerHTML = resultHTML;
        resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getTarotSynthesis(cards) {
        const syntheses = [
            `세 장의 카드가 하나의 이야기를 들려주고 있습니다. <strong>${cards[0].name.split('(')[1]?.replace(')', '') || cards[0].name}</strong>의 에너지가 과거에 영향을 미쳤고, 현재는 <strong>${cards[1].name.split('(')[1]?.replace(')', '') || cards[1].name}</strong>의 흐름 속에 있습니다. 앞으로는 <strong>${cards[2].name.split('(')[1]?.replace(')', '') || cards[2].name}</strong>의 에너지가 당신을 이끌 것입니다. 변화를 두려워하지 말고 내면의 지혜를 믿으며 한 걸음씩 나아가세요.`,
            `과거의 경험이 현재의 당신을 만들었습니다. 지금 이 순간의 선택이 미래를 결정합니다. 카드들이 보내는 공통 메시지는 '자신을 신뢰하라'는 것입니다. 지금 느끼는 직관과 본능적인 감각이 당신을 올바른 방향으로 이끌고 있습니다.`,
            `세 장의 카드에서 공통적으로 느껴지는 에너지는 성장과 전환입니다. 현재 겪고 있는 어려움이나 변화는 더 높은 차원으로 도약하기 위한 필수적인 과정입니다. 준비된 자에게 기회가 옵니다. 당신은 이미 준비되어 있습니다.`
        ];
        return syntheses[Math.floor(Math.random() * syntheses.length)];
    }

    function getTarotAffirmation(cards) {
        const affirmations = [
            '나는 내 삶의 모든 순간을 신뢰하며, 지금 이 순간도 완벽한 흐름 안에 있습니다.',
            '나는 변화를 두려워하지 않습니다. 모든 변화는 내게 더 나은 가능성을 열어줍니다.',
            '내 직관은 언제나 나를 올바른 방향으로 이끌고 있습니다. 나는 나 자신을 믿습니다.',
            '과거의 경험이 오늘의 지혜가 되었습니다. 나는 성장하고 있습니다.',
            '나는 우주의 지지와 사랑을 받으며, 내 삶에 풍요와 기쁨을 허용합니다.'
        ];
        return affirmations[Math.floor(Math.random() * affirmations.length)];
    }

    function renderSaju() {
        container.innerHTML = `
            <div style="text-align:center; margin-bottom:40px;">
                <div class="report-badge">고전 지혜 · 사주명리</div>
                <h2 style="font-size:2.2rem; font-weight:900; color:var(--primary-color); margin-bottom:12px;">심층 사주 분석</h2>
                <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">
                    생년월일시를 기반으로 오행(五行)과 천간지지(天干地支)의 흐름을 분석합니다.<br>
                    정확한 생년월일시를 입력할수록 더 정밀한 분석이 가능합니다.
                </p>
            </div>
            <!-- Input Form -->
            <div style="max-width:520px; margin:0 auto 40px;">
                <div style="display:grid; gap:18px;">
                    <div class="input-field">
                        <label style="font-weight:800; font-size:0.85rem; color:var(--text-muted); margin-bottom:8px; display:block;">생년월일 <span style="color:#ef4444">*</span></label>
                        <input type="date" id="birth-date" style="width:100%;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div class="input-field">
                            <label style="font-weight:800; font-size:0.85rem; color:var(--text-muted); margin-bottom:8px; display:block;">태어난 시간 (시주)</label>
                            <select id="birth-time" style="width:100%;">
                                <option value="-1">모름 / 미입력</option>
                                ${Array(24).fill(0).map((_, i) => `<option value="${i}">${i}시 (${getTimeKorean(i)}시)</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-field">
                            <label style="font-weight:800; font-size:0.85rem; color:var(--text-muted); margin-bottom:8px; display:block;">성별</label>
                            <select id="gender" style="width:100%;">
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                            </select>
                        </div>
                    </div>
                    <button class="luxury-btn" style="width:100%; margin-top:10px;" onclick="analyzeSajuDeep()">
                        <i class="fas fa-yin-yang"></i> 사주 분석 시작
                    </button>
                </div>
            </div>

            <!-- Ohaeng Guide -->
            <div style="max-width:700px; margin:0 auto 30px;">
                <h4 style="text-align:center; color:var(--primary-color); margin-bottom:20px; font-size:1rem;">오행(五行) 기본 속성</h4>
                <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:10px;">
                    ${Object.entries(fortuneData.saju.descriptions.elements).map(([key, val]) => `
                        <div style="background:var(--bg-color); padding:15px 10px; border-radius:14px; text-align:center; border:1px solid var(--border-color);">
                            <div style="font-size:1.2rem; font-weight:900; color:var(--accent-color); margin-bottom:6px;">${key}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted); line-height:1.5;">${val}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="saju-result-deep"></div>
        `;
    }

    function getTimeKorean(h) {
        const names = ['자','축','인','묘','진','사','오','미','신','유','술','해','자','축','인','묘','진','사','오','미','신','유','술','해'];
        return names[Math.floor(h / 2)];
    }

    function getStemBranch(year) {
        const stems = ['경','신','임','계','갑','을','병','정','무','기'];
        const branches = ['신','유','술','해','자','축','인','묘','진','사','오','미'];
        const stemIdx = (year - 4) % 10;
        const branchIdx = (year - 4) % 12;
        return stems[(stemIdx + 10) % 10] + branches[(branchIdx + 12) % 12];
    }

    function getZodiac(year) {
        return fortuneData.zodiac ? fortuneData.zodiac.signs[(year - 4) % 12] : null;
    }

    window.analyzeSajuDeep = function () {
        const dateVal = document.getElementById('birth-date').value;
        if (!dateVal) { alert('생년월일을 입력해 주세요.'); return; }

        const birthDate = new Date(dateVal);
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const timeVal = parseInt(document.getElementById('birth-time').value);
        const gender = document.getElementById('gender').value;
        const stemBranch = getStemBranch(year);
        const zodiac = getZodiac(year);
        const resultDiv = document.getElementById('saju-result-deep');

        // Determine dominant element based on birth month
        const monthElements = ['수','수','목','목','목','화','화','화','토','금','금','금'];
        const dominantElement = monthElements[month - 1];
        const elementDesc = fortuneData.saju.descriptions.elements[dominantElement + '(木)'] ||
                            fortuneData.saju.descriptions.elements[Object.keys(fortuneData.saju.descriptions.elements).find(k => k.includes(dominantElement))] ||
                            '균형 잡힌 오행의 기운을 타고났습니다.';

        resultDiv.innerHTML = `
            <div class="luxury-report" style="margin-top:40px; background:var(--bg-color);">
                <div class="report-header">
                    <div class="report-badge">Analysis Completed · ${new Date().toLocaleDateString('ko-KR')}</div>
                    <h2 style="margin-bottom:8px;">사주 정밀 분석 리포트</h2>
                    <p style="color:var(--text-muted);">${year}년 ${month}월 ${day}일 ${timeVal >= 0 ? timeVal + '시' : ''} · ${gender === 'male' ? '남성' : '여성'}</p>
                </div>

                <div style="padding:40px;">
                    <!-- Four Pillars Summary -->
                    <div style="margin-bottom:35px;">
                        <h4 style="color:var(--primary-color); margin-bottom:18px;"><i class="fas fa-columns"></i> 사주 팔자(四柱八字) 개요</h4>
                        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; text-align:center;">
                            <div style="background:var(--card-bg); padding:18px 10px; border-radius:16px; border-top:4px solid #6366f1;">
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; font-weight:700;">년주(年柱)</div>
                                <div style="font-size:1.5rem; font-weight:900; color:#6366f1;">${stemBranch[0]}</div>
                                <div style="font-size:1.5rem; font-weight:900; color:#818cf8;">${stemBranch[1]}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">${year}년</div>
                            </div>
                            <div style="background:var(--card-bg); padding:18px 10px; border-radius:16px; border-top:4px solid #8b5cf6;">
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; font-weight:700;">월주(月柱)</div>
                                <div style="font-size:1.5rem; font-weight:900; color:#8b5cf6;">${getStemBranch(year * 12 + month)[0]}</div>
                                <div style="font-size:1.5rem; font-weight:900; color:#a78bfa;">${getStemBranch(year * 12 + month)[1]}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">${month}월</div>
                            </div>
                            <div style="background:var(--card-bg); padding:18px 10px; border-radius:16px; border-top:4px solid #ec4899;">
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; font-weight:700;">일주(日柱)</div>
                                <div style="font-size:1.5rem; font-weight:900; color:#ec4899;">${getStemBranch(year * 365 + day)[0]}</div>
                                <div style="font-size:1.5rem; font-weight:900; color:#f9a8d4;">${getStemBranch(year * 365 + day)[1]}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">${day}일</div>
                            </div>
                            <div style="background:var(--card-bg); padding:18px 10px; border-radius:16px; border-top:4px solid ${timeVal < 0 ? 'var(--border-color)' : '#f59e0b'};">
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; font-weight:700;">시주(時柱)</div>
                                ${timeVal >= 0 ? `
                                    <div style="font-size:1.5rem; font-weight:900; color:#f59e0b;">${getStemBranch(timeVal * 2)[0]}</div>
                                    <div style="font-size:1.5rem; font-weight:900; color:#fcd34d;">${getStemBranch(timeVal * 2)[1]}</div>
                                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">${timeVal}시</div>
                                ` : `
                                    <div style="font-size:1.2rem; color:var(--text-muted); margin-top:10px;">?</div>
                                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">미입력</div>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Zodiac -->
                    ${zodiac ? `
                    <div style="background:linear-gradient(135deg,#4f46e522,#7c3aed11); border:1px solid #6366f133; padding:25px; border-radius:20px; margin-bottom:25px;">
                        <h4 style="color:#6366f1; margin-bottom:12px;"><i class="fas fa-paw"></i> 띠 분석 — ${zodiac.name}</h4>
                        <div style="display:flex; align-items:center; gap:20px;">
                            <div style="text-align:center; flex-shrink:0;">
                                <div style="font-size:2.5rem; margin-bottom:5px;">${getZodiacEmoji(zodiac.name)}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${zodiac.element}</div>
                            </div>
                            <div>
                                <p style="font-size:0.95rem; line-height:1.8; color:var(--text-main);">${zodiac.trait}</p>
                                <div style="margin-top:10px; display:flex; gap:10px; font-size:0.82rem;">
                                    <span style="background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:20px; font-weight:700;">행운의 색: ${zodiac.lucky_color}</span>
                                    <span style="background:#dbeafe; color:#1e40af; padding:4px 10px; border-radius:20px; font-weight:700;">행운의 숫자: ${zodiac.lucky_number}</span>
                                </div>
                            </div>
                        </div>
                    </div>` : ''}

                    <!-- Professional Analysis -->
                    <div style="background:var(--card-bg); border:1px solid var(--border-color); padding:30px; border-radius:20px; margin-bottom:25px;">
                        <h4 style="color:var(--primary-color); margin-bottom:15px;"><i class="fas fa-scroll"></i> 격국 및 운기 분석</h4>
                        <p style="font-size:0.95rem; line-height:2; color:var(--text-main);">
                            ${fortuneData.saju.descriptions.professional_analysis}
                        </p>
                    </div>

                    <!-- This Year's Fortune -->
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:25px;">
                        <div style="background:#f0fdf4; padding:20px; border-radius:16px; border:1px solid #dcfce7;">
                            <h5 style="color:#166534; margin-bottom:10px;"><i class="fas fa-briefcase"></i> 직업 & 재물운</h5>
                            <p style="font-size:0.88rem; color:#14532d; line-height:1.7;">${getFortuneText('career', year, gender)}</p>
                        </div>
                        <div style="background:#eff6ff; padding:20px; border-radius:16px; border:1px solid #dbeafe;">
                            <h5 style="color:#1e40af; margin-bottom:10px;"><i class="fas fa-heart"></i> 애정 & 인간관계운</h5>
                            <p style="font-size:0.88rem; color:#1e3a8a; line-height:1.7;">${getFortuneText('love', year, gender)}</p>
                        </div>
                        <div style="background:#fdf4ff; padding:20px; border-radius:16px; border:1px solid #e9d5ff;">
                            <h5 style="color:#7c3aed; margin-bottom:10px;"><i class="fas fa-heartbeat"></i> 건강운</h5>
                            <p style="font-size:0.88rem; color:#4c1d95; line-height:1.7;">${getFortuneText('health', year, gender)}</p>
                        </div>
                        <div style="background:#fff7ed; padding:20px; border-radius:16px; border:1px solid #fed7aa;">
                            <h5 style="color:#c2410c; margin-bottom:10px;"><i class="fas fa-star"></i> 종합 운세</h5>
                            <p style="font-size:0.88rem; color:#7c2d12; line-height:1.7;">${getFortuneText('overall', year, gender)}</p>
                        </div>
                    </div>

                    <div style="text-align:center;">
                        <button class="luxury-btn" style="max-width:280px; margin-bottom:20px;" onclick="renderSaju()">다시 분석하기</button>
                        ${window.getShareUI ? window.getShareUI('사주 정밀 분석 결과', `${year}년생 ${zodiac ? zodiac.name + '띠' : ''} — VitalRest 사주 분석으로 운명의 흐름을 읽었어요!`) : ''}
                    </div>
                </div>
            </div>
        `;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    function getZodiacEmoji(name) {
        const map = { '쥐(子)': '🐭', '소(丑)': '🐮', '호랑이(寅)': '🐯', '토끼(卯)': '🐰',
                       '용(辰)': '🐲', '뱀(巳)': '🐍', '말(午)': '🐴', '양(未)': '🐑',
                       '원숭이(申)': '🐵', '닭(酉)': '🐔', '개(戌)': '🐶', '돼지(亥)': '🐷' };
        return map[name] || '⭐';
    }

    function getFortuneText(type, year, gender) {
        const seed = year % 4;
        const texts = {
            career: [
                '올해는 그동안 준비해온 결실이 나타나는 시기입니다. 새로운 기회를 주저하지 말고 과감하게 도전하세요. 재물의 흐름이 상승세로, 투자와 저축의 균형을 잘 유지하면 중년 이후 풍요로운 기반을 마련할 수 있습니다.',
                '직장 내 인정과 승진의 기회가 찾아오는 해입니다. 다만 금전 관리에 신중을 기해야 하며, 즉흥적인 투자보다는 안정적인 재테크를 권장합니다.',
                '새로운 분야로의 전환이나 부업에 좋은 운이 흐릅니다. 주변의 귀인이 중요한 연결고리가 될 수 있으니 인맥 관리에 힘쓰세요.',
                '현재 자리를 지키며 실력을 다지는 해입니다. 섣불리 변화를 주기보다 기반을 탄탄히 할수록 내년 이후 더 큰 도약이 기다리고 있습니다.'
            ],
            love: [
                '인연이 찾아오거나 기존 관계가 더 깊어지는 시기입니다. 진솔한 소통과 배려가 관계를 풍성하게 만들 것입니다. 귀인을 통한 만남의 가능성도 열려 있습니다.',
                '소중한 사람과의 관계가 한 단계 발전할 수 있는 해입니다. 오해나 갈등이 생기더라도 차분하게 대화로 풀어가면 오히려 더 단단한 유대로 발전합니다.',
                '새로운 만남의 기회가 많은 해입니다. 자신감 있게 마음을 열면 예상치 못한 좋은 인연을 만날 수 있습니다.',
                '혼자만의 성찰이 필요한 시기입니다. 관계에서 서두르지 않고 천천히 신뢰를 쌓아가는 것이 장기적으로 더 아름다운 결실을 맺습니다.'
            ],
            health: [
                '전반적으로 건강 운이 좋은 편이나, 과로를 경계하세요. 규칙적인 수면과 운동 습관이 건강을 지키는 핵심입니다. 소화계와 심장 건강에 주의를 기울이세요.',
                '만성적인 피로가 누적될 수 있으니 충분한 휴식을 취하세요. 면역력 관리를 위해 영양 균형 있는 식사와 규칙적인 운동을 병행하세요.',
                '정신 건강에 특히 주의가 필요한 해입니다. 스트레스 해소 방법을 찾고 필요하다면 전문가 상담을 받아보세요.',
                '체력이 상승하는 시기입니다. 새로운 운동이나 건강한 습관을 시작하기에 좋은 때입니다. 정기 건강검진을 꼭 챙기세요.'
            ],
            overall: [
                '전체적으로 상승하는 운기의 해입니다. 두려움보다 기대감을 가지고 새로운 도전에 임하세요. 지금 심은 씨앗이 수년 후 큰 열매가 될 것입니다.',
                '안정을 추구하되 변화의 흐름에 민첩하게 반응하는 한 해입니다. 주변의 조언을 겸허히 듣되 최종 결정은 자신의 직관을 신뢰하세요.',
                '변화와 성장이 공존하는 역동적인 해입니다. 어려운 상황에서도 긍정적 시각을 유지하면 반드시 좋은 결과가 따라옵니다.',
                '내면의 성숙과 외적 성장이 조화를 이루는 해입니다. 조급함을 버리고 꾸준함으로 목표를 향해 나아가세요.'
            ]
        };
        return texts[type][seed];
    }
});
