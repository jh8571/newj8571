// ── VitalGuide Firebase Auth & User Data ──────────────────────────────────
import { initializeApp }          from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup,
         createUserWithEmailAndPassword, signInWithEmailAndPassword,
         GoogleAuthProvider, signOut, updateProfile }
                                   from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc,
         arrayUnion, serverTimestamp, runTransaction }
                                   from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDN56a13brgJNV0Bw5YLg8N-D4ofn-AJc4",
  authDomain:        "vi7al-e79f9.firebaseapp.com",
  projectId:         "vi7al-e79f9",
  storageBucket:     "vi7al-e79f9.firebasestorage.app",
  messagingSenderId: "132141266017",
  appId:             "1:132141266017:web:eb51dad083e327e076a620",
  measurementId:     "G-SVKGQY7C32"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
export { db, auth };

// ── Level System ───────────────────────────────────────────────────────────
// 10개 티어 (각 10레벨, 마지막 Lv.100은 단독)
const TIERS = [
  { min:  1, max: 10,  icon:'🌱', ko:'새싹',          en:'Sprout'   },
  { min: 11, max: 20,  icon:'🌿', ko:'성장',          en:'Growth'   },
  { min: 21, max: 30,  icon:'💧', ko:'활력 충전',     en:'Hydrated' },
  { min: 31, max: 40,  icon:'☀️', ko:'건강 루틴',     en:'Routine'  },
  { min: 41, max: 50,  icon:'⚡', ko:'에너지',        en:'Energy'   },
  { min: 51, max: 60,  icon:'🔥', ko:'열정',          en:'Passion'  },
  { min: 61, max: 70,  icon:'💪', ko:'건강 전사',     en:'Warrior'  },
  { min: 71, max: 80,  icon:'🧬', ko:'웰니스 전문가', en:'Expert'   },
  { min: 81, max: 90,  icon:'🌟', ko:'빛나는 건강인', en:'Radiant'  },
  { min: 91, max: 99,  icon:'🏆', ko:'웰니스 챔피언', en:'Champion' },
  { min:100, max:100,  icon:'👑', ko:'VitalGuide 레전드', en:'VitalGuide Legend' },
];

// 레벨 n의 누적 XP 임계값
function levelThreshold(n) {
  if (n <= 1) return 0;
  return Math.round(Math.pow(n - 1, 1.6) * 20);
}

// XP → 레벨
function levelFromXP(xp) {
  let lv = 1;
  for (let n = 2; n <= 100; n++) {
    if (xp >= levelThreshold(n)) lv = n;
    else break;
  }
  return lv;
}

function getTier(lv) {
  return TIERS.find(t => lv >= t.min && lv <= t.max) || TIERS[0];
}

export function getLevelInfo(xp) {
  const level  = levelFromXP(xp);
  const tier   = getTier(level);
  const curXP  = levelThreshold(level);
  const nextXP = level < 100 ? levelThreshold(level + 1) : null;
  const pct    = nextXP ? Math.round(((xp - curXP) / (nextXP - curXP)) * 100) : 100;
  const name   = level === 100 ? `${tier.icon} ${tier.ko}` : `${tier.icon} ${tier.ko} Lv.${level}`;
  const nameEn = level === 100 ? `${tier.icon} ${tier.en}` : `${tier.icon} ${tier.en} Lv.${level}`;
  return { level, tier, name, nameEn, xp, curXP, nextXP, pct };
}

export { levelThreshold, getTier, TIERS };

// ── Firestore helpers ──────────────────────────────────────────────────────
async function getUserDoc(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

async function createUserProfile(uid, displayName, email) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    displayName: displayName || '익명',
    email:       email || '',
    xp:          0,
    level:       1,
    joinedAt:    serverTimestamp(),
    results:     {},
    gameScores:  {},
    activityLog: [],
  }, { merge: true });
}

// ── Auth state ─────────────────────────────────────────────────────────────
let _currentUser  = null;
let _currentData  = null;
const _listeners  = [];


export function onUserChange(cb) { _listeners.push(cb); }

