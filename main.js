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

    // Gender Selection with Visual Feedback
    window.setGender = function(gender) {
        userGender = gender;
        const maleBtn = document.getElementById('gender-male');
        const femaleBtn = document.getElementById('gender-female');
        
        if (gender === 'male') {
            maleBtn.classList.add('active');
            femaleBtn.classList.remove('active');
        } else {
            femaleBtn.classList.add('active');
            maleBtn.classList.remove('active');
        }
    };

    // AI Analysis Logic - Enhanced for Premium Content
    window.analyzeNutrition = function() {
        const age = document.getElementById('age-range').value;
        const concern = document.getElementById('health-concern').value;
        
        aiResultSection.style.display = 'block';
        aiResultContent.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid #004e92; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="font-weight: 600; color: #475569;">당신의 신체 데이터를 바탕으로 최적의 영양 밸런스를 계산 중입니다...</p>
            </div>
        `;

        setTimeout(() => {
            const recommendations = getDetailedRecommendations(userGender, age, concern);
            displayAIResults(recommendations);
            aiResultSection.scrollIntoView({ behavior: 'smooth' });
        }, 1200);
    };

    function getDetailedRecommendations(gender, age, concern) {
        const database = {
            fatigue: {
                title: "에너지 부스팅 및 만성피로 회복",
                mainNutrients: [
                    { name: "고함량 비타민 B군", reason: "에너지 대사 효율을 극대화하여 무기력증을 개선합니다." },
                    { name: "L-아르기닌", reason: "혈행 개선을 통해 근육과 장기에 산소 공급을 원활히 합니다." },
                    { name: "마그네슘", reason: "근육 긴장을 완화하고 신경계를 안정시켜 에너지 소모를 줄입니다." }
                ],
                lifestyle: "주 3회 30분 이상의 유산소 운동과 정해진 시간에 기상하는 습관이 필수적입니다.",
                diet: "시금치, 아몬드, 돼지고기(안심) 등 티아민과 마그네슘이 풍부한 식단을 권장합니다.",
                caution: "신장 기능이 저하된 경우 고용량 마그네슘 섭취 전 전문의와 상담하십시오."
            },
            eye: {
                title: "디지털 피로 해소 및 시력 보호",
                mainNutrients: [
                    { name: "루테인 & 지아잔틴", reason: "황반 색소 밀도를 유지하여 블루라이트로부터 눈을 보호합니다." },
                    { name: "오메가3 (EPA/DHA)", reason: "눈물 층의 수분 유지를 도와 안구 건조증을 근본적으로 개선합니다." },
                    { name: "비타민 A", reason: "어두운 곳에서의 시각 적응을 돕고 점막 건강을 유지합니다." }
                ],
                lifestyle: "20분 화면 작업 후 20초간 6미터 먼 곳을 바라보는 '20-20-20' 규칙을 실천하세요.",
                diet: "당근, 블루베리, 연어와 같이 비타민A와 오메가3가 풍부한 식품을 섭취하세요.",
                caution: "흡연자의 경우 루테인 고용량 장기 복용 시 주의가 필요합니다."
            },
            immune: {
                title: "면역 체계 강화 및 항바이러스 솔루션",
                mainNutrients: [
                    { name: "비타민 D3", reason: "면역 세포의 활성화를 돕는 '면역 스위치' 역할을 수행합니다." },
                    { name: "아연", reason: "정상적인 세포 분열과 면역 기능에 필수적인 미네랄입니다." },
                    { name: "프로폴리스", reason: "천연 플라보노이드 성분이 유해 세균으로부터 신체를 방어합니다." }
                ],
                lifestyle: "하루 15분 햇볕 쬐기와 충분한 수면(7시간 이상)은 비타민D 합성과 면역력에 결정적입니다.",
                diet: "버섯, 굴, 브로콜리 등 아연과 비타민이 풍부한 식단이 좋습니다.",
                caution: "알레르기 체질인 경우 프로폴리스 섭취 전 소량 테스트를 권장합니다."
            },
            bone: {
                title: "골밀도 강화 및 관절 유연성 케어",
                mainNutrients: [
                    { name: "칼슘 & 비타민 K2", reason: "비타민 K2는 칼슘이 혈관이 아닌 뼈로 정확히 흡수되도록 돕습니다." },
                    { name: "MSM (식이유황)", reason: "관절 연골의 염증을 완화하고 통증 감소에 도움을 줍니다." },
                    { name: "비타민 D", reason: "장내 칼슘 흡수율을 높여 골다공증 예방에 기여합니다." }
                ],
                lifestyle: "뼈에 가벼운 체중 부하를 주는 걷기나 근력 운동을 병행하는 것이 효과적입니다.",
                diet: "멸치, 우유, 두부, 청경채 등 칼슘 함량이 높은 음식을 자주 섭취하세요.",
                caution: "칼슘제는 철분제와 함께 복용 시 흡수율이 떨어지므로 시간을 두어야 합니다."
            },
            liver: {
                title: "간 해독 기능 및 피로 물질 제거",
                mainNutrients: [
                    { name: "밀크씨슬 (실리마린)", reason: "간 세포의 파괴를 막고 재생을 돕는 강력한 항산화제입니다." },
                    { name: "글루타치온", reason: "체내 독소 제거와 간의 해독 대사 과정에 필수적인 성분입니다." },
                    { name: "헛개나무 추출물", reason: "알코올 분해 효소 활성을 도와 숙면과 간 기능 회복을 지원합니다." }
                ],
                lifestyle: "과도한 당분 섭취를 줄이고 규칙적인 식사를 통해 비알코올성 지방간을 예방하세요.",
                diet: "부추, 마늘, 비트와 같이 간 해독을 돕는 식재료를 적극 활용하세요.",
                caution: "담도 폐쇄증이 있는 경우 실리마린 섭취를 피해야 합니다."
            },
            brain: {
                title: "두뇌 활력 및 인지 기능 강화",
                mainNutrients: [
                    { name: "포스파티딜세린", reason: "뇌 세포막의 구성 성분으로 기억력 감퇴를 예방하고 집중력을 높입니다." },
                    { name: "은행잎 추출물", reason: "뇌 혈류를 개선하여 산소와 영양분이 뇌 세포에 잘 전달되게 합니다." },
                    { name: "DHA", reason: "뇌 신경 조직의 주요 성분으로 정보 전달 능력을 원활하게 합니다." }
                ],
                lifestyle: "독서나 퀴즈 풀이 등 지속적인 두뇌 자극 활동과 유산소 운동을 병행하세요.",
                diet: "등푸른 생선, 견과류, 계란 노른자(레시틴) 등이 두뇌 건강에 좋습니다.",
                caution: "혈액 응고 저해제 복용 시 은행잎 추출물 섭취 전 의사와 상의하세요."
            }
        };

        return database[concern] || database.fatigue;
    }

    function displayAIResults(rec) {
        aiResultContent.innerHTML = `
            <div class="premium-report" style="grid-column: 1/-1; background: white; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0;">
                <div style="background: #004e92; color: white; padding: 40px; text-align: center;">
                    <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 50px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Personalized Analysis Report</span>
                    <h2 style="font-size: 2rem; margin-top: 15px; color: white;">${rec.title}</h2>
                </div>
                
                <div style="padding: 40px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 40px;">
                        ${rec.mainNutrients.map(n => `
                            <div style="background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #f1f5f9; transition: 0.3s hover;">
                                <div style="color: #004e92; font-size: 1.25rem; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-check-circle"></i> ${n.name}
                                </div>
                                <p style="font-size: 0.95rem; color: #475569; line-height: 1.6;">${n.reason}</p>
                                <button onclick="quickSearch('${n.name.split(' ')[0]}')" style="margin-top: 15px; background: none; border: none; color: #004e92; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-decoration: underline;">성분 정보 자세히 보기</button>
                            </div>
                        `).join('')}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; border-top: 1px solid #f1f5f9; padding-top: 40px;">
                        <div>
                            <h4 style="color: #0f172a; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;"><i class="fas fa-lightbulb" style="color: #f59e0b;"></i> 생활 습관 가이드</h4>
                            <p style="font-size: 1rem; color: #475569; line-height: 1.8;">${rec.lifestyle}</p>
                        </div>
                        <div>
                            <h4 style="color: #0f172a; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;"><i class="fas fa-utensils" style="color: #10b981;"></i> 추천 식단</h4>
                            <p style="font-size: 1rem; color: #475569; line-height: 1.8;">${rec.diet}</p>
                        </div>
                    </div>

                    <div style="margin-top: 40px; background: #fff7ed; padding: 25px; border-radius: 20px; border: 1px solid #ffedd5;">
                        <h4 style="color: #9a3412; margin-bottom: 10px; font-size: 1rem;"><i class="fas fa-exclamation-triangle"></i> 복용 시 주의사항</h4>
                        <p style="font-size: 0.95rem; color: #9a3412; line-height: 1.7;">${rec.caution}</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px dashed #e2e8f0; text-align: center;">
                        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6;">
                            <strong>의학적 면책 조항:</strong> 본 AI 분석 결과는 정보 제공만을 목적으로 하며, 전문적인 의학적 진단이나 치료를 대신할 수 없습니다. 
                            새로운 영양제 섭취를 시작하기 전 반드시 의사나 약사와 상담하십시오.
                        </p>
                    </div>
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