# Cloudflare Pages 배포

Cloudflare Pages 프로젝트 `jobdahannews`의 **Settings > Builds**를 다음과 같이 설정합니다.

- Production branch: `master`
- Build command: `node cloudflare/build-assets.mjs`
- Build output directory: `cloudflare/public`
- Root directory: 비워 둠

`functions/api/news.js`가 `/api/news` Pages Function으로 배포됩니다. 정적 화면과 뉴스 API가 같은 `jobdahannews.pages.dev` 도메인에서 실행됩니다.

**Settings > Variables and Secrets**에서 Production 환경에 아래 두 값을 **Secret**으로 추가합니다. 값에는 키 이름, `=`, 따옴표, 앞뒤 공백을 넣지 않습니다.

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

Preview 배포에서도 뉴스가 필요하면 Preview 환경에도 같은 두 Secret을 추가합니다.
