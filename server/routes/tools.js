import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import QRCode from 'qrcode';

// 统一响应：成功 { ok: true, ... }，失败 { ok: false, error }
function ok(res, data) {
  res.json({ ok: true, ...data });
}

function fail(res, msg, status = 400) {
  res.status(status).json({ ok: false, error: msg });
}

// ---------- Base64 ----------
export function base64Encode(req, res) {
  const { text } = req.body || {};
  if (text === undefined || text === null) return fail(res, '缺少 text');
  ok(res, { result: Buffer.from(String(text), 'utf8').toString('base64') });
}

export function base64Decode(req, res) {
  const { text } = req.body || {};
  if (!text) return fail(res, '缺少 text');
  try {
    const buf = Buffer.from(String(text), 'base64');
    // 校验是否合法 base64
    if (buf.toString('base64').replace(/=+$/, '') !== String(text).replace(/=+$/, '').replace(/\s/g, '')) {
      throw new Error('invalid base64');
    }
    ok(res, { result: buf.toString('utf8') });
  } catch {
    return fail(res, '无效的 Base64 字符串');
  }
}

// ---------- 哈希 ----------
const HASH_ALGOS = {
  md5: (v) => crypto.createHash('md5').update(v, 'utf8').digest('hex'),
  md5_16: (v) => crypto.createHash('md5').update(v, 'utf8').digest('hex').slice(8, 24),
  sha1: (v) => crypto.createHash('sha1').update(v, 'utf8').digest('hex'),
  sha224: (v) => crypto.createHash('sha224').update(v, 'utf8').digest('hex'),
  sha256: (v) => crypto.createHash('sha256').update(v, 'utf8').digest('hex'),
  sha384: (v) => crypto.createHash('sha384').update(v, 'utf8').digest('hex'),
  sha512: (v) => crypto.createHash('sha512').update(v, 'utf8').digest('hex'),
};

export function hashText(req, res) {
  const { text, algo = 'md5' } = req.body || {};
  if (text === undefined || text === null) return fail(res, '缺少 text');
  const fn = HASH_ALGOS[String(algo).toLowerCase()];
  if (!fn) return fail(res, `不支持的算法: ${algo}（可选: ${Object.keys(HASH_ALGOS).join(', ')}）`);
  ok(res, { algorithm: String(algo).toLowerCase(), result: fn(String(text)) });
}

// ---------- CRC32 ----------
function crc32(str) {
  let crc = 0xffffffff;
  const bytes = Buffer.from(str, 'utf8');
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function crc32Compute(req, res) {
  const { text } = req.body || {};
  if (text === undefined || text === null) return fail(res, '缺少 text');
  const v = crc32(String(text));
  ok(res, { dec: v, hex: v.toString(16).toUpperCase().padStart(8, '0') });
}

// ---------- JSON ----------
export function jsonProcess(req, res) {
  const { text, action = 'format' } = req.body || {};
  if (!text) return fail(res, '缺少 text');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return fail(res, 'JSON 解析失败: ' + e.message);
  }
  try {
    const result =
      action === 'compress' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
    ok(res, { result });
  } catch (e) {
    fail(res, '处理失败: ' + e.message);
  }
}

// ---------- URL ----------
export function urlProcess(req, res) {
  const { text, action = 'encode' } = req.body || {};
  if (text === undefined || text === null) return fail(res, '缺少 text');
  try {
    const result =
      action === 'decode' ? decodeURIComponent(String(text)) : encodeURIComponent(String(text));
    ok(res, { result });
  } catch {
    fail(res, '处理失败：可能是无效的编码字符串');
  }
}

// ---------- UUID ----------
export function uuidGenerate(req, res) {
  const { count = 5, uppercase = false } = req.body || {};
  const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 100);
  const list = [];
  for (let i = 0; i < n; i++) {
    let id = crypto.randomUUID();
    if (uppercase) id = id.toUpperCase();
    list.push(id);
  }
  ok(res, { count: n, uuid: list });
}

// ---------- 随机密码 ----------
const PWD_CHARS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

export function passwordGenerate(req, res) {
  const { length = 16, count = 5, lower = true, upper = true, digits = true, symbols = true } =
    req.body || {};
  const len = Math.min(Math.max(parseInt(length, 10) || 16, 6), 64);
  const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20);
  let charset = '';
  if (lower) charset += PWD_CHARS.lower;
  if (upper) charset += PWD_CHARS.upper;
  if (digits) charset += PWD_CHARS.digits;
  if (symbols) charset += PWD_CHARS.symbols;
  if (!charset) return fail(res, '至少选择一种字符类型');
  const random = () => charset[Math.floor(Math.random() * charset.length)];
  const list = [];
  for (let i = 0; i < n; i++) {
    let pwd = '';
    for (let j = 0; j < len; j++) pwd += random();
    list.push(pwd);
  }
  ok(res, { length: len, count: n, password: list });
}

