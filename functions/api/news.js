import { getNews } from '../../앱인토스/취업뉴스모음/server/news.mjs';

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export async function onRequestGet(context) {
  const result = await getNews(new URL(context.request.url).searchParams, {
    clientId: context.env.NAVER_CLIENT_ID,
    clientSecret: context.env.NAVER_CLIENT_SECRET,
  });
  return json(result.status, result.body);
}
