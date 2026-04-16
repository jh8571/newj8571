let currentQuestion = 0;
let scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
let mbtiData = null;
const LIKERT = [
    { ko: "전혀 그렇지 않다", en: "Strongly Disagree", value: 1 },
    { ko: "그렇지 않다",     en: "Disagree",          value: 2 },
    { ko: "보통이다",        en: "Neutral",            value: 3 },
    { ko: "그렇다",          en: "Agree",              value: 4 },
    { ko: "매우 그렇다",     en: "Strongly Agree",     value: 5 }
];

async function initMbti() {
    try {
        const res = await fetch('mbti_data.json');
        mbtiData = await res.json();
    } catch (e) {
        console.error('MBTI data load failed:', e);
    }
}
initMbti();

window.startMbtiTest = function () {
    if (!mbtiData) return;
    document.getElementById('intro-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    currentQuestion = 0;
    scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    renderQuestion();
};

function renderQuestion() {
    const q = mbtiData.questions[currentQuestion];
    const total = mbtiData.questions.length;
    const progress = (currentQuestion / total) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';

    const lang = localStorage.getItem('lang') || 'ko';

    document.getElementById('question-card').innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <span style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">Q ${currentQuestion + 1} / ${total}</span>
            <span style="font-size:0.85rem; background:var(--accent-color)22; color:var(--accent-color); padding:4px 12px; border-radius:20px; font-weight:700;">${getDimLabel(q.type)}</span>
        </div>
        <h4 id="question-text" style="font-size:1.3rem; margin-bottom:40px; line-height:1.7; color:var(--primary-color);">${q.q}</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
            ${LIKERT.map(opt => `
                <button class="likert-btn" onclick="handleAnswer(${opt.value}, '${q.type}', '${q.pole}')"
                    style="padding:16px 24px; text-align:left; border:2px solid var(--border-color);
                           background:var(--bg-color); border-radius:14px; cursor:pointer;
                           display:flex; align-items:center; gap:14px; font-size:0.95rem;
                           font-weight:600; color:var(--text-main); transition:0.2s;">
                    <span style="width:28px; height:28px; border-radius:50%; border:2px solid var(--border-color);
                                 display:flex; align-items:center; justify-content:center;
                                 font-size:0.75rem; font-weight:800; flex-shrink:0;">${opt.value}</span>
                    <span>${lang === 'ko' ? opt.ko : opt.en}</span>
                </button>
            `).join('')}
        </div>
    `;

    // Hover effects
    document.querySelectorAll('.likert-btn').forEach(btn => {
        btn.addEventListener('mouseover', () => {
            btn.style.borderColor = 'var(--accent-color)';
            btn.style.background = 'var(--accent-color)11';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'var(--bg-color)';
        });
    });
}

function getDimLabel(type) {
    const lang = localStorage.getItem('lang') || 'ko';
    const mapKo = { EI: '에너지 방향', SN: '인식 방식', TF: '판단 기준', JP: '생활 양식' };
    const mapEn = { EI: 'Energy', SN: 'Perception', TF: 'Judgment', JP: 'Lifestyle' };
    return (lang === 'ko' ? mapKo : mapEn)[type] || type;
}

window.handleAnswer = function (value, type, pole) {
    // Convert to contribution toward first letter of type
    const firstLetter = type[0]; // E, S, T, J
    const secondLetter = type[1]; // I, N, F, P
    const contribution = value - 3; // -2 to +2

    if (pole === firstLetter) {
        scores[firstLetter] += contribution;
        scores[secondLetter] -= contribution;
    } else {
        scores[secondLetter] += contribution;
        scores[firstLetter] -= contribution;
    }

    currentQuestion++;
    if (currentQuestion < mbtiData.questions.length) {
        renderQuestion();
    } else {
        showResult();
    }
};

function getPct(a, b) {
    const total = Math.abs(scores[a]) + Math.abs(scores[b]);
    if (total === 0) return [50, 50];
    const rawA = scores[a] + scores[b]; // net toward A direction... actually let's recalculate
    // Scores are accumulated as net: scores.E and scores.I are inverse
    // percent for A: (scores[a] + 30) / 60 * 100 where 30 is max per dimension
    const maxPer = 30; // 15 questions × max 2
    const pctA = Math.round(((scores[a] + maxPer) / (2 * maxPer)) * 100);
    return [Math.max(5, Math.min(95, pctA)), Math.max(5, Math.min(95, 100 - pctA))];
}

function showResult() {
    document.getElementById('quiz-section').style.display = 'none';
    const resultSection = document.getElementById('result-section');
    resultSection.style.display = 'block';

    const e = scores.E >= 0;
    const s = scores.S >= 0;
    const t = scores.T >= 0;
    const j = scores.J >= 0;
    const mbti = (e ? 'E' : 'I') + (s ? 'S' : 'N') + (t ? 'T' : 'F') + (j ? 'J' : 'P');

    const [ePct, iPct] = getPct('E', 'I');
    const [sPct, nPct] = getPct('S', 'N');
    const [tPct, fPct] = getPct('T', 'F');
    const [jPct, pPct] = getPct('J', 'P');

    const t = window.t;
    const lang = localStorage.getItem('lang') || 'ko';
    const d = mbtiData.types[mbti];
    const dimData = [
        { a: 'E', b: 'I', aPct: ePct, bPct: iPct, label: t('에너지 방향','Energy') },
        { a: 'S', b: 'N', aPct: sPct, bPct: nPct, label: t('인식 방식','Perception') },
        { a: 'T', b: 'F', aPct: tPct, bPct: fPct, label: t('판단 기준','Judgment') },
        { a: 'J', b: 'P', aPct: jPct, bPct: pPct, label: t('생활 양식','Lifestyle') }
    ];

    const dimColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

    resultSection.innerHTML = `
        <div class="luxury-report" style="text-align:center;">
            <div style="background:var(--accent-color); color:white; display:inline-block; padding:8px 28px; border-radius:50px; font-weight:900; font-size:0.85rem; margin-bottom:20px; letter-spacing:2px;">${t('나의 MBTI 유형','My MBTI Type')}</div>
            <div style="font-size:1.2rem; color:var(--text-muted); margin-bottom:8px;">${d.emoji} ${d.title}</div>
            <h2 style="font-size:5rem; font-weight:900; color:var(--primary-color); margin-bottom:8px; letter-spacing:4px;">${mbti}</h2>
            <p style="font-style:italic; color:var(--accent-color); font-weight:700; margin-bottom:30px;">"${d.tagline}"</p>
            <p style="font-size:1.05rem; color:var(--text-main); margin-bottom:40px; line-height:1.9; max-width:650px; margin-left:auto; margin-right:auto;">${d.overview}</p>

            <!-- Dimension Bars -->
            <div style="max-width:600px; margin:0 auto 40px; text-align:left;">
                <h4 style="color:var(--primary-color); margin-bottom:20px; font-size:1.1rem;">📊 차원별 성향 분석</h4>
                ${dimData.map((dim, i) => `
                    <div style="margin-bottom:22px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:800; margin-bottom:8px;">
                            <span style="color:${dim.aPct > 50 ? dimColors[i] : 'var(--text-muted)'};">${dim.a} ${dim.aPct}%</span>
                            <span style="color:var(--text-muted); font-size:0.75rem;">${dim.label}</span>
                            <span style="color:${dim.bPct > 50 ? dimColors[i] : 'var(--text-muted)'};">${dim.bPct}% ${dim.b}</span>
                        </div>
                        <div style="background:var(--border-color); border-radius:10px; height:12px; overflow:hidden;">
                            <div style="width:${dim.aPct}%; background:${dimColors[i]}; height:100%; border-radius:10px; transition:width 1s ease;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Strengths & Weaknesses -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left; margin-bottom:30px;">
                <div style="background:var(--bg-color); padding:25px; border-radius:20px; border-left:4px solid #10b981;">
                    <h4 style="color:#10b981; margin-bottom:15px; font-size:1rem;"><i class="fas fa-arrow-up"></i> 강점</h4>
                    <ul style="list-style:none; padding:0; font-size:0.88rem; line-height:1.8;">
                        ${d.strengths.map(s => `<li>✅ ${s}</li>`).join('')}
                    </ul>
                </div>
                <div style="background:var(--bg-color); padding:25px; border-radius:20px; border-left:4px solid #f59e0b;">
                    <h4 style="color:#f59e0b; margin-bottom:15px; font-size:1rem;"><i class="fas fa-arrow-down"></i> 성장 포인트</h4>
                    <ul style="list-style:none; padding:0; font-size:0.88rem; line-height:1.8;">
                        ${d.weaknesses.map(w => `<li>⚠️ ${w}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- Cognitive Functions -->
            <div style="background:var(--bg-color); padding:25px; border-radius:20px; text-align:left; margin-bottom:20px; border:1px solid var(--border-color);">
                <h4 style="color:var(--accent-color); margin-bottom:15px;"><i class="fas fa-brain"></i> 인지 기능 스택</h4>
                <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; text-align:center;">
                    ${d.cognitive_functions.map((fn, i) => `
                        <div style="background:var(--card-bg); padding:12px; border-radius:12px;">
                            <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;">${['주기능','부기능','3차기능','열등기능'][i]}</div>
                            <div style="font-weight:800; color:var(--primary-color); font-size:0.9rem;">${fn}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Careers & Famous -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left; margin-bottom:20px;">
                <div style="background:var(--bg-color); padding:25px; border-radius:20px;">
                    <h4 style="color:#6366f1; margin-bottom:12px;"><i class="fas fa-briefcase"></i> 추천 직업</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${d.careers.map(c => `<span style="background:#6366f111; color:#6366f1; padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:700;">${c}</span>`).join('')}
                    </div>
                </div>
                <div style="background:var(--bg-color); padding:25px; border-radius:20px;">
                    <h4 style="color:#ec4899; margin-bottom:12px;"><i class="fas fa-star"></i> 같은 유형 유명인</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${d.famous_people.map(p => `<span style="background:#ec489911; color:#ec4899; padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:700;">${p}</span>`).join('')}
                    </div>
                </div>
            </div>

            <!-- Relationship -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left; margin-bottom:20px;">
                <div style="background:#f0fdf4; padding:20px; border-radius:16px; border:1px solid #dcfce7;">
                    <h5 style="color:#166534; margin-bottom:8px;"><i class="fas fa-heart"></i> 궁합이 잘 맞는 유형</h5>
                    <p style="font-size:0.9rem; color:#14532d; font-weight:700;">${d.good.join(' · ')}</p>
                </div>
                <div style="background:#eff6ff; padding:20px; border-radius:16px; border:1px solid #dbeafe;">
                    <h5 style="color:#1e40af; margin-bottom:8px;"><i class="fas fa-people-arrows"></i> 관계 개선이 필요한 유형</h5>
                    <p style="font-size:0.9rem; color:#1e3a8a; font-weight:700;">${d.bad.join(' · ')}</p>
                </div>
            </div>

            <!-- Health Tips -->
            <div style="background:var(--card-bg); border:1px solid var(--border-color); padding:25px; border-radius:20px; text-align:left; margin-bottom:20px;">
                <h4 style="color:#10b981; margin-bottom:12px;"><i class="fas fa-dumbbell"></i> 건강 & 웰니스 가이드</h4>
                <p style="font-size:0.9rem; line-height:1.8; color:var(--text-main);">${d.health_tip}</p>
            </div>

            <!-- Growth Tip -->
            <div style="background:linear-gradient(135deg, var(--accent-color)15, var(--primary-color)10); border:1px solid var(--accent-color)33; padding:25px; border-radius:20px; text-align:left; margin-bottom:30px;">
                <h4 style="color:var(--accent-color); margin-bottom:12px;"><i class="fas fa-seedling"></i> 성장을 위한 조언</h4>
                <p style="font-size:0.9rem; line-height:1.8; color:var(--text-main);">${d.growth_tip}</p>
            </div>

            <!-- Relationship Tip -->
            <div style="background:#fdf4ff; border:1px solid #e9d5ff; padding:25px; border-radius:20px; text-align:left; margin-bottom:30px;">
                <h4 style="color:#7c3aed; margin-bottom:12px;"><i class="fas fa-people-group"></i> 관계 & 커뮤니케이션 팁</h4>
                <p style="font-size:0.9rem; line-height:1.8; color:#4c1d95;">${d.relationship_tip}</p>
            </div>

            <button class="luxury-btn" onclick="location.reload()" style="margin-top:10px; margin-bottom:10px;">테스트 다시하기</button>
            ${window.getShareUI ? window.getShareUI(`나의 MBTI: ${mbti} ${d.emoji}`, `저는 ${d.title}(${mbti}) 유형입니다! VitalRest 정밀 MBTI 분석으로 당신의 유형도 확인해 보세요.`) : ''}
        </div>
    `;

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
