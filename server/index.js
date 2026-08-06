import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { scanPorts, cancelScan } from './routes/portScan.js';
import { getPublicIp, queryIp } from './routes/ip.js';
import { proxyRequest } from './routes/proxy.js';
import {
  base64Encode,
  base64Decode,
  hashText,
  crc32Compute,
  jsonProcess,
  urlProcess,
  uuidGenerate,
  passwordGenerate,
  timestampNow,
  timestampConvert,
  colorConvert,
  textStats,
  regexTest,
  textDiff,
  qrcodeGenerate,
} from './routes/tools.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.get('/api/ip/public', async (_req, res) => {
  try {
    const ip = await getPublicIp();
    res.json({ ip });
  } catch {
    res.status(500).json({ error: '获取公网 IP 失败' });
  }
});

app.get('/api/ip/query', async (req, res) => {
  const ip = (req.query.ip || '').toString().trim();
  if (!ip) {
    return res.status(400).json({ error: '缺少 ip 参数' });
  }
  try {
    const data = await queryIp(ip);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.post('/api/port-scan', async (req, res) => {
  const { host, ports, timeout } = req.body || {};
  if (!host || !Array.isArray(ports) || ports.length === 0) {
    return res.status(400).json({ error: '需要 host 和 ports' });
  }
  if (ports.length > 2000) {
    return res.status(400).json({ error: '端口数量不能超过 2000' });
  }
  try {
    const results = await scanPorts(host, ports, timeout || 1);
    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/port-scan/stop', (_req, res) => {
  cancelScan();
  res.json({ ok: true });
});

app.all('/api/m3u8/proxy', (req, res) => proxyRequest(req, res));

app.all('/api/proxy', (req, res) => proxyRequest(req, res));

// ---------- 工具 API ----------
const toolsRouter = express.Router();
toolsRouter.post('/base64/encode', base64Encode);
toolsRouter.post('/base64/decode', base64Decode);
toolsRouter.post('/hash', hashText);
toolsRouter.post('/crc32', crc32Compute);
toolsRouter.post('/json', jsonProcess);
toolsRouter.post('/url', urlProcess);
toolsRouter.post('/uuid', uuidGenerate);
toolsRouter.post('/password', passwordGenerate);
toolsRouter.get('/timestamp/now', timestampNow);
toolsRouter.post('/timestamp/convert', timestampConvert);
toolsRouter.post('/color', colorConvert);
toolsRouter.post('/text-stats', textStats);
toolsRouter.post('/regex', regexTest);
toolsRouter.post('/diff', textDiff);
toolsRouter.post('/qrcode', qrcodeGenerate);
app.use('/api/tools', toolsRouter);

// 生产环境：托管前端构建产物
// 查找顺序：环境变量 DIST_DIR → server/dist → ../client/dist → ../client（兼容 dist 被直接放到 client 目录的情况）
function findDistDir() {
  const candidates = [
    process.env.DIST_DIR,
    path.resolve(__dirname, 'dist'),
    path.resolve(__dirname, '../client/dist'),
    path.resolve(__dirname, '../client'),
  ].filter(Boolean);
  return candidates.find((dir) => {
    try {
      return fs.existsSync(path.join(dir, 'index.html'));
    } catch {
      return false;
    }
  });
}

const distDir = findDistDir();
if (distDir) {
  app.use(express.static(distDir));
  // SPA 回退到 index.html（排除 /api/ 前缀的接口路径）
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
  console.log(`[static] serving ${distDir}`);
} else {
  console.warn(
    '[static] 未找到前端构建产物。请确保 server/dist 或 client/dist 存在，或用环境变量 DIST_DIR 指定目录。当前仅提供 API。',
  );
}

app.listen(PORT, () => {
  console.log(`Tool Station server running at http://localhost:${PORT}`);
});
