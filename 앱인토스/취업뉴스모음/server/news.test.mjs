import test from 'node:test';
import assert from 'node:assert/strict';
import {getNews,normalize,clean} from './news.mjs';
const item={title:'<b>반도체</b> &amp; AI',originallink:'https://example.com/news/1',description:'설명',pubDate:'Thu, 08 Oct 2026 09:00:00 +0900'};
const keys={clientId:'test-id',clientSecret:'test-secret'};
test('missing credentials never requests upstream',async()=>{assert.equal((await getNews(new URLSearchParams(),{fetchImpl:()=>{throw Error('unexpected');}})).status,503);});
test('reject unknown categories',async()=>{assert.equal((await getNews(new URLSearchParams('tag=unknown'),keys)).status,400);});
test('strip markup, decode entities and reject script URLs',()=>{assert.equal(clean(item.title),'반도체 & AI');assert.equal(normalize([{...item,originallink:'javascript:alert(1)'}],'AI').length,0);});
test('deduplicate articles and merge categories; credentials in headers only',async()=>{
  const result=await getNews(new URLSearchParams([['tag','반도체'],['tag','AI']]),{...keys,fetchImpl:async(url,options)=>{assert.equal(url.origin+url.pathname,'https://naverapihub.apigw.ntruss.com/search/v1/news');assert.equal(options.headers['X-NCP-APIGW-API-KEY-ID'],'test-id');assert.equal(options.headers['X-NCP-APIGW-API-KEY'],'test-secret');assert.equal(options.redirect,'error');assert.ok(!url.href.includes('test-secret'));assert.equal(url.searchParams.get('sort'),'date');return {ok:true,json:async()=>({items:[item]})};}});
  assert.equal(result.body.articles.length,1);assert.deepEqual(result.body.articles[0].categories,['반도체','AI']);assert.equal(result.body.partial,false);assert.equal(result.body.hasMore,false);
});
test('partial failure is disclosed',async()=>{const r=await getNews(new URLSearchParams([['tag','AI'],['tag','로봇']]),{...keys,fetchImpl:async u=>u.searchParams.get('query')==='로봇'?{ok:false,status:500}:{ok:true,json:async()=>({items:[item]})}});assert.equal(r.status,200);assert.equal(r.body.partial,true);});
test('authentication error is actionable without leaking upstream details',async()=>{const r=await getNews(new URLSearchParams('q=AI'),{...keys,fetchImpl:async()=>({ok:false,status:401})});assert.equal(r.status,502);assert.match(r.body.message,/인증/);assert.ok(!JSON.stringify(r).includes('test-secret'));});
test('empty results stay empty and never insert demo articles',async()=>{const r=await getNews(new URLSearchParams('q=AI'),{...keys,fetchImpl:async()=>({ok:true,json:async()=>({items:[]})})});assert.deepEqual(r.body.articles,[]);});
