document.addEventListener('DOMContentLoaded', () => {
    let drugData = [];
    let userGender = 'male';

    const drugListElement = document.getElementById('drug-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const aiResultSection = document.getElementById('ai-result-section');
    const aiResultContent = document.getElementById('ai-result-content');
    const modal = document.getElementById('drug-modal');
    const modalContent = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');

    fetch('drugs.json').then(r => r.json()).then(data => { drugData = data; });

    window.setGender = function(gender) {
        userGender = gender;
        document.getElementById('gender-male').classList.toggle('active', gender === 'male');
        document.getElementById('gender-female').classList.toggle('active', gender === 'female');
    };

    window.analyzeNutrition = function() {
        const age = document.getElementById('age-range').value;
        const concern = document.getElementById('health-concern').value;
        
        aiResultSection.style.display = 'block';
        aiResultContent.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 100px 0;">
                <div class="premium-loader"></div>
                <p style="margin-top:20px; font-family: 'serif'; font-style: italic; color: #64748b; letter-spacing: 1px;">Clinical Data Synchronizing...</p>
            </div>
        `;

        setTimeout(() => {
            const report = generateHyperPersonalizedReport(userGender, age, concern);
            displayPremiumReport(report);
            aiResultSection.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    };

    function generateHyperPersonalizedReport(gender, age, concern) {
        // 고민별 기본 베이스
        const baseData = {
            fatigue: { name: "에너지 대사 및 활력", icon: "fa-bolt" },
            eye: { name: "시각 기능 및 안구 보호", icon: "fa-eye" },
            immune: { name: "면역 방어 체계", icon: "fa-shield-virus" },
            bone: { name: "골격계 및 관절 구조", icon: "fa-bone" },
            liver: { name: "간 대사 및 해독 가동", icon: "fa-flask-vial" },
            brain: { name: "인지 기제 및 뇌 혈류", icon: "fa-brain" }
        };

        // 성별/연령별 차별화된 추천 성분 맵
        const nutrientMap = {
            male: {
                teen: { fatigue: ["비타민 B군", "아연"], eye: ["루테인", "비타민 A"], immune: ["비타민 C", "유산균"], bone: ["칼슘", "비타민 D"], liver: ["밀크씨슬"], brain: ["DHA", "테아닌"] },
                young: { fatigue: ["L-아르기닌", "비타민 B12"], eye: ["오메가3", "루테인"], immune: ["비타민 D", "홍삼"], bone: ["MSM", "마그네슘"], liver: ["실리마린", "비타민 B군"], brain: ["포스파티딜세린", "오메가3"] },
                middle: { fatigue: ["코엔자임 Q10", "옥타코사놀"], eye: ["지아잔틴", "아스타잔틴"], immune: ["베타글루칸", "아연"], bone: ["칼슘", "비타민 K2"], liver: ["글루타치온", "헛개"], brain: ["은행잎 추출물", "비타민 E"] },
                senior: { fatigue: ["포스파티딜콜린", "BCAA"], eye: ["비타민 A", "루테인"], immune: ["프로폴리스", "셀레늄"], bone: ["N-아세틸글루코사민", "칼슘"], liver: ["우르소데옥시콜산", "밀크씨슬"], brain: ["은행잎", "오메가3"] }
            },
            female: {
                teen: { fatigue: ["철분", "비타민 B군"], eye: ["루테인"], immune: ["유산균", "비타민 C"], bone: ["칼슘", "망간"], liver: ["비타민 B6"], brain: ["DHA", "철분"] },
                young: { fatigue: ["철분", "마그네슘"], eye: ["오메가3", "히알루론산"], immune: ["여성 유산균", "비타민 D"], bone: ["엽산", "칼슘"], liver: ["밀크씨슬", "이노시톨"], brain: ["오메가3", "엽산"] },
                middle: { fatigue: ["감마리놀렌산", "이소플라본"], eye: ["지아잔틴", "오메가3"], immune: ["콜라겐", "비타민 C"], bone: ["칼슘", "대두이소플라본"], liver: ["실리마린", "글루타치온"], brain: ["포스파티딜세린", "비타민 B12"] },
                senior: { fatigue: ["로열젤리", "코엔자임 Q10"], eye: ["루테인", "비타민 E"], immune: ["프로폴리스", "유산균"], bone: ["비타민 D", "칼슘", "K2"], liver: ["우르소데옥시콜산", "글루타치온"], brain: ["은행잎", "DHA"] }
            }
        };

        const recommendedNames = nutrientMap[gender][age][concern];
        const detailedNutrients = recommendedNames.map(name => getNutrientDetails(name, age, gender));

        return {
            category: baseData[concern].name,
            icon: baseData[concern].icon,
            title: `${gender === 'male' ? '남성' : '여성'} ${getAgeText(age)} 맞춤형 ${baseData[concern].name} 솔루션`,
            description: getPersonalizedDesc(gender, age, concern),
            nutrients: detailedNutrients,
            lifestyle: getLifestyleTip(age, concern),
            caution: getCaution(age, concern)
        };
    }

    function getNutrientDetails(name, age, gender) {
        const data = {
            "비타민 B군": "탄수화물, 단백질, 지방 대사에 관여하여 체내 에너지를 생성합니다. 특히 수용성으로 매일 보충이 필요합니다.",
            "L-아르기닌": "산화질소를 생성하여 혈관을 확장시키고 혈행을 개선합니다. 활력 증진에 직접적인 도움을 줍니다.",
            "마그네슘": "300가지 이상의 효소 작용에 관여하며, 신경 안정과 근육 이완을 도와 '천연의 진정제'로 불립니다.",
            "루테인": "눈 망막의 중심 시력을 담당하는 황반 밀도를 유지합니다. 체내 합성이 안 되어 반드시 섭취해야 합니다.",
            "오메가3": "혈중 중성지질 개선 및 혈행 원활에 도움을 주며, 건조한 눈 개선에 탁월한 효과가 입증되었습니다.",
            "비타민 D": "칼슘과 인이 흡수되고 이용되는데 필요하며, 뼈의 형성과 유지 및 골다공증 발생 위험 감소에 도움을 줍니다.",
            "실리마린": "엉겅퀴 추출물로 간 세포의 파괴를 방지하고 단백질 합성을 촉진하여 간의 재생을 돕습니다.",
            "철분": "체내 산소 운반과 혈액 생성에 필수적입니다. 여성과 성장기 청소년에게 특히 권장되는 성분입니다.",
            "포스파티딜세린": "뇌 세포막의 구성 성분으로 인지 기능 개선과 기억력 향상에 도움을 주는 기능성 성분입니다.",
            "칼슘": "뼈와 치아 형성에 필요하며 신경과 근육 기능 유지에 필수적인 무기질입니다.",
            "비타민 K2": "칼슘이 혈관 벽에 쌓이지 않고 뼈로 직접 들어가게 가이드하는 '교통 정리' 역할을 합니다.",
            "MSM": "관절 및 연골 건강에 도움을 줄 수 있는 식이유황 성분으로 염증 완화 효과가 있습니다."
        };
        return { name, info: data[name] || "검증된 기능성 성분으로 신체 밸런스 유지에 도움을 줍니다." };
    }

    function getAgeText(age) {
        const map = { teen: "청소년", young: "청년", middle: "중년", senior: "노년" };
        return map[age];
    }

    function getPersonalizedDesc(gender, age, concern) {
        if (age === 'senior') return "신체 기능이 자연스럽게 저하되는 시기입니다. 단순 고함량보다는 흡수율과 세포 보호에 집중한 설계가 필요합니다.";
        if (age === 'teen') return "성장기에는 에너지 소모량이 매우 큽니다. 학습 집중력과 신체 발달을 동시에 고려한 균형 잡힌 영양 공급이 핵심입니다.";
        if (gender === 'female' && age === 'young') return "생체 주기와 활동량을 고려한 철분 및 마그네슘 보충이 중요합니다. 미용보다는 근본적인 활력에 집중하세요.";
        return "현대인의 불규칙한 생활 습관으로 인해 깨진 신체 밸런스를 복구하고 핵심 기능을 강화하는 데 초점을 맞췄습니다.";
    }

    function getLifestyleTip(age, concern) {
        if (concern === 'eye') return "PC 사용 50분마다 10분간 창밖 멀리 보기와 온찜질을 병행하세요.";
        if (age === 'senior') return "과격한 운동보다는 하루 40분 정도의 가벼운 산책이 영양소 흡수를 돕습니다.";
        return "카페인 의존도를 낮추고 하루 2L 이상의 수분 섭취를 유지하는 것이 추천 성분의 효과를 극대화합니다.";
    }

    function getCaution(age, concern) {
        if (age === 'senior') return "복용 중인 만성 질환 약물(혈압, 당뇨 등)이 있다면 반드시 의사와 상호작용을 확인하세요.";
        return "한꺼번에 많은 양을 먹기보다 매일 정해진 시간에 규칙적으로 섭취하는 것이 중요합니다.";
    }

    function displayPremiumReport(report) {
        aiResultContent.innerHTML = `
            <div class="luxury-report-card">
                <div class="report-header">
                    <div class="report-badge"><i class="fas ${report.icon}"></i> ${report.category}</div>
                    <h2>${report.title}</h2>
                    <p class="report-subtitle">${report.description}</p>
                </div>
                
                <div class="nutrient-focus-grid">
                    ${report.nutrients.map(n => `
                        <div class="focus-item">
                            <h4 class="focus-name">${n.name}</h4>
                            <p class="focus-info">${n.info}</p>
                            <button onclick="quickSearch('${n.name.split(' ')[0]}')" class="focus-search-btn">Clinical Data →</button>
                        </div>
                    `).join('')}
                </div>

                <div class="report-footer-grid">
                    <div class="footer-box">
                        <label>Expert Advice</label>
                        <p>${report.lifestyle}</p>
                    </div>
                    <div class="footer-box caution">
                        <label>Caution</label>
                        <p>${report.caution}</p>
                    </div>
                </div>

                <div class="medical-disclaimer">
                    The analysis is based on health generalities and clinical literature. Consult a medical professional before starting any regimen.
                </div>
            </div>
        `;
    }

    // Search & Modal logic remain optimized
    if (searchBtn) {
        searchBtn.addEventListener('click', () => performSearch());
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
    }

    window.quickSearch = function(q) { searchInput.value = q; performSearch(); };

    function performSearch() {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) return;
        const filtered = drugData.filter(d => d.name.toLowerCase().includes(q) || d.ingredients.toLowerCase().includes(q));
        renderResults(filtered);
    }

    function renderResults(results) {
        drugListElement.innerHTML = results.length ? '' : '<p class="no-data">검색 결과가 없습니다.</p>';
        results.forEach(d => {
            const card = document.createElement('div');
            card.className = 'drug-card';
            card.innerHTML = `
                <div class="card-category ${d.category === '전문의약품' ? 'pro' : 'general'}">${d.category}</div>
                <h3 class="card-name">${d.name}</h3>
                <div class="card-efficacy">${d.efficacy.substring(0, 50)}...</div>
            `;
            card.onclick = () => showDetail(d.id);
            drugListElement.appendChild(card);
        });
        drugListElement.scrollIntoView({ behavior: 'smooth' });
    }

    window.showDetail = function(id) {
        const d = drugData.find(x => x.id === id);
        if (!d) return;
        modalContent.innerHTML = `
            <div class="detail-header">
                <h2>${d.name}</h2>
                <p>${d.manufacturer}</p>
            </div>
            <div class="detail-body">
                <p><strong>주요 성분:</strong> ${d.ingredients}</p>
                <p><strong>효능 효과:</strong> ${d.efficacy}</p>
                <div class="detail-desc">${d.description}</div>
            </div>
        `;
        modal.style.display = 'block';
    };

    if (closeModal) closeModal.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
});