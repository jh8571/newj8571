// Translation helper — use window.t('한국어', 'English') throughout JS files
window.t = function(ko, en) {
    return (localStorage.getItem('lang') || 'ko') === 'en' ? en : ko;
};

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
