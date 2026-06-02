/* VitalGuide - 우측 하단 floating "fun" 메뉴
   /fun/ 페이지에서는 숨김. 모든 메인 사이트 페이지에 자동 표시. */
(function() {
    if (window.location.pathname.startsWith('/fun/')) return;
    if (document.getElementById('vg-fun-btn')) return; // 중복 방지

    const css = `
        #vg-fun-btn {
            position: fixed; bottom: 18px; right: 18px; z-index: 9998;
            width: 48px; height: 48px; border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            border: none; cursor: pointer;
            box-shadow: 0 4px 16px rgba(99,102,241,0.35);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.3rem; transition: transform 0.2s, box-shadow 0.2s;
            opacity: 0.85;
        }
        #vg-fun-btn:hover {
            transform: scale(1.08); opacity: 1;
            box-shadow: 0 6px 22px rgba(99,102,241,0.5);
        }
        #vg-fun-menu {
            position: fixed; bottom: 76px; right: 18px; z-index: 9999;
            background: var(--card-bg, #ffffff);
            border-radius: 18px; padding: 12px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.18);
            min-width: 220px;
            border: 1px solid var(--border-color, #e5e7eb);
            transform: translateY(8px); opacity: 0;
            pointer-events: none;
            transition: transform 0.18s, opacity 0.18s;
        }
        #vg-fun-menu.open {
            transform: translateY(0); opacity: 1;
            pointer-events: auto;
        }
        #vg-fun-menu .vg-fun-title {
            font-size: 0.7rem; font-weight: 800;
            color: var(--text-muted, #6b7280);
            letter-spacing: 0.06em; text-transform: uppercase;
            margin: 4px 8px 8px;
        }
        #vg-fun-menu a {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px; border-radius: 10px;
            text-decoration: none;
            color: var(--text-color, #111827);
            font-size: 0.88rem; font-weight: 600;
            transition: background 0.15s;
        }
        #vg-fun-menu a:hover {
            background: color-mix(in srgb, #6366f1 8%, transparent);
        }
        #vg-fun-menu a .em { font-size: 1.15rem; width: 22px; text-align: center; }
        #vg-fun-menu .vg-fun-foot {
            font-size: 0.7rem; color: var(--text-muted, #6b7280);
            text-align: center; padding: 8px 8px 4px;
            border-top: 1px solid var(--border-color, #e5e7eb);
            margin-top: 6px;
        }
        @media (max-width: 480px) {
            #vg-fun-btn { width: 44px; height: 44px; bottom: 14px; right: 14px; font-size: 1.15rem; }
            #vg-fun-menu { bottom: 66px; right: 14px; min-width: 200px; }
        }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'vg-fun-btn';
    btn.setAttribute('aria-label', '재미 페이지 열기');
    btn.title = '🎮 게임 · 운세 · MBTI';
    btn.innerHTML = '🎮';

    const menu = document.createElement('div');
    menu.id = 'vg-fun-menu';
    menu.innerHTML = `
        <div class="vg-fun-title">🎉 재미로 보는 페이지</div>
        <a href="/fun/games.html"><span class="em">🎮</span> 미니게임</a>
        <a href="/fun/mbti.html"><span class="em">🧠</span> MBTI 테스트</a>
        <a href="/fun/psychology.html"><span class="em">💭</span> 심리분석</a>
        <a href="/fun/fortune.html"><span class="em">🔮</span> 오늘의 운세</a>
        <a href="/fun/animal.html"><span class="em">🐾</span> 동물 테스트</a>
        <a href="/fun/quiz.html"><span class="em">❓</span> 지식 퀴즈</a>
        <a href="/fun/leaderboard.html"><span class="em">🏆</span> 랭킹</a>
        <div class="vg-fun-foot">건강 정보와 별개의 재미 콘텐츠</div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(menu);

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && e.target !== btn) {
            menu.classList.remove('open');
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') menu.classList.remove('open');
    });
})();
