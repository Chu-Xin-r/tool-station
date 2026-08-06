import { Buffer } from 'node:buffer';

const BLOCKED_SCHEMES = ['file:', 'ftp:', 'gopher:'];

export async function proxyRequest(req, res) {
  const target = (req.query.url || '').toString().trim();
  if (!target) {
    return res.status(400).json({ error: '缺少 url 参数' });
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return res.status(400).json({ error: '无效的 URL' });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).json({ error: '仅支持 http/https' });
  }

  // 传递查询参数（如代理目标自身带参数时）
  const url = new URL(target);
  if (req.query.__extra) {
    url.search = req.query.__extra;
  }

  try {
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    // 透传客户端可能需要的头
    if (req.headers.referer) headers.Referer = req.headers.referer;

    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : (req.body ? JSON.stringify(req.body) : undefined),
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });

    const body = Buffer.from(await upstream.arrayBuffer());
    const ct = upstream.headers.get('content-type');

    if (ct && ct.includes('application/json')) {
      res.status(upstream.status);
      res.setHeader('Content-Type', ct);
      // JSON 响应返回原始内容（可能为视频 json 或 m3u8 索引）
      res.send(body);
    } else {
      res.status(upstream.status);
      for (const [k, v] of upstream.headers.entries()) {
        if (/^(content-length|transfer-encoding|connection|keep-alive|content-security-policy)$/i.test(k)) continue;
        res.setHeader(k, v);
      }
      res.send(body);
    }
  } catch (e) {
    res.status(502).json({ error: '代理请求失败: ' + e.message });
  }
}
