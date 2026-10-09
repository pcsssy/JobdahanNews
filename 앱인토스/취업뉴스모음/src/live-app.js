(() => {
  'use strict';
  const $=s=>document.querySelector(s), {tags}=window.careerNewsCategories, known=new Set(tags);
  const safeUrl=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
  let state={interests:[],saved:[]};
  try {
    const old=JSON.parse(localStorage.getItem('career-news:v2')||localStorage.getItem('career-news:v1')||'null');
    if(old) state={interests:Array.isArray(old.interests)?old.interests.filter(t=>known.has(t)):[],saved:Array.isArray(old.saved)?old.saved.filter(a=>a&&safeUrl(a.url)&&a.id===a.url&&typeof a.title==='string'&&Array.isArray(a.categories)).slice(0,100):[]};
  } catch { /* Start empty when browser storage is unavailable. */ }
  const selected=new Set(state.interests);
  let view='all',articles=[],query='',loading=false,error='',partial=false,hasMore=false,page=1,controller,timer,serial=0;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  function notify(message){$('#status').textContent=message;$('#status').classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#status').classList.remove('visible'),4000);}
  function persist(){try{localStorage.setItem('career-news:v2',JSON.stringify(state));return true;}catch{notify('저장이 제한되어 이번 화면에서만 유지됩니다.');return false;}}
  function renderSelected(){
    const target=$('#selected-topics'); target.replaceChildren();
    if(!selected.size){target.append(el('p','selection-empty','아직 고른 분야가 없어요. 관심 있는 주제를 추가해 보세요.'));return;}
    target.append(...[...selected].map(tag=>{
      const b=el('button','selected-topic',`${tag} ×`);b.setAttribute('aria-label',`${tag} 선택 해제`);
      b.onclick=()=>{selected.delete(tag);chips();schedule();};return b;
    }));
  }
  function chips(){renderSelected();$('#topic-count').textContent=`${selected.size}개 선택`;$('#topics').replaceChildren(...tags.map(tag=>{
    const b=el('button','chip',tag);b.setAttribute('aria-pressed',String(selected.has(tag)));
    b.onclick=()=>{selected.has(tag)?selected.delete(tag):selected.add(tag);chips();schedule();};return b;
  }));}
  function render(){
    $('#saved-count').textContent=state.saved.length;
    $('#feed-title').textContent=view==='saved'?'다시 읽고 싶은 뉴스':view==='interest'?'내 관심 분야의 뉴스':'분야의 흐름을 읽어보세요';
    const list=$('#news-list');list.replaceChildren();list.setAttribute('aria-busy',String(loading));
    const data=view==='saved'?state.saved.filter(a=>(!selected.size||a.categories.some(t=>selected.has(t)))&&`${a.title} ${a.description||''}`.toLowerCase().includes(query.toLowerCase())):articles;
    $('#result-count').textContent=loading?'불러오는 중':`${data.length}개`;
    const more=$('#load-more'); more.hidden=view==='saved'||loading||!hasMore; more.disabled=loading; more.textContent='뉴스 더 보기';
    if(loading){list.append(el('div','empty','최신 뉴스를 불러오고 있어요…'));return;}
    if(error){const box=el('div','empty',error),retry=el('button','save-interests','다시 시도');retry.onclick=load;box.append(retry);list.append(box);return;}
    if(partial)list.append(el('p','demo-notice','일부 분야를 불러오지 못했어요. 잠시 후 다시 검색해 주세요.'));
    if(!data.length)list.append(el('div','empty',view==='interest'&&!state.interests.length?'분야를 선택한 뒤 관심 분야로 저장해 주세요.':view==='saved'?'저장한 뉴스가 없거나 선택 조건에 맞지 않아요.':'검색 결과가 없어요. 다른 분야나 키워드를 선택해 주세요.'));
    for(const a of data){
      const card=el('article','news-card'),top=el('div','card-top');top.append(el('span','category',a.categories.join(' · ')),el('span','example','뉴스 검색 결과'));
      const content=el('div','card-content'),text=el('div',''),title=el('h3',''),link=el('a','article-link',a.title);
      link.href=safeUrl(a.url);link.target='_blank';link.rel='noopener noreferrer';title.append(link);text.append(title,el('p','',a.description));content.append(text);
      const bottom=el('div','card-bottom'),date=Date.parse(a.publishedAt);
      bottom.append(el('span','',`${a.source} · ${Number.isFinite(date)?new Date(date).toLocaleString('ko-KR'):'날짜 정보 없음'}`));
      const saved=state.saved.some(s=>s.id===a.id),button=el('button','bookmark',saved?'✓ 저장됨':'+ 저장');
      button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${a.title} 저장`);
      button.onclick=()=>{if(!saved&&state.saved.length>=100){notify('최대 100개까지 저장할 수 있어요.');return;}state.saved=saved?state.saved.filter(s=>s.id!==a.id):[...state.saved,a];if(persist())notify(saved?'저장을 해제했어요.':'뉴스를 저장했어요.');render();document.querySelector(`[data-view="${view}"]`).focus();};
      const memo=el('button','bookmark','메모 쓰기');
      memo.setAttribute('aria-label',`${a.title} 메모 쓰기`);
      memo.onclick=()=>window.jobNotes.open(a);
      bottom.append(memo,button);card.append(top,content,bottom);list.append(card);
    }
  }
  function schedule(){clearTimeout(timer);controller?.abort();serial++;articles=[];page=1;hasMore=false;error='';loading=view!=='saved';render();timer=setTimeout(()=>load(false),500);}
  async function load(more=false){
    clearTimeout(timer);controller?.abort();const id=++serial;error='';partial=false;if(!more){articles=[];page=1;hasMore=false;}loading=false;
    if(view==='saved'||(view==='interest'&&!state.interests.length)){render();return;}
    if(location.protocol==='file:'){error='서버 실행 후 http://127.0.0.1:5173 에서 실제 뉴스를 확인해 주세요.';render();return;}
    loading=true;render();const current=new AbortController();controller=current;const timeout=setTimeout(()=>current.abort(),15000);
    const nextPage=more?page+1:1,params=new URLSearchParams({q:query,page:String(nextPage)});(view==='interest'?state.interests:[...selected]).forEach(t=>params.append('tag',t));
    try{const response=await fetch(`/api/news?${params}`,{signal:current.signal});const body=await response.json();if(!response.ok)throw new Error(body.message||'뉴스를 불러오지 못했어요.');if(!Array.isArray(body.articles))throw new Error('뉴스 응답을 확인하지 못했어요.');if(id!==serial)return;const knownArticles=new Set(articles.map(a=>a.id));articles=more?[...articles,...body.articles.filter(a=>!knownArticles.has(a.id))]:body.articles;page=nextPage;partial=body.partial;hasMore=Boolean(body.hasMore);}
    catch(cause){if(id!==serial)return;error=cause.name==='AbortError'?'연결 시간이 초과되었어요. 다시 시도해 주세요.':cause.message;}
    finally{clearTimeout(timeout);if(id===serial){loading=false;render();}}
  }
  $('#search').maxLength=80;$('#search').oninput=e=>{query=e.target.value.trim();schedule();};
  $('#reset').onclick=()=>{selected.clear();chips();schedule();};
  $('#save-interests').onclick=()=>{state.interests=[...selected];if(persist())notify('관심 분야를 저장했어요.');schedule();};
  $('#load-more').onclick=()=>load(true);
  document.querySelectorAll('[data-view]').forEach(b=>{b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));load(false);};});
  chips();load();
})();
