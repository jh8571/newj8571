document.addEventListener('DOMContentLoaded', () => {
    let drugData = [];
    let nutrientData = [];
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
    Promise.all([
        fetch('drugs.json').then(r => r.json()),
        fetch('nutrients.json').then(r => r.json())
    ]).then(([drugs, nutrients]) => {
        drugData = drugs.drugs || drugs;
        nutrientData = nutrients.nutrients || nutrients;
        console.log('Database synced:', drugData.length + nutrientData.length);
    }).catch(e => console.error('Load error:', e));

    // 2. Gender Selection
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
        const stress = (document.getElementById('stress-level') || {}).value || 'medium';
        const diet = (document.getElementById('diet-type') || {}).value || 'normal';
        const exercise = (document.getElementById('exercise-level') || {}).value || 'medium';

        if (!aiResultSection || !aiResultContent) return;

        aiResultSection.style.display = 'block';
        aiResultContent.innerHTML = `
            <div style="text-align: center; padding: 100px 40px;">
                <div class="premium-loader"></div>
                <p style="margin-top:24px; color: #64748b; font-size:1rem;">🔬 임상 데이터베이스 분석 중...<br><span style="font-size:0.85rem; opacity:0.7">60종 영양 성분 × 라이프스타일 교차 분석</span></p>
            </div>`;

        setTimeout(() => {
            const report = generateAdvancedReport(userGender, age, concern, stress, diet, exercise);
            displayAdvancedReport(report);
            aiResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1800);
    };

    // ─── 추천 매트릭스 ───
    const NUTRIENT_MAP = {
        male: {
            teen: {
                fatigue: { core: ["비타민 B1 (티아민)", "비타민 B2 (리보플라빈)", "아연 (Zn)"], support: ["마그네슘 (Mg)", "코엔자임 Q10 (유비퀴논/유비퀴놀)"] },
                immune: { core: ["비타민 C (L-아스코르빈산)", "비타민 D3 (콜레칼시페롤)", "아연 (Zn)"], support: ["프로바이오틱스 (유산균 복합균주)", "베타글루칸 (효모/귀리 유래)"] },
                brain:  { core: ["오메가-3 지방산 (EPA/DHA)", "포스파티딜세린 (PS)", "엽산 (비타민 B9 / L-메틸폴레이트)"], support: ["비타민 B12 (메틸코발라민)", "테아닌 (L-테아닌)"] },
                bone:   { core: ["칼슘 (Ca)", "비타민 D3 (콜레칼시페롤)", "망간 (Mn)"], support: ["비타민 K2 (메나퀴논-7, MK-7)", "마그네슘 (Mg)"] },
                liver:  { core: ["밀크씨슬 (실리마린)", "비타민 B6 (피리독살-5-인산)", "NAC (N-아세틸시스테인)"], support: ["비타민 C (L-아스코르빈산)", "아연 (Zn)"] },
                eye:    { core: ["루테인 (마리골드꽃 추출물)", "비타민 A (레티놀 / 베타카로틴)", "아스타잔틴 (헤마토코쿠스 조류 추출)"], support: ["오메가-3 지방산 (EPA/DHA)", "비타민 C (L-아스코르빈산)"] },
                skin:   { core: ["비오틴 (비타민 B7)", "비타민 C (L-아스코르빈산)", "아연 (Zn)"], support: ["오메가-3 지방산 (EPA/DHA)", "프로바이오틱스 (유산균 복합균주)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "마그네슘 (Mg)", "코엔자임 Q10 (유비퀴논/유비퀴놀)"], support: ["비타민 D3 (콜레칼시페롤)", "비타민 K2 (메나퀴논-7, MK-7)"] },
                weight: { core: ["L-카르니틴", "크롬 (Cr, 피콜린산크롬)", "이눌린/FOS (프리바이오틱스)"], support: ["베르베린", "프로바이오틱스 (유산균 복합균주)"] },
                sleep:  { core: ["마그네슘 (Mg)", "테아닌 (L-테아닌)", "L-트립토판 / 5-HTP"], support: ["글리신", "비타민 B6 (피리독살-5-인산)"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "이눌린/FOS (프리바이오틱스)", "L-글루타민"], support: ["아연 (Zn)", "비타민 D3 (콜레칼시페롤)"] },
                blood_sugar: { core: ["베르베린", "크롬 (Cr, 피콜린산크롬)", "알파리포산 (R-ALA, 활성형)"], support: ["마그네슘 (Mg)", "이눌린/FOS (프리바이오틱스)"] },
                antiaging:   { core: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "코엔자임 Q10 (유비퀴논/유비퀴놀)", "레스베라트롤 (경질 껍질 추출)"], support: ["글루타치온 (환원형 GSH)", "비타민 D3 (콜레칼시페롤)"] }
            },
            young: {
                fatigue: { core: ["L-아르기닌 / L-시트룰린", "비타민 B12 (메틸코발라민)", "마그네슘 (Mg)"], support: ["코엔자임 Q10 (유비퀴논/유비퀴놀)", "옥타코사놀 (사탕수수 추출)"] },
                immune: { core: ["비타민 D3 (콜레칼시페롤)", "홍삼 (6년근 진세노사이드 복합)", "아연 (Zn)"], support: ["비타민 C (L-아스코르빈산)", "베타글루칸 (효모/귀리 유래)"] },
                brain:  { core: ["포스파티딜세린 (PS)", "오메가-3 지방산 (EPA/DHA)", "은행잎 추출물 (EGb761® 징코플라본)"], support: ["비타민 B12 (메틸코발라민)", "테아닌 (L-테아닌)"] },
                bone:   { core: ["MSM (메틸설포닐메탄)", "비타민 K2 (메나퀴논-7, MK-7)", "비타민 D3 (콜레칼시페롤)"], support: ["마그네슘 (Mg)", "칼슘 (Ca)"] },
                liver:  { core: ["밀크씨슬 (실리마린)", "글루타치온 (환원형 GSH)", "NAC (N-아세틸시스테인)"], support: ["비타민 B군", "헛개나무 열매 추출물 (디하이드로미리세틴 DHM)"] },
                eye:    { core: ["오메가-3 지방산 (EPA/DHA)", "루테인 (마리골드꽃 추출물)", "아스타잔틴 (헤마토코쿠스 조류 추출)"], support: ["비타민 A (레티놀 / 베타카로틴)", "비타민 C (L-아스코르빈산)"] },
                skin:   { core: ["저분자 피쉬 콜라겐 펩타이드", "비타민 C (L-아스코르빈산)", "아스타잔틴 (헤마토코쿠스 조류 추출)"], support: ["히알루론산 (HA, 저분자)", "아연 (Zn)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "코엔자임 Q10 (유비퀴논/유비퀴놀)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["마그네슘 (Mg)", "L-아르기닌 / L-시트룰린"] },
                weight: { core: ["L-카르니틴", "베르베린", "BCAA (분지사슬 아미노산)"], support: ["크롬 (Cr, 피콜린산크롬)", "이눌린/FOS (프리바이오틱스)"] },
                sleep:  { core: ["마그네슘 (Mg)", "테아닌 (L-테아닌)", "아슈와간다 (KSM-66® 위타놀라이드)"], support: ["L-트립토판 / 5-HTP", "글리신"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "L-글루타민", "이눌린/FOS (프리바이오틱스)"], support: ["아연 (Zn)", "커큐민 (강황 추출물 + 바이오페린)"] },
                blood_sugar: { core: ["베르베린", "알파리포산 (R-ALA, 활성형)", "크롬 (Cr, 피콜린산크롬)"], support: ["마그네슘 (Mg)", "오메가-3 지방산 (EPA/DHA)"] },
                antiaging:   { core: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "레스베라트롤 (경질 껍질 추출)", "글루타치온 (환원형 GSH)"], support: ["코엔자임 Q10 (유비퀴논/유비퀴놀)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] }
            },
            middle: {
                fatigue: { core: ["코엔자임 Q10 (유비퀴논/유비퀴놀)", "옥타코사놀 (사탕수수 추출)", "마카 추출물 (페루산, 표준화)"], support: ["비타민 B12 (메틸코발라민)", "마그네슘 (Mg)"] },
                immune: { core: ["베타글루칸 (효모/귀리 유래)", "셀레늄 (Se, 유기셀레늄)", "비타민 D3 (콜레칼시페롤)"], support: ["아연 (Zn)", "홍삼 (6년근 진세노사이드 복합)"] },
                brain:  { core: ["은행잎 추출물 (EGb761® 징코플라본)", "포스파티딜세린 (PS)", "커큐민 (강황 추출물 + 바이오페린)"], support: ["오메가-3 지방산 (EPA/DHA)", "NMN (니코틴아마이드 모노뉴클레오타이드)"] },
                bone:   { core: ["칼슘 (Ca)", "비타민 K2 (메나퀴논-7, MK-7)", "보스웰리아 (AKBA 표준화)"], support: ["MSM (메틸설포닐메탄)", "비타민 D3 (콜레칼시페롤)"] },
                liver:  { core: ["글루타치온 (환원형 GSH)", "밀크씨슬 (실리마린)", "헛개나무 열매 추출물 (디하이드로미리세틴 DHM)"], support: ["아티초크 추출물 (시나린·루테올린)", "NAC (N-아세틸시스테인)"] },
                eye:    { core: ["아스타잔틴 (헤마토코쿠스 조류 추출)", "루테인 (마리골드꽃 추출물)", "오메가-3 지방산 (EPA/DHA)"], support: ["비타민 E (혼합 토코페롤/토코트리에놀)", "비타민 A (레티놀 / 베타카로틴)"] },
                skin:   { core: ["저분자 피쉬 콜라겐 펩타이드", "아스타잔틴 (헤마토코쿠스 조류 추출)", "글루타치온 (환원형 GSH)"], support: ["히알루론산 (HA, 저분자)", "비타민 C (L-아스코르빈산)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "코엔자임 Q10 (유비퀴논/유비퀴놀)", "레스베라트롤 (경질 껍질 추출)"], support: ["비타민 K2 (메나퀴논-7, MK-7)", "마그네슘 (Mg)"] },
                weight: { core: ["베르베린", "L-카르니틴", "아티초크 추출물 (시나린·루테올린)"], support: ["이눌린/FOS (프리바이오틱스)", "크롬 (Cr, 피콜린산크롬)"] },
                sleep:  { core: ["마그네슘 (Mg)", "아슈와간다 (KSM-66® 위타놀라이드)", "L-트립토판 / 5-HTP"], support: ["테아닌 (L-테아닌)", "글리신"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "이눌린/FOS (프리바이오틱스)", "커큐민 (강황 추출물 + 바이오페린)"], support: ["L-글루타민", "아연 (Zn)"] },
                blood_sugar: { core: ["베르베린", "알파리포산 (R-ALA, 활성형)", "NMN (니코틴아마이드 모노뉴클레오타이드)"], support: ["크롬 (Cr, 피콜린산크롬)", "마그네슘 (Mg)"] },
                antiaging:   { core: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "아스타잔틴 (헤마토코쿠스 조류 추출)", "레스베라트롤 (경질 껍질 추출)"], support: ["글루타치온 (환원형 GSH)", "커큐민 (강황 추출물 + 바이오페린)"] }
            },
            senior: {
                fatigue: { core: ["코엔자임 Q10 (유비퀴논/유비퀴놀)", "BCAA (분지사슬 아미노산)", "비타민 B12 (메틸코발라민)"], support: ["마그네슘 (Mg)", "철분 (헴철 / 킬레이트 비헴철)"] },
                immune: { core: ["비타민 D3 (콜레칼시페롤)", "셀레늄 (Se, 유기셀레늄)", "베타글루칸 (효모/귀리 유래)"], support: ["아연 (Zn)", "비타민 C (L-아스코르빈산)"] },
                brain:  { core: ["은행잎 추출물 (EGb761® 징코플라본)", "오메가-3 지방산 (EPA/DHA)", "커큐민 (강황 추출물 + 바이오페린)"], support: ["포스파티딜세린 (PS)", "NMN (니코틴아마이드 모노뉴클레오타이드)"] },
                bone:   { core: ["칼슘 (Ca)", "비타민 D3 (콜레칼시페롤)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["마그네슘 (Mg)", "보스웰리아 (AKBA 표준화)"] },
                liver:  { core: ["밀크씨슬 (실리마린)", "아티초크 추출물 (시나린·루테올린)", "글루타치온 (환원형 GSH)"], support: ["NAC (N-아세틸시스테인)", "비타민 E (혼합 토코페롤/토코트리에놀)"] },
                eye:    { core: ["루테인 (마리골드꽃 추출물)", "아스타잔틴 (헤마토코쿠스 조류 추출)", "오메가-3 지방산 (EPA/DHA)"], support: ["비타민 A (레티놀 / 베타카로틴)", "비타민 E (혼합 토코페롤/토코트리에놀)"] },
                skin:   { core: ["저분자 피쉬 콜라겐 펩타이드", "히알루론산 (HA, 저분자)", "글루타치온 (환원형 GSH)"], support: ["비타민 C (L-아스코르빈산)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "코엔자임 Q10 (유비퀴논/유비퀴놀)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["마그네슘 (Mg)", "레스베라트롤 (경질 껍질 추출)"] },
                weight: { core: ["L-카르니틴", "베르베린", "프로바이오틱스 (유산균 복합균주)"], support: ["이눌린/FOS (프리바이오틱스)", "아티초크 추출물 (시나린·루테올린)"] },
                sleep:  { core: ["마그네슘 (Mg)", "글리신", "L-트립토판 / 5-HTP"], support: ["테아닌 (L-테아닌)", "아슈와간다 (KSM-66® 위타놀라이드)"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "이눌린/FOS (프리바이오틱스)", "L-글루타민"], support: ["아연 (Zn)", "비타민 D3 (콜레칼시페롤)"] },
                blood_sugar: { core: ["베르베린", "알파리포산 (R-ALA, 활성형)", "크롬 (Cr, 피콜린산크롬)"], support: ["마그네슘 (Mg)", "베타글루칸 (효모/귀리 유래)"] },
                antiaging:   { core: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "레스베라트롤 (경질 껍질 추출)", "커큐민 (강황 추출물 + 바이오페린)"], support: ["글루타치온 (환원형 GSH)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] }
            }
        },
        female: {
            teen: {
                fatigue: { core: ["철분 (헴철 / 킬레이트 비헴철)", "비타민 B2 (리보플라빈)", "비타민 C (L-아스코르빈산)"], support: ["마그네슘 (Mg)", "비타민 B6 (피리독살-5-인산)"] },
                immune: { core: ["비타민 C (L-아스코르빈산)", "프로바이오틱스 (유산균 복합균주)", "아연 (Zn)"], support: ["비타민 D3 (콜레칼시페롤)", "베타글루칸 (효모/귀리 유래)"] },
                brain:  { core: ["오메가-3 지방산 (EPA/DHA)", "엽산 (비타민 B9 / L-메틸폴레이트)", "철분 (헴철 / 킬레이트 비헴철)"], support: ["테아닌 (L-테아닌)", "비타민 B12 (메틸코발라민)"] },
                bone:   { core: ["칼슘 (Ca)", "비타민 D3 (콜레칼시페롤)", "망간 (Mn)"], support: ["마그네슘 (Mg)", "비타민 K2 (메나퀴논-7, MK-7)"] },
                liver:  { core: ["밀크씨슬 (실리마린)", "비타민 B6 (피리독살-5-인산)", "NAC (N-아세틸시스테인)"], support: ["비타민 C (L-아스코르빈산)", "글루타치온 (환원형 GSH)"] },
                eye:    { core: ["루테인 (마리골드꽃 추출물)", "비타민 A (레티놀 / 베타카로틴)", "비타민 C (L-아스코르빈산)"], support: ["오메가-3 지방산 (EPA/DHA)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] },
                skin:   { core: ["비오틴 (비타민 B7)", "비타민 C (L-아스코르빈산)", "아연 (Zn)"], support: ["오메가-3 지방산 (EPA/DHA)", "감마리놀렌산 GLA (달맞이꽃종자유/보라지유)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "마그네슘 (Mg)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["코엔자임 Q10 (유비퀴논/유비퀴놀)", "비타민 D3 (콜레칼시페롤)"] },
                weight: { core: ["철분 (헴철 / 킬레이트 비헴철)", "이눌린/FOS (프리바이오틱스)", "크롬 (Cr, 피콜린산크롬)"], support: ["프로바이오틱스 (유산균 복합균주)", "비타민 B군"] },
                sleep:  { core: ["마그네슘 (Mg)", "테아닌 (L-테아닌)", "L-트립토판 / 5-HTP"], support: ["비타민 B6 (피리독살-5-인산)", "글리신"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "이눌린/FOS (프리바이오틱스)", "L-글루타민"], support: ["아연 (Zn)", "비타민 D3 (콜레칼시페롤)"] },
                blood_sugar: { core: ["크롬 (Cr, 피콜린산크롬)", "마그네슘 (Mg)", "이눌린/FOS (프리바이오틱스)"], support: ["베르베린", "알파리포산 (R-ALA, 활성형)"] },
                antiaging:   { core: ["글루타치온 (환원형 GSH)", "비타민 C (L-아스코르빈산)", "레스베라트롤 (경질 껍질 추출)"], support: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] }
            },
            young: {
                fatigue: { core: ["철분 (헴철 / 킬레이트 비헴철)", "마그네슘 (Mg)", "L-카르니틴"], support: ["비타민 B12 (메틸코발라민)", "코엔자임 Q10 (유비퀴논/유비퀴놀)"] },
                immune: { core: ["비타민 D3 (콜레칼시페롤)", "프로바이오틱스 (유산균 복합균주)", "비타민 C (L-아스코르빈산)"], support: ["아연 (Zn)", "크랜베리 추출물 (프로안토시아니딘 PAC)"] },
                brain:  { core: ["오메가-3 지방산 (EPA/DHA)", "엽산 (비타민 B9 / L-메틸폴레이트)", "테아닌 (L-테아닌)"], support: ["포스파티딜세린 (PS)", "철분 (헴철 / 킬레이트 비헴철)"] },
                bone:   { core: ["칼슘 (Ca)", "비타민 D3 (콜레칼시페롤)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["마그네슘 (Mg)", "엽산 (비타민 B9 / L-메틸폴레이트)"] },
                liver:  { core: ["밀크씨슬 (실리마린)", "글루타치온 (환원형 GSH)", "비타민 B군"], support: ["NAC (N-아세틸시스테인)", "아티초크 추출물 (시나린·루테올린)"] },
                eye:    { core: ["오메가-3 지방산 (EPA/DHA)", "루테인 (마리골드꽃 추출물)", "히알루론산 (HA, 저분자)"], support: ["비타민 A (레티놀 / 베타카로틴)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] },
                skin:   { core: ["저분자 피쉬 콜라겐 펩타이드", "비타민 C (L-아스코르빈산)", "감마리놀렌산 GLA (달맞이꽃종자유/보라지유)"], support: ["히알루론산 (HA, 저분자)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "마그네슘 (Mg)", "코엔자임 Q10 (유비퀴논/유비퀴놀)"], support: ["비타민 K2 (메나퀴논-7, MK-7)", "엽산 (비타민 B9 / L-메틸폴레이트)"] },
                weight: { core: ["L-카르니틴", "이눌린/FOS (프리바이오틱스)", "베르베린"], support: ["크롬 (Cr, 피콜린산크롬)", "프로바이오틱스 (유산균 복합균주)"] },
                sleep:  { core: ["마그네슘 (Mg)", "테아닌 (L-테아닌)", "아슈와간다 (KSM-66® 위타놀라이드)"], support: ["L-트립토판 / 5-HTP", "비타민 B6 (피리독살-5-인산)"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "L-글루타민", "이눌린/FOS (프리바이오틱스)"], support: ["크랜베리 추출물 (프로안토시아니딘 PAC)", "아연 (Zn)"] },
                blood_sugar: { core: ["베르베린", "크롬 (Cr, 피콜린산크롬)", "알파리포산 (R-ALA, 활성형)"], support: ["마그네슘 (Mg)", "이눌린/FOS (프리바이오틱스)"] },
                antiaging:   { core: ["글루타치온 (환원형 GSH)", "아스타잔틴 (헤마토코쿠스 조류 추출)", "비타민 C (L-아스코르빈산)"], support: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "레스베라트롤 (경질 껍질 추출)"] }
            },
            middle: {
                fatigue: { core: ["대두 이소플라본 (제니스테인·다이제인)", "코엔자임 Q10 (유비퀴논/유비퀴놀)", "감마리놀렌산 GLA (달맞이꽃종자유/보라지유)"], support: ["마카 추출물 (페루산, 표준화)", "마그네슘 (Mg)"] },
                immune: { core: ["비타민 D3 (콜레칼시페롤)", "비타민 C (L-아스코르빈산)", "셀레늄 (Se, 유기셀레늄)"], support: ["베타글루칸 (효모/귀리 유래)", "아연 (Zn)"] },
                brain:  { core: ["포스파티딜세린 (PS)", "오메가-3 지방산 (EPA/DHA)", "은행잎 추출물 (EGb761® 징코플라본)"], support: ["비타민 B12 (메틸코발라민)", "커큐민 (강황 추출물 + 바이오페린)"] },
                bone:   { core: ["칼슘 (Ca)", "대두 이소플라본 (제니스테인·다이제인)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["비타민 D3 (콜레칼시페롤)", "마그네슘 (Mg)"] },
                liver:  { core: ["밀크씨슬 (실리마린)", "글루타치온 (환원형 GSH)", "NAC (N-아세틸시스테인)"], support: ["아티초크 추출물 (시나린·루테올린)", "비타민 B군"] },
                eye:    { core: ["루테인 (마리골드꽃 추출물)", "아스타잔틴 (헤마토코쿠스 조류 추출)", "오메가-3 지방산 (EPA/DHA)"], support: ["비타민 E (혼합 토코페롤/토코트리에놀)", "비타민 A (레티놀 / 베타카로틴)"] },
                skin:   { core: ["저분자 피쉬 콜라겐 펩타이드", "글루타치온 (환원형 GSH)", "히알루론산 (HA, 저분자)"], support: ["감마리놀렌산 GLA (달맞이꽃종자유/보라지유)", "비타민 C (L-아스코르빈산)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "대두 이소플라본 (제니스테인·다이제인)", "코엔자임 Q10 (유비퀴논/유비퀴놀)"], support: ["마그네슘 (Mg)", "레스베라트롤 (경질 껍질 추출)"] },
                weight: { core: ["베르베린", "L-카르니틴", "이눌린/FOS (프리바이오틱스)"], support: ["대두 이소플라본 (제니스테인·다이제인)", "아티초크 추출물 (시나린·루테올린)"] },
                sleep:  { core: ["마그네슘 (Mg)", "아슈와간다 (KSM-66® 위타놀라이드)", "L-트립토판 / 5-HTP"], support: ["대두 이소플라본 (제니스테인·다이제인)", "글리신"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "이눌린/FOS (프리바이오틱스)", "L-글루타민"], support: ["커큐민 (강황 추출물 + 바이오페린)", "아연 (Zn)"] },
                blood_sugar: { core: ["베르베린", "크롬 (Cr, 피콜린산크롬)", "알파리포산 (R-ALA, 활성형)"], support: ["마그네슘 (Mg)", "이눌린/FOS (프리바이오틱스)"] },
                antiaging:   { core: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "글루타치온 (환원형 GSH)", "레스베라트롤 (경질 껍질 추출)"], support: ["아스타잔틴 (헤마토코쿠스 조류 추출)", "커큐민 (강황 추출물 + 바이오페린)"] }
            },
            senior: {
                fatigue: { core: ["비타민 B12 (메틸코발라민)", "코엔자임 Q10 (유비퀴논/유비퀴놀)", "철분 (헴철 / 킬레이트 비헴철)"], support: ["마그네슘 (Mg)", "BCAA (분지사슬 아미노산)"] },
                immune: { core: ["비타민 D3 (콜레칼시페롤)", "셀레늄 (Se, 유기셀레늄)", "프로바이오틱스 (유산균 복합균주)"], support: ["아연 (Zn)", "베타글루칸 (효모/귀리 유래)"] },
                brain:  { core: ["은행잎 추출물 (EGb761® 징코플라본)", "오메가-3 지방산 (EPA/DHA)", "포스파티딜세린 (PS)"], support: ["커큐민 (강황 추출물 + 바이오페린)", "NMN (니코틴아마이드 모노뉴클레오타이드)"] },
                bone:   { core: ["칼슘 (Ca)", "비타민 D3 (콜레칼시페롤)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["마그네슘 (Mg)", "보스웰리아 (AKBA 표준화)"] },
                liver:  { core: ["밀크씨슬 (실리마린)", "글루타치온 (환원형 GSH)", "아티초크 추출물 (시나린·루테올린)"], support: ["NAC (N-아세틸시스테인)", "비타민 E (혼합 토코페롤/토코트리에놀)"] },
                eye:    { core: ["루테인 (마리골드꽃 추출물)", "아스타잔틴 (헤마토코쿠스 조류 추출)", "비타민 A (레티놀 / 베타카로틴)"], support: ["비타민 E (혼합 토코페롤/토코트리에놀)", "오메가-3 지방산 (EPA/DHA)"] },
                skin:   { core: ["저분자 피쉬 콜라겐 펩타이드", "히알루론산 (HA, 저분자)", "글루타치온 (환원형 GSH)"], support: ["비타민 C (L-아스코르빈산)", "대두 이소플라본 (제니스테인·다이제인)"] },
                heart:  { core: ["오메가-3 지방산 (EPA/DHA)", "코엔자임 Q10 (유비퀴논/유비퀴놀)", "비타민 K2 (메나퀴논-7, MK-7)"], support: ["마그네슘 (Mg)", "레스베라트롤 (경질 껍질 추출)"] },
                weight: { core: ["L-카르니틴", "프로바이오틱스 (유산균 복합균주)", "베르베린"], support: ["이눌린/FOS (프리바이오틱스)", "크롬 (Cr, 피콜린산크롬)"] },
                sleep:  { core: ["마그네슘 (Mg)", "글리신", "L-트립토판 / 5-HTP"], support: ["테아닌 (L-테아닌)", "아슈와간다 (KSM-66® 위타놀라이드)"] },
                gut:    { core: ["프로바이오틱스 (유산균 복합균주)", "이눌린/FOS (프리바이오틱스)", "L-글루타민"], support: ["아연 (Zn)", "비타민 D3 (콜레칼시페롤)"] },
                blood_sugar: { core: ["베르베린", "크롬 (Cr, 피콜린산크롬)", "알파리포산 (R-ALA, 활성형)"], support: ["마그네슘 (Mg)", "베타글루칸 (효모/귀리 유래)"] },
                antiaging:   { core: ["NMN (니코틴아마이드 모노뉴클레오타이드)", "레스베라트롤 (경질 껍질 추출)", "커큐민 (강황 추출물 + 바이오페린)"], support: ["글루타치온 (환원형 GSH)", "아스타잔틴 (헤마토코쿠스 조류 추출)"] }
            }
        }
    };

    // 라이프스타일 추가 추천
    const LIFESTYLE_ADD = {
        stress:    { high:  ["아슈와간다 (KSM-66® 위타놀라이드)", "마그네슘 (Mg)", "테아닌 (L-테아닌)"] },
        diet:      { vegan: ["비타민 B12 (메틸코발라민)", "철분 (헴철 / 킬레이트 비헴철)", "비타민 D3 (콜레칼시페롤)", "오메가-3 지방산 (EPA/DHA)"],
                     vegetarian: ["비타민 B12 (메틸코발라민)", "철분 (헴철 / 킬레이트 비헴철)"] },
        exercise:  { high: ["BCAA (분지사슬 아미노산)", "마그네슘 (Mg)", "코엔자임 Q10 (유비퀴논/유비퀴놀)"],
                     low:  ["L-카르니틴", "비타민 D3 (콜레칼시페롤)"] }
    };

    const CONCERN_LABELS = {
        fatigue:'⚡ 만성 피로', immune:'🛡️ 면역력 강화', brain:'🧠 기억력/집중력', bone:'🦴 뼈/관절',
        heart:'❤️ 심혈관', liver:'🫀 간 기능', eye:'👁️ 눈 건강', skin:'✨ 피부/모발',
        sleep:'🌙 수면/스트레스', gut:'🌿 장 건강', weight:'⚖️ 체중/대사', blood_sugar:'🩸 혈당 관리', antiaging:'🔬 항노화'
    };

    function findNutrient(name) {
        return nutrientData.find(n => n.name === name || n.name.startsWith(name.split(' ')[0]));
    }

    function generateAdvancedReport(gender, age, concern, stress, diet, exercise) {
        const base = NUTRIENT_MAP[gender][age][concern] || { core: [], support: [] };
        const coreNames = [...base.core];
        const supportNames = [...base.support];

        // 라이프스타일 추가 성분 (중복 제거)
        const extras = new Set();
        if (stress === 'high') LIFESTYLE_ADD.stress.high.forEach(n => extras.add(n));
        if (diet !== 'normal') (LIFESTYLE_ADD.diet[diet] || []).forEach(n => extras.add(n));
        if (exercise === 'high') LIFESTYLE_ADD.exercise.high.forEach(n => extras.add(n));
        if (exercise === 'low')  LIFESTYLE_ADD.exercise.low.forEach(n => extras.add(n));
        const allNames = new Set([...coreNames, ...supportNames]);
        const lifestyleExtras = [...extras].filter(n => !allNames.has(n)).slice(0, 2);

        const toCard = (name, priority) => {
            const d = findNutrient(name) || {};
            return { name: d.name || name, category: d.category || '–', efficacy: d.efficacy || '–', description: d.description || '', dri: d.dri || '–', food: d.food || '–', caution: d.caution || '–', timing: d.timing || '–', priority };
        };

        const coreCards    = coreNames.map(n => toCard(n, 'core'));
        const supportCards = supportNames.map(n => toCard(n, 'support'));
        const extraCards   = lifestyleExtras.map(n => toCard(n, 'lifestyle'));

        // 복용 타이밍 분류
        const timingGroups = { '아침 식사 후': [], '식사와 함께': [], '공복': [], '저녁 식사 후': [], '취침 전': [] };
        [...coreCards, ...supportCards, ...extraCards].forEach(n => {
            if (n.timing && timingGroups[n.timing]) timingGroups[n.timing].push(n.name.split(' ')[0]);
            else if (n.timing) timingGroups['식사와 함께'].push(n.name.split(' ')[0]);
        });

        // 라이프스타일 가이드
        const lifestyleGuide = [];
        if (stress === 'high') lifestyleGuide.push('⚠️ 만성 스트레스는 코르티솔을 높여 영양소 소모를 2~3배 가속합니다. 마그네슘·비타민 C·B군이 특히 빠르게 소진됩니다.');
        if (stress === 'medium') lifestyleGuide.push('🌿 보통 수준의 스트레스도 장기화 시 부신 기능을 소진시킵니다. 규칙적인 심호흡과 수면 루틴으로 코르티솔 리듬을 유지하세요.');
        if (diet === 'vegan') lifestyleGuide.push('🌱 비건 식단은 비타민 B12, 철분, 비타민 D, 오메가-3(DHA/EPA), 아연, 요오드가 결핍되기 쉽습니다. 반드시 보충제로 보완하세요.');
        if (diet === 'vegetarian') lifestyleGuide.push('🥗 채식 식단에서 비타민 B12·철분 결핍이 흔합니다. 발효 식품과 콩류를 통해 보완하고 헴철 대신 비타민 C와 함께 비헴철을 섭취하세요.');
        if (exercise === 'high') lifestyleGuide.push('💪 고강도 운동은 산화 스트레스와 염증을 증가시킵니다. 항산화제(비타민 C·E, 아스타잔틴)와 마그네슘, BCAA로 회복을 최적화하세요.');
        if (exercise === 'low') lifestyleGuide.push('🚶 운동 부족은 인슐린 감수성과 미토콘드리아 기능을 저하시킵니다. 하루 30분 걷기만으로도 비타민 D 합성과 대사가 크게 개선됩니다.');
        lifestyleGuide.push('💧 하루 체중 × 30ml 이상의 수분 섭취는 수용성 영양소의 흡수율과 신장 여과 기능을 최적화합니다.');

        return { gender, age, concern, stress, diet, exercise, coreCards, supportCards, extraCards, timingGroups, lifestyleGuide };
    }

    function displayAdvancedReport(r) {
        const genderLabel = r.gender === 'male' ? '남성' : '여성';
        const concernLabel = CONCERN_LABELS[r.concern] || r.concern;
        const ageLabel = { teen:'청소년', young:'청년', middle:'중년', senior:'노년' }[r.age] || r.age;

        const nutrientCard = (n, badgeLabel, badgeColor) => `
            <div style="background:var(--bg-color);border:1px solid var(--border-color);border-radius:20px;padding:24px;position:relative;overflow:hidden;">
                <div style="position:absolute;top:16px;right:16px;background:${badgeColor};color:white;font-size:0.7rem;font-weight:900;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;">${badgeLabel}</div>
                <h4 style="font-size:1.05rem;font-weight:800;color:var(--primary-color);margin-bottom:6px;padding-right:70px;line-height:1.3;">${n.name}</h4>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;">${n.category}</div>
                <p style="font-size:0.88rem;line-height:1.65;color:var(--text-color);margin-bottom:14px;">${n.efficacy}</p>
                <div style="background:var(--card-bg,#f1f5f9);border-radius:12px;padding:12px;font-size:0.82rem;display:grid;gap:6px;">
                    <div><b style="color:var(--accent-color);">📋 권장 함량:</b> ${n.dri}</div>
                    <div><b style="color:#10b981;">🥗 주요 식품:</b> ${n.food}</div>
                    <div><b style="color:#6366f1;">⏰ 복용 타이밍:</b> ${n.timing}</div>
                    ${n.caution ? `<div style="color:#f59e0b;"><b>⚠️ 주의:</b> ${n.caution.length > 80 ? n.caution.slice(0,80)+'…' : n.caution}</div>` : ''}
                </div>
            </div>`;

        const timingHTML = Object.entries(r.timingGroups)
            .filter(([,list]) => list.length > 0)
            .map(([time, list]) => `
                <div style="display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid var(--border-color);">
                    <span style="font-size:0.8rem;font-weight:900;color:var(--primary-color);min-width:90px;padding-top:2px;">${time}</span>
                    <span style="font-size:0.88rem;color:var(--text-color);line-height:1.6;">${list.join(', ')}</span>
                </div>`).join('');

        aiResultContent.innerHTML = `
        <div class="luxury-report-card" style="overflow:hidden;">

            <!-- 헤더 -->
            <div class="report-header" style="padding:40px;border-bottom:1px solid var(--border-color);">
                <div class="report-badge">최적화된 영양 설계 완료</div>
                <h2 style="font-size:2rem;font-weight:900;margin:12px 0 8px;">${genderLabel} · ${ageLabel} · ${concernLabel}</h2>
                <p style="color:var(--text-muted);font-size:0.95rem;">60종 임상 데이터베이스 기반 · 라이프스타일 교차 분석 완료</p>
                <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">
                    <span style="background:#eff6ff;color:#3b82f6;padding:4px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;">스트레스 ${{low:'낮음',medium:'보통',high:'높음'}[r.stress]}</span>
                    <span style="background:#f0fdf4;color:#16a34a;padding:4px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;">${{normal:'일반식',vegetarian:'채식',vegan:'비건'}[r.diet]}</span>
                    <span style="background:#faf5ff;color:#7c3aed;padding:4px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;">운동 ${{low:'부족',medium:'적정',high:'활발'}[r.exercise]}</span>
                </div>
            </div>

            <!-- 핵심 영양소 -->
            <div style="padding:32px 40px;">
                <div style="font-size:0.75rem;font-weight:900;letter-spacing:1.5px;color:var(--primary-color);margin-bottom:16px;">CORE NUTRIENTS — 핵심 영양소 ★★★</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                    ${r.coreCards.map(n => nutrientCard(n, 'CORE', '#6366f1')).join('')}
                </div>
            </div>

            <!-- 보조 영양소 -->
            <div style="padding:0 40px 32px;">
                <div style="font-size:0.75rem;font-weight:900;letter-spacing:1.5px;color:#8b5cf6;margin-bottom:16px;">SUPPORT NUTRIENTS — 보조 영양소 ★★</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                    ${r.supportCards.map(n => nutrientCard(n, 'SUPPORT', '#8b5cf6')).join('')}
                </div>
            </div>

            ${r.extraCards.length > 0 ? `
            <!-- 라이프스타일 추가 -->
            <div style="padding:0 40px 32px;">
                <div style="font-size:0.75rem;font-weight:900;letter-spacing:1.5px;color:#10b981;margin-bottom:16px;">LIFESTYLE ADD-ON — 라이프스타일 맞춤 추가 ★</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                    ${r.extraCards.map(n => nutrientCard(n, 'ADD-ON', '#10b981')).join('')}
                </div>
            </div>` : ''}

            <!-- 복용 타이밍 가이드 -->
            <div style="margin:0 40px 32px;background:var(--card-bg,#f8fafc);border-radius:20px;padding:28px;">
                <div style="font-size:0.75rem;font-weight:900;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:16px;">⏰ TIMING GUIDE — 복용 타이밍 가이드</div>
                ${timingHTML}
                <p style="font-size:0.78rem;color:var(--text-muted);margin-top:12px;">* 지용성 비타민(A·D·E·K)은 반드시 지방이 포함된 식사와 함께, 철분은 비타민 C와 함께 복용하면 흡수율이 극대화됩니다.</p>
            </div>

            <!-- 라이프스타일 가이드 -->
            <div style="margin:0 40px 32px;border:1px solid var(--border-color);border-radius:20px;padding:28px;">
                <div style="font-size:0.75rem;font-weight:900;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:16px;">🌿 LIFESTYLE GUIDE — 개인화 생활 가이드</div>
                ${r.lifestyleGuide.map(g => `<p style="font-size:0.88rem;line-height:1.7;color:var(--text-color);margin-bottom:10px;">${g}</p>`).join('')}
            </div>

            <!-- 주의사항 -->
            <div style="margin:0 40px 40px;background:#fffbeb;border:1px solid #fde68a;border-radius:20px;padding:24px;">
                <div style="font-size:0.75rem;font-weight:900;letter-spacing:1.5px;color:#b45309;margin-bottom:12px;">⚠️ CLINICAL CAUTION — 임상 주의사항</div>
                <p style="font-size:0.85rem;line-height:1.7;color:#78350f;">본 분석 결과는 60종 임상 데이터베이스를 기반으로 한 일반적인 건강 정보입니다. 질환이 있거나 약물을 복용 중인 경우, 특히 <strong>항응고제·혈당강하제·항우울제·면역억제제</strong> 복용자는 반드시 의사 또는 약사와 상담 후 섭취하시기 바랍니다. 영양 보충제는 의약품을 대체하지 않습니다.</p>
            </div>

            <!-- 재분석 -->
            <div style="padding:0 40px 40px;text-align:center;">
                <button onclick="window.scrollTo({top:0,behavior:'smooth'})" class="luxury-btn" style="max-width:320px;margin:0 auto 16px;">🔄 조건 변경 후 재분석</button>
                ${window.getShareUI ? window.getShareUI('AI 맞춤 영양 리포트', 'VitalRest에서 저에게 딱 맞는 프리미엄 영양 성분 조합을 찾았어요!') : ''}
            </div>

        </div>`;
    }

    // 4. Search Functionality
    const KOREAN_TO_ENGLISH = {
        "비타민c": "vitamin c", "비타민 c": "vitamin c", "오메가3": "omega-3", "오메가-3": "omega-3",
        "루테인": "lutein", "마그네슘": "magnesium", "비타민d": "vitamin d", "비타민 d": "vitamin d",
        "아연": "zinc", "포스파티딜세린": "phosphatidylserine", "밀크씨슬": "milk thistle", "실리마린": "silymarin",
        "유산균": "probiotic", "글루타치온": "glutathione", "코엔자임q10": "coenzyme q10", "msm": "msm",
        "비타민b12": "vitamin b12", "감마리놀렌산": "gamma linolenic acid", "테아닌": "theanine",
        "히알루론산": "hyaluronic acid", "콜라겐": "collagen", "칼슘": "calcium", "비타민b6": "vitamin b6",
        "망간": "manganese", "아스피린": "aspirin", "타이레놀": "tylenol", "애드빌": "advil", "이부프로펜": "ibuprofen"
    };

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

    async function performSearch() {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) return;

        // 1. Local Search (immediate results)
        const filteredNutrients = nutrientData.filter(n => 
            n.name.toLowerCase().includes(q) || 
            n.efficacy.toLowerCase().includes(q) ||
            n.category.toLowerCase().includes(q)
        );

        const filteredDrugs = drugData.filter(d => 
            d.name.toLowerCase().includes(q) || 
            d.ingredients.toLowerCase().includes(q) ||
            d.efficacy.toLowerCase().includes(q)
        );

        renderSearchResults(filteredNutrients, filteredDrugs);

        // 2. FDA Global Search (Async)
        const translated = KOREAN_TO_ENGLISH[q] || q;
        const isEnglish = /[a-zA-Z]/.test(translated);

        if (isEnglish) {
            const loadingMsg = document.createElement('div');
            loadingMsg.id = 'fda-loading-status';
            loadingMsg.style.cssText = 'grid-column:1/-1; text-align:center; padding:20px;';
            loadingMsg.innerHTML = `
                <div class="premium-loader" style="width:30px; height:30px; margin:0 auto;"></div>
                <p style="margin-top:10px; font-size:0.9rem; color:var(--primary-color); font-weight:700;">FDA 글로벌 데이터베이스 검색 중...</p>
            `;
            drugListElement.appendChild(loadingMsg);

            try {
                const fdaResults = await searchFDA(translated);
                if (loadingMsg.parentNode) drugListElement.removeChild(loadingMsg);
                
                if (fdaResults.length > 0) {
                    if (filteredNutrients.length === 0 && filteredDrugs.length === 0) {
                        drugListElement.innerHTML = '';
                    }
                    renderFDAResults(fdaResults);
                } else if (filteredNutrients.length === 0 && filteredDrugs.length === 0) {
                    drugListElement.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px;">검색 결과가 없습니다. (글로벌 데이터 포함)</p>';
                }
            } catch (e) {
                if (loadingMsg.parentNode) drugListElement.removeChild(loadingMsg);
                console.error('FDA Search error:', e);
            }
        }
    }

    async function searchFDA(query) {
        const results = [];
        const enforcementUrl = `https://api.fda.gov/food/enforcement.json?search=product_description:"${query}"&limit=5`;
        const labelUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"&limit=5`;

        try {
            const [enforcementRes, labelRes] = await Promise.allSettled([
                fetch(enforcementUrl).then(r => r.ok ? r.json() : null),
                fetch(labelUrl).then(r => r.ok ? r.json() : null)
            ]);

            if (enforcementRes.status === 'fulfilled' && enforcementRes.value && enforcementRes.value.results) {
                enforcementRes.value.results.forEach(item => results.push({ ...item, fdaType: 'enforcement' }));
            }
            if (labelRes.status === 'fulfilled' && labelRes.value && labelRes.value.results) {
                labelRes.value.results.forEach(item => results.push({ ...item, fdaType: 'label' }));
            }
        } catch (e) {
            console.warn('FDA fetch failed', e);
        }
        return results;
    }

    function renderFDAResults(results) {
        if (!drugListElement) return;
        
        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'drug-card';
            
            if (item.fdaType === 'enforcement') {
                card.style.borderLeft = '6px solid #ef4444';
                card.innerHTML = `
                    <div class="card-category" style="background: #ef4444; color: white;">FDA Safety Recall</div>
                    <h3 class="card-name">${item.recalling_firm}</h3>
                    <p style="font-size:0.85rem; color:#ef4444; font-weight:700;">Recalled Product</p>
                    <div class="card-efficacy" style="margin-top:10px; font-size:0.8rem; color:#475569;">${item.product_description.substring(0,100)}...</div>
                `;
                card.onclick = () => showFDAEnforcementDetail(item);
            } else {
                card.style.borderLeft = '6px solid #3b82f6';
                const brandName = (item.openfda && item.openfda.brand_name) ? item.openfda.brand_name[0] : 'Global Drug Data';
                card.innerHTML = `
                    <div class="card-category" style="background: #3b82f6; color: white;">FDA Global Label</div>
                    <h3 class="card-name">${brandName}</h3>
                    <p style="font-size:0.85rem; color:#3b82f6; font-weight:700;">International Standard</p>
                    <div class="card-efficacy" style="margin-top:10px; font-size:0.8rem; color:#475569;">${(item.indications_and_usage ? item.indications_and_usage[0] : 'View details').substring(0,100)}...</div>
                `;
                card.onclick = () => showFDADrugDetail(item);
            }
            drugListElement.appendChild(card);
        });
    }

    window.showFDAEnforcementDetail = function(item) {
        if (!modal) return;
        modalContent.innerHTML = `
            <div class="report-header" style="text-align: left; padding: 0 0 30px; background: none; border-bottom: 2px solid #fee2e2;">
                <div class="report-badge" style="background:#ef4444; color:white;">FDA 리콜 정보</div>
                <h2 style="font-size: 2rem; margin-top: 10px; color:#b91c1c;">${item.recalling_firm}</h2>
                <p style="color: #ef4444; font-weight: 800; font-size: 1.1rem;">리콜 상태: ${item.status}</p>
            </div>
            <div style="margin-top: 30px; display: grid; gap: 20px;">
                <div style="background: #fef2f2; padding: 25px; border-radius: 20px; border: 1px solid #fee2e2;">
                    <h4 style="color: #dc2626; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle"></i> 리콜 사유</h4>
                    <p style="line-height: 1.6; color: #991b1b;">${item.reason_for_recall}</p>
                </div>
                <div style="background: #f8fafc; padding: 20px; border-radius: 15px;">
                    <h5 style="color: #475569; margin-bottom: 8px;">제품 설명</h5>
                    <p style="font-size: 0.9rem; line-height: 1.5;">${item.product_description}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 12px;">
                        <h6 style="font-size: 0.75rem; color: #64748b; margin-bottom: 5px;">리콜 등급</h6>
                        <p style="font-weight: 700;">${item.classification}</p>
                    </div>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 12px;">
                        <h6 style="font-size: 0.75rem; color: #64748b; margin-bottom: 5px;">개시 일자</h6>
                        <p style="font-weight: 700;">${item.recall_initiation_date}</p>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    };

    window.showFDADrugDetail = function(item) {
        if (!modal) return;
        const brandName = (item.openfda && item.openfda.brand_name) ? item.openfda.brand_name[0] : 'Global Drug Data';
        const manufacturer = (item.openfda && item.openfda.manufacturer_name) ? item.openfda.manufacturer_name[0] : 'Unknown';
        
        modalContent.innerHTML = `
            <div class="report-header" style="text-align: left; padding: 0 0 30px; background: none; border-bottom: 2px solid #dbeafe;">
                <div class="report-badge" style="background:#3b82f6; color:white;">FDA 의약품 정보</div>
                <h2 style="font-size: 2.2rem; margin-top: 10px; color:#1e40af;">${brandName}</h2>
                <p style="color: #3b82f6; font-weight: 800;">${manufacturer}</p>
            </div>
            <div style="margin-top: 30px; display: grid; gap: 20px;">
                <div style="background: #eff6ff; padding: 25px; border-radius: 20px;">
                    <h4 style="color: #1e40af; margin-bottom: 10px;">적응증 및 용법</h4>
                    <p style="line-height: 1.6;">${item.indications_and_usage ? item.indications_and_usage[0] : '정보 없음'}</p>
                </div>
                <div style="background: #f8fafc; padding: 25px; border-radius: 20px;">
                    <h4 style="color: #1e40af; margin-bottom: 10px;">용량 및 투여</h4>
                    <p style="line-height: 1.6;">${item.dosage_and_administration ? item.dosage_and_administration[0] : '정보 없음'}</p>
                </div>
                <div style="background: #fffbeb; padding: 25px; border-radius: 20px; border: 1px solid #fef3c7;">
                    <h4 style="color: #92400e; margin-bottom: 10px;"><i class="fas fa-exclamation-circle"></i> 경고 사항</h4>
                    <p style="line-height: 1.6; color: #92400e;">${item.warnings ? item.warnings[0] : '정보 없음'}</p>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    };

    function renderSearchResults(nutrients, drugs) {
        if (!drugListElement) return;
        const totalCount = nutrients.length + drugs.length;
        drugListElement.innerHTML = totalCount ? '' : '<p style="grid-column:1/-1; text-align:center; padding:40px;">검색 결과가 없습니다.</p>';

        // Render Nutrients First (Encyclopedia style)
        nutrients.forEach(n => {
            const card = document.createElement('div');
            card.className = 'drug-card';
            card.style.borderLeft = '6px solid var(--accent-color)';
            card.innerHTML = `
                <div class="card-category" style="background: var(--accent-color); color: white;">성분 백과</div>
                <h3 class="card-name">${n.name}</h3>
                <p style="font-size:0.85rem; color: var(--accent-color); font-weight: 700;">${n.category}</p>
                <div class="card-efficacy" style="margin-top:10px; font-size:0.9rem; color:#475569;">${n.efficacy.substring(0,80)}...</div>
            `;
            card.onclick = () => showNutrientDetail(n.id);
            drugListElement.appendChild(card);
        });

        // Render Drugs
        drugs.forEach(d => {
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

    window.showNutrientDetail = function(id) {
        const n = nutrientData.find(x => x.id === id);
        if (!n || !modal) return;
        modalContent.innerHTML = `
            <div class="report-header" style="text-align: left; padding: 0 0 30px; background: none; border-bottom: 2px solid var(--border-color);">
                <div class="report-badge">영양 성분 백과</div>
                <h2 style="font-size: 2.5rem; margin-top: 10px;">${n.name}</h2>
                <p style="color: var(--accent-color); font-weight: 800; font-size: 1.1rem;">${n.category}</p>
            </div>
            <div style="margin-top: 30px; display: grid; gap: 25px;">
                <div style="background: var(--bg-color); padding: 25px; border-radius: 20px;">
                    <h4 style="color: var(--primary-color); margin-bottom: 10px;"><i class="fas fa-info-circle"></i> 성분 설명</h4>
                    <p style="line-height: 1.8; color: var(--text-main);">${n.description}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 15px; border-left: 5px solid #22c55e;">
                        <h5 style="color: #166534; margin-bottom: 8px;">주요 효능</h5>
                        <p style="font-size: 0.9rem;">${n.efficacy}</p>
                    </div>
                    <div style="background: #fffbeb; padding: 20px; border-radius: 15px; border-left: 5px solid #f59e0b;">
                        <h5 style="color: #92400e; margin-bottom: 8px;">일일 권장량</h5>
                        <p style="font-size: 0.9rem;">${n.dri}</p>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 25px; border-radius: 20px;">
                    <h4 style="color: var(--primary-color); margin-bottom: 10px;"><i class="fas fa-utensils"></i> 풍부한 식품</h4>
                    <p style="font-size: 0.95rem;">${n.food}</p>
                </div>

                <div style="background: #fef2f2; padding: 25px; border-radius: 20px; border: 1px solid #fee2e2;">
                    <h4 style="color: #dc2626; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle"></i> 주의사항</h4>
                    <p style="font-size: 0.95rem; color: #991b1b;">${n.caution}</p>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    };

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
