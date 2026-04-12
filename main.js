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

    // Data Loading
    fetch('drugs.json')
        .then(response => response.json())
        .then(data => {
            drugData = data;
        })
        .catch(error => console.error('Error loading data:', error));

    // Gender Selection
    window.setGender = function(gender) {
        userGender = gender;
        document.getElementById('gender-male').classList.toggle('active', gender === 'male');
        document.getElementById('gender-female').classList.toggle('active', gender === 'female');
    };

    // AI Analysis Logic
    window.analyzeNutrition = function() {
        const age = document.getElementById('age-range').value;
        const concern = document.getElementById('health-concern').value;
        
        aiResultSection.style.display = 'block';
        aiResultContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #004e92;"></i><p style="margin-top:15px;">AI가 당신의 데이터를 분석 중입니다...</p></div>';

        // Simulate AI Processing Delay
        setTimeout(() => {
            const recommendations = getRecommendations(userGender, age, concern);
            displayAIResults(recommendations);
            aiResultSection.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    };

    function getRecommendations(gender, age, concern) {
        const database = {
            fatigue: {
                title: "피로 회복 및 활력 패키지",
                nutrients: ["비타민 B12", "마그네슘", "L-아르기닌"],
                desc: "만성 피로는 에너지 대사 저하에서 옵니다. 고함량 비타민 B군과 에너지 생성을 돕는 아미노산 조합을 추천합니다."
            },
            eye: {
                title: "시력 보호 및 안구 건조 케어",
                nutrients: ["루테인", "지아잔틴", "오메가3"],
                desc: "황반 색소 밀도를 유지하고 눈물 층의 안정성을 높여 디지털 기기 사용으로 인한 피로를 줄여줍니다."
            },
            immune: {
                title: "면역 체계 강화 솔루션",
                nutrients: ["아연", "비타민 D", "프로폴리스"],
                desc: "면역 세포의 활성화를 돕는 미네랄과 비타민 조합으로 외부 바이러스에 대한 방어력을 높입니다."
            },
            bone: {
                title: "관절 및 뼈 건강 가이드",
                nutrients: ["칼슘", "비타민 K2", "MSM"],
                desc: "골밀도 유지와 연골 건강을 위한 필수 성분입니다. 비타민 K2는 칼슘이 뼈로 잘 흡수되도록 돕습니다."
            },
            liver: {
                title: "간 해독 및 기능 개선",
                nutrients: ["밀크씨슬(실리마린)", "헛개나무추출물", "글루타치온"],
                desc: "손상된 간 세포의 재생을 돕고 체내 독소 배출을 원활하게 하여 활기찬 아침을 지원합니다."
            },
            brain: {
                title: "인지 기능 및 기억력 증진",
                nutrients: ["포스파티딜세린", "은행잎추출물", "DHA"],
                desc: "뇌 세포막의 건강을 유지하고 혈행을 개선하여 집중력과 기억력 향상에 도움을 줍니다."
            }
        };

        return database[concern] || database.fatigue;
    }

    function displayAIResults(rec) {
        aiResultContent.innerHTML = `
            <div class="result-card-large" style="grid-column: 1/-1; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 25px;">
                    <div style="width: 60px; height: 60px; background: #004e92; color: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        <i class="fas fa-file-medical-alt"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 1.4rem; color: #0f172a;">${rec.title}</h4>
                        <p style="color: #64748b;">분석 결과, 현재 당신에게 가장 필요한 핵심 조합입니다.</p>
                    </div>
                </div>
                <p style="line-height: 1.8; color: #475569; margin-bottom: 30px; font-size: 1.05rem; padding: 20px; background: #f8fafc; border-radius: 15px;">${rec.desc}</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    ${rec.nutrients.map(n => `
                        <div style="padding: 20px; border: 2px solid #f1f5f9; border-radius: 16px; text-align: center;">
                            <div style="color: #004e92; font-size: 1.2rem; font-weight: 800; margin-bottom: 10px;">${n}</div>
                            <button onclick="quickSearch('${n}')" style="background: none; border: none; color: #64748b; font-size: 0.85rem; cursor: pointer; text-decoration: underline;">상세 정보 검색</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Integrated Search Logic
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    window.quickSearch = function(query) {
        if (searchInput) {
            searchInput.value = query;
            performSearch();
        }
    };

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;

        const filtered = drugData.filter(d => 
            d.name.toLowerCase().includes(query) || 
            d.ingredients.toLowerCase().includes(query) ||
            d.efficacy.toLowerCase().includes(query)
        );

        renderResults(filtered);
    }

    function renderResults(results) {
        drugListElement.innerHTML = '';
        if (results.length === 0) {
            drugListElement.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">검색 결과가 없습니다. 다른 성분명을 입력해 보세요.</p>';
            return;
        }

        results.forEach(drug => {
            const card = document.createElement('div');
            card.className = 'drug-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="card-category ${drug.category === '전문의약품' ? 'pro' : 'general'}">${drug.category}</div>
                <h3 class="card-name">${drug.name}</h3>
                <p class="card-manufacturer">${drug.manufacturer}</p>
                <div class="card-efficacy">${drug.efficacy.substring(0, 60)}${drug.efficacy.length > 60 ? '...' : ''}</div>
                <button class="detail-btn" style="margin-top: 15px; width: 100%; padding: 10px; background: #f1f5f9; border: none; border-radius: 8px; font-weight: 600; color: #475569;">상세 보기</button>
            `;
            card.onclick = () => showDetail(drug.id);
            drugListElement.appendChild(card);
        });
        drugListElement.scrollIntoView({ behavior: 'smooth' });
    }

    window.showDetail = function(id) {
        const drug = drugData.find(d => d.id === id);
        if (!drug) return;

        modalContent.innerHTML = `
            <div class="detail-header">
                <span class="detail-category ${drug.category === '전문의약품' ? 'pro' : 'general'}">${drug.category}</span>
                <h2 style="margin-top:15px; font-size: 1.8rem; color: #000428;">${drug.name}</h2>
                <p style="color: #64748b; font-weight: 600;">${drug.manufacturer}</p>
            </div>
            <div class="detail-grid" style="margin-top: 30px; display: grid; gap: 20px;">
                <div><strong><i class="fas fa-flask"></i> 주요 성분:</strong> ${drug.ingredients}</div>
                <div><strong><i class="fas fa-check-circle"></i> 주요 효능:</strong> ${drug.efficacy}</div>
                <div><strong><i class="fas fa-directions"></i> 복용법:</strong> ${drug.usage}</div>
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; font-size: 0.95rem; line-height: 1.6;">
                    <strong>상세 설명:</strong> ${drug.description}
                </div>
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
});