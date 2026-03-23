const drugData = [
    {
        id: 1,
        name: "아모디핀정 (암로디핀캄실산염)",
        category: "전문의약품",
        manufacturer: "한미약품",
        ingredients: "암로디핀캄실산염 7.84mg",
        efficacy: "고혈압, 관상동맥의 고정폐쇄쇄성 질환(안정형협심증) 또는 혈관경련성 질환(이형협심증)에 의한 심근성 허혈증",
        usage: "성인: 1일 1회 5mg을 경구투여하며 환자의 반응에 따라 1일 최대 10mg까지 증량할 수 있다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "643500200",
        description: "칼슘채널차단제로 혈관을 확장시켜 혈압을 낮추고 심장의 부담을 덜어주는 약물입니다."
    },
    {
        id: 2,
        name: "글루코파지정 (메트포르민염산염)",
        category: "전문의약품",
        manufacturer: "머크/대웅제약",
        ingredients: "메트포르민염산염 500mg",
        efficacy: "식이요법 및 운동요법을 통해 혈당 조절이 충분치 않은 제2형 당뇨병 환자의 치료",
        usage: "통상 초회용량으로 1회 500mg을 1일 2회 식사와 함께 투여한다.",
        storage: "밀폐용기, 실온(1~30℃)보관",
        insuranceCode: "640000300",
        description: "간에서 당 생성을 억제하고 근육에서 당 이용을 촉진하여 혈당을 조절합니다."
    },
    {
        id: 3,
        name: "리피토정 10mg (아토르바스타틴)",
        category: "전문의약품",
        manufacturer: "한국화이자제약",
        ingredients: "아토르바스타틴칼슘삼수화물 10.85mg",
        efficacy: "고콜레스테롤혈증 및 혼합형 이상지질혈증의 치료",
        usage: "1일 1회 10mg으로 시작하여 필요시 4주 이상의 간격을 두고 증량한다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "648900030",
        description: "스타틴 계열의 약물로 콜레스테롤 합성을 억제하여 혈중 지질 수치를 개선합니다."
    },
    {
        id: 4,
        name: "타이레놀정 500mg (아세트아미노펜)",
        category: "일반의약품",
        manufacturer: "한국존슨앤드존슨",
        ingredients: "아세트아미노펜 500mg",
        efficacy: "해열 및 감기에 의한 통증, 두통, 치통, 근육통, 허리통증, 생리통, 관절통의 완화",
        usage: "만 12세 이상 소아 및 성인: 1회 1~2정씩 1일 3~4회 (4~6시간 간격) 필요시 복용한다. (1일 최대 4g)",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "648500030",
        description: "가장 널리 쓰이는 해열진통제로 위장 장애가 적어 공복에도 복용이 가능합니다."
    },
    {
        id: 5,
        name: "게보린정",
        category: "일반의약품",
        manufacturer: "삼진제약",
        ingredients: "아세트아미노펜 300mg, 이소프로필안티피린 150mg, 카페인무수물 50mg",
        efficacy: "두통, 치통, 발치후 통증, 인후통, 귀의 통증, 관절통, 신경통, 요통, 근육통, 견통, 타박통, 골절통, 염좌통, 월경통(생리통), 외상통의 진통. 오한, 발열시의 해열",
        usage: "성인 1회 1정, 1일 3회까지 공복(빈 속)을 피하여 복용한다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "647200010",
        description: "빠른 진통 효과로 유명한 복합 성분 진통제입니다."
    },
    {
        id: 6,
        name: "가스활명수-큐액",
        category: "일반의약품",
        manufacturer: "동화약품",
        ingredients: "육계, 건강, 아선약, 정향, 진피, 창출, 후박 등 11종의 생약 성분",
        efficacy: "식욕부진(식욕감퇴), 위부팽만감, 소화불량, 과식, 체함, 구역, 구토",
        usage: "성인: 1회 1병(75mL)을 1일 3회 식후에 복용한다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "-",
        description: "100년 넘는 역사를 가진 대한민국 대표 액상 소화제입니다."
    },
    {
        id: 7,
        name: "고려은단 비타민C 1000",
        category: "건강기능식품",
        manufacturer: "고려은단",
        ingredients: "비타민C 1000mg",
        efficacy: "결합조직 형성과 기능유지에 필요, 철의 흡수에 필요, 항산화 작용을 하여 유해산소로부터 세포를 보호하는데 필요",
        usage: "1일 1회, 1회 1정(1000mg)을 식사 후 물과 함께 섭취하십시오.",
        storage: "직사광선을 피하고 서늘한 곳에 보관",
        insuranceCode: "-",
        description: "영국산 비타민C 원료를 사용한 고함량 비타민C 제품입니다."
    },
    {
        id: 8,
        name: "정관장 홍삼정",
        category: "건강기능식품",
        manufacturer: "한국인삼공사",
        ingredients: "홍삼농축액(6년근, 고형분 64%) 100%",
        efficacy: "면역력 증진, 피로 개선, 혈소판 응집 억제를 통한 혈액 흐름, 기억력 개선, 항산화에 도움을 줄 수 있음",
        usage: "성인 1일 1회 3g을 온수 또는 냉수에 타서 섭취하거나 직접 섭취하십시오.",
        storage: "직사광선을 피하고 서늘한 곳에 보관 (개봉 후 냉장보관)",
        insuranceCode: "-",
        description: "6년근 홍삼을 최적의 조건으로 추출·농축하여 홍삼 본연의 맛과 향이 우수한 제품입니다."
    },
    {
        id: 9,
        name: "노르딕 내추럴스 얼티밋 오메가",
        category: "건강기능식품",
        manufacturer: "Nordic Naturals",
        ingredients: "정제어유(EPA 및 DHA 함유 유지)",
        efficacy: "혈중 중성지질 개선, 혈행 개선에 도움을 줄 수 있음, 건조한 눈을 개선하여 눈 건강에 도움을 줄 수 있음",
        usage: "1일 1회 2캡슐을 식사와 함께 섭취하십시오.",
        storage: "서늘하고 건조한 곳에 보관",
        insuranceCode: "-",
        description: "고농축 EPA/DHA가 함유된 프리미엄 오메가-3 제품입니다."
    },
    {
        id: 10,
        name: "판피린 큐 액",
        category: "일반의약품",
        manufacturer: "동아제약",
        ingredients: "아세트아미노펜 300mg, 클로르페니라민말레산염 2.5mg, dl-메틸에페드린염산염 20mg 등",
        efficacy: "감기의 제증상(콧물, 코막힘, 재채기, 인후통, 기침, 가래, 오한, 발열, 두통, 관절통, 근육통)의 완화",
        usage: "성인 1회 1병(20mL)을 1일 3회 식후 30분에 복용한다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "-",
        description: "초기 감기에 효과적인 액상 감기약입니다."
    },
    {
        id: 11,
        name: "잔탁정 (라니티딘)",
        category: "전문의약품",
        manufacturer: "글락소스미스크라인",
        ingredients: "라니티딘염산염 168mg",
        efficacy: "위·십이지장궤양, 역류성식도염, 졸링거-엘리슨 증후군",
        usage: "성인: 1회 150mg을 1일 2회(아침, 취침전) 경구투여한다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "642100010",
        description: "위산 분비를 억제하여 위궤양 및 식도염을 치료하는 약물입니다."
    },
    {
        id: 12,
        name: "노스카나겔",
        category: "일반의약품",
        manufacturer: "동아제약",
        ingredients: "헤파린나트륨 500IU, 알란토인 50mg, 덱스판테놀 100mg",
        efficacy: "상처 조직의 치료 후 처치(흉터 치료)",
        usage: "성인 및 2세 이상의 소아: 상처 및 주변 부위에 1일 수회 가볍게 마사지하며 바른다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "-",
        description: "여드름 흉터, 수술 흉터 등에 효과적인 흉터 치료제입니다."
    },
    {
        id: 13,
        name: "세노비스 트리플러스",
        category: "건강기능식품",
        manufacturer: "세노비스",
        ingredients: "멀티비타민, 미네랄, 오메가-3(EPA 및 DHA 함유 유지)",
        efficacy: "기초 영양 보충, 혈행 개선 및 눈 건강에 도움을 줄 수 있음",
        usage: "1일 1회, 1회 2캡슐을 충분한 물과 함께 섭취하십시오.",
        storage: "서늘하고 건조한 곳에 보관",
        insuranceCode: "-",
        description: "비타민, 미네랄, 오메가-3를 한 번에 섭취할 수 있는 올인원 제품입니다."
    },
    {
        id: 14,
        name: "베아제정",
        category: "일반의약품",
        manufacturer: "대웅제약",
        ingredients: "판크레아틴, 비오디아스타제2000, 리파제, 판프로신 등 복합 소화효소",
        efficacy: "소화불량, 식욕감퇴(식욕부진), 과식, 체함, 소화촉진, 제산, 위부팽만감",
        usage: "성인: 1회 1정, 1일 3회 식후에 복용한다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "641100010",
        description: "다양한 소화 효소가 배합되어 탄수화물, 단백질, 지방 소화를 돕는 소화제입니다."
    }
];