onAuthStateChanged(auth, async user => {
  if (user) {
    _currentUser = user;
    _currentData = await getUserDoc(user.uid);
    if (!_currentData) {
      await createUserProfile(user.uid, user.displayName, user.email);
      _currentData = await getUserDoc(user.uid);
    }
    // 레벨 공식 변경 시 기존 유저 레벨 자동 재계산 + 랭킹 즉시 반영
    const correctLevel = levelFromXP(_currentData.xp || 0);
    if ((_currentData.level || 1) !== correctLevel) {
      await updateDoc(doc(db, 'users', user.uid), { level: correctLevel });
      _currentData = { ..._currentData, level: correctLevel };
      await _updateXPLB();  // 랭킹 문서도 새 레벨로 업데이트
    }
  } else {
    _currentUser = null;
    _currentData = null;
  }
  _listeners.forEach(cb => cb(_currentUser, _currentData));
  window._vgUser     = _currentUser;
  window._vgUserData = _currentData;
  updateHeaderUI(_currentUser, _currentData);
});

export function getCurrentUser()     { return _currentUser; }
export function getCurrentUserData() { return _currentData; }

// ── Sign in / out ──────────────────────────────────────────────────────────
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isInAppBrowser() {
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line|KAKAOTALK|KakaoTalk|NaverApp|Twitter|Snapchat|WeChat|MicroMessenger/.test(ua)
    || (ua.includes('Android') && ua.includes('; wv)'))
    || (ua.includes('iPhone') && !ua.includes('Safari') && !ua.includes('CriOS') && !ua.includes('FxiOS'));
}

export function showInAppBrowserGuide() {
  const lang = localStorage.getItem('lang') || 'ko';
  const ua = navigator.userAgent;
  const isAndroid = /Android/.test(ua);

  // Android KakaoTalk → Chrome으로 자동 전환 시도
  if (isAndroid && /KAKAOTALK|KakaoTalk/.test(ua)) {
    const url = location.href;
    window.location.href = 'intent://' + location.host + location.pathname + location.search
      + '#Intent;scheme=https;package=com.android.chrome;end;';
    // 0.5초 후에도 안 열리면 안내 팝업 표시
    setTimeout(() => _showInAppGuidePopup(lang), 500);
    return;
  }

  _showInAppGuidePopup(lang);
}

