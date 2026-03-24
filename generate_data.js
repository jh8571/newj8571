const fs = require('fs');

// Generate 500 mock drugs
const categories = ["전문의약품", "일반의약품", "건강기능식품"];
const manufacturers = ["한미약품", "대웅제약", "유한양행", "종근당", "GC녹십자", "동아에스티", "보령제약", "JW중외제약", "일동제약", "휴온스"];
const symptoms = ["감기", "고혈압", "당뇨", "소화불량", "두통", "관절염", "알레르기", "피부염", "불면증", "우울증", "비타민 결핍", "피로"];
const forms = ["정", "캡슐", "시럽", "연고", "주사액", "과립"];

const drugs = [];
for (let i = 1; i <= 500; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
    const form = forms[Math.floor(Math.random() * forms.length)];
    
    drugs.push({
        id: i,
        name: `메디컬${symptom}${i}${form}`,
        category: category,
        manufacturer: manufacturer,
        ingredients: `활성성분${i} ${Math.floor(Math.random() * 500 + 10)}mg`,
        efficacy: `${symptom} 증상의 완화 및 치료`,
        usage: `성인 1일 ${Math.floor(Math.random() * 3 + 1)}회, 1회 1${form} 투여`,
        storage: "기밀용기, 실온(1~30℃)보관",
        insuranceCode: category === "건강기능식품" ? "-" : `6${Math.floor(10000000 + Math.random() * 90000000)}`,
        description: `이 약은 ${symptom}에 주로 처방/사용되는 ${category}입니다. 의사나 약사의 지시에 따라 복용하십시오.`
    });
}

fs.writeFileSync('drugs.json', JSON.stringify(drugs, null, 2));

// Generate 50 mock psychological tests
const tests = [];
for (let i = 1; i <= 50; i++) {
    tests.push({
        id: i,
        title: `심리테스트 ${i}: 당신의 ${['연애 세포', '스트레스 지수', '잠재된 성향', '리더십', '금전운'][Math.floor(Math.random() * 5)]} 알아보기`,
        description: `이 테스트를 통해 당신의 깊은 내면을 알아보세요! 총 3개의 질문으로 구성되어 있습니다.`,
        questions: [
            {
                q: "Q1. 길을 걷다 우연히 돈을 주웠습니다. 당신의 반응은?",
                options: [
                    { text: "경찰서에 갖다 준다.", score: 1 },
                    { text: "주위를 둘러보고 주머니에 넣는다.", score: 2 },
                    { text: "그대로 둔다.", score: 3 },
                    { text: "친구에게 자랑한다.", score: 4 }
                ]
            },
            {
                q: "Q2. 주말에 약속이 취소되었습니다. 무엇을 할 건가요?",
                options: [
                    { text: "집에서 넷플릭스를 본다.", score: 1 },
                    { text: "혼자 카페에 가서 책을 읽는다.", score: 2 },
                    { text: "다른 친구에게 연락해 만난다.", score: 3 },
                    { text: "밀린 집안일을 한다.", score: 4 }
                ]
            },
            {
                q: "Q3. 가장 좋아하는 색깔은?",
                options: [
                    { text: "빨강", score: 1 },
                    { text: "파랑", score: 2 },
                    { text: "초록", score: 3 },
                    { text: "검정", score: 4 }
                ]
            }
        ],
        results: {
            "3-5": "당신은 안정적이고 차분한 성향을 가지고 있습니다.",
            "6-8": "당신은 현실적이고 타협을 잘하는 성향입니다.",
            "9-10": "당신은 활발하고 사교적인 성격의 소유자입니다.",
            "11-12": "당신은 독창적이고 자유로운 영혼입니다."
        }
    });
}

fs.writeFileSync('tests.json', JSON.stringify(tests, null, 2));
console.log('Generated drugs.json and tests.json');
