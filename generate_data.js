const fs = require('fs');

const drugs = [
    {
        id: 1,
        name: "노바스크정 5mg",
        category: "전문의약품",
        manufacturer: "한국화이자제약",
        ingredients: "암로디핀베실산염 6.944mg",
        efficacy: "고혈압, 관상동맥의 고정폐쇄성 질환(안정형협심증) 또는 혈관경련성 질환(이형협심증)에 의한 심근성 허혈증",
        usage: "성인 : 암로디핀으로서 1일 1회 5mg을 경구투여하며 환자의 반응에 따라 1일 최대 10mg까지 증량할 수 있다.",
        storage: "차광기밀용기, 실온(1~30℃)보관",
        insuranceCode: "648900010",
        description: "칼슘채널차단제(CCB) 계열의 대표적인 고혈압 치료제입니다. 혈관 근육을 이완시켜 혈압을 낮추고 심장으로의 혈액 공급을 원활하게 합니다."
    },
    {
        id: 2,
        name: "자누비아정 100mg",
        category: "전문의약품",
        manufacturer: "한국MSD",
        ingredients: "시타글립틴인산염수화물 128.5mg",
        efficacy: "제2형 당뇨병 환자의 혈당 조절을 향상시키기 위해 식사요법 및 운동요법의 보조제로 투여한다.",
        usage: "단독요법 또는 병용요법 시 권장용량은 1일 1회 100mg입니다. 식사 여부와 관계없이 복용 가능합니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "655500010",
        description: "DPP-4 억제제 계열의 당뇨병 치료제입니다. 인크레틴 호르몬의 분해를 억제하여 인슐린 분비를 촉진하고 혈당을 조절합니다."
    },
    {
        id: 3,
        name: "트윈스타정 80/5mg",
        category: "전문의약품",
        manufacturer: "한국베링거인겔하임",
        ingredients: "텔미사르탄 80mg, 암로디핀베실산염 6.94mg",
        efficacy: "텔미사르탄 또는 암로디핀 단독요법으로 혈압이 적절하게 조절되지 않는 본태성 고혈압",
        usage: "권장용량은 1일 1회 1정으로, 식사 여부와 관계없이 물과 함께 복용합니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "653800010",
        description: "ARB 계열의 텔미사르탄과 CCB 계열의 암로디핀이 복합된 고혈압 치료제로, 보다 강력한 혈압 강하 효과를 제공합니다."
    },
    {
        id: 4,
        name: "아스피린프로텍트정 100mg",
        category: "일반의약품",
        manufacturer: "바이엘코리아",
        ingredients: "아스피린 100mg",
        efficacy: "혈전 생성 억제를 통한 심혈관계 질환 예방 (심근경색, 뇌경색 등)",
        usage: "성인 1일 1회 1정(100mg)을 식후에 복용하는 것이 권장됩니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "641100010",
        description: "저용량 아스피린 제품으로, 혈소판 응집을 차단하여 혈관 내 혈전 생성을 예방하는 데 사용됩니다."
    },
    {
        id: 5,
        name: "우루사정 200mg",
        category: "전문의약품",
        manufacturer: "대웅제약",
        ingredients: "우르소데오キシ콜산 200mg",
        efficacy: "담석증, 원발 쓸개즙성 간경화증의 간기능 개선, 만성 간질환의 간기능 개선",
        usage: "담석증 : 성인 1회 200~400mg을 1일 3회 복용합니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "641600010",
        description: "담즙 분비를 촉진하고 간세포를 보호하여 간 기능을 개선하는 대표적인 간장 질환 보조제입니다."
    },
    {
        id: 6,
        name: "리리카캡슐 75mg",
        category: "전문의약품",
        manufacturer: "한국비아트리스제약",
        ingredients: "프레가발린 75mg",
        efficacy: "성인에서 말초 및 중추 신경병증성 통증의 치료, 간질, 섬유근육통의 치료",
        usage: "1일 150~600mg의 범위를 1일 2회 또는 3회로 나누어 복용합니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "648900050",
        description: "신경 전달 물질의 방출을 조절하여 신경 통증을 완화하고 발작을 억제하는 약물입니다."
    },
    {
        id: 7,
        name: "이지엔6 애니 연질캡슐",
        category: "일반의약품",
        manufacturer: "대웅제약",
        ingredients: "이부프로펜 200mg",
        efficacy: "두통, 치통, 생리통, 근육통, 신경통, 오한, 발열 시의 해열",
        usage: "만 15세 이상 성인: 1회 1~2캡슐을 1일 3~4회 식후 복용합니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "-",
        description: "액상형 연질캡슐로 흡수가 빨라 통증 완화 효과가 신속한 비스테로이드성 소염진통제(NSAIDs)입니다."
    },
    {
        id: 8,
        name: "삐콤씨 정",
        category: "일반의약품",
        manufacturer: "유한양행",
        ingredients: "비타민B1, B2, B6, C, E 및 니코틴산아미드",
        efficacy: "비타민 B, C의 보급(육체피로, 임신·수유기, 병중·병후의 체력 저하시)",
        usage: "만 12세 이상 및 성인: 1일 2회, 1회 1정을 식후 복용합니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "-",
        description: "에너지 대사를 돕는 비타민 B군과 항산화 작용을 하는 비타민 C가 함유된 비타민 영양제입니다."
    },
    {
        id: 9,
        name: "센시아 정",
        category: "일반의약품",
        manufacturer: "동국제약",
        ingredients: "센텔라정량추출물 30mg",
        efficacy: "정맥부전과 관련된 증상(다리의 부종, 통증, 중압감)의 개선",
        usage: "성인 1일 1~2정을 식사와 함께 복용합니다.",
        storage: "밀폐용기, 실온(1~25℃)보관",
        insuranceCode: "-",
        description: "식물성 성분으로 정맥 벽의 탄력을 높이고 모세혈관 투과성을 조절하여 다리의 붓기와 무거운 증상을 완화합니다."
    },
    {
        id: 10,
        name: "임팩타민 프리미엄 정",
        category: "일반의약품",
        manufacturer: "대웅제약",
        ingredients: "벤포티아민(활성비타민 B1) 외 비타민 B군 10종, 아연, 비타민 C",
        efficacy: "육체피로, 눈의 피로, 구내염, 근육통, 관절통, 신경통 완화",
        usage: "만 12세 이상 및 성인: 1일 1회 1~2정을 식후 복용합니다.",
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: "-",
        description: "고함량 비타민 B군 복합제로 특히 피로 회복과 에너지 생성에 효과적인 활성형 비타민이 포함되어 있습니다."
    }
];

