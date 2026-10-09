(() => {
  'use strict';
  const { industries, roles, articles } = window.careerNewsData;
  const knownTags = new Set([...industries, ...roles]);
  const knownIds = new Set(articles.map(article => article.id));
  const key = 'career-news:v1';
  let state = { interests: [], saved: [] };
  let storageError = false;
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (stored && Array.isArray(stored.interests) && Array.isArray(stored.saved)) {
      state = { interests: stored.interests.filter(tag => knownTags.has(tag)), saved: stored.saved.filter(id => knownIds.has(id)) };
    }
  } catch { storageError = true; }
  const selected = new Set(state.interests);
  let view = 'all';
  let query = '';
  let noticeTimer;
  const $ = selector => document.querySelector(selector);
  const notify = message => {
    clearTimeout(noticeTimer);
    $('#status').textContent = message;
    $('#status').classList.add('visible');
    noticeTimer = setTimeout(() => $('#status').classList.remove('visible'), 3500);
  };
  const persist = () => {
    try { localStorage.setItem(key, JSON.stringify(state)); return true; }
    catch { notify('브라우저 저장이 제한되어 있어요. 이번 화면에서만 유지됩니다.'); return false; }
  };
  const matches = (article, tags) => !tags.size || [article.industry, ...article.roles].some(tag => tags.has(tag));
  function renderChips() {
    for (const [target, tags] of [['#industries', industries], ['#roles', roles]]) {
      $(target).replaceChildren(...tags.map(tag => {
        const button = document.createElement('button');
        button.textContent = tag;
        button.className = 'chip';
        button.setAttribute('aria-pressed', String(selected.has(tag)));
        button.onclick = () => {
          selected.has(tag) ? selected.delete(tag) : selected.add(tag);
          renderChips(); renderFeed();
          [...$(target).children].find(child => child.textContent === tag)?.focus();
        };
        return button;
      }));
    }
  }
  function renderFeed() {
    const filtered = articles.filter(article => {
      if (view === 'saved' && !state.saved.includes(article.id)) return false;
      if (view === 'interest' && (!state.interests.length || !matches(article, new Set(state.interests)))) return false;
      return matches(article, selected) && `${article.title} ${article.description} ${article.industry} ${article.roles.join(' ')}`.toLocaleLowerCase().includes(query);
    });
    $('#saved-count').textContent = state.saved.length;
    $('#result-count').textContent = `${filtered.length}개`;
    $('#feed-title').textContent = view === 'saved' ? '다시 읽고 싶은 뉴스' : view === 'interest' ? '내 관심 분야의 뉴스' : '분야의 흐름을 읽어보세요';
    const list = $('#news-list');
    list.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = view === 'interest' && !state.interests.length ? '위에서 분야를 선택한 뒤 관심 분야로 저장해 주세요.' : view === 'saved' && !state.saved.length ? '다시 보고 싶은 뉴스의 저장 버튼을 눌러주세요.' : '조건에 맞는 뉴스가 없어요. 분야 선택이나 검색어를 바꿔보세요.';
      list.append(empty);
    }
    for (const article of filtered) {
      const card = document.createElement('article');
      card.className = 'news-card';
      // Only local, fixed demo content is used here. Remote article text must use textContent.
      card.innerHTML = `<div class="card-top"><span class="category">${article.industry} · ${article.roles.join(' / ')}</span><span class="example">가상 예시</span></div><div class="card-content"><div><h3>${article.title}</h3><p>${article.description}</p></div><div class="tile ${article.color}" aria-hidden="true">${article.mark}</div></div><details><summary>취업 준비에 연결해 보기</summary><p>${article.point}</p></details><div class="card-bottom"><span>학습용 예시 · 실제 기사 아님</span><button class="bookmark" data-id="${article.id}" aria-pressed="${state.saved.includes(article.id)}" aria-label="${article.title} 저장">${state.saved.includes(article.id) ? '✓ 저장됨' : '+ 저장'}</button></div>`;
      card.querySelector('.bookmark').onclick = () => {
        const saved = state.saved.includes(article.id);
        state.saved = saved ? state.saved.filter(id => id !== article.id) : [...state.saved, article.id];
        const persisted = persist();
        renderFeed();
        const focusTarget = [...document.querySelectorAll('.bookmark')].find(button => button.dataset.id === article.id);
        (focusTarget || document.querySelector(`[data-view="${view}"]`)).focus();
        if (persisted) notify(saved ? '저장 목록에서 삭제했어요.' : '다시 읽을 뉴스에 저장했어요.');
      };
      list.append(card);
    }
  }
  $('#search').addEventListener('input', event => { query = event.target.value.trim().toLocaleLowerCase(); renderFeed(); });
  $('#reset').onclick = () => { selected.clear(); renderChips(); renderFeed(); };
  $('#save-interests').onclick = () => {
    state.interests = [...selected];
    if (persist()) notify(state.interests.length ? '관심 분야를 저장했어요.' : '저장한 관심 분야를 비웠어요.');
    renderFeed();
  };
  document.querySelectorAll('[data-view]').forEach(button => {
    button.onclick = () => {
      view = button.dataset.view;
      document.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      renderFeed();
    };
  });
  renderChips(); renderFeed();
  if (storageError) notify('저장 정보를 불러오지 못했어요. 이번 화면에서 새로 시작합니다.');
})();