// ---------- 时间戳 ----------
export function timestampNow(_req, res) {
  const now = Date.now();
  ok(res, { millisecond: now, second: Math.floor(now / 1000) });
}

export function timestampConvert(req, res) {
  const { timestamp } = req.body || {};
  if (timestamp === undefined || timestamp === null || timestamp === '') {
    return fail(res, '缺少 timestamp');
  }
  const num = Number(timestamp);
  if (isNaN(num)) return fail(res, '无效的时间戳');
  const ms = Math.abs(num) < 100000000000 ? num * 1000 : num;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return fail(res, '无效的时间戳');
  const pad = (x) => String(x).padStart(2, '0');
  const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const utc = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  ok(res, { millisecond: ms, second: Math.floor(ms / 1000), local, utc });
}

// ---------- 颜色 ----------
function hexToRgb(hex) {
  let h = String(hex).replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function colorConvert(req, res) {
  const { hex } = req.body || {};
  if (!hex) return fail(res, '缺少 hex');
  const rgb = hexToRgb(hex);
  if (!rgb) return fail(res, '无效的 HEX 颜色');
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const normalized = '#' + String(hex).replace('#', '').trim().toUpperCase();
  ok(res, {
    hex: normalized,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgbObj: rgb,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hslObj: hsl,
  });
}

// ---------- 文本统计 ----------
export function textStats(req, res) {
  const { text } = req.body || {};
  if (text === undefined || text === null) return fail(res, '缺少 text');
  const s = String(text);
  ok(res, {
    characters: s.length,
    characters_no_space: s.replace(/\s/g, '').length,
    words: s.trim() ? s.trim().split(/\s+/).length : 0,
    lines: s ? s.split('\n').length : 0,
    bytes: Buffer.byteLength(s, 'utf8'),
    chinese: (s.match(/[\u4e00-\u9fa5]/g) || []).length,
    letters: (s.match(/[a-zA-Z]/g) || []).length,
    digits: (s.match(/[0-9]/g) || []).length,
    spaces: (s.match(/\s/g) || []).length,
  });
}

// ---------- 正则 ----------
export function regexTest(req, res) {
  const { pattern, flags = 'g', text } = req.body || {};
  if (!pattern) return fail(res, '缺少 pattern');
  if (text === undefined || text === null) return fail(res, '缺少 text');
  let re;
  try {
    re = new RegExp(String(pattern), String(flags));
  } catch (e) {
    return fail(res, '正则表达式错误: ' + e.message);
  }
  const matches = [];
  let m;
  let i = 0;
  while ((m = re.exec(String(text))) !== null) {
    matches.push({ index: m.index, text: m[0], groups: m.slice(1) });
    if (m[0] === '') re.lastIndex++;
    if (++i > 10000) break;
  }
  ok(res, { count: matches.length, matches });
}

// ---------- Diff ----------
function diffLinesOld(a, b) {
  // 简化行级 diff：找出新增/删除行
  const leftLines = String(a).split('\n');
  const rightLines = String(b).split('\n');
  const added = rightLines.filter((l) => !leftLines.includes(l));
  const removed = leftLines.filter((l) => !rightLines.includes(l));
  return { added, removed, leftLines, rightLines };
}

export function textDiff(req, res) {
  const { left, right } = req.body || {};
  if (left === undefined || right === undefined) return fail(res, '缺少 left 或 right');
  const d = diffLinesOld(left, right);
  ok(res, {
    left_lines: d.leftLines.length,
    right_lines: d.rightLines.length,
    added_lines: d.added.length,
    removed_lines: d.removed.length,
    added: d.added,
    removed: d.removed,
  });
}

// ---------- 二维码 ----------
export async function qrcodeGenerate(req, res) {
  const { text, size = 256, level = 'M' } = req.body || {};
  if (!text) return fail(res, '缺少 text');
  try {
    const dataUrl = await QRCode.toDataURL(String(text), {
      width: Math.min(Math.max(parseInt(size, 10) || 256, 100), 1024),
      margin: 2,
      errorCorrectionLevel: ['L', 'M', 'Q', 'H'].includes(level) ? level : 'M',
    });
    ok(res, { dataUrl, mime: 'image/png' });
  } catch (e) {
    fail(res, '生成失败: ' + e.message);
  }
}
