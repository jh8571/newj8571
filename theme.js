document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    const langBtn = document.getElementById('lang-toggle');
    const html = document.documentElement;

    // 1. Theme Management
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeBtn.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }

    // 2. Language Management (Simple Content Toggle)
    // 이 기능은 페이지 내의 [data-ko]와 [data-en] 속성을 가진 요소들을 토글합니다.
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLanguage(savedLang);

    langBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem('lang') || 'ko';
        const newLang = currentLang === 'ko' ? 'en' : 'ko';
        setLanguage(newLang);
    });

    function setLanguage(lang) {
        localStorage.setItem('lang', lang);
        langBtn.innerText = lang === 'ko' ? 'EN' : 'KR';
        
        // 데이터 속성을 기반으로 텍스트 변경
        document.querySelectorAll('[data-ko]').forEach(el => {
            el.innerText = lang === 'ko' ? el.getAttribute('data-ko') : el.getAttribute('data-en');
        });

        // 플레이스홀더 처리
        document.querySelectorAll('input[data-ko-ph]').forEach(el => {
            el.placeholder = lang === 'ko' ? el.getAttribute('data-ko-ph') : el.getAttribute('data-en-ph');
        });
    }

    // 3. Global SNS Share Logic
    window.getShareUI = function(title, text) {
        // HTML 속성과 JS 문자열 내에서 안전하도록 따옴표 및 특수문자 이스케이프
        const safeTitle = title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        const safeText = text.replace(/'/g, "\\'").replace(/"/g, "&quot;");

        return `
            <div class="share-container" style="margin-top: 40px; padding: 30px; background: var(--card-bg); border-radius: 20px; border: 1px solid var(--border-color); text-align: center;">
                <h4 style="color: var(--primary-color); margin-bottom: 20px; font-size: 1.1rem;"><i class="fas fa-share-nodes"></i> 결과 공유하기</h4>
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <button onclick="shareResult('kakao', '${safeTitle}', '${safeText}')" style="background: #FEE500; color: #000000; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.3s;" title="카카오톡 공유"><i class="fas fa-comment"></i></button>
                    <button onclick="shareResult('facebook', '${safeTitle}', '${safeText}')" style="background: #1877F2; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.3s;" title="페이스북 공유"><i class="fab fa-facebook-f"></i></button>
                    <button onclick="shareResult('twitter', '${safeTitle}', '${safeText}')" style="background: #1DA1F2; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.3s;" title="X (트위터) 공유"><i class="fab fa-twitter"></i></button>
                    <button onclick="shareResult('copy', '${safeTitle}', '${safeText}')" style="background: var(--text-muted); color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.3s;" title="링크 복사"><i class="fas fa-link"></i></button>
                </div>
            </div>
        `;
    };

    window.shareResult = function(platform, title, text) {
        const url = window.location.href;
        const fullTitle = `${title} | VitalRest`;
        const fullText = `${text}\n지금 VitalRest에서 확인해 보세요!`;

        if (platform === 'kakao') {
            if (navigator.share) {
                navigator.share({ title: fullTitle, text: fullText, url: url }).catch(console.error);
            } else {
                alert("모바일 기기에서 카카오톡 공유가 가능합니다. 데스크톱에서는 '링크 복사'를 이용해 주세요.");
            }
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTitle + '\n' + fullText)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(url).then(() => {
                alert('결과 링크가 클립보드에 복사되었습니다! 친구들에게 공유해 보세요.');
            });
        }
    };
});