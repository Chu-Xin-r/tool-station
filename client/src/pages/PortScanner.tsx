import { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  InputNumber,
  Select,
  Alert,
  Table,
  Tag,
  Typography,
  message,
  Progress,
} from 'antd';
import { ScanOutlined, StopOutlined } from '@ant-design/icons';
import { apiBase } from '../config';

const { TextArea } = Input;

interface PortResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
}

const presets = [
  { label: 'Web 常用端口', ports: [80, 443, 8080, 8000, 8888, 3000, 5173, 7400, 8002, 3306, 6379, 27017] },
  { label: '数据库常用端口', ports: [3306, 5432, 1433, 6379, 27017, 9200, 11211] },
  { label: '邮件服务端口', ports: [25, 110, 143, 465, 587, 993, 995] },
  { label: '远程访问端口', ports: [22, 23, 3389, 5900, 5800, 2222] },
];

const COMMON = [
  21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1433, 1521, 3306, 3389,
  5432, 5900, 6379, 7001, 8000, 8005, 8009, 8080, 8081, 8443, 8888, 9000, 9090, 9200, 9300, 11211,
  27017, 5000, 3000, 27018,
];

export default function PortScanner() {
  const [host, setHost] = useState('127.0.0.1');
  const [mode, setMode] = useState<'preset' | 'range'>('preset');
  const [portsText, setPortsText] = useState('21,22,80,443,8080,3306');
  const [startPort, setStartPort] = useState(1);
  const [endPort, setEndPort] = useState(1024);
  const [timeout, setTimeoutMs] = useState(1000);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const [progress, setProgress] = useState(0);

  const getPorts = (): number[] | null => {
    if (mode === 'preset') {
      const list = portsText
        .split(/[,\s]+/)
        .map((p) => parseInt(p, 10))
        .filter((p) => !isNaN(p) && p >= 1 && p <= 65535);
      if (list.length === 0) {
        message.warning('请输入有效的端口');
        return null;
      }
      return list;
    }
    const s = Math.min(startPort, endPort);
    const e = Math.max(startPort, endPort);
    if (e - s > 2000) {
      message.warning('单次扫描端口数不能超过 2000');
      return null;
    }
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  };

  const scan = async () => {
    if (scanning) return;
    const ports = getPorts();
    if (!ports) return;
    if (!host.trim()) {
      message.warning('请输入主机地址');
      return;
    }
    setScanning(true);
    setResults([]);
    setProgress(0);

    try {
      const res = await fetch(`${apiBase}/port-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim(), ports, timeout: timeout / 1000 }),
      });
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        setResults(data.results || []);
      }
    } catch {
      message.error('扫描请求失败，请确认后端已启动');
    } finally {
      setScanning(false);
      setProgress(100);
    }
  };

  const stop = () => {
    fetch(`${apiBase}/port-scan/stop`, { method: 'POST' }).catch(() => {});
    setScanning(false);
  };

  return (
    <Card title="端口扫描">
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Alert
          type="warning"
          showIcon
          message="端口扫描需启动 Node 后端 (npm run dev)，且需目标主机允许访问。请勿对未授权主机进行扫描。"
        />
        <Space wrap>
          <span>目标主机:</span>
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="127.0.0.1"
            style={{ width: 180 }}
            className="monospace"
          />
          <Select
            value={mode}
            onChange={setMode}
            style={{ width: 160 }}
            options={[
              { label: '自定义端口列表', value: 'preset' },
              { label: '端口范围扫描', value: 'range' },
            ]}
          />
          <span>超时(ms):</span>
          <InputNumber min={100} max={10000} value={timeout} onChange={(v) => setTimeoutMs(v || 1000)} />
          {!scanning ? (
            <Button type="primary" icon={<ScanOutlined />} onClick={scan}>
              开始扫描
            </Button>
          ) : (
            <Button danger icon={<StopOutlined />} onClick={stop}>
              停止
            </Button>
          )}
        </Space>

        {mode === 'preset' ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              value={portsText}
              onChange={(e) => setPortsText(e.target.value)}
              placeholder="端口列表，逗号或空格分隔，如: 21,22,80,443,8080"
              autoSize={{ minRows: 1, maxRows: 3 }}
              className="monospace"
            />
            <Space wrap>
              {presets.map((p) => (
                <Button key={p.label} size="small" onClick={() => setPortsText(p.ports.join(','))}>
                  {p.label}
                </Button>
              ))}
              <Button size="small" onClick={() => setPortsText(COMMON.join(','))}>
                常用端口全集
              </Button>
            </Space>
          </Space>
        ) : (
          <Space>
            <span>起始端口:</span>
            <InputNumber min={1} max={65535} value={startPort} onChange={(v) => setStartPort(v || 1)} />
            <span>结束端口:</span>
            <InputNumber min={1} max={65535} value={endPort} onChange={(v) => setEndPort(v || 1024)} />
          </Space>
        )}

        {scanning && (
          <>
            <Progress percent={Math.round(progress)} />
            <Typography.Text type="secondary">扫描中...</Typography.Text>
          </>
        )}

        {results.length > 0 && (
          <div>
            <Typography.Text strong>
              扫描完成，开放端口 {results.filter((r) => r.status === 'open').length} 个
            </Typography.Text>
            <Table
              size="small"
              rowKey="port"
              style={{ marginTop: 8 }}
              dataSource={results}
              pagination={false}
              columns={[
                {
                  title: '端口',
                  dataIndex: 'port',
                  width: 120,
                  render: (p: number) => <Typography.Text code>{p}</Typography.Text>,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  width: 120,
                  render: (s: string) =>
                    s === 'open' ? <Tag color="green">OPEN</Tag> : s === 'filtered' ? <Tag color="orange">FILTERED</Tag> : <Tag>CLOSED</Tag>,
                },
              ]}
            />
          </div>
        )}
      </Space>
    </Card>
  );
}
