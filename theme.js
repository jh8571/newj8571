// Translation helper — use window.t('한국어', 'English') throughout JS files
window.t = function(ko, en) {
    return (localStorage.getItem('lang') || 'ko') === 'en' ? en : ko;
};

// Firebase Auth 자동 로드 (모든 페이지)
(function() {
    const s = document.createElement('script');
    s.type = 'module';
    s.src  = '/firebase-auth.js';
    document.head.appendChild(s);
})();

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    const langBtn  = document.getElementById('lang-toggle');
    const html     = document.documentElement;

    // ─── 1. Theme ─────────────────────────────────────────────────
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    function updateThemeIcon(theme) {
        themeBtn.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }

    // ─── 2. Language ───────────────────────────────────────────────
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLanguage(savedLang);

    langBtn.addEventListener('click', () => {
        const next = (localStorage.getItem('lang') || 'ko') === 'ko' ? 'en' : 'ko';
        localStorage.setItem('lang', next);
        location.reload();
    });

    function setLanguage(lang) {
        localStorage.setItem('lang', lang);
        langBtn.innerText = lang === 'ko' ? 'EN' : 'KR';
        // Short text elements
        document.querySelectorAll('[data-ko]').forEach(el => {
            el.innerHTML = lang === 'ko' ? el.getAttribute('data-ko') : (el.getAttribute('data-en') || el.getAttribute('data-ko'));
        });
        // Input placeholders
        document.querySelectorAll('input[data-ko-ph]').forEach(el => {
            el.placeholder = lang === 'ko' ? el.getAttribute('data-ko-ph') : el.getAttribute('data-en-ph');
        });
        // Block content: .lang-ko shown in Korean, .lang-en shown in English
        document.querySelectorAll('.lang-ko').forEach(el => {
            el.style.display = lang === 'ko' ? '' : 'none';
        });
        document.querySelectorAll('.lang-en').forEach(el => {
            el.style.display = lang === 'en' ? '' : 'none';
        });
    }

    // ─── 3. SNS Share ──────────────────────────────────────────────
    window.getShareUI = function (title, text) {
        const lang = localStorage.getItem('lang') || 'ko';
        const sT = title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const sX = text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const shareTitle = lang === 'ko' ? '결과 공유하기' : 'Share Results';
        return `
            <div class="share-container" style="margin-top:40px; padding:30px; background:var(--card-bg);
                 border-radius:20px; border:1px solid var(--border-color); text-align:center;">
                <h4 style="color:var(--primary-color); margin-bottom:20px; font-size:1.1rem;">
                    <i class="fas fa-share-nodes"></i> ${shareTitle}
                </h4>
                <div style="display:flex; justify-content:center; gap:15px;">
                    <button onclick="shareResult('kakao','${sT}','${sX}')" style="background:#FEE500; color:#000; border:none; width:50px; height:50px; border-radius:50%; font-size:1.5rem; cursor:pointer;" title="${lang === 'ko' ? '카카오톡' : 'KakaoTalk'}"><i class="fas fa-comment"></i></button>
                    <button onclick="shareResult('facebook','${sT}','${sX}')" style="background:#1877F2; color:white; border:none; width:50px; height:50px; border-radius:50%; font-size:1.5rem; cursor:pointer;" title="Facebook"><i class="fab fa-facebook-f"></i></button>
                    <button onclick="shareResult('twitter','${sT}','${sX}')" style="background:#1DA1F2; color:white; border:none; width:50px; height:50px; border-radius:50%; font-size:1.5rem; cursor:pointer;" title="X (Twitter)"><i class="fab fa-twitter"></i></button>
                    <button onclick="shareResult('copy','${sT}','${sX}')" style="background:var(--text-muted); color:white; border:none; width:50px; height:50px; border-radius:50%; font-size:1.5rem; cursor:pointer;" title="${lang === 'ko' ? '링크 복사' : 'Copy Link'}"><i class="fas fa-link"></i></button>
                </div>
            </div>`;
    };

    window.shareResult = function (platform, title, text) {
        const lang = localStorage.getItem('lang') || 'ko';
        const url  = window.location.href;
        const full = `${title} | VitalGuide`;
        const msg  = lang === 'ko'
            ? `${text}\n지금 VitalGuide에서 확인해 보세요!`
            : `${text}\nCheck it out on VitalGuide!`;
        if (platform === 'kakao') {
            if (navigator.share) navigator.share({ title: full, text: msg, url }).catch(console.error);
            else alert(lang === 'ko'
                ? "모바일에서 카카오톡 공유가 가능합니다. 데스크톱에서는 '링크 복사'를 이용해 주세요."
                : "KakaoTalk sharing is available on mobile. On desktop, please use 'Copy Link'.");
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(full + '\n' + msg)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(url).then(() => alert(lang === 'ko' ? '링크가 클립보드에 복사되었습니다!' : 'Link copied to clipboard!'));
        }
    };

    // ─── 4. Site Config (nav + accent color) ──────────────────────
    applySiteConfig();
});