function _showInAppGuidePopup(lang) {
  if (document.getElementById('vg-inapp-guide')) return;
  const overlay = document.createElement('div');
  overlay.id = 'vg-inapp-guide';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100001;
    display:flex;align-items:flex-end;justify-content:center;padding:20px;backdrop-filter:blur(4px);`;

  overlay.innerHTML = `
    <div style="background:var(--card-bg);border-radius:24px 24px 20px 20px;padding:32px 28px;
      width:100%;max-width:480px;box-shadow:0 -10px 40px rgba(0,0,0,0.3);text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:12px;">🌐</div>
      <h3 style="font-size:1.1rem;font-weight:900;margin-bottom:10px;">
        ${lang==='ko' ? '외부 브라우저에서 열어주세요' : 'Open in External Browser'}
      </h3>
      <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.7;margin-bottom:20px;">
        ${lang==='ko'
          ? '카카오톡·인스타그램 등 앱 내 브라우저에서는<br>구글 로그인이 차단됩니다.<br><br>우측 하단 <strong>⋯ 메뉴 → Chrome(또는 Safari)으로 열기</strong>를 선택해주세요.'
          : 'Google Sign-In is blocked inside in-app browsers.<br><br>Tap the <strong>⋯ menu → Open in Chrome (or Safari)</strong>.'}
      </p>
      <button onclick="document.getElementById('vg-inapp-guide').remove()"
        style="width:100%;padding:14px;background:var(--primary-color);color:white;border:none;
          border-radius:14px;font-size:0.95rem;font-weight:800;cursor:pointer;">
        ${lang==='ko' ? '확인' : 'OK'}
      </button>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── Kakao Auth ─────────────────────────────────────────────────────────────
const KAKAO_JS_KEY   = 'aab8c65bef75cf69f10357ebaf3a03e8'; // SDK 초기화용 (JavaScript 키)
const KAKAO_REST_KEY = 'e3952ba4b233d081484238204e9af8ca'; // OAuth 인증용 (REST API 키)

function loadKakaoSDK() {
  return new Promise(resolve => {
    if (window.Kakao) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

// Kakao 인증 후 돌아올 URI (Kakao Developers에 정확히 등록 필요)
const KAKAO_REDIRECT_URI = 'https://vi7al.com';

async function _saveKakaoUser(res) {
  const kakaoId  = String(res.id);
  const nickname = res.kakao_account?.profile?.nickname || res.properties?.nickname || '카카오 사용자';
  const photo    = res.kakao_account?.profile?.thumbnail_image_url || res.properties?.thumbnail_image || '';
  const uid      = 'kakao_' + kakaoId;

  const ref  = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: nickname, email: '', photoURL: photo,
      xp: 0, level: 1, joinedAt: serverTimestamp(),
      results: {}, gameScores: {}, activityLog: [], provider: 'kakao',
    }, { merge: true });
  }

  const dataSnap  = await getDoc(ref);
  _currentUser    = { uid, displayName: nickname, photoURL: photo, email: '', isKakao: true };
  _currentData    = dataSnap.data();
  window._vgUser     = _currentUser;
  window._vgUserData = _currentData;

  localStorage.setItem('vg_kakao_uid',   uid);
  localStorage.setItem('vg_kakao_name',  nickname);
  localStorage.setItem('vg_kakao_photo', photo);

  _listeners.forEach(cb => cb(_currentUser, _currentData));
  updateHeaderUI(_currentUser, _currentData);
}

async function _fetchKakaoUser() {
  return await Kakao.API.request({ url: '/v2/user/me' });
}

async function _exchangeCodeAndLogin(code) {
  const tokenBody = new URLSearchParams({
    grant_type:   'authorization_code',
    client_id:    KAKAO_REST_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    code,
  });

  // Kakao 토큰 엔드포인트 직접 호출
  const res = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: tokenBody,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch(e) { throw new Error('응답 파싱 오류 (status ' + res.status + '): ' + text.substring(0, 300)); }
  if (!data.access_token) throw new Error(data.error_description || JSON.stringify(data));

  await loadKakaoSDK();
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
  Kakao.Auth.setAccessToken(data.access_token, true);

  const userRes = await _fetchKakaoUser();
  await _saveKakaoUser(userRes);
}

export async function signInKakao() {
  await loadKakaoSDK();
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);

  // 이미 토큰이 있으면 바로 사용자 정보 획득
  if (Kakao.Auth.getAccessToken()) {
    try {
      const userRes = await _fetchKakaoUser();
      await _saveKakaoUser(userRes);
      return;
    } catch(e) {
      Kakao.Auth.setAccessToken(null);
    }
  }

  // 현재 페이지 기억 (로그인 후 복귀용)
  sessionStorage.setItem('kakao_return_to', location.href);

  // REST API 키로 OAuth URL 직접 생성 (Kakao.Auth.authorize는 JS키를 사용해 KOE006 발생)
  const authUrl = 'https://kauth.kakao.com/oauth/authorize?' + new URLSearchParams({
    client_id:     KAKAO_REST_KEY,
    redirect_uri:  KAKAO_REDIRECT_URI,
    response_type: 'code',
    state:         'vg_kakao',
  });
  location.href = authUrl;
}

// ── 페이지 로드 시 Kakao OAuth 콜백 처리 ───────────────────────────────────
async function _handleKakaoCallback() {
  const params = new URLSearchParams(location.search);
  const code   = params.get('code');
  const state  = params.get('state');
  if (!code || state !== 'vg_kakao') return;

  history.replaceState({}, '', location.pathname);

  try {
    await _exchangeCodeAndLogin(code);
    const returnTo = sessionStorage.getItem('kakao_return_to');
    sessionStorage.removeItem('kakao_return_to');
    if (returnTo && !returnTo.startsWith(location.href)) {
      location.href = returnTo;
    } else {
      toast('카카오 로그인 성공! 🎉', '#FEE500');
    }
  } catch(e) {
    console.error('Kakao callback error:', e);
    toast('카카오 오류: ' + (e.message || JSON.stringify(e)), '#ef4444', 5000);
  }
}

