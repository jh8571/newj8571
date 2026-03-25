const fs = require('fs');

const baseDrugs = [
    { name: "노바스크", category: "전문의약품", manufacturer: "한국화이자제약", ingredients: "암로디핀베실산염", efficacy: "고혈압, 협심증" },
    { name: "자누비아", category: "전문의약품", manufacturer: "한국MSD", ingredients: "시타글립틴인산염", efficacy: "제2형 당뇨병" },
    { name: "아스피린프로텍트", category: "일반의약품", manufacturer: "바이엘코리아", ingredients: "아스피린", efficacy: "혈전 예방" },
    { name: "우루사", category: "전문의약품", manufacturer: "대웅제약", ingredients: "우르소데오キシ콜산", efficacy: "간기능 개선" },
    { name: "리리카", category: "전문의약품", manufacturer: "한국비아트리스", ingredients: "프레가발린", efficacy: "신경통, 간질" },
    { name: "타이레놀", category: "일반의약품", manufacturer: "한국존슨앤드존슨", ingredients: "아세트아미노펜", efficacy: "해열, 진통" },
    { name: "겔포스엘", category: "일반의약품", manufacturer: "보령제약", ingredients: "알루미늄마그네슘", efficacy: "제산제, 위통 완화" },
    { name: "케토톱", category: "일반의약품", manufacturer: "한독", ingredients: "케토프로펜", efficacy: "관절염, 근육통" },
    { name: "아로나민골드", category: "일반의약품", manufacturer: "일동제약", ingredients: "활성비타민 B군", efficacy: "피로회복" },
    { name: "임팩타민", category: "일반의약품", manufacturer: "대웅제약", ingredients: "비타민 B복합체", efficacy: "육체피로" }
];

const manufacturers = ["한미약품", "대웅제약", "유한양행", "종근당", "GC녹십자", "동아에스티", "보령제약", "JW중외제약", "일동제약", "휴온스", "광동제약", "제일약품", "셀트리온", "삼성바이오", "신풍제약"];
const categories = ["전문의약품", "일반의약품", "건강기능식품"];
const symptoms = ["고혈압", "당뇨", "소화불량", "두통", "비염", "피부염", "골다공증", "불면증", "우울증", "비타민결핍", "간기능저하", "혈행개선", "눈피로", "전립선건강", "갱년기증상"];
const forms = ["정", "캡슐", "시럽", "연고", "겔", "주사액", "패취"];

const drugs = [];

// 상징적인 실제 약품 먼저 추가
baseDrugs.forEach((d, i) => {
    drugs.push({
        id: i + 1,
        name: d.name + " " + (Math.random() > 0.5 ? "5mg" : "10mg"),
        category: d.category,
        manufacturer: d.manufacturer,
        ingredients: d.ingredients + " " + (Math.random() * 100).toFixed(1) + "mg",
        efficacy: d.efficacy + " 증상의 완화",
        usage: "성인 1일 1회 식후 복용",
        storage: "실온 보관 (1-30도)",
        insuranceCode: d.category === "건강기능식품" ? "-" : "6" + Math.floor(Math.random() * 100000000),
        description: `${d.name}은 ${d.efficacy} 치료에 널리 사용되는 제품입니다.`
    });
});

// 약 2000개의 모의 데이터 생성
for (let i = drugs.length + 1; i <= 2000; i++) {
    const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const form = forms[Math.floor(Math.random() * forms.length)];
    
    drugs.push({
        id: i,
        name: `${symptom}제로-${i}${form}`,
        category: category,
        manufacturer: manufacturer,
        ingredients: `활성성분 ${symptom}X-${i} ${Math.floor(Math.random() * 500)}mg`,
        efficacy: `${symptom} 관련 증상의 집중 치료 및 개선`,
        usage: `성인 1일 ${Math.floor(Math.random() * 3) + 1}회, 회당 1${form} 복용`,
        storage: "차광기밀용기, 건조한 실온 보관",
        insuranceCode: category === "건강기능식품" ? "-" : "6" + Math.floor(Math.random() * 90000000 + 10000000),
        description: `본 의약품은 ${manufacturer}의 최신 기술로 제조된 ${symptom} 전용 ${category}입니다.`
    });
}

fs.writeFileSync('drugs.json', JSON.stringify(drugs, null, 2));
console.log('Successfully generated 2,000+ drug data entries.');
