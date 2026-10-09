import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {getNews} from './news.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
try {process.loadEnvFile(resolve(root,'.env'));} catch(e) {if(e.code!=='ENOENT') throw e;}
let active=0,requests=0,windowStart=Date.now();
const send=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET') return send(res,405,{message:'GET 요청만 지원합니다.'});
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/news') {
      if(Date.now()-windowStart>60000){requests=0;windowStart=Date.now();}
      if(active>=3 || requests>=20) return send(res,429,{message:'요청이 많아요. 잠시 후 다시 시도해 주세요.'});
      active++;requests++;
      try {const r=await getNews(url.searchParams,{clientId:process.env.NAVER_CLIENT_ID,clientSecret:process.env.NAVER_CLIENT_SECRET});send(res,r.status,r.body);} finally {active--;}
      return;
    }
    const path=decodeURIComponent(url.pathname);
    if(path!=='/' && path!=='/index.html' && !/^\/src\/[a-z0-9_./-]+\.(js|css)$/i.test(path)) return send(res,404,{});
    const file=resolve(root,path==='/'?'index.html':'.'+path);
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)) return send(res,404,{});
    const data=await readFile(file), types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
    res.writeHead(200,{'Content-Type':`${types[extname(file)]}; charset=utf-8`,'Cache-Control':'no-cache'});res.end(data);
  } catch(e) {send(res,e.code==='ENOENT'?404:500,{message:'요청을 처리하지 못했어요.'});}
});
server.listen(Number(process.env.PORT||5173),'127.0.0.1',()=>console.log(`취업뉴스모음: http://127.0.0.1:${server.address().port}`));
