// SDK 설치와 콘솔 등록 후 사용하는 설정 초안입니다.
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'career-news', // 미등록 임시 값: 실제 콘솔 appName으로 교체
  brand: { displayName: '잡다한뉴스', primaryColor: '#202020', icon: '' },
  web: {
    host: 'localhost',
    port: 5173,
    commands: { dev: 'vite --host', build: 'vite build' },
  },
  permissions: [],
  outdir: 'dist',
});
