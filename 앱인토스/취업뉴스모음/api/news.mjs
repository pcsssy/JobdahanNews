import { getNews } from '../server/news.mjs';

// Vercel Serverless Function: keeps the NAVER API credentials on the server.
export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }
  if (request.method !== 'GET') {
    response.status(405).json({ message: 'GET 요청만 사용할 수 있어요.' });
    return;
  }

  const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  try {
    const result = await getNews(url.searchParams, {
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    });
    response.status(result.status).json(result.body);
  } catch {
    response.status(500).json({ message: '뉴스 서버에서 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' });
  }
}
