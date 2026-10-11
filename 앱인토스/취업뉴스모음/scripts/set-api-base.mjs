import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = String(process.env.NEWS_API_BASE || '').replace(/\/$/, '');
if (!/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(base)) {
  throw new Error('NEWS_API_BASE에 배포된 HTTPS 뉴스 서버 주소를 넣어 주세요.');
}

const file = resolve('dist/index.html');
const source = await readFile(file, 'utf8');
if (!source.includes('__NEWS_API_BASE__')) {
  throw new Error('뉴스 서버 주소 삽입 위치를 찾지 못했어요.');
}
await writeFile(file, source.replaceAll('__NEWS_API_BASE__', base), 'utf8');
