(function () {
  if (localStorage.getItem('vg-cookie-consent')) return;

  var banner = document.createElement('div');
  banner.id = 'vg-cookie-banner';
  banner.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0',
    'background:#0f172a', 'color:#e2e8f0',
    'padding:14px 20px', 'z-index:99999',
    'display:flex', 'align-items:center', 'justify-content:space-between',
    'flex-wrap:wrap', 'gap:12px',
    'box-shadow:0 -4px 24px rgba(0,0,0,0.25)',
    'font-family:inherit'
  ].join(';');

  banner.innerHTML =
    '<p style="margin:0;font-size:0.85rem;line-height:1.65;flex:1;min-width:220px;">' +
      '이 사이트는 맞춤형 광고(Google AdSense) 제공 및 서비스 개선을 위해 쿠키를 사용합니다. ' +
      '<a href="/privacy.html" style="color:#38bdf8;text-decoration:underline;">개인정보처리방침</a>' +
    '</p>' +
    '<div style="display:flex;gap:10px;flex-shrink:0;">' +
      '<button id="vg-decline" style="background:transparent;border:1px solid #475569;color:#94a3b8;' +
        'padding:7px 16px;border-radius:8px;cursor:pointer;font-size:0.82rem;">거부</button>' +
      '<button id="vg-accept" style="background:#38bdf8;border:none;color:#0f172a;' +
        'padding:7px 20px;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">동의</button>' +
    '</div>';

  function dismiss(val) {
    localStorage.setItem('vg-cookie-consent', val);
    banner.style.transition = 'transform 0.3s ease';
    banner.style.transform = 'translateY(100%)';
    setTimeout(function () { banner.remove(); }, 320);
  }

  document.body.appendChild(banner);
  document.getElementById('vg-accept').addEventListener('click', function () { dismiss('accepted'); });
  document.getElementById('vg-decline').addEventListener('click', function () { dismiss('declined'); });
})();
