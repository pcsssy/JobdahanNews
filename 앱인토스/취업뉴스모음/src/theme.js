(() => {
  let preference;
  try { preference = localStorage.getItem('jobdahan:theme'); } catch {}
  function apply(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#141414' : '#f7f7f4';
    const button = document.querySelector('#theme-toggle');
    if (button) {
      button.textContent = dark ? '☀ 라이트' : '☾ 다크';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? '라이트 모드 켜기' : '다크 모드 켜기');
    }
  }
  // The release checklist requires a light first screen. Dark mode remains an
  // explicit user preference after the user turns it on.
  const initial = () => preference === 'dark';
  apply(initial());
  document.addEventListener('DOMContentLoaded', () => {
    apply(initial());
    document.querySelector('#theme-toggle').onclick = () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference === 'dark');
      try { localStorage.setItem('jobdahan:theme', preference); } catch {}
    };
  });
})();
