import { getNews } from '../앱인토스/취업뉴스모음/server/news.mjs';

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/news') {
      if (request.method !== 'GET') return json(405, { message: 'GET 요청만 지원합니다.' });
      const result = await getNews(url.searchParams, {
        clientId: env.NAVER_CLIENT_ID,
        clientSecret: env.NAVER_CLIENT_SECRET,
      });
      return json(result.status, result.body);
    }
    return env.ASSETS.fetch(request);
  },
};
