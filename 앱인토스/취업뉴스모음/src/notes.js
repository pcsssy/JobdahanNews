(() => {
  const key = 'jobdahan:notes';
  let notes = [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(value)) notes = value.filter(n => n && typeof n.id === 'string' && typeof n.text === 'string' && typeof n.title === 'string').slice(0, 200);
  } catch {}
  const node = (tag, text, cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
  const dialog = document.createElement('dialog');
  dialog.className = 'notes-dialog';
  document.body.append(dialog);
  let dirty = false;
  function close() { if (dirty && !confirm('저장하지 않은 메모를 닫을까요?')) return; dirty = false; dialog.close(); }
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  function shell(title) {
    dialog.replaceChildren(); dirty = false;
    const header = node('div', '', 'note-header'), heading = node('h2', title);
    heading.id = 'note-heading'; dialog.setAttribute('aria-labelledby', heading.id);
    const button = node('button', '닫기', 'note-close'); button.onclick = close;
    header.append(heading, button); dialog.append(header);
    if (!dialog.open) dialog.showModal();
  }
  function persist(next, status) {
    try { localStorage.setItem(key, JSON.stringify(next)); notes = next; return true; }
    catch { status.textContent = '저장 공간이 부족하거나 저장이 차단됐어요. 메모를 복사해 보관해 주세요.'; return false; }
  }
  function open(article) {
    shell('읽은 뉴스, 나의 생각');
    const existing = notes.find(n => n.id === article.id);
    dialog.append(node('p', article.title, 'note-article'));
    const label = node('label', '나의 메모'); label.htmlFor = 'note-text';
    const input = document.createElement('textarea'); input.id = 'note-text'; input.maxLength = 4000;
    input.value = existing?.text || ''; input.placeholder = '핵심 내용, 지원 기업과의 연결점, 면접에서 이야기할 나의 생각을 적어보세요.';
    const counter = node('p', `${input.value.length} / 4,000`, 'note-counter');
    input.oninput = () => { dirty = input.value !== (existing?.text || ''); counter.textContent = `${input.value.length} / 4,000`; };
    const status = node('p', '', 'note-status'); status.setAttribute('role', 'status');
    const save = node('button', '메모 저장', 'note-primary');
    save.onclick = () => {
      if (!input.value.trim()) { status.textContent = '메모 내용을 입력해 주세요.'; input.focus(); return; }
      if (!existing && notes.length >= 200) { status.textContent = '메모는 200개까지 저장할 수 있어요.'; return; }
      const entry = { id: article.id, title: article.title, url: article.url, text: input.value, updatedAt: new Date().toISOString() };
      if (persist([entry, ...notes.filter(n => n.id !== article.id)], status)) { dirty = false; showList(); }
    };
    dialog.append(label, input, counter, save, status, node('p', '메모는 이 브라우저에 저장돼요. 브라우저 데이터를 지우면 삭제됩니다.', 'note-help'));
    input.focus();
  }
  function showList() {
    shell('나의 뉴스 노트');
    dialog.append(node('p', `${notes.length}개의 생각을 모았어요.`, 'note-help'));
    if (!notes.length) dialog.append(node('p', '기사 아래 ‘메모 쓰기’를 눌러 첫 생각을 남겨보세요.', 'empty'));
    const status = node('p', '', 'note-status'); status.setAttribute('role', 'status');
    for (const note of notes) {
      const card = node('section', '', 'note-item');
      const title = document.createElement('a'); title.className = 'note-link'; title.href = note.url; title.target = '_blank'; title.rel = 'noopener noreferrer'; title.textContent = note.title;
      card.append(title, node('p', note.text, 'note-body'));
      const edit = node('button', '수정', 'bookmark'); edit.onclick = () => open(note);
      const remove = node('button', '삭제', 'bookmark'); remove.onclick = () => {
        if (confirm('이 메모를 삭제할까요?') && persist(notes.filter(n => n.id !== note.id), status)) showList();
      };
      card.append(edit, remove); dialog.append(card);
    }
    dialog.append(status); dialog.querySelector('.note-close').focus();
  }
  document.querySelector('#open-notes').onclick = showList;
  window.jobNotes = { open };
})();
