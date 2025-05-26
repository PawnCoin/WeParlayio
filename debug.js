window.addEventListener('load', () => {
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (!btn.onclick && !btn.getAttribute("data-action")) {
      console.warn(`⚠️ Button "${btn.innerText}" has no click handler.`);
    }
  });

  fetch('/api/odds').then(r => {
    if (!r.ok) console.error('❌ API /api/odds failed');
  });
});
