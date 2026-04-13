document.addEventListener('DOMContentLoaded', () => {
    let drugData = [];
    let userGender = 'male';

    // Elements
    const drugListElement = document.getElementById('drug-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const aiResultSection = document.getElementById('ai-result-section');
    const aiResultContent = document.getElementById('ai-result-content');
    const modal = document.getElementById('drug-modal');
    const modalContent = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');

    // 1. Data Loading
    fetch('drugs.json')
        .then(r => r.json())
        .then(data => {
            drugData = data;
            console.log('Database synced:', drugData.length);
        }).catch(e => console.error('Load error:', e));

    // 2. Gender Selection (Fixed for index.html)
    window.setGender = function(gender) {
        userGender = gender;
        const maleBtn = document.getElementById('gender-male');
        const femaleBtn = document.getElementById('gender-female');
        if (maleBtn && femaleBtn) {
            maleBtn.classList.toggle('active', gender === 'male');
            femaleBtn.classList.toggle('active', gender === 'female');
        }
    };

    // 3. AI Analysis Report
    window.analyzeNutrition = function() {
        const age = document.getElementById('age-range').value;
        const concern = document.getElementById('health-concern').value;
        
        if (!aiResultSection || !aiResultContent) return;

        aiResultSection.style.display = 'block';
        aiResultContent.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 100px 0;">
                <div class="premium-loader"></div>
                <p style="margin-top:20px; color: #64748b;" data-ko="고정밀 AI가 최적의 영양 조합을 설계 중입니다..." data-en="High-precision AI is designing the optimal nutrition combination...">고정밀 AI가 최적의 영양 조합을 설계 중입니다...</p>
            </div>
        `;

        setTimeout(() => {
            const report = generateHyperPersonalizedReport(userGender, age, concern);
            displayPremiumReport(report);
            aiResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1500);
    };

    function generateHyperPersonalizedReport(gender, age, concern) {
        const nutrientMap = {
            male: {
                teen: { fatigue: ["비타민 B군", "아연", "마그네슘"], eye: ["루테인", "비타민 A", "베타카로틴"], immune: ["비타민 C", "유산균", "프로폴리스"], bone: ["칼슘", "비타민 D", "망간"], liver: ["밀크씨슬", "비타민 B6", "타우린"], brain: ["DHA", "테아닌", "포스파티딜세린"] },
                young: { fatigue: ["L-아르기닌", "비타민 B12", "타우린", "마그네슘"], eye: ["오메가3", "루테인", "아스타잔틴"], immune: ["비타민 D", "홍삼", "아연"], bone: ["MSM", "마그네슘", "비타민 K2"], liver: ["실리마린", "비타민 B군", "글루타치온"], brain: ["포스파티딜세린", "오메가3", "은행잎 추출물"] },
                middle: { fatigue: ["코엔자임 Q10", "옥타코사놀", "비타민 B군", "마카"], eye: ["지아잔틴", "아스타잔틴", "루테인"], immune: ["베타글루칸", "아연", "셀레늄"], bone: ["칼슘", "비타민 K2", "MSM", "보스웰리아"], liver: ["글루타치온", "헛개", "실리마린"], brain: ["은행잎 추출물", "비타민 E", "포스파티딜콜린"] },
                senior: { fatigue: ["포스파티딜콜린", "BCAA", "코엔자임 Q10"], eye: ["비타민 A", "루테인", "지아잔틴"], immune: ["프로폴리스", "셀레늄", "비타민 D"], bone: ["N-아세틸글루코사민", "칼슘", "비타민 D", "K2"], liver: ["우르소데옥시콜산", "밀크씨슬", "아티초크"], brain: ["은행잎", "오메가3", "커큐민"] }
            },
            female: {
                teen: { fatigue: ["철분", "비타민 B군", "비타민 C"], eye: ["루테인", "비타민 A", "블루베리추출물"], immune: ["유산균", "비타민 C", "아연"], bone: ["칼슘", "망간", "비타민 D"], liver: ["비타민 B6", "밀크씨슬", "테아닌"], brain: ["DHA", "철분", "엽산"] },
                young: { fatigue: ["철분", "마그네슘", "비타민 B군", "L-카르니틴"], eye: ["오메가3", "히알루론산", "루테인"], immune: ["여성 유산균", "비타민 D", "크랜베리"], bone: ["엽산", "칼슘", "비타민 D"], liver: ["밀크씨슬", "이노시톨", "비타민 B군"], brain: ["오메가3", "엽산", "테아닌"] },
                middle: { fatigue: ["감마리놀렌산", "이소플라본", "코엔자임 Q10"], eye: ["지아잔틴", "오메가3", "루테인"], immune: ["콜라겐", "비타민 C", "히알루론산", "엘라스틴"], bone: ["칼슘", "대두이소플라본", "비타민 K2"], liver: ["실리마린", "글루타치온", "비타민 B군"], brain: ["포스파티딜세린", "비타민 B12", "오메가3"] },
                senior: { fatigue: ["로열젤리", "코엔자임 Q10", "비타민 B12"], eye: ["루테인", "비타민 E", "지아잔틴"], immune: ["프로폴리스", "유산균", "셀레늄"], bone: ["비타민 D", "칼슘", "K2", "MSM"], liver: ["우르소데옥시콜산", "글루타치온", "밀크씨슬"], brain: ["은행잎", "DHA", "포스파티딜세린"] }
            }
        };

        const resNames = nutrientMap[gender][age][concern];
        const detailedNutrients = resNames.map(n => ({
            name: n,
            ...getNutrientDetail(n)
        }));

        return {
            title: `${gender==='male'?'남성':'여성'} 맞춤형 정밀 분석 리포트`,
            nutrients: detailedNutrients,
            lifestyle: "규칙적인 수면과 하루 2L 이상의 수분 섭취는 영양소의 생체 이용률을 극대화합니다.",
            caution: "질환이 있거나 약물을 복용 중인 경우 섭취 전 반드시 전문가와 상담하십시오."
        };
    }

    function getNutrientDetail(n) {
        const details = {
            "비타민 B군": { info: "에너지 대사와 피로 회복의 핵심 성분입니다.", dri: "B1: 1.2mg, B2: 1.4mg, B6: 1.5mg", composition: "티아민, 리보플라빈, 니아신, 판토텐산 등 8종 복합체" },
            "L-아르기닌": { info: "혈관 확장 및 혈행 개선을 도와 활력을 높입니다.", dri: "1,000 ~ 3,000mg", composition: "준필수 아미노산 (단백질 합성 및 질소 산화물 생성)" },
            "마그네슘": { info: "천연의 진정제라 불리며 근육 및 신경 안정을 돕습니다.", dri: "350mg (남성), 280mg (여성)", composition: "산화마그네슘 또는 킬레이트 마그네슘" },
            "오메가3": { info: "혈행 개선 및 건조한 눈 개선에 필수적인 지방산입니다.", dri: "500 ~ 2,000mg (EPA+DHA 합계)", composition: "EPA(혈행) 및 DHA(뇌/망막) 비율 최적화" },
            "루테인": { info: "눈의 황반 색소 밀도를 유지하여 노화를 방지합니다.", dri: "10 ~ 20mg", composition: "마리골드꽃 추출물 (루테인 단일 또는 지아잔틴 복합)" },
            "비타민 D": { info: "칼슘 흡수를 돕고 면역 시스템을 조절합니다.", dri: "400 ~ 1,000 IU (결핍 시 2,000 IU 이상)", composition: "비타민 D3 (콜레칼시페롤 - 흡수율 높음)" },
            "비타민 C": { info: "강력한 항산화 작용과 콜라겐 합성을 돕습니다.", dri: "100 ~ 1,000mg (수용성으로 과량 시 배출)", composition: "순수 아스코르빈산 또는 중성화 비타민 C" },
            "아연": { info: "정상적인 면역 기능과 세포 분열에 필수적입니다.", dri: "8.5 ~ 11mg", composition: "글루콘산 아연 또는 산화 아연" },
            "실리마린": { info: "간 세포 재생을 돕고 독소로부터 간을 보호합니다.", dri: "130mg", composition: "밀크씨슬 추출물 유효 성분" },
            "포스파티딜세린": { info: "뇌 세포막의 구성 성분으로 인지 능력 개선에 도움을 줍니다.", dri: "300mg", composition: "대두 추출 인지질 (기억력 및 집중력 강화)" },
            "철분": { info: "체내 산소 운반과 혈액 생성에 핵심적인 역할을 합니다.", dri: "12 ~ 14mg (남성), 18mg (여성)", composition: "헴철(동물성) 또는 비헴철(식물성)" },
            "칼슘": { info: "뼈와 치아 형성에 필수적이며 신경 기능을 조절합니다.", dri: "700 ~ 800mg", composition: "해조칼슘 또는 구연산칼슘 (흡수율 고려)" },
            "코엔자임 Q10": { info: "세포 내 에너지 생성을 돕고 항산화 작용을 합니다.", dri: "100mg", composition: "유비퀴논 (에너지 생성 및 혈압 감소)" },
            "지아잔틴": { info: "황반 중심부의 밀도를 유지하여 시력을 보호합니다.", dri: "2 ~ 4mg (루테인과 5:1 비율 권장)", composition: "눈 건강 정밀 케어 성분" },
            "글루타치온": { info: "강력한 항산화제로 체내 해독 및 미백을 돕습니다.", dri: "250 ~ 500mg", composition: "L-글루타치온 효모 추출물" },
            "유산균": { info: "장내 유익균 증식을 돕고 면역력의 70%를 담당합니다.", dri: "1억 ~ 100억 CFU (보장균수 확인)", composition: "프로바이오틱스 (복합 균주 설계)" },
            "MSM": { info: "관절 및 연골 건강에 도움을 주는 유기 유황 성분입니다.", dri: "1,500 ~ 2,000mg", composition: "디메틸설폰 (식이유황)" },
            "테아닌": { info: "스트레스로 인한 긴장 완화에 도움을 줍니다.", dri: "200 ~ 250mg", composition: "녹차 추출 아미노산 성분" },
            "셀레늄": { info: "유해산소로부터 세포를 보호하는 항산화 미네랄입니다.", dri: "55μg", composition: "건조효모 유래 유기셀레늄" },
            "베타카로틴": { info: "체내에서 비타민 A로 전환되어 시력과 피부를 보호합니다.", dri: "1.26mg RE", composition: "식물성 비타민 A 전구체" },
            "망간": { info: "뼈 형성과 에너지 이용, 유해산소 차단에 필요합니다.", dri: "3.0 ~ 4.0mg", composition: "필수 미량 미네랄" },
            "엽산": { info: "세포와 혈액 생성, 태아 신경관 발달에 필수적입니다.", dri: "400μg (임신 준비 시 800μg)", composition: "비타민 B9" },
            "홍삼": { info: "면역력 증진, 피로 개선, 혈행 흐름을 돕습니다.", dri: "진세노사이드 Rg1+Rb1+Rg3 합계 3 ~ 80mg", composition: "사포닌 복합체" }
        };
        return details[n] || { info: "임상적으로 검증된 프리미엄 건강 성분입니다.", dri: "별도 상담 권장", composition: "천연 유래 고기능성 성분" };
    }

    function displayPremiumReport(report) {
        aiResultContent.innerHTML = `
            <div class="luxury-report-card">
                <div class="report-header">
                    <div class="report-badge" data-ko="최적화된 영양 설계 완료" data-en="Optimal Nutrition Design Ready">최적화된 영양 설계 완료</div>
                    <h2 style="font-size: 2.2rem; font-weight: 900; margin-bottom: 10px;">${report.title}</h2>
                    <p style="color: var(--text-muted);" data-ko="인공지능이 제안하는 당신을 위한 최적의 영양 조합입니다." data-en="AI-driven nutrient combination tailored for you.">인공지능이 제안하는 당신을 위한 최적의 영양 조합입니다.</p>
                </div>
                <div class="nutrient-focus-grid" style="padding: 40px;">
                    ${report.nutrients.map(n => `
                        <div class="focus-item" style="border: 1px solid var(--border-color); background: var(--bg-color); padding: 25px; border-radius: 24px;">
                            <h4 class="focus-name" style="font-size: 1.3rem; color: var(--primary-color); border-bottom: 2px solid var(--accent-color); display: inline-block; margin-bottom: 15px;">${n.name}</h4>
                            <p class="focus-info" style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">${n.info}</p>
                            <div style="background: white; padding: 15px; border-radius: 12px; font-size: 0.85rem;">
                                <div style="margin-bottom: 5px;"><strong style="color: var(--accent-color);"><i class="fas fa-check-circle"></i> 일일 권장 함량:</strong> ${n.dri}</div>
                                <div><strong style="color: var(--primary-color);"><i class="fas fa-info-circle"></i> 주요 성분 구성:</strong> ${n.composition}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="report-footer-grid" style="border-top: 1px solid var(--border-color); display: grid; grid-template-columns: 1fr 1fr;">
                    <div class="footer-box" style="padding: 30px; border-right: 1px solid var(--border-color);">
                        <label style="font-size: 0.75rem; font-weight: 900; color: var(--text-muted); display: block; margin-bottom: 10px;" data-ko="LIFESTYLE GUIDE" data-en="LIFESTYLE GUIDE">LIFESTYLE GUIDE</label>
                        <p style="font-size: 0.95rem; font-weight: 600;">${report.lifestyle}</p>
                    </div>
                    <div class="footer-box" style="padding: 30px;">
                        <label style="font-size: 0.75rem; font-weight: 900; color: #f59e0b; display: block; margin-bottom: 10px;" data-ko="CAUTION" data-en="CAUTION">CAUTION</label>
                        <p style="font-size: 0.9rem; color: #475569;">${report.caution}</p>
                    </div>
                </div>
                <div style="padding: 30px; text-align: center; background: #f8fafc;">
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;" data-ko="* 위 분석 결과는 일반적인 건강 정보를 바탕으로 하며, 개인의 체질과 상태에 따라 다를 수 있습니다." data-en="* The analysis is based on general health data and may vary by individual.">* 위 분석 결과는 일반적인 건강 정보를 바탕으로 하며, 개인의 체질과 상태에 따라 다를 수 있습니다.</p>
                    <button onclick="location.reload()" class="luxury-btn" style="max-width: 300px; margin-top: 0;" data-ko="분석 다시하기" data-en="Re-analyze">분석 다시하기</button>
                </div>
            </div>
        `;
    }

    // 4. Search Functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
    }

    window.quickSearch = function(q) {
        if (searchInput) {
            searchInput.value = q;
            performSearch();
        }
    };

    function performSearch() {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) return;
        const filtered = drugData.filter(d => 
            d.name.toLowerCase().includes(q) || 
            d.ingredients.toLowerCase().includes(q) ||
            d.efficacy.toLowerCase().includes(q)
        );
        renderSearchResults(filtered);
    }

    function renderSearchResults(results) {
        if (!drugListElement) return;
        drugListElement.innerHTML = results.length ? '' : '<p style="grid-column:1/-1; text-align:center; padding:40px;">검색 결과가 없습니다.</p>';
        results.forEach(d => {
            const card = document.createElement('div');
            card.className = 'drug-card';
            card.innerHTML = `
                <div class="card-category ${d.category==='전문의약품'?'pro':'general'}">${d.category}</div>
                <h3 class="card-name">${d.name}</h3>
                <p style="font-size:0.85rem; color:#64748b;">${d.manufacturer}</p>
                <div class="card-efficacy" style="margin-top:10px; font-size:0.9rem; color:#475569;">${d.efficacy.substring(0,60)}...</div>
            `;
            card.onclick = () => showDetail(d.id);
            drugListElement.appendChild(card);
        });
        drugListElement.scrollIntoView({ behavior: 'smooth' });
    }

    window.showDetail = function(id) {
        const d = drugData.find(x => x.id === id);
        if (!d || !modal) return;
        modalContent.innerHTML = `
            <div class="detail-header">
                <span class="detail-category ${d.category==='전문의약품'?'pro':'general'}">${d.category}</span>
                <h2 style="margin-top:15px;">${d.name}</h2>
                <p>${d.manufacturer}</p>
            </div>
            <div style="margin-top:30px; display:grid; gap:20px;">
                <p><strong>주요 성분:</strong> ${d.ingredients}</p>
                <p><strong>효능 효과:</strong> ${d.efficacy}</p>
                <div style="background:#f8fafc; padding:20px; border-radius:15px;">${d.description}</div>
            </div>
        `;
        modal.style.display = 'block';
    };

    if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
});