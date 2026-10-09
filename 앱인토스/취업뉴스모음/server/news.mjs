export const topics = {
  'AI':'인공지능','반도체':'반도체','로봇':'로봇','의료·바이오':'바이오','모빌리티':'모빌리티','에너지':'에너지','배터리':'배터리','우주·항공':'우주 항공',
  '금융':'금융','핀테크':'핀테크','게임':'게임 산업','콘텐츠':'콘텐츠 산업','통신':'통신 산업','이커머스':'이커머스','유통':'유통 산업','부동산·건설':'건설 산업',
  '환경·ESG':'ESG 환경','교육':'에듀테크 교육','뷰티·패션':'뷰티 패션','식품':'식품 산업','여행·호텔':'여행 호텔','물류':'물류 산업','공공·정책':'공공 정책',
  '개발':'소프트웨어 개발','데이터':'데이터 분석','디자인':'UX 디자인','기획':'서비스 기획','마케팅':'마케팅','영업':'기업 영업','회계·재무':'회계 재무','인사':'인사 채용'
};
const defaultTopics = ['AI','반도체','로봇','의료·바이오','모빌리티','금융','콘텐츠','에너지'];
export function safeUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function clean(value) {
  const entities = {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '};
  return String(value || '').replace(/<[^>]*>/g, '').replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, code) => {
    if (!code.startsWith('#')) return entities[code.toLowerCase()];
    const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2),16) : Number(code.slice(1));
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
  }).slice(0,3000);
}
export function normalize(items, category) {
  return items.flatMap(item => {
    const url = safeUrl(item.originallink) || safeUrl(item.link), title = clean(item.title), date = Date.parse(item.pubDate);
    if (!url || !title) return [];
    return [{id:url,url,title,description:clean(item.description),source:new URL(url).hostname.replace(/^www\./,''),publishedAt:Number.isFinite(date)?new Date(date).toISOString():null,categories:[category]}];
  });
}
export async function getNews(params, {clientId,clientSecret,fetchImpl=fetch}={}) {
  const tags = [...new Set(params.getAll('tag'))], query = (params.get('q') || '').trim(), page = Number(params.get('page') || '1');
  if(query.length>80 || tags.some(t=>!Object.hasOwn(topics,t)) || tags.length>12 || !Number.isInteger(page) || page < 1 || page > 50) return {status:400,body:{message:'검색어나 분야를 확인해 주세요.'}};
  if(!clientId || !clientSecret) return {status:503,body:{code:'SETUP_REQUIRED',message:'뉴스 연결 준비 중이에요. 서버의 네이버 API 키를 설정해 주세요.'}};
  const searches = tags.length ? tags : query ? ['검색'] : defaultTopics;
  const results = await Promise.allSettled(searches.map(async tag=>{
    const url = new URL('https://naverapihub.apigw.ntruss.com/search/v1/news');
    url.search = new URLSearchParams({query:[topics[tag],query].filter(Boolean).join(' '),display:'20',start:String((page - 1) * 20 + 1),sort:'date'});
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 8000);
    let response;
    try {
      response = await fetchImpl(url,{headers:{'X-NCP-APIGW-API-KEY-ID':clientId,'X-NCP-APIGW-API-KEY':clientSecret},signal:abort.signal,redirect:'error'});
    } finally {
      clearTimeout(timeout);
    }
    if(!response.ok) throw new Error(String(response.status));
    const body = await response.json();
    if(!Array.isArray(body.items)) throw new Error('INVALID_RESPONSE');
    return {articles:normalize(body.items,tag),hasMore:body.items.length === 20};
  }));
  const failed = results.filter(r=>r.status==='rejected');
  if(failed.length===results.length) {
    const reasons=failed.map(r=>r.reason?.message);
    const upstreamStatus = reasons.find(r => /^\d{3}$/.test(r));
    return {status:502,body:{code:upstreamStatus?`UPSTREAM_${upstreamStatus}`:'UPSTREAM_NETWORK_ERROR',message:reasons.some(r=>['401','403'].includes(r))?'뉴스 API 인증에 실패했어요. 서버 키와 검색 API 권한을 확인해 주세요.':reasons.includes('429')?'뉴스 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요.':'뉴스 제공처에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'}};
  }
  const merged=new Map();
  for(const r of results) if(r.status==='fulfilled') for(const a of r.value.articles) {
    if(merged.has(a.id)) merged.get(a.id).categories.push(...a.categories); else merged.set(a.id,a);
  }
  return {status:200,body:{articles:[...merged.values()].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')),partial:failed.length>0,hasMore:results.some(r=>r.status==='fulfilled'&&r.value.hasMore),fetchedAt:new Date().toISOString()}};
}
