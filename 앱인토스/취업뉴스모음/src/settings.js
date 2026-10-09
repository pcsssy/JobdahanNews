(() => {
  'use strict';
  const KEYS = { state: 'career-news:v2', legacy: 'career-news:v1', notes: 'jobdahan:notes', theme: 'jobdahan:theme' };
  const dialog = document.createElement('dialog');
  dialog.className = 'settings-dialog';
  document.body.append(dialog);
  const make = (tag, text, cls = '') => { const element = document.createElement(tag); element.className = cls; element.textContent = text; return element; };
  const getJson = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const state = () => getJson(KEYS.state) || getJson(KEYS.legacy) || { interests: [], saved: [] };
  const notes = () => { const value = getJson(KEYS.notes); return Array.isArray(value) ? value : []; };
  const resetAndReload = keys => {
    try { keys.forEach(key => localStorage.removeItem(key)); location.reload(); }
    catch { window.alert('브라우저 저장소를 초기화하지 못했어요. 브라우저 설정에서 사이트 데이터를 삭제해 주세요.'); }
  };
  function close() { dialog.close(); }
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  function row(title, description, action, dangerous = false) {
    const item = make('section', '', `setting-row${dangerous ? ' is-dangerous' : ''}`);
    const copy = make('div', '', 'setting-copy'); copy.append(make('h3', title), make('p', description));
    item.append(copy, action); return item;
  }
  function action(label, onClick, secondary = false) {
    const button = make('button', label, `setting-action${secondary ? ' secondary' : ''}`); button.onclick = onClick; return button;
  }
  function section(label) { return make('p', label, 'settings-label'); }
  function open() {
    dialog.replaceChildren();
    const header = make('div', '', 'settings-header');
    const title = make('div', '', ''); title.append(make('p', 'JOBDAHANNEWS', 'settings-kicker'), make('h2', '설정'));
    const closeButton = action('닫기', close, true); closeButton.classList.add('note-close');
    header.append(title, closeButton); dialog.append(header);
    dialog.append(section('맞춤 설정'));
    const savedState = state();
    dialog.append(row('관심 분야', `${savedState.interests?.length || 0}개 분야를 저장했어요. 홈에서 언제든 바꿀 수 있어요.`, action('홈에서 편집', () => { close(); document.querySelector('#interest-title').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, true)));
    dialog.append(row('화면 모드', document.documentElement.dataset.theme === 'dark' ? '어두운 화면을 사용하고 있어요.' : '밝은 화면을 사용하고 있어요.', action('모드 변경', () => { document.querySelector('#theme-toggle').click(); open(); }, true)));
    dialog.append(section('내 데이터'));
    dialog.append(row('저장한 뉴스', `${savedState.saved?.length || 0}개를 저장했어요.`, action('초기화', () => { if (confirm('저장한 뉴스만 모두 지울까요?')) { const next = { ...savedState, saved: [] }; localStorage.setItem(KEYS.state, JSON.stringify(next)); localStorage.removeItem(KEYS.legacy); location.reload(); } }, true)));
    dialog.append(row('나의 뉴스 노트', `${notes().length}개의 메모가 이 기기에 저장되어 있어요.`, action('초기화', () => { if (confirm('뉴스 노트를 모두 삭제할까요? 이 작업은 되돌릴 수 없어요.')) resetAndReload([KEYS.notes]); }, true)));
    dialog.append(row('이 기기의 앱 데이터', '관심 분야, 저장 뉴스, 뉴스 노트, 화면 모드를 모두 지워요. 로그인 기능 전까지는 데이터가 이 브라우저에만 저장됩니다.', action('모두 초기화', () => { if (confirm('이 기기에 저장된 잡다한뉴스 데이터를 모두 삭제할까요? 이 작업은 되돌릴 수 없어요.')) resetAndReload(Object.values(KEYS)); }, false), true));
    dialog.append(section('앱 정보'));
    const contact = document.createElement('a'); contact.className = 'settings-contact'; contact.href = 'mailto:pcsssy@gmail.com'; contact.textContent = 'pcsssy@gmail.com';
    const contactRow = row('문의하기', '오류 제보와 제안은 이메일로 보내 주세요.', contact); dialog.append(contactRow);
    dialog.append(row('데이터 사용 안내', '뉴스 제목·요약·출처는 네이버 뉴스 검색 결과를 표시합니다. 기사 원문은 해당 언론사 페이지에서 확인할 수 있어요.', make('span', 'v0.1', 'version')));
    dialog.append(make('p', '로그인과 기기 간 동기화는 다음 버전에서 제공할 예정입니다.', 'settings-footnote'));
    dialog.showModal(); closeButton.focus();
  }
  document.querySelector('#open-settings').onclick = open;
})();
