import net from 'node:net';

let cancelled = false;

export function cancelScan() {
  cancelled = true;
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