let currentCategory = '전체';
let searchQuery = '';

const drugListElement = document.getElementById('drug-list');
const categoryButtons = document.querySelectorAll('.cat-btn');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('drug-modal');
const modalContent = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');

// Initial Render
renderDrugs();

// Category Filtering
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.getAttribute('data-category');
        renderDrugs();
    });
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderDrugs();
});

function renderDrugs() {
    const filteredDrugs = drugData.filter(drug => {
        const matchesCategory = currentCategory === '전체' || drug.category === currentCategory;
        const matchesSearch = drug.name.toLowerCase().includes(searchQuery) || 
                            drug.manufacturer.toLowerCase().includes(searchQuery) ||
                            drug.ingredients.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    drugListElement.innerHTML = '';
    
    if (filteredDrugs.length === 0) {
        drugListElement.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        return;
    }

    filteredDrugs.forEach(drug => {
        const card = document.createElement('div');
        card.className = 'drug-card';
        card.innerHTML = `
            <div class="card-category">${drug.category}</div>
            <h3 class="card-name">${drug.name}</h3>
            <p class="card-manufacturer">${drug.manufacturer}</p>
            <button class="detail-btn" onclick="showDetail(${drug.id})">상세보기</button>
        `;
        drugListElement.appendChild(card);
    });
}

window.showDetail = function(id) {
    const drug = drugData.find(d => d.id === id);
    if (!drug) return;

    modalContent.innerHTML = `
        <div class="detail-header">
            <span class="detail-category">${drug.category}</span>
            <h2>${drug.name}</h2>
            <p class="manufacturer-large">${drug.manufacturer}</p>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <label>주요 성분</label>
                <p>${drug.ingredients}</p>
            </div>
            <div class="detail-item">
                <label>보험코드</label>
                <p>${drug.insuranceCode}</p>
            </div>
            <div class="detail-item full-width">
                <label>효능/효과</label>
                <p>${drug.efficacy}</p>
            </div>
            <div class="detail-item full-width">
                <label>용법/용량</label>
                <p>${drug.usage}</p>
            </div>
            <div class="detail-item full-width">
                <label>보관방법</label>
                <p>${drug.storage}</p>
            </div>
            <div class="detail-item full-width">
                <label>상세 설명</label>
                <p>${drug.description}</p>
            </div>
        </div>
    `;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scroll
};

closeModal.onclick = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};