export async function restoreKakaoSession() {
  const uid = localStorage.getItem('vg_kakao_uid');
  if (!uid || _currentUser) return;
  try {
    const ref  = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) { localStorage.removeItem('vg_kakao_uid'); return; }
    const nickname = localStorage.getItem('vg_kakao_name')  || '카카오 사용자';
    const photo    = localStorage.getItem('vg_kakao_photo') || '';
    _currentUser = { uid, displayName: nickname, photoURL: photo, email: '', isKakao: true };
    _currentData = snap.data();
    window._vgUser     = _currentUser;
    window._vgUserData = _currentData;
    _listeners.forEach(cb => cb(_currentUser, _currentData));
    updateHeaderUI(_currentUser, _currentData);
  } catch(e) { console.warn('Kakao session restore error', e); }
}

export async function signInGoogle() {
  if (isInAppBrowser()) {
    showInAppBrowserGuide();
    return;
  }
  const provider = new GoogleAuthProvider();
  try {
    // 모바일 포함 항상 Popup 사용 (Redirect는 일부 모바일 브라우저에서 결과 유실)
    await signInWithPopup(auth, provider);
  } catch(e) { console.error(e); throw e; }
}

export async function signInEmail(email, password) {
  try { await signInWithEmailAndPassword(auth, email, password); }
  catch(e) { throw e; }
}

export async function signUpEmail(email, password, nickname) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: nickname });
    await createUserProfile(cred.user.uid, nickname, email);
  } catch(e) { throw e; }
}

export async function signOutUser() {
  // 카카오 세션 초기화
  if (_currentUser?.isKakao) {
    localStorage.removeItem('vg_kakao_uid');
    localStorage.removeItem('vg_kakao_name');
    localStorage.removeItem('vg_kakao_photo');
    if (window.Kakao?.Auth?.getAccessToken()) {
      try { await new Promise(r => Kakao.Auth.logout(r)); } catch(e) {}
    }
    _currentUser  = null;
    _currentData  = null;
    window._vgUser     = null;
    window._vgUserData = null;
    _listeners.forEach(cb => cb(null, null));
    updateHeaderUI(null, null);
    return;
  }
  // Firebase 로그아웃
  await signOut(auth);
}

// ── 리더보드 업데이트 ──────────────────────────────────────────────────────
async function _updateLB(key, score) {
  if (!_currentUser) return;
  const uid   = _currentUser.uid;
  const name  = _currentUser.displayName || '익명';
  const photo = _currentUser.photoURL || '';
  const ref   = doc(db, 'leaderboard', key);
  try {
    await runTransaction(db, async tx => {
      const snap = await tx.get(ref);
      let top = snap.exists() ? (snap.data().top || []) : [];
      top = top.filter(e => e.uid !== uid);
      top.push({ uid, name, score, photo });
      top.sort((a, b) => b.score - a.score);
      top = top.slice(0, 10);
      tx.set(ref, { top }, { merge: true });
    });
  } catch(e) { console.warn('LB update error', e); }
}

async function _updateXPLB() {
  if (!_currentUser || !_currentData) return;
  const uid   = _currentUser.uid;
  const name  = _currentUser.displayName || '익명';
  const photo = _currentUser.photoURL || '';
  const xp    = _currentData.xp || 0;
  const level = _currentData.level || 1;
  const tier  = getTier(level);
  const ref   = doc(db, 'leaderboard', '_xp');
  try {
    await runTransaction(db, async tx => {
      const snap = await tx.get(ref);
      let top = snap.exists() ? (snap.data().top || []) : [];
      top = top.filter(e => e.uid !== uid);
      top.push({ uid, name, xp, level, tier: tier.icon + ' ' + tier.ko, photo });
      top.sort((a, b) => b.xp - a.xp);
      top = top.slice(0, 10);
      tx.set(ref, { top }, { merge: true });
    });
  } catch(e) { console.warn('XP LB update error', e); }
}

export async function getLeaderboard(key) {
  const ref  = doc(db, 'leaderboard', key);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().top || []) : [];
}

