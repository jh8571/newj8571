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
});