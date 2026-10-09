# Cloudflare Workers 배포

이 구성은 정적 화면과 `/api/news` API를 하나의 Cloudflare Worker로 배포합니다. 브라우저에는 네이버 API 키가 전달되지 않습니다.

## Git 연동 배포

Cloudflare Workers Builds에서 이 GitHub 저장소를 연결하고 배포 명령을 `npx wrangler deploy`로 둡니다. 루트의 `wrangler.jsonc`가 배포 중 `cloudflare/build-assets.mjs`를 자동 실행해 정적 파일을 만들기 때문에 별도의 빌드 출력 디렉터리를 지정할 필요가 없습니다.

첫 배포 뒤 Worker의 **Settings → Variables and Secrets**에 아래 두 항목을 Secret으로 추가하세요.

```text
NAVER_CLIENT_ID
NAVER_CLIENT_SECRET
```

값은 로컬 `.env`에 넣었던 NAVER API HUB Client ID와 Client Secret입니다. 이 값들은 GitHub에 커밋하거나 Cloudflare 빌드 로그에 넣지 마세요.

Secret 저장 후 새 배포를 실행합니다. 키가 설정되기 전에는 앱이 ‘뉴스 연결 준비 중’ 메시지를 보여 줍니다.

## 로컬 확인

```powershell
../../.tools/node-v22.16.0-win-x64/node.exe cloudflare/build-assets.mjs
npx wrangler dev
```

로컬 Worker 비밀값은 `cloudflare/.dev.vars`에 넣습니다. `.dev.vars`는 커밋하지 않습니다.