// ── XP 보상표 ──────────────────────────────────────────────────────────────
const XP_REWARDS = {
  gamePlayed:        { xp: 10, label: '🎮 게임 플레이' },
  gameScore:         { xp: 60, label: '🏆 신기록 달성!' },
  mbti:              { xp: 20, label: '🧠 MBTI 테스트 완료' },
  psychology:        { xp: 20, label: '🔬 심리 테스트 완료' },
  healthType:        { xp: 20, label: '💪 건강 유형 테스트 완료' },
  biologicalAge:     { xp: 15, label: '🧬 생체나이 계산 완료' },
  bmiCalculator:     { xp: 15, label: '⚖️ BMI 계산 완료' },
  runningCalculator: { xp: 15, label: '🏃 런닝 계산 완료' },
};

// ── XP & record saving ─────────────────────────────────────────────────────
export async function awardXP(activityKey, extraData = {}) {
  if (!_currentUser) return;
  const reward = XP_REWARDS[activityKey];
  if (!reward) return;

  const ref = doc(db, 'users', _currentUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const newXP    = (data.xp || 0) + reward.xp;
  const newLevel = levelFromXP(newXP);

  const logEntry = {
    type:  activityKey,
    label: reward.label,
    xp:    reward.xp,
    ts:    new Date().toISOString(),
    ...extraData,
  };

  const updatePayload = {
    xp:          newXP,
    level:       newLevel,
    activityLog: arrayUnion(logEntry),
  };

  // 결과물 저장
  if (extraData.result !== undefined) {
    updatePayload[`results.${activityKey}`] = {
      value: extraData.result,
      savedAt: new Date().toISOString(),
    };
  }

  await updateDoc(ref, updatePayload);
  _currentData = { ..._currentData, xp: newXP, level: newLevel };
  window._vgUserData = _currentData;
  updateHeaderUI(_currentUser, _currentData);
  // XP 랭킹 업데이트
  await _updateXPLB();

  // 레벨업 체크
  if (newLevel > (data.level || 1)) {
    showLevelUpToast(newLevel);
  } else {
    showXPToast(reward.xp, reward.label);
  }
}

export async function saveGameScore(gameName, score) {
  if (!_currentUser) return;
  const ref = doc(db, 'users', _currentUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data   = snap.data();
  const prev   = data.gameScores?.[gameName] || 0;
  const isNew  = score > prev;

  if (isNew) {
    await updateDoc(ref, { [`gameScores.${gameName}`]: score });
    await _updateLB(gameName, score);
    const newScores = { ...(data.gameScores || {}), [gameName]: score };
    const total = Object.values(newScores).reduce((a, b) => a + b, 0);
    await _updateLB('_total', total);
    await awardXP('gameScore', { game: gameName, score });   // 신기록: +60 XP
  } else {
    await awardXP('gamePlayed', { game: gameName, score });  // 일반 플레이: +10 XP
  }
}

// ── Toast notifications ────────────────────────────────────────────────────
function showXPToast(xp, label) {
  toast(`+${xp} XP — ${label}`, '#10b981');
}

function showLevelUpToast(level) {
  const tier = getTier(level);
  const lang = localStorage.getItem('lang') || 'ko';
  const lvName = level === 100 ? (lang==='ko'?tier.ko:tier.en) : `${lang==='ko'?tier.ko:tier.en} Lv.${level}`;
  toast(`🎉 레벨업! ${tier.icon} ${lvName}`, '#f59e0b', 4000);
}

function toast(msg, color = '#0f172a', duration = 3000) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:${color};color:white;padding:12px 22px;border-radius:14px;font-size:0.9rem;
    font-weight:700;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.2);
    animation:vgToastIn 0.3s ease;white-space:nowrap;max-width:90vw;`;
  el.textContent = msg;
  if (!document.getElementById('vg-toast-style')) {
    const s = document.createElement('style');
    s.id = 'vg-toast-style';
    s.textContent = `@keyframes vgToastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
    document.head.appendChild(s);
  }
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, duration);
}

