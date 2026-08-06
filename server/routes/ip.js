// 公网 IP 获取：依次尝试多个接口，返回纯文本 IPv4 优先，全部失败才抛错
const IP_SOURCES = [
  'https://4.ipw.cn',
  'https://ip.3322.net',
  'https://api.ipify.org?format=json',
  'https://ifconfig.me/ip',
];

// 通用请求：返回原始响应文本（调用方自行解析）
async function fetchRaw(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) {
    throw new Error(`上游返回状态 ${res.status}`);
  }
  return res.text();
}

function extractIp(text) {
  const match = String(text).match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
  return match ? match[0] : null;
}

export async function getPublicIp() {
  const errors = [];
  for (const source of IP_SOURCES) {
    try {
      const text = await fetchRaw(source);
      // 若为 JSON，取 ip 字段
      let raw = text;
      try {
        const obj = JSON.parse(text);
        if (obj && typeof obj === 'object' && obj.ip) raw = obj.ip;
      } catch {
        // 非 JSON，用纯文本
      }
      const ip = extractIp(raw);
      if (ip) return ip;
      errors.push(`${source}: 响应中未找到 IP`);
    } catch (e) {
      errors.push(`${source}: ${e.message}`);
    }
  }
  throw new Error('所有公网 IP 接口均失败: ' + errors.join(' | '));
}

export async function queryIp(ip) {
  // 主要来源：ip-api.com（免费国际）；备选：api.ip.sb（国内可访问）
  const sources = [
    `http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=status,message,query,country,regionName,city,isp,org,timezone`,
    `https://api.ip.sb/geoip/${encodeURIComponent(ip)}`,
  ];
  const errors = [];
  for (const source of sources) {
    try {
      const text = await fetchRaw(source);
      const data = JSON.parse(text);
      if (data.status === 'fail') {
        throw new Error(data.message || '查询失败');
      }
      return {
        ip: data.query || data.ip || ip,
        country: data.country || data.country_name || '',
        region: data.regionName || data.region || data.province || '',
        city: data.city || '',
        isp: data.isp || data.organization || data.org || '',
        org: data.organization || data.org || '',
        timezone: data.timezone || data.time_zone || '',
      };
    } catch (e) {
      errors.push(`${source}: ${e.message}`);
    }
  }
  throw new Error('IP 归属地查询失败: ' + errors.join(' | '));
}