async function applySiteConfig() {
    try {
        const res = await fetch('/site_config.json?_=' + Date.now());
        if (!res.ok) return;
        const cfg = await res.json();

        // 4-a. Accent color
        if (cfg.site?.accent_color) {
            document.documentElement.style.setProperty('--accent-color', cfg.site.accent_color);
            document.documentElement.style.setProperty('--primary-color', cfg.site.accent_color);
        }

        // 4-b. Logo text
        const logo = document.querySelector('.logo');
        if (logo && cfg.site?.logo_text) logo.textContent = cfg.site.logo_text;

        // 4-c. Nav rebuild
        const nav = document.querySelector('header nav');
        if (nav && Array.isArray(cfg.nav)) {
            const currentFile = window.location.pathname.split('/').pop() || 'index.html';
            const lang = localStorage.getItem('lang') || 'ko';
            nav.innerHTML = cfg.nav
                .filter(item => item.enabled !== false)
                .map(item => {
                    const active = (currentFile === item.href ||
                                   (currentFile === '' && item.href === 'index.html')) ? ' class="active"' : '';
                    return `<a href="${item.href}"${active} data-ko="${item.label_ko}" data-en="${item.label_en}">${lang === 'ko' ? item.label_ko : item.label_en}</a>`;
                }).join('');
        }
    } catch (e) {
        // silent — fallback to hardcoded nav
    }

    // 4-d. Page hero texts from page_texts.json
    try {
        const pt = await fetch('/page_texts.json?_=' + Date.now());
        if (!pt.ok) return;
        const texts = await pt.json();

        const file = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const page = texts[file];
        if (!page) return;

        const lang = localStorage.getItem('lang') || 'ko';
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const h2 = hero.querySelector('h2');
        const p  = hero.querySelector('p');
        if (h2) {
            h2.setAttribute('data-ko', page.hero_h2_ko);
            h2.setAttribute('data-en', page.hero_h2_en);
            h2.innerHTML = lang === 'ko' ? page.hero_h2_ko : page.hero_h2_en;
        }
        if (p) {
            p.setAttribute('data-ko', page.hero_p_ko);
            p.setAttribute('data-en', page.hero_p_en);
            p.innerHTML = lang === 'ko' ? page.hero_p_ko : page.hero_p_en;
        }
    } catch (e) {
        // silent — fallback to hardcoded hero texts
    }
}

