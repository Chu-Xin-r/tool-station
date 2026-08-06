import net from 'node:net';
import os from 'node:os';
import dns from 'node:dns/promises';

let cancelled = false;

export function cancelScan() {
  cancelled = true;
}

// 获取本机所有 IPv4 地址（含回环与内网）
function getLocalIPv4s() {
  const ips = new Set();
  const ifaces = os.networkInterfaces();
  for (const list of Object.values(ifaces)) {
    if (!list) continue;
    for (const item of list) {
      if (item.family === 'IPv4') ips.add(item.address);
    }
  }
  return ips;
}

// 判断目标是否为服务器自身（禁止扫描，防止泄露本机开放端口）
export async function isLocalHost(host) {
  const h = String(host || '').trim().toLowerCase();
  if (!h) return true;
  if (['localhost', '0.0.0.0', '::1', '::'].includes(h)) return true;
  const localIPs = getLocalIPv4s();
  if (localIPs.has(h)) return true;
  if (/^127\./.test(h)) return true;
  // 域名：解析后检查是否指向本机
  if (!/^[\d.]+$/.test(h)) {
    try {
      const { address } = await dns.lookup(h);
      if (localIPs.has(address) || /^127\./.test(address)) return true;
    } catch {
      return false; // 解析失败交由扫描流程处理
    }
  }
  return false;
}

export function scanPorts(host, ports, timeoutSeconds = 1) {
  cancelled = false;
  const timeoutMs = Math.max(100, Math.min(10000, Math.round((timeoutSeconds || 1) * 1000)));
  const concurrency = 200;

  return new Promise((resolve) => {
    const results = [];
    let index = 0;
    let active = 0;
    let done = 0;

    const checkPort = (port) => {
      return new Promise((r) => {
        const socket = new net.Socket();
        let settled = false;
        const finish = (status) => {
          if (settled) return;
          settled = true;
          socket.destroy();
          r(status);
        };
        socket.setTimeout(timeoutMs);
        socket.once('connect', () => finish('open'));
        socket.once('timeout', () => finish('filtered'));
        socket.once('error', () => finish('closed'));
        socket.connect(port, host);
      });
    };

    const worker = async () => {
      while (index < ports.length) {
        if (cancelled) break;
        const port = ports[index++];
        active++;
        const status = await checkPort(port);
        results.push({ port, status });
        done++;
        active--;
        if (done === ports.length || (cancelled && active === 0)) {
          resolve(results);
        }
      }
    };

    const workers = Math.min(concurrency, ports.length);
    for (let i = 0; i < workers; i++) {
      worker();
    }
  });
}
