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

    // 1. Data Loading with Status
    function loadData() {
        fetch('drugs.json')
            .then(r => {
                if (!r.ok) throw new Error('Data load failed');
                return r.json();
            })
            .then(data => {
                drugData = data;
                console.log('Medical database loaded:', drugData.length, 'items');
            })
            .catch(err => {
                console.error('Fetch error:', err);
                if (drugListElement) drugListElement.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:red;">데이터베이스를 불러오지 못했습니다. 새로고침을 시도해 주세요.</p>';
            });
    }
    loadData();

    // 2. Gender Selection
    window.setGender = function(gender) {
        userGender = gender;
        document.getElementById('gender-male').classList.toggle('active', gender === 'male');
        document.getElementById('gender-female').classList.toggle('active', gender === 'female');
    };

    // 3. AI Analysis Report Logic
    window.analyzeNutrition = function() {
        const age = document.getElementById('age-range').value;
        const concern = document.getElementById('health-concern').value;
        
        if (aiResultSection) {
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
            }, 1200);
        }
    };

    function generateHyperPersonalizedReport(gender, age, concern) {
        const baseData = {
            fatigue: { name: "에너지 대사 및 활력", icon: "fa-bolt" },
            eye: { name: "시각 기능 및 안구 보호", icon: "fa-eye" },
            immune: { name: "면역 방어 체계", icon: "fa-shield-virus" },
            bone: { name: "골격계 및 관절 구조", icon: "fa-bone" },
            liver: { name: "간 대사 및 해독 가동", icon: "fa-flask-vial" },
            brain: { name: "인지 기제 및 뇌 혈류", icon: "fa-brain" }
        };

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
        const detailedNutrients = recommendedNames.map(name => getNutrientDetails(name));

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

    function getNutrientDetails(name) {
        const data = {
            "비타민 B군": "에너지 대사 효율을 극대화하여 무기력증을 개선하고 세포 활력을 높입니다.",
            "L-아르기닌": "혈관 확장 작용을 통해 혈행을 개선하고 신체 전반의 에너지 전달을 돕습니다.",
            "마그네슘": "신경 안정과 근육 이완에 필수적이며, 스트레스 완화 및 수면 질 개선에 효과적입니다.",
            "루테인": "눈의 황반 밀도를 유지하여 노화로 인한 시력 감퇴를 방지하고 블루라이트를 차단합니다.",
            "오메가3": "혈중 중성지질 개선과 눈의 건조함 해결, 뇌 세포 활성화에 탁월한 필수 지방산입니다.",
            "비타민 D": "칼슘 흡수를 도와 뼈 건강을 지키며, 면역 세포의 활성화를 돕는 핵심 비타민입니다.",
            "실리마린": "간 세포의 파괴를 방지하고 독소로부터 간을 보호하여 피로 회복을 돕습니다.",
            "철분": "혈액 내 산소 운반을 담당하여 빈혈 예방과 근육 대사에 기여합니다.",
            "포스파티딜세린": "뇌 세포막의 구성 성분으로 기억력 개선 및 인지 기능 강화에 도움을 줍니다.",
            "칼슘": "치아와 뼈의 구성 성분이며 신경 전달 및 근육 수축·이완 조절에 관여합니다.",
            "비타민 K2": "칼슘이 뼈에 잘 정착되도록 가이드하여 혈관 석회화를 방지하고 골밀도를 높입니다.",
            "MSM": "관절 연골의 염증을 줄이고 통증을 완화하여 유연한 움직임을 지원합니다.",
            "아연": "정상적인 면역 기능과 세포 분열에 필수적인 미네랄입니다.",
            "홍삼": "면역력 증진 및 피로 개선, 혈소판 응집 억제를 통한 혈액 흐름에 도움을 줍니다."
        };
        return { name, info: data[name] || "검증된 기능성 성분으로 신체 밸런스 유지에 도움을 줍니다." };
    }

    function getAgeText(age) {
        const map = { teen: "청소년", young: "청년", middle: "중년", senior: "노년" };
        return map[age];
    }

    function getPersonalizedDesc(gender, age, concern) {
        if (age === 'senior') return "신체 기능 저하를 고려하여 흡수율과 세포 보호에 집중한 고품격 설계입니다.";
        if (age === 'teen') return "성장기 두뇌 발달과 신체 균형을 동시에 고려한 필수 영양 설계입니다.";
        return "현대인의 라이프스타일에서 결핍되기 쉬운 핵심 성분을 임상 데이터를 근거로 선정했습니다.";
    }

    function getLifestyleTip(age, concern) {
        if (concern === 'eye') return "PC 사용 50분마다 10분간 휴식하며 먼 곳을 바라보는 습관을 기르세요.";
        return "추천 성분의 흡수율을 높이기 위해 매일 정해진 시간에 규칙적으로 복용하는 것이 좋습니다.";
    }

    function getCaution(age, concern) {
        return "특이 체질이나 복용 중인 질환 약물이 있다면 반드시 전문의와 상담 후 섭취하세요.";
    }

    function displayPremiumReport(report) {
        if (aiResultContent) {
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
                                <button onclick="quickSearch('${n.name.split(' ')[0]}')" class="focus-search-btn">데이터 확인 →</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="report-footer-grid">
                        <div class="footer-box"><label>전문가 조언</label><p>${report.lifestyle}</p></div>
                        <div class="footer-box caution"><label>주의사항</label><p>${report.caution}</p></div>
                    </div>
                    <div class="medical-disclaimer">본 분석 리포트는 참고용이며 실제 진단은 의료기관을 방문하시기 바랍니다.</div>
                </div>
            `;
        }
    }

    // 4. Enhanced Search Engine Logic
    if (searchBtn && searchInput) {
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
        if (!q) {
            alert('검색어를 입력해 주세요.');
            return;
        }

        if (drugData.length === 0) {
            console.log('Data not yet loaded, retrying search...');
            setTimeout(performSearch, 500);
            return;
        }

        // 검색 범위를 효능(efficacy)과 상세 설명(description)까지 확장
        const filtered = drugData.filter(d => 
            d.name.toLowerCase().includes(q) || 
            d.ingredients.toLowerCase().includes(q) ||
            d.efficacy.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q)
        );

        renderResults(filtered);
    }

    function renderResults(results) {
        if (!drugListElement) return;
        
        drugListElement.innerHTML = results.length ? '' : `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; background: #f8fafc; border-radius: 20px; border: 1px dashed #cbd5e1;">
                <i class="fas fa-search-minus" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 20px; display: block;"></i>
                <h3 style="color: #1e293b;">검색 결과가 없습니다</h3>
                <p style="color: #64748b; margin-top: 10px;">다른 키워드(예: 혈압, 비타민, 당뇨)로 검색해 보세요.</p>
            </div>
        `;

        results.forEach(d => {
            const card = document.createElement('div');
            card.className = 'drug-card';
            card.innerHTML = `
                <div class="card-category ${d.category === '전문의약품' ? 'pro' : 'general'}">${d.category}</div>
                <h3 class="card-name">${d.name}</h3>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 10px;">${d.manufacturer}</p>
                <div class="card-efficacy" style="font-size: 0.9rem; line-height: 1.5; color: #475569;">${d.efficacy.substring(0, 60)}...</div>
                <button class="detail-btn" style="margin-top: 20px; width: 100%; padding: 10px; background: #f1f5f9; border: none; border-radius: 8px; font-weight: 700; color: #0f172a; cursor: pointer;">상세 정보</button>
            `;
            card.onclick = () => showDetail(d.id);
            drugListElement.appendChild(card);
        });
        
        if (results.length > 0) {
            drugListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    window.showDetail = function(id) {
        const d = drugData.find(x => x.id === id);
        if (!d || !modal || !modalContent) return;
        modalContent.innerHTML = `
            <div class="detail-header">
                <span class="detail-category ${d.category === '전문의약품' ? 'pro' : 'general'}">${d.category}</span>
                <h2 style="margin-top:15px; font-size: 1.8rem; color: #0f172a;">${d.name}</h2>
                <p style="color: #64748b; font-weight: 600;">${d.manufacturer}</p>
            </div>
            <div class="detail-body" style="margin-top: 30px; display: grid; gap: 20px;">
                <p><strong><i class="fas fa-flask"></i> 주요 성분:</strong> ${d.ingredients}</p>
                <p><strong><i class="fas fa-check-circle"></i> 주요 효능:</strong> ${d.efficacy}</p>
                <p><strong><i class="fas fa-directions"></i> 용법 용량:</strong> ${d.usage}</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; line-height: 1.7; font-size: 0.95rem; color: #475569;">
                    <strong>상세 설명:</strong><br>${d.description}
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
    
    window.onclick = (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
});