// ── 실시간 랭킹 위젯 (모든 페이지 공통) ────────────────────────────────────
(function() {
    // leaderboard.html 자체에서는 표시 안 함
    if (location.pathname.includes('leaderboard')) return;

    const css = `
    #vg-lb-widget{position:fixed;top:400px;right:40px;z-index:9000;display:flex;flex-direction:column;align-items:flex-end;gap:10px;}
    #vg-lb-toggle{display:none;background:var(--primary-color);color:white;border:none;border-radius:50px;padding:10px 18px;font-size:.88rem;font-weight:800;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.18);align-items:center;gap:7px;transition:transform .2s,opacity .2s;}
    #vg-lb-toggle:hover{transform:translateY(-2px);opacity:.9;}
    #vg-lb-panel{width:272px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.13);overflow:hidden;display:flex;flex-direction:column;animation:lbFadeIn .4s ease;}
    #vg-lb-panel.hidden{display:none;}
    @keyframes lbFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    #vg-lb-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid var(--border-color);}
    #vg-lb-head span{font-size:.9rem;font-weight:900;}
    #vg-lb-close{background:var(--border-color);border:none;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:.85rem;color:var(--text-muted);align-items:center;justify-content:center;}
    #vg-lb-tabs{display:flex;padding:8px 12px 0;gap:4px;}
    .vg-lb-tab{flex:1;padding:7px 4px;border:none;background:transparent;border-radius:8px;font-size:.75rem;font-weight:800;cursor:pointer;color:var(--text-muted);transition:.15s;}
    .vg-lb-tab.active{background:var(--primary-color);color:white;}
    #vg-lb-game-sel{display:flex;flex-wrap:wrap;gap:4px;padding:8px 12px 4px;border-bottom:1px solid var(--border-color);}
    .vg-lb-game-btn{padding:3px 8px;background:var(--bg-color);border:1px solid var(--border-color);border-radius:20px;font-size:.7rem;font-weight:700;cursor:pointer;color:var(--text-muted);transition:.15s;white-space:nowrap;}
    .vg-lb-game-btn.active{background:var(--primary-color);color:white;border-color:var(--primary-color);}
    #vg-lb-list{list-style:none;padding:6px 12px;margin:0;max-height:220px;overflow-y:auto;}
    #vg-lb-list li{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--border-color);font-size:.82rem;}
    #vg-lb-list li:last-child{border-bottom:none;}
    .vg-lb-rank{width:20px;text-align:center;font-weight:900;font-size:.8rem;color:var(--text-muted);flex-shrink:0;}
    .vg-lb-rank.r1{color:#f59e0b;}.vg-lb-rank.r2{color:#94a3b8;}.vg-lb-rank.r3{color:#cd7c2f;}
    .vg-lb-avatar{width:28px;height:28px;border-radius:50%;object-fit:cover;background:var(--border-color);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.8rem;overflow:hidden;}
    .vg-lb-name{flex:1;font-weight:700;color:var(--text-main);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .vg-lb-score{font-size:.75rem;font-weight:800;color:var(--primary-color);flex-shrink:0;}
    #vg-lb-more{display:block;text-align:center;padding:10px;font-size:.78rem;font-weight:800;color:var(--primary-color);text-decoration:none;border-top:1px solid var(--border-color);}
    .vg-lb-empty{padding:20px;text-align:center;color:var(--text-muted);font-size:.82rem;}
    @media(max-width:900px){#vg-lb-widget{top:auto;bottom:24px;right:16px;}#vg-lb-toggle{display:flex!important;}}
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const GAMES = [
        {k:'tetris',ko:'테트리스',icon:'🟦'},{k:'snake',ko:'스네이크',icon:'🐍'},
        {k:'2048',ko:'2048',icon:'🎲'},{k:'breakout',ko:'블록깨기',icon:'🧱'},
        {k:'flappy',ko:'플래피',icon:'🐦'},{k:'clicker',ko:'클릭커',icon:'👆'},
        {k:'math',ko:'암산왕',icon:'🧮'},{k:'typing',ko:'타이핑',icon:'⌨️'},
        {k:'color',ko:'색상찾기',icon:'🎨'},{k:'sudoku',ko:'스도쿠',icon:'🔢'},
        {k:'memory',ko:'기억력',icon:'🃏'},{k:'reaction',ko:'반응속도',icon:'⚡'},
        {k:'number',ko:'숫자맞추기',icon:'🎯'},{k:'minesweeper',ko:'지뢰찾기',icon:'💣'},
        {k:'whack',ko:'두더지',icon:'🔨'},
    ];

    const widget = document.createElement('div');
    widget.id = 'vg-lb-widget';
    widget.innerHTML = `
        <div id="vg-lb-panel">
            <div id="vg-lb-head">
                <span>🏆 실시간 랭킹 TOP 5</span>
                <button id="vg-lb-close" style="display:none;">✕</button>
            </div>
            <div id="vg-lb-tabs">
                <button class="vg-lb-tab active" data-tab="xp">레벨 랭킹</button>
                <button class="vg-lb-tab" data-tab="total">종합 점수</button>
                <button class="vg-lb-tab" data-tab="game">게임별</button>
            </div>
            <div id="vg-lb-game-sel" style="display:none;">${GAMES.map(g=>`<button class="vg-lb-game-btn" data-k="${g.k}">${g.icon} ${g.ko}</button>`).join('')}</div>
            <ul id="vg-lb-list"><li class="vg-lb-empty">로딩 중...</li></ul>
            <a href="/leaderboard.html" id="vg-lb-more">전체 랭킹 보기 →</a>
        </div>
        <button id="vg-lb-toggle">🏆 랭킹 TOP 5</button>`;
    document.body.appendChild(widget);

    let curTab = 'xp', curGame = 'tetris', loaded = {};
    const list    = document.getElementById('vg-lb-list');
    const gameSel = document.getElementById('vg-lb-game-sel');
    const tabs    = document.querySelectorAll('.vg-lb-tab');
    const toggle  = document.getElementById('vg-lb-toggle');
    const panel   = document.getElementById('vg-lb-panel');
    const closeBtn = document.getElementById('vg-lb-close');
    const isMobile = () => window.innerWidth <= 900;

    if (isMobile()) panel.classList.add('hidden');

    toggle.addEventListener('click', () => {
        const hidden = panel.classList.toggle('hidden');
        closeBtn.style.display = hidden ? 'none' : 'flex';
        if (!hidden) render(curTab);
    });
    closeBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
        closeBtn.style.display = 'none';
    });

    gameSel.querySelectorAll('.vg-lb-game-btn').forEach((btn, i) => {
        if (i === 0) btn.classList.add('active');
        btn.addEventListener('click', () => {
            gameSel.querySelectorAll('.vg-lb-game-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            curGame = btn.dataset.k;
            render('game');
        });
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            curTab = tab.dataset.tab;
            gameSel.style.display = curTab === 'game' ? 'flex' : 'none';
            render(curTab);
        });
    });

    function avatar(e) {
        return e.photo
            ? `<img class="vg-lb-avatar" src="${e.photo}" onerror="this.outerHTML='<div class=vg-lb-avatar>👤</div>'">`
            : `<div class="vg-lb-avatar">👤</div>`;
    }
    const medal = i => i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'';
    const rc    = i => i===0?'r1':i===1?'r2':i===2?'r3':'';

    async function fetchData(key) {
        if (loaded[key]) return loaded[key];
        if (!window.vgGetLeaderboard) return [];
        const data = await window.vgGetLeaderboard(key);
        return (loaded[key] = (data||[]).slice(0,5));
    }

    async function render(tab) {
        list.innerHTML = '<li class="vg-lb-empty">로딩 중...</li>';
        const data = await fetchData(tab==='game' ? curGame : tab==='xp' ? '_xp' : '_total');
        if (!data.length) { list.innerHTML = '<li class="vg-lb-empty">아직 데이터가 없습니다</li>'; return; }
        list.innerHTML = data.map((e,i) => `<li>
            <span class="vg-lb-rank ${rc(i)}">${medal(i)}</span>${avatar(e)}
            <span class="vg-lb-name">${e.name||'익명'}</span>
            <span class="vg-lb-score">${tab==='xp' ? (e.tier||'')+' Lv.'+(e.level||1) : (e.score||0).toLocaleString()+(tab==='total'?'pts':'')}</span>
        </li>`).join('');
    }

    let waited = 0;
    const waitReady = setInterval(() => {
        waited += 200;
        if (window.vgGetLeaderboard || waited >= 5000) {
            clearInterval(waitReady);
            if (!isMobile()) render(curTab);
        }
    }, 200);
})();
