import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const clientDir = path.join(rootDir, 'client');
const distSource = path.join(clientDir, 'dist');
const serverDist = path.join(rootDir, 'server', 'dist');

console.log('[build] 构建前端...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

console.log(`[build] 复制前端产物到 server/dist ...`);
if (fs.existsSync(serverDist)) {
  fs.rmSync(serverDist, { recursive: true, force: true });
}
fs.mkdirSync(serverDist, { recursive: true });
fs.cpSync(distSource, serverDist, { recursive: true });
console.log('[build] 完成: server/dist 已包含前端页面');