// 추가적으로 490개의 더 구체적인 모의 데이터를 생성하여 대량의 데이터 세트 구축
const manufacturers = ["한미약품", "대웅제약", "유한양행", "종근당", "GC녹십자", "동아에스티", "보령제약", "JW중외제약", "일동제약", "휴온스"];
const symptoms = ["심혈관", "내분비", "소화기", "근골격", "신경계", "호흡기", "피부", "비뇨기"];

for (let i = 11; i <= 500; i++) {
    const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const isSpecialist = Math.random() > 0.4;
    
    drugs.push({
        id: i,
        name: `${symptom}케어 ${i}정`,
        category: isSpecialist ? "전문의약품" : "일반의약품",
        manufacturer: manufacturer,
        ingredients: `활성성분 ${i}X 25mg, 보조성분 ${i}Y 10mg`,
        efficacy: `${symptom} 질환의 증상 완화 및 치료 보조`,
        usage: `성인 기준 1일 ${Math.floor(Math.random()*3)+1}회, 식후 30분에 복용합니다.`,
        storage: "기밀용기, 실온(1~30℃)의 건조한 곳에 보관하십시오.",
        insuranceCode: isSpecialist ? `6${Math.floor(10000000 + Math.random() * 90000000)}` : "-",
        description: `이 제품은 ${symptom} 계통의 건강을 위해 개발된 ${isSpecialist ? '전문가 처방이 필요한' : '안전한'} 약물입니다. ${manufacturer}의 엄격한 품질 관리를 거쳤습니다.`
    });
}

fs.writeFileSync('drugs.json', JSON.stringify(drugs, null, 2));
console.log('High-quality drug data generated.');