// ── Header UI injection ────────────────────────────────────────────────────
function updateHeaderUI(user, data) {
  let btn = document.getElementById('vg-auth-btn');
  const lang = localStorage.getItem('lang') || 'ko';

  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'vg-auth-btn';
    btn.style.cssText = `background:var(--border-color);border:none;height:40px;padding:0 14px;
      border-radius:12px;cursor:pointer;color:var(--text-main);font-weight:800;font-size:0.8rem;
      display:flex;align-items:center;gap:7px;transition:0.2s;white-space:nowrap;`;
    btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
    btn.onmouseout  = () => btn.style.transform = '';
    const bar = document.querySelector('.controls-bar');
    if (bar) bar.prepend(btn);
  }

  if (user && data) {
    const lvInfo = getLevelInfo(data.xp || 0);
    const avatar = user.photoURL
      ? `<img src="${user.photoURL}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;">`
      : `<span style="font-size:1rem;">${lvInfo.name.split(' ')[0]}</span>`;
    btn.innerHTML = `${avatar}<span>Lv.${lvInfo.level}</span>`;
    btn.title = lang === 'ko' ? `${user.displayName || '사용자'} · ${data.xp || 0} XP` : `${user.displayName || 'User'} · ${data.xp || 0} XP`;
    btn.onclick = () => { location.href = 'profile.html'; };
  } else {
    btn.innerHTML = `<i class="fas fa-user" style="font-size:0.85rem;"></i>${lang === 'ko' ? '로그인' : 'Login'}`;
    btn.onclick = () => showAuthModal();
  }
}

