import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = resolve(repoRoot, '앱인토스', '취업뉴스모음');
const output = resolve(repoRoot, 'cloudflare', 'public');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(appRoot, 'index.html'), resolve(output, 'index.html'));
await cp(resolve(appRoot, 'src'), resolve(output, 'src'), { recursive: true });
console.log(`Cloudflare assets prepared: ${output}`);
