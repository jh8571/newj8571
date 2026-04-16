document.addEventListener('DOMContentLoaded', () => {
    let testData = [];
    let currentTest = null;
    let currentQuestionIndex = 0;
    let totalScore = 0;
    let answers = [];

    const testListElement = document.getElementById('test-list');
    const modal = document.getElementById('test-modal');
    const modalContent = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');

    if (!testListElement) return;

    const t = window.t;

    // Icon & color mapping per test
    const testMeta = {
        1: { icon: 'fa-cloud-rain', color: '#6366f1', label: 'PHQ-9 우울척도', badge_ko: '임상 검증', badge_en: 'Clinically Validated' },
        2: { icon: 'fa-wind', color: '#f59e0b', label: 'PSS-10 스트레스척도', badge_ko: '글로벌 표준', badge_en: 'Global Standard' },
        3: { icon: 'fa-heart', color: '#ec4899', label: 'RSES 자존감척도', badge_ko: '국제 표준', badge_en: 'International Standard' },
        4: { icon: 'fa-bolt', color: '#10b981', label: 'GAD-7 불안척도', badge_ko: '임상 검증', badge_en: 'Clinically Validated' },
        5: { icon: 'fa-moon', color: '#8b5cf6', label: 'PSQI 수면척도', badge_ko: '국제 표준', badge_en: 'International Standard' }
    };

    // Load Tests
    fetch('tests.json')
        .then(r => r.json())
        .then(data => {
            testData = data;
            renderTestList();
        })
        .catch(e => console.error('Test data load error:', e));

    function renderTestList() {
        const lang = localStorage.getItem('lang') || 'ko';
        testListElement.innerHTML = '';
        testData.forEach(test => {
            const meta = testMeta[test.id] || { icon: 'fa-brain', color: 'var(--accent-color)', badge_ko: '전문', badge_en: 'Expert' };
            const badge = lang === 'ko' ? meta.badge_ko : meta.badge_en;
            const card = document.createElement('div');
            card.className = 'drug-card';
            card.innerHTML = `
                <div style="width:55px; height:55px; border-radius:16px; background:${meta.color}22;
                     display:flex; align-items:center; justify-content:center; margin-bottom:18px;">
                    <i class="fas ${meta.icon}" style="color:${meta.color}; font-size:1.5rem;"></i>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    <span style="font-size:0.7rem; background:${meta.color}22; color:${meta.color}; padding:3px 10px; border-radius:20px; font-weight:800;">${badge}</span>
                </div>
                <h3 class="card-name" style="font-size:1rem; line-height:1.4;">${test.title}</h3>
                <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:20px; line-height:1.6;">${test.description}</p>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px; font-size:0.82rem; color:var(--text-muted);">
                    <span><i class="fas fa-list-ol"></i> ${test.questions.length}${t('문항','questions')}</span>
                    <span><i class="fas fa-clock"></i> ${t('약','~')} ${Math.ceil(test.questions.length / 3)}${t('분','min')}</span>
                </div>
                <button class="luxury-btn" style="margin-top:0; padding:12px 25px; font-size:0.9rem;" onclick="startTest(${test.id})">${t('분석 시작하기','Start Analysis')}</button>
            `;
            testListElement.appendChild(card);
        });
    }

    window.startTest = function (id) {
        currentTest = testData.find(t => t.id === id);
        if (!currentTest) return;
        currentQuestionIndex = 0;
        totalScore = 0;
        answers = [];
        renderQuestion();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    function renderQuestion() {
        const q = currentTest.questions[currentQuestionIndex];
        const total = currentTest.questions.length;
        const progress = (currentQuestionIndex / total) * 100;
        const meta = testMeta[currentTest.id] || { color: 'var(--accent-color)' };

        modalContent.innerHTML = `
            <div style="padding:10px 0 30px;">
                <div class="progress-container" style="margin-bottom:20px;">
                    <div class="progress-bar" style="width:${progress}%; background:${meta.color};"></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                    <span style="font-size:0.75rem; background:${meta.color}22; color:${meta.color}; padding:4px 12px; border-radius:20px; font-weight:800;">${currentTest.title}</span>
                    <span style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">${currentQuestionIndex + 1} / ${total}</span>
                </div>
                <h2 style="font-size:1.25rem; line-height:1.7; color:var(--primary-color); margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid var(--border-color);">${q.q}</h2>
                <div style="display:grid; gap:10px;">
                    ${q.options.map((opt, idx) => `
                        <button class="selectable-card" onclick="selectOption(${opt.score}, ${idx})"
                            style="padding:18px 20px; text-align:left; display:flex; align-items:center; gap:14px; border-radius:14px; cursor:pointer; transition:0.2s;">
                            <span style="width:32px; height:32px; border-radius:50%; border:2px solid var(--border-color);
                                         display:flex; align-items:center; justify-content:center;
                                         font-weight:800; font-size:0.8rem; flex-shrink:0; color:${meta.color};">${idx + 1}</span>
                            <span style="font-size:0.95rem; font-weight:600; line-height:1.4;">${opt.text}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    window.selectOption = function (score, idx) {
        // Brief selection feedback
        const btns = document.querySelectorAll('.selectable-card');
        if (btns[idx]) {
            btns[idx].style.background = 'var(--accent-color)22';
            btns[idx].style.borderColor = 'var(--accent-color)';
        }
        setTimeout(() => {
            totalScore += score;
            answers.push(score);
            currentQuestionIndex++;
            if (currentQuestionIndex < currentTest.questions.length) {
                renderQuestion();
            } else {
                showResult();
            }
        }, 200);
    };

    function getResultInfo() {
        for (const range in currentTest.results) {
            const [min, max] = range.split('-').map(Number);
            if (totalScore >= min && totalScore <= max) {
                return { text: currentTest.results[range], range, min, max };
            }
        }
        return { text: t('결과를 분석하는 중입니다.', 'Analyzing your results.'), range: '0-0', min: 0, max: 0 };
    }

    function getMaxScore() {
        let max = 0;
        currentTest.questions.forEach(q => {
            const maxOpt = Math.max(...q.options.map(o => o.score));
            max += maxOpt;
        });
        return max;
    }

    function getScoreLevel(id, score) {
        const lang = localStorage.getItem('lang') || 'ko';
        if (id === 1) { // PHQ-9
            if (score <= 4) return { label: t('정상','Normal'), color: '#10b981', pct: (score / 27) * 100 };
            if (score <= 9) return { label: t('경미한 우울','Mild Depression'), color: '#f59e0b', pct: (score / 27) * 100 };
            if (score <= 14) return { label: t('중간 우울','Moderate Depression'), color: '#f97316', pct: (score / 27) * 100 };
            if (score <= 19) return { label: t('심한 우울','Severe Depression'), color: '#ef4444', pct: (score / 27) * 100 };
            return { label: t('매우 심한 우울','Very Severe Depression'), color: '#991b1b', pct: (score / 27) * 100 };
        }
        if (id === 2) { // PSS-10
            if (score <= 12) return { label: t('낮은 스트레스','Low Stress'), color: '#10b981', pct: (score / 40) * 100 };
            if (score <= 18) return { label: t('적정 스트레스','Moderate Stress'), color: '#f59e0b', pct: (score / 40) * 100 };
            if (score <= 26) return { label: t('높은 스트레스','High Stress'), color: '#f97316', pct: (score / 40) * 100 };
            return { label: t('만성 스트레스 위험','Chronic Stress Risk'), color: '#ef4444', pct: (score / 40) * 100 };
        }
        if (id === 3) { // RSES
            if (score >= 25) return { label: t('높은 자존감','High Self-Esteem'), color: '#10b981', pct: (score / 30) * 100 };
            if (score >= 16) return { label: t('보통 자존감','Average Self-Esteem'), color: '#f59e0b', pct: (score / 30) * 100 };
            return { label: t('낮은 자존감','Low Self-Esteem'), color: '#ef4444', pct: (score / 30) * 100 };
        }
        if (id === 4) { // GAD-7
            if (score <= 4) return { label: t('정상','Normal'), color: '#10b981', pct: (score / 21) * 100 };
            if (score <= 9) return { label: t('경미한 불안','Mild Anxiety'), color: '#f59e0b', pct: (score / 21) * 100 };
            if (score <= 14) return { label: t('중간 불안','Moderate Anxiety'), color: '#f97316', pct: (score / 21) * 100 };
            return { label: t('심한 불안','Severe Anxiety'), color: '#ef4444', pct: (score / 21) * 100 };
        }
        if (id === 5) { // PSQI
            if (score <= 7) return { label: t('양호한 수면','Good Sleep'), color: '#10b981', pct: (score / 30) * 100 };
            if (score <= 15) return { label: t('수면 질 저하','Poor Sleep Quality'), color: '#f59e0b', pct: (score / 30) * 100 };
            if (score <= 23) return { label: t('수면 장애 가능성','Possible Sleep Disorder'), color: '#f97316', pct: (score / 30) * 100 };
            return { label: t('심각한 수면 부족','Severe Sleep Deprivation'), color: '#ef4444', pct: (score / 30) * 100 };
        }
        const maxSc = getMaxScore();
        return { label: t('분석 완료','Analysis Complete'), color: '#6366f1', pct: (score / maxSc) * 100 };
    }

    function getCopingTips(id, score) {
        const lang = localStorage.getItem('lang') || 'ko';
        const tipsKo = {
            1: {
                low:  ['🌿 매일 10~15분 자연 속 산책을 실천하세요', '📓 감사 일기를 통해 긍정적 사고를 강화하세요', '🤝 친한 사람과의 정기적인 대화 시간을 가지세요'],
                mid:  ['🧘 마음챙김 명상 앱을 활용해 일일 10분 명상을 시작하세요', '🏃 규칙적인 유산소 운동이 세로토닌 분비를 돕습니다', '💊 오메가-3, 비타민 D 등 기분 관련 영양소를 확인하세요', '📞 정신건강 위기상담 전화: 1577-0199 (24시간)'],
                high: ['🏥 가까운 정신건강복지센터나 정신과 전문의 상담을 받으세요', '📞 자살예방상담전화: 1393 (24시간)', '🤗 혼자 이겨내려 하지 말고 주변에 도움을 요청하세요', '💊 전문가 처방에 따른 약물 치료가 빠른 회복을 도웁니다']
            },
            2: {
                low:  ['🌱 현재의 건강한 대처 방식을 계속 유지하세요', '📚 새로운 취미나 학습으로 삶의 활력을 더하세요'],
                mid:  ['🧘 일주일에 3회 이상 명상이나 요가를 실천하세요', '📵 퇴근 후 업무 연락을 차단하는 경계를 만드세요', '🛁 따뜻한 목욕, 아로마 등 신체 이완 루틴을 만드세요'],
                high: ['📋 스트레스 원인을 목록으로 정리하고 통제 가능/불가능 항목을 분류하세요', '💬 인지행동치료(CBT) 기반 상담을 받아보세요', '🏥 스트레스 클리닉 방문을 고려해 보세요']
            },
            3: {
                low:  ['🏆 매일 아침 자신의 장점 3가지를 소리 내어 말해보세요', '🎯 아주 작은 목표를 세우고 이루는 경험을 쌓으세요', '💬 자존감 향상을 위한 심리 상담을 고려해 보세요'],
                mid:  ['📖 자기 계발 도서나 팟캐스트로 긍정적 자아상을 강화하세요', '🤝 나를 지지해 주는 사람들과 더 많은 시간을 보내세요'],
                high: ['🌟 지금의 긍정적 에너지를 타인과 나누세요', '🎓 멘토링이나 코칭으로 더 많은 사람에게 영향을 줄 수 있습니다']
            },
            4: {
                low:  ['😌 현재의 평온함을 유지하는 일상 루틴을 지켜나가세요', '🌿 규칙적인 자연 속 산책이 불안 예방에 효과적입니다'],
                mid:  ['🧘 복식호흡법(4-7-8 호흡)을 하루 3번 연습하세요', '🚫 카페인과 알코올 섭취를 줄이세요', '📵 취침 1시간 전 스마트폰을 내려놓으세요'],
                high: ['🏥 GAD(범불안장애) 진단을 위해 정신건강 전문가를 찾아보세요', '💊 필요시 의사와 약물 치료 옵션을 상의하세요', '📞 정신건강 위기상담: 1577-0199 (24시간)']
            },
            5: {
                low:  ['🌙 현재의 건강한 수면 습관을 계속 유지하세요', '📱 취침 환경(온도, 조명)을 최적화하는 것도 도움이 됩니다'],
                mid:  ['⏰ 주말에도 같은 시간에 기상하는 수면 리듬을 유지하세요', '☕ 오후 2시 이후 카페인 섭취를 피하세요', '📵 취침 1시간 전 블루라이트 차단 모드를 사용하세요'],
                high: ['🏥 수면다원검사를 통해 수면무호흡증 등을 확인하세요', '💊 멜라토닌 보충제는 단기적으로 도움이 될 수 있으나 전문가 상담 후 사용하세요', '🧠 인지행동치료(CBT-I)가 불면증 치료에 가장 효과적입니다']
            }
        };

        const tipsEn = {
            1: {
                low:  ['🌿 Take a 10–15 minute walk in nature every day', '📓 Keep a gratitude journal to reinforce positive thinking', '🤝 Schedule regular catch-ups with people you trust'],
                mid:  ['🧘 Start a daily 10-minute mindfulness meditation using an app', '🏃 Regular aerobic exercise helps boost serotonin production', '💊 Check mood-related nutrients like Omega-3 and Vitamin D', '📞 Mental Health Crisis Line: consult your local helpline'],
                high: ['🏥 Visit a mental health center or psychiatrist near you', '📞 Suicide prevention hotline: contact your national helpline', '🤗 Don\'t try to cope alone — reach out to those around you', '💊 Medication prescribed by a specialist can aid faster recovery']
            },
            2: {
                low:  ['🌱 Keep up your current healthy coping strategies', '📚 Add new hobbies or learning to bring more vitality to your life'],
                mid:  ['🧘 Practice meditation or yoga 3+ times per week', '📵 Set boundaries to disconnect from work messages after hours', '🛁 Build a physical relaxation routine: warm baths, aromatherapy, etc.'],
                high: ['📋 List your stressors and categorize them as controllable vs. uncontrollable', '💬 Consider counseling based on Cognitive Behavioral Therapy (CBT)', '🏥 Think about visiting a stress management clinic']
            },
            3: {
                low:  ['🏆 Say 3 of your strengths out loud every morning', '🎯 Set small achievable goals and build on each success', '💬 Consider psychological counseling to improve self-esteem'],
                mid:  ['📖 Reinforce a positive self-image with self-help books or podcasts', '🤝 Spend more time with people who support and uplift you'],
                high: ['🌟 Share your positive energy with those around you', '🎓 You can influence more people through mentoring or coaching']
            },
            4: {
                low:  ['😌 Keep the daily routines that maintain your sense of calm', '🌿 Regular walks in nature are effective for preventing anxiety'],
                mid:  ['🧘 Practice diaphragmatic breathing (4-7-8 method) 3 times a day', '🚫 Reduce caffeine and alcohol consumption', '📵 Put your phone away 1 hour before bed'],
                high: ['🏥 Seek a mental health professional for GAD (generalized anxiety disorder) evaluation', '💊 Discuss medication options with your doctor if needed', '📞 Mental health crisis support: contact your local helpline']
            },
            5: {
                low:  ['🌙 Keep maintaining your healthy sleep habits', '📱 Optimizing your sleep environment (temperature, lighting) can also help'],
                mid:  ['⏰ Wake up at the same time every day, even on weekends', '☕ Avoid caffeine after 2 PM', '📵 Use blue light filter mode 1 hour before bed'],
                high: ['🏥 Get a sleep study to check for sleep apnea and other disorders', '💊 Melatonin supplements may help short-term, but consult a specialist first', '🧠 Cognitive Behavioral Therapy for Insomnia (CBT-I) is the most effective treatment']
            }
        };

        const tips = lang === 'ko' ? tipsKo[id] : tipsEn[id];
        if (!tips) return [t('꾸준한 자기 관리와 주기적인 체크가 중요합니다.', 'Consistent self-care and regular check-ins are important.')];

        const pct = (score / getMaxScore()) * 100;
        if (pct <= 33) return tips.low;
        if (pct <= 66) return tips.mid;
        return tips.high;
    }

    function showResult() {
        const lang = localStorage.getItem('lang') || 'ko';
        const result = getResultInfo();
        const level = getScoreLevel(currentTest.id, totalScore);
        const coping = getCopingTips(currentTest.id, totalScore);
        const maxSc = getMaxScore();
        const meta = testMeta[currentTest.id] || { color: '#6366f1', icon: 'fa-brain' };

        const scaleLabels = lang === 'ko'
            ? '<span>정상</span><span>경미</span><span>중간</span><span>심각</span>'
            : '<span>Normal</span><span>Mild</span><span>Moderate</span><span>Severe</span>';

        modalContent.innerHTML = `
            <div style="padding:10px 0;">
                <!-- Header -->
                <div style="text-align:center; margin-bottom:30px;">
                    <div style="width:80px; height:80px; border-radius:50%; background:${level.color}22;
                         display:flex; align-items:center; justify-content:center; margin:0 auto 15px;">
                        <i class="fas ${meta.icon}" style="color:${level.color}; font-size:2rem;"></i>
                    </div>
                    <div style="display:inline-block; background:${level.color}22; color:${level.color};
                         padding:5px 18px; border-radius:50px; font-weight:900; font-size:0.85rem; margin-bottom:10px;">
                        ${level.label}
                    </div>
                    <h2 style="font-size:1.8rem; font-weight:900; color:var(--primary-color);">${t('심리 분석 리포트','Psychological Analysis Report')}</h2>
                    <p style="color:var(--text-muted); font-size:0.85rem; margin-top:5px;">${currentTest.title}</p>
                </div>

                <!-- Score Visual -->
                <div style="background:var(--bg-color); padding:25px; border-radius:20px; margin-bottom:20px; text-align:center;">
                    <div style="font-size:3rem; font-weight:900; color:${level.color}; line-height:1;">${totalScore}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:15px;">/ ${maxSc}${t('점','pts')}</div>
                    <div style="background:var(--border-color); border-radius:10px; height:14px; overflow:hidden; max-width:400px; margin:0 auto;">
                        <div style="width:${Math.min(level.pct, 100)}%; background:${level.color}; height:100%; border-radius:10px; transition:width 1.2s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:6px; max-width:400px; margin-left:auto; margin-right:auto;">
                        ${scaleLabels}
                    </div>
                </div>

                <!-- Interpretation -->
                <div style="background:linear-gradient(135deg, ${level.color}15, ${level.color}05); border:1px solid ${level.color}33;
                     padding:25px; border-radius:20px; margin-bottom:20px;">
                    <h3 style="color:${level.color}; margin-bottom:12px; font-size:1rem;"><i class="fas fa-quote-left"></i> ${t('전문가 해석','Expert Interpretation')}</h3>
                    <p style="font-size:1rem; line-height:1.9; color:var(--text-main);">${result.text}</p>
                </div>

                <!-- Coping Strategies -->
                <div style="background:var(--bg-color); padding:25px; border-radius:20px; margin-bottom:20px; border:1px solid var(--border-color);">
                    <h3 style="color:var(--primary-color); margin-bottom:15px; font-size:1rem;"><i class="fas fa-lightbulb"></i> ${t('맞춤형 대처 전략','Personalized Coping Strategies')}</h3>
                    <ul style="list-style:none; padding:0; display:grid; gap:10px;">
                        ${coping.map(tip => `
                            <li style="padding:12px 15px; background:var(--card-bg); border-radius:12px; font-size:0.9rem; line-height:1.5; color:var(--text-main);">
                                ${tip}
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Disclaimer -->
                <div style="background:#fff7ed; border:1px solid #fed7aa; padding:15px 20px; border-radius:14px; margin-bottom:25px;">
                    <p style="font-size:0.8rem; color:#92400e; line-height:1.6;">
                        ${lang === 'ko'
                            ? '⚠️ <strong>안내:</strong> 이 검사는 전문적 임상 진단을 대체하지 않습니다. 증상이 지속되거나 일상에 지장을 줄 경우, 반드시 전문 의료기관을 방문하세요. <strong>정신건강 위기상담전화: 1577-0199</strong> (24시간 운영)'
                            : '⚠️ <strong>Notice:</strong> This test is not a substitute for professional clinical diagnosis. If symptoms persist or interfere with daily life, please visit a qualified healthcare provider. <strong>Contact your local mental health crisis line</strong> for 24-hour support.'
                        }
                    </p>
                </div>

                <div style="text-align:center;">
                    <button class="luxury-btn" onclick="location.reload()" style="margin-bottom:15px; max-width:300px;">${t('다른 테스트 하기','Try Another Test')}</button>
                    ${window.getShareUI ? window.getShareUI(
                        t(`${currentTest.title} 결과: ${level.label}`, `${currentTest.title} Result: ${level.label}`),
                        t('VitalRest에서 제 마음의 건강 상태를 체크해봤어요. 당신도 한번 확인해보세요!', 'I checked my mental wellness on VitalRest. You should try it too!')
                    ) : ''}
                </div>
            </div>
        `;
    }

    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
});
