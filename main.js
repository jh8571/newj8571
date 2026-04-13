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
                <p style="margin-top:20px; color: #64748b;">분석 데이터를 생성 중입니다...</p>
            </div>
        `;

        setTimeout(() => {
            const report = generateHyperPersonalizedReport(userGender, age, concern);
            displayPremiumReport(report);
            aiResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1000);
    };

    function generateHyperPersonalizedReport(gender, age, concern) {
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

        const resNames = nutrientMap[gender][age][concern];
        const detailedNutrients = resNames.map(n => ({
            name: n,
            info: getNutrientInfo(n)
        }));

        return {
            title: `${gender==='male'?'남성':'여성'} 맞춤형 분석 리포트`,
            nutrients: detailedNutrients,
            lifestyle: "규칙적인 수면과 하루 2L 이상의 수분 섭취는 영양소의 흡수를 돕습니다.",
            caution: "만성 질환이 있거나 약물을 복용 중인 경우 전문의와 상의하십시오."
        };
    }

    function getNutrientInfo(n) {
        const info = {
            "비타민 B군": "에너지 대사를 활성화하여 무기력증을 개선합니다.",
            "L-아르기닌": "혈행 개선을 통해 활력을 높이고 운동 효율을 증대시킵니다.",
            "마그네슘": "신경 안정과 근육 이완을 도와 스트레스 완화에 기여합니다.",
            "오메가3": "건조한 눈 개선과 혈중 중성지질 완화에 효과적입니다.",
            "루테인": "황반 색소 밀도를 유지하여 시력 보호에 필수적입니다."
        };
        return info[n] || "임상적으로 검증된 고기능성 건강 성분입니다.";
    }

    function displayPremiumReport(report) {
        aiResultContent.innerHTML = `
            <div class="luxury-report-card">
                <div class="report-header">
                    <div class="report-badge">Analysis Completed</div>
                    <h2>${report.title}</h2>
                </div>
                <div class="nutrient-focus-grid">
                    ${report.nutrients.map(n => `
                        <div class="focus-item">
                            <h4 class="focus-name">${n.name}</h4>
                            <p class="focus-info">${n.info}</p>
                            <button onclick="quickSearch('${n.name.split(' ')[0]}')" class="focus-search-btn">자세히 보기 →</button>
                        </div>
                    `).join('')}
                </div>
                <div class="report-footer-grid">
                    <div class="footer-box"><label>전문가 가이드</label><p>${report.lifestyle}</p></div>
                    <div class="footer-box caution"><label>주의사항</label><p>${report.caution}</p></div>
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