// ── Auth Modal ─────────────────────────────────────────────────────────────
export function showAuthModal() {
  if (document.getElementById('vg-auth-modal')) return;
  const lang = localStorage.getItem('lang') || 'ko';

  const overlay = document.createElement('div');
  overlay.id = 'vg-auth-modal';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100000;
    display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);`;

  overlay.innerHTML = `
    <div style="background:var(--card-bg);border-radius:28px;padding:40px 36px;max-width:440px;
      width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.25);border:1px solid var(--border-color);
      animation:vgModalIn 0.3s ease;position:relative;">
      <style>@keyframes vgModalIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}</style>
      <button onclick="document.getElementById('vg-auth-modal').remove()"
        style="position:absolute;top:16px;right:16px;background:var(--border-color);border:none;
          width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1.1rem;color:var(--text-muted);">✕</button>

      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:2.5rem;margin-bottom:10px;">🏃</div>
        <h2 style="font-size:1.5rem;font-weight:900;margin-bottom:6px;">${lang === 'ko' ? '로그인 · 회원가입' : 'Login · Sign Up'}</h2>
        <p style="font-size:0.85rem;color:var(--text-muted);">${lang === 'ko' ? '결과를 저장하고 레벨을 올려보세요' : 'Save results and level up'}</p>
      </div>

      <!-- Kakao -->
      <button id="vg-kakao-btn" style="width:100%;padding:14px;background:#FEE500;color:#191919;
        border:none;border-radius:14px;font-size:0.95rem;font-weight:800;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px;transition:0.2s;"
        onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.1 4 6.6l-1 3.7 4.3-2.8c.9.1 1.8.2 2.7.2 5.523 0 10-3.477 10-7.7S17.523 3 12 3z"/>
        </svg>
        ${lang === 'ko' ? '카카오로 계속하기' : 'Continue with Kakao'}
      </button>

      <!-- Google -->
      <button id="vg-google-btn" style="width:100%;padding:14px;background:#fff;color:#1e293b;
        border:2px solid #e2e8f0;border-radius:14px;font-size:0.95rem;font-weight:800;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;transition:0.2s;"
        onmouseover="this.style.borderColor='#4285F4'" onmouseout="this.style.borderColor='#e2e8f0'">
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.5 29.6 1.5 24 1.5 14.8 1.5 7 7.1 3.7 15l7 5.4C12.4 14.3 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.8 37.4 46.5 31.4 46.5 24.5z"/>
          <path fill="#FBBC05" d="M10.7 28.5C10.2 27 10 25.5 10 24s.2-3 .7-4.5L3.7 14C2 17.2 1 20.5 1 24s1 6.8 2.7 10l7-5.5z"/>
          <path fill="#34A853" d="M24 46.5c5.6 0 10.3-1.9 13.8-5l-7.4-5.7c-1.8 1.2-4.1 2-6.4 2-6.3 0-11.6-4.3-13.3-10l-7 5.4C7 40.9 14.8 46.5 24 46.5z"/>
        </svg>
        Google${lang === 'ko' ? '로 계속하기' : ' 로그인'}
      </button>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <div style="flex:1;height:1px;background:var(--border-color);"></div>
        <span style="font-size:0.78rem;color:var(--text-muted);font-weight:700;">OR</span>
        <div style="flex:1;height:1px;background:var(--border-color);"></div>
      </div>

      <!-- Tab -->
      <div style="display:flex;background:var(--bg-color);border-radius:12px;padding:4px;margin-bottom:20px;">
        <button id="tab-login" onclick="switchTab('login')" style="flex:1;padding:10px;border:none;border-radius:9px;
          font-weight:800;font-size:0.88rem;cursor:pointer;background:var(--primary-color);color:white;transition:0.2s;">
          ${lang === 'ko' ? '로그인' : 'Login'}
        </button>
        <button id="tab-signup" onclick="switchTab('signup')" style="flex:1;padding:10px;border:none;
          border-radius:9px;font-weight:800;font-size:0.88rem;cursor:pointer;background:transparent;
          color:var(--text-muted);transition:0.2s;">
          ${lang === 'ko' ? '회원가입' : 'Sign Up'}
        </button>
      </div>

      <div id="auth-form-area">
        <input id="auth-email" type="email" placeholder="${lang === 'ko' ? '이메일' : 'Email'}"
          style="width:100%;padding:13px 16px;border:2px solid var(--border-color);border-radius:13px;
            font-size:0.95rem;background:var(--card-bg);color:var(--text-main);outline:none;margin-bottom:10px;box-sizing:border-box;"
          onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='var(--border-color)'">
        <div id="signup-nickname-wrap" style="display:none;">
          <input id="auth-nickname" type="text" placeholder="${lang === 'ko' ? '닉네임 (2~12자)' : 'Nickname (2–12 chars)'}"
            style="width:100%;padding:13px 16px;border:2px solid var(--border-color);border-radius:13px;
              font-size:0.95rem;background:var(--card-bg);color:var(--text-main);outline:none;margin-bottom:10px;box-sizing:border-box;"
            onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='var(--border-color)'">
        </div>
        <input id="auth-password" type="password" placeholder="${lang === 'ko' ? '비밀번호 (8자 이상, 영문+숫자)' : 'Password (8+ chars, letters+numbers)'}" autocomplete="current-password"
          style="width:100%;padding:13px 16px;border:2px solid var(--border-color);border-radius:13px;
            font-size:0.95rem;background:var(--card-bg);color:var(--text-main);outline:none;margin-bottom:16px;box-sizing:border-box;"
          onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='var(--border-color)'"
          onkeydown="if(event.key==='Enter') document.getElementById('auth-submit').click()">
        <p id="auth-error" style="color:#ef4444;font-size:0.83rem;margin:-8px 0 12px;display:none;"></p>
        <button id="auth-submit" style="width:100%;padding:15px;background:var(--primary-color);color:white;
          border:none;border-radius:14px;font-size:1rem;font-weight:900;cursor:pointer;transition:opacity 0.2s;"
          onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
          ${lang === 'ko' ? '로그인' : 'Login'}
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  let mode = 'login';

  window.switchTab = function(m) {
    mode = m;
    const isSignup = m === 'signup';
    document.getElementById('tab-login').style.cssText  += isSignup ? 'background:transparent;color:var(--text-muted);' : 'background:var(--primary-color);color:white;';
    document.getElementById('tab-signup').style.cssText += isSignup ? 'background:var(--primary-color);color:white;' : 'background:transparent;color:var(--text-muted);';
    document.getElementById('signup-nickname-wrap').style.display = isSignup ? '' : 'none';
    document.getElementById('auth-submit').textContent = lang === 'ko' ? (isSignup ? '가입하기' : '로그인') : (isSignup ? 'Sign Up' : 'Login');
    document.getElementById('auth-password').autocomplete = isSignup ? 'new-password' : 'current-password';
  };

  document.getElementById('vg-kakao-btn').onclick = async () => {
    try {
      await signInKakao();
      document.getElementById('vg-auth-modal')?.remove();
    } catch(e) {
      console.error('Kakao login error:', e);
      const msg = e?.error_description || e?.message || JSON.stringify(e);
      showAuthError('카카오 오류: ' + msg);
    }
  };

  document.getElementById('vg-google-btn').onclick = async () => {
    try {
      await signInGoogle();
      document.getElementById('vg-auth-modal')?.remove();
    } catch(e) {
      showAuthError(e.message);
    }
  };

  let failCount = 0;

  document.getElementById('auth-submit').onclick = async () => {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const nickname = document.getElementById('auth-nickname')?.value.trim();
    const submitBtn = document.getElementById('auth-submit');
    const errEl    = document.getElementById('auth-error');
    errEl.style.display = 'none';

    if (!email || !password) { showAuthError(lang === 'ko' ? '이메일과 비밀번호를 입력해주세요.' : 'Enter email and password.'); return; }

    if (mode === 'signup') {
      // 비밀번호 강도 검사 (8자 이상, 영문+숫자 혼합)
      if (password.length < 8) {
        showAuthError(lang === 'ko' ? '비밀번호는 8자 이상이어야 합니다.' : 'Password must be at least 8 characters.');
        return;
      }
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        showAuthError(lang === 'ko' ? '비밀번호는 영문과 숫자를 모두 포함해야 합니다.' : 'Password must contain letters and numbers.');
        return;
      }
      if (!nickname || nickname.length < 2) {
        showAuthError(lang === 'ko' ? '닉네임을 2자 이상 입력해주세요.' : 'Nickname must be 2+ chars.');
        return;
      }
      // 닉네임 XSS 방지
      if (/<|>|&|"|'/.test(nickname)) {
        showAuthError(lang === 'ko' ? '닉네임에 사용할 수 없는 문자가 포함되어 있습니다.' : 'Nickname contains invalid characters.');
        return;
      }
    }

    // 5회 연속 실패 시 30초 잠금
    if (failCount >= 5) {
      showAuthError(lang === 'ko' ? '잠시 후 다시 시도해주세요. (보안 잠금)' : 'Too many attempts. Please wait.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    try {
      if (mode === 'signup') {
        await signUpEmail(email, password, nickname);
      } else {
        await signInEmail(email, password);
      }
      document.getElementById('vg-auth-modal')?.remove();
    } catch(e) {
      failCount++;
      // 이메일 존재 여부를 노출하지 않도록 user-not-found와 wrong-password를 동일 메시지로 처리
      const msg = {
        'auth/user-not-found':       lang === 'ko' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : 'Invalid email or password.',
        'auth/wrong-password':       lang === 'ko' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : 'Invalid email or password.',
        'auth/invalid-credential':   lang === 'ko' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : 'Invalid email or password.',
        'auth/email-already-in-use': lang === 'ko' ? '이미 사용 중인 이메일입니다.' : 'Email already in use.',
        'auth/weak-password':        lang === 'ko' ? '비밀번호는 8자 이상 영문+숫자를 포함해야 합니다.' : 'Password must be 8+ chars with letters and numbers.',
        'auth/invalid-email':        lang === 'ko' ? '이메일 형식이 올바르지 않습니다.' : 'Invalid email format.',
        'auth/too-many-requests':    lang === 'ko' ? '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' : 'Too many requests. Please try again later.',
      }[e.code] || (lang === 'ko' ? '오류가 발생했습니다. 다시 시도해주세요.' : 'An error occurred. Please try again.');
      showAuthError(msg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  };

  function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    el.textContent = msg;
    el.style.display = 'block';
  }

  document.getElementById('auth-email').focus();
}

window.showAuthModal    = showAuthModal;
window.vgAwardXP        = awardXP;
window.vgSaveGame       = saveGameScore;
window.vgGetLevel       = getLevelInfo;
window.vgGetLeaderboard = getLeaderboard;
window.vgGetUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
};

// 페이지 로드 시 Kakao OAuth 콜백 처리 (code 파라미터 감지)
_handleKakaoCallback();
// Kakao 세션 복원 (Firebase Auth 완료 후)
setTimeout(restoreKakaoSession, 1000);
