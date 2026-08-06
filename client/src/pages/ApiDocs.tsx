import { useState } from 'react';
import {
  Card,
  Collapse,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Input,
  message,
  Tabs,
  Alert,
} from 'antd';
import {
  CopyOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  GlobalOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const BASE = 'http://cxauo.site:8002';

export interface ApiParam {
  name: string;
  type: string;
  required?: boolean;
  desc: string;
  example?: unknown;
}

export interface ApiSpec {
  id: string;
  group: string;
  method: 'GET' | 'POST';
  path: string;
  name: string;
  desc: string;
  params: ApiParam[];
  bodyExample?: string;
  responseExample: string;
  curl: string;
}

const APIS: ApiSpec[] = [
  // ============ 工具 API ============
  {
    group: '工具 API',
    id: 'tools-base64-encode',
    method: 'POST',
    path: '/api/tools/base64/encode',
    name: 'Base64 编码',
    desc: '将文本编码为 Base64 字符串，支持中文。',
    params: [{ name: 'text', type: 'string', required: true, desc: '要编码的文本', example: 'Hello 世界' }],
    bodyExample: '{\n  "text": "Hello 世界"\n}',
    responseExample: '{\n  "ok": true,\n  "result": "SGVsbG8g5LiW55WM"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/base64/encode \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"Hello 世界"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-base64-decode',
    method: 'POST',
    path: '/api/tools/base64/decode',
    name: 'Base64 解码',
    desc: '将 Base64 字符串解码为原始文本。',
    params: [{ name: 'text', type: 'string', required: true, desc: 'Base64 字符串', example: 'SGVsbG8g5LiW55WM' }],
    bodyExample: '{\n  "text": "SGVsbG8g5LiW55WM"\n}',
    responseExample: '{\n  "ok": true,\n  "result": "Hello 世界"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/base64/decode \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"SGVsbG8g5LiW55WM"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-hash',
    method: 'POST',
    path: '/api/tools/hash',
    name: '哈希加密',
    desc: '计算文本的哈希值。支持 md5 / md5_16 / sha1 / sha224 / sha256 / sha384 / sha512。',
    params: [
      { name: 'text', type: 'string', required: true, desc: '要加密的文本', example: 'hello' },
      { name: 'algo', type: 'string', required: false, desc: '算法，默认 md5', example: 'sha256' },
    ],
    bodyExample: '{\n  "text": "hello",\n  "algo": "sha256"\n}',
    responseExample: '{\n  "ok": true,\n  "algorithm": "sha256",\n  "result": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/hash \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"hello","algo":"sha256"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-crc32',
    method: 'POST',
    path: '/api/tools/crc32',
    name: 'CRC32 校验',
    desc: '计算文本的 CRC32 校验值。',
    params: [{ name: 'text', type: 'string', required: true, desc: '输入文本', example: 'hello' }],
    bodyExample: '{\n  "text": "hello"\n}',
    responseExample: '{\n  "ok": true,\n  "dec": 907060870,\n  "hex": "3610A686"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/crc32 \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"hello"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-json',
    method: 'POST',
    path: '/api/tools/json',
    name: 'JSON 格式化 / 压缩',
    desc: '格式化（action=format）或压缩（action=compress）JSON。',
    params: [
      { name: 'text', type: 'string', required: true, desc: 'JSON 字符串', example: '{"a":1,"b":2}' },
      { name: 'action', type: 'string', required: false, desc: 'format 或 compress，默认 format', example: 'format' },
    ],
    bodyExample: '{\n  "text": "{\\"a\\":1,\\"b\\":2}",\n  "action": "format"\n}',
    responseExample: '{\n  "ok": true,\n  "result": "{\\n  \\"a\\": 1,\\n  \\"b\\": 2\\n}"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/json \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"{\\"a\\":1,\\"b\\":2}"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-url',
    method: 'POST',
    path: '/api/tools/url',
    name: 'URL 编解码',
    desc: 'URL 编码（action=encode）或解码（action=decode）。',
    params: [
      { name: 'text', type: 'string', required: true, desc: '要处理的字符串', example: 'hello world?x=1' },
      { name: 'action', type: 'string', required: false, desc: 'encode 或 decode，默认 encode', example: 'encode' },
    ],
    bodyExample: '{\n  "text": "hello world?x=1",\n  "action": "encode"\n}',
    responseExample: '{\n  "ok": true,\n  "result": "hello%20world%3Fx%3D1"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/url \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"hello world?x=1"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-uuid',
    method: 'POST',
    path: '/api/tools/uuid',
    name: 'UUID 生成',
    desc: '批量生成 UUID v4。',
    params: [
      { name: 'count', type: 'number', required: false, desc: '生成数量 1-100，默认 5', example: 3 },
      { name: 'uppercase', type: 'boolean', required: false, desc: '是否大写，默认 false', example: true },
    ],
    bodyExample: '{\n  "count": 3,\n  "uppercase": false\n}',
    responseExample: '{\n  "ok": true,\n  "count": 3,\n  "uuid": ["a1b2...", "c3d4..."]\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/uuid \\\n  -H "Content-Type: application/json" \\\n  -d \'{"count":3}\'',
  },
  {
    group: '工具 API',
    id: 'tools-password',
    method: 'POST',
    path: '/api/tools/password',
    name: '随机密码生成',
    desc: '生成随机密码。字符类型开关默认全开。',
    params: [
      { name: 'length', type: 'number', required: false, desc: '密码长度 6-64，默认 16', example: 16 },
      { name: 'count', type: 'number', required: false, desc: '生成数量 1-20，默认 5', example: 5 },
      { name: 'lower', type: 'boolean', required: false, desc: '小写字母，默认 true' },
      { name: 'upper', type: 'boolean', required: false, desc: '大写字母，默认 true' },
      { name: 'digits', type: 'boolean', required: false, desc: '数字，默认 true' },
      { name: 'symbols', type: 'boolean', required: false, desc: '特殊符号，默认 true' },
    ],
    bodyExample: '{\n  "length": 16,\n  "count": 3,\n  "lower": true,\n  "upper": true,\n  "digits": true,\n  "symbols": true\n}',
    responseExample: '{\n  "ok": true,\n  "length": 16,\n  "count": 3,\n  "password": ["xQ&dAmA3h5Ky...", "..."]\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/password \\\n  -H "Content-Type: application/json" \\\n  -d \'{"length":16,"count":3}\'',
  },
  {
    group: '工具 API',
    id: 'tools-ts-now',
    method: 'GET',
    path: '/api/tools/timestamp/now',
    name: '当前时间戳',
    desc: '返回当前毫秒/秒级时间戳。',
    params: [],
    responseExample: '{\n  "ok": true,\n  "millisecond": 1750000000000,\n  "second": 1750000000\n}',
    curl: 'curl http://cxauo.site:8002/api/tools/timestamp/now',
  },
  {
    group: '工具 API',
    id: 'tools-ts-convert',
    method: 'POST',
    path: '/api/tools/timestamp/convert',
    name: '时间戳转换',
    desc: '时间戳转日期时间（自动识别秒/毫秒）。',
    params: [{ name: 'timestamp', type: 'number', required: true, desc: '秒或毫秒级时间戳', example: 1750000000 }],
    bodyExample: '{\n  "timestamp": 1750000000\n}',
    responseExample: '{\n  "ok": true,\n  "millisecond": 1750000000000,\n  "second": 1750000000,\n  "local": "2025-06-15 23:06:40",\n  "utc": "2025-06-15 15:06:40"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/timestamp/convert \\\n  -H "Content-Type: application/json" \\\n  -d \'{"timestamp":1750000000}\'',
  },
  {
    group: '工具 API',
    id: 'tools-color',
    method: 'POST',
    path: '/api/tools/color',
    name: '颜色转换',
    desc: 'HEX 颜色转 RGB / HSL。',
    params: [{ name: 'hex', type: 'string', required: true, desc: 'HEX 颜色（# 可省略）', example: '#1677ff' }],
    bodyExample: '{\n  "hex": "#1677ff"\n}',
    responseExample: '{\n  "ok": true,\n  "hex": "#1677FF",\n  "rgb": "rgb(22, 119, 255)",\n  "rgbObj": {"r":22,"g":119,"b":255},\n  "hsl": "hsl(215, 100%, 54%)",\n  "hslObj": {"h":215,"s":100,"l":54}\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/color \\\n  -H "Content-Type: application/json" \\\n  -d \'{"hex":"#1677ff"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-text-stats',
    method: 'POST',
    path: '/api/tools/text-stats',
    name: '文本统计',
    desc: '统计文本的字符、单词、行数、字节、中英文等。',
    params: [{ name: 'text', type: 'string', required: true, desc: '要统计的文本' }],
    bodyExample: '{\n  "text": "hello 世界 123"\n}',
    responseExample: '{\n  "ok": true,\n  "characters": 12,\n  "characters_no_space": 10,\n  "words": 3,\n  "lines": 1,\n  "bytes": 12,\n  "chinese": 2,\n  "letters": 5,\n  "digits": 3,\n  "spaces": 2\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/text-stats \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"hello 世界 123"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-regex',
    method: 'POST',
    path: '/api/tools/regex',
    name: '正则测试',
    desc: '对文本执行正则匹配，返回所有匹配结果及捕获分组。',
    params: [
      { name: 'pattern', type: 'string', required: true, desc: '正则表达式', example: '\\d+' },
      { name: 'flags', type: 'string', required: false, desc: '正则修饰符，默认 g', example: 'g' },
      { name: 'text', type: 'string', required: true, desc: '待匹配文本', example: 'a1b22c333' },
    ],
    bodyExample: '{\n  "pattern": "\\\\d+",\n  "flags": "g",\n  "text": "a1b22c333"\n}',
    responseExample: '{\n  "ok": true,\n  "count": 3,\n  "matches": [\n    {"index":1,"text":"1","groups":[]},\n    {"index":3,"text":"22","groups":[]}\n  ]\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/regex \\\n  -H "Content-Type: application/json" \\\n  -d \'{"pattern":"\\\\d+","text":"a1b22c333"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-diff',
    method: 'POST',
    path: '/api/tools/diff',
    name: '文本对比 (Diff)',
    desc: '对比两段文本，返回新增/删除的行。',
    params: [
      { name: 'left', type: 'string', required: true, desc: '原始文本' },
      { name: 'right', type: 'string', required: true, desc: '对比文本' },
    ],
    bodyExample: '{\n  "left": "a\\nb",\n  "right": "a\\nc"\n}',
    responseExample: '{\n  "ok": true,\n  "left_lines": 2,\n  "right_lines": 2,\n  "added_lines": 1,\n  "removed_lines": 1,\n  "added": ["c"],\n  "removed": ["b"]\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/diff \\\n  -H "Content-Type: application/json" \\\n  -d \'{"left":"a\\nb","right":"a\\nc"}\'',
  },
  {
    group: '工具 API',
    id: 'tools-qrcode',
    method: 'POST',
    path: '/api/tools/qrcode',
    name: '二维码生成',
    desc: '生成二维码图片，返回 DataURL（可直接用于 img src）。',
    params: [
      { name: 'text', type: 'string', required: true, desc: '二维码内容', example: 'https://cxauo.site:8002' },
      { name: 'size', type: 'number', required: false, desc: '尺寸 100-1024，默认 256', example: 256 },
      { name: 'level', type: 'string', required: false, desc: '容错 L/M/Q/H，默认 M', example: 'M' },
    ],
    bodyExample: '{\n  "text": "https://cxauo.site:8002",\n  "size": 256,\n  "level": "M"\n}',
    responseExample: '{\n  "ok": true,\n  "dataUrl": "data:image/png;base64,iVBORw0KGgo...",\n  "mime": "image/png"\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/tools/qrcode \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"https://cxauo.site:8002"}\'',
  },

  // ============ 网络 API ============
  {
    group: '网络 API',
    id: 'health',
    method: 'GET',
    path: '/api/health',
    name: '健康检查',
    desc: '检查服务是否正常。',
    params: [],
    responseExample: '{\n  "ok": true,\n  "time": 1750000000000\n}',
    curl: 'curl http://cxauo.site:8002/api/health',
  },
  {
    group: '网络 API',
    id: 'ip-public',
    method: 'GET',
    path: '/api/ip/public',
    name: '本机公网 IP',
    desc: '获取服务器的公网 IP（多接口轮询）。',
    params: [],
    responseExample: '{\n  "ip": "219.139.64.99"\n}',
    curl: 'curl http://cxauo.site:8002/api/ip/public',
  },
  {
    group: '网络 API',
    id: 'ip-query',
    method: 'GET',
    path: '/api/ip/query',
    name: 'IP 归属地查询',
    desc: '查询任意 IP 的归属地信息（多接口轮询）。',
    params: [{ name: 'ip', type: 'query', required: true, desc: 'IP 地址', example: '8.8.8.8' }],
    responseExample: '{\n  "ip": "8.8.8.8",\n  "country": "United States",\n  "region": "California",\n  "city": "Mountain View",\n  "isp": "Google",\n  "org": "Google",\n  "timezone": "America/Chicago"\n}',
    curl: 'curl "http://cxauo.site:8002/api/ip/query?ip=8.8.8.8"',
  },
  {
    group: '网络 API',
    id: 'port-scan',
    method: 'POST',
    path: '/api/port-scan',
    name: '端口扫描',
    desc: '对指定主机执行 TCP 端口扫描。',
    params: [
      { name: 'host', type: 'string', required: true, desc: '目标主机 IP 或域名', example: '127.0.0.1' },
      { name: 'ports', type: 'number[]', required: true, desc: '端口列表，最多 2000 个', example: [80, 443, 8002] },
      { name: 'timeout', type: 'number', required: false, desc: '超时秒数，默认 1', example: 1 },
    ],
    bodyExample: '{\n  "host": "127.0.0.1",\n  "ports": [80, 443, 8002],\n  "timeout": 1\n}',
    responseExample: '{\n  "results": [\n    {"port": 80, "status": "open"},\n    {"port": 443, "status": "closed"}\n  ]\n}',
    curl: 'curl -X POST http://cxauo.site:8002/api/port-scan \\\n  -H "Content-Type: application/json" \\\n  -d \'{"host":"127.0.0.1","ports":[80,443,8002]}\'',
  },
  {
    group: '网络 API',
    id: 'proxy',
    method: 'GET',
    path: '/api/proxy',
    name: '通用 HTTP 代理',
    desc: '转发任意 HTTP/HTTPS 请求，规避 CORS 限制。',
    params: [{ name: 'url', type: 'query', required: true, desc: '目标 URL', example: 'https://example.com/api' }],
    responseExample: '<目标接口的原始响应>',
    curl: 'curl "http://cxauo.site:8002/api/proxy?url=https%3A%2F%2Fexample.com"',
  },
];

// 按分组聚合
function groupApis(apis: ApiSpec[]) {
  const map = new Map<string, ApiSpec[]>();
  apis.forEach((a) => {
    if (!map.has(a.group)) map.set(a.group, []);
    map.get(a.group)!.push(a);
  });
  return Array.from(map.entries());
}

const methodColor: Record<string, string> = { GET: 'green', POST: 'blue' };

function CodeBlock({ text }: { text: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <Button
        size="small"
        type="text"
        icon={<CopyOutlined />}
        style={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
        onClick={() => {
          navigator.clipboard.writeText(text);
          message.success('已复制');
        }}
      >
        复制
      </Button>
      <pre
        className="code-area"
        style={{
          background: 'rgba(128,128,128,0.08)',
          padding: 12,
          borderRadius: 8,
          overflow: 'auto',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {text}
      </pre>
    </div>
  );
}

function TestForm({ spec }: { spec: ApiSpec }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [params, setParams] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    spec.params.forEach((p) => {
      const ex = p.example;
      init[p.name] = typeof ex === 'object' ? JSON.stringify(ex) : ex !== undefined ? String(ex) : '';
    });
    return init;
  });

  const run = async () => {
    setLoading(true);
    setResult('');
    try {
      let url = '/api' + spec.path.replace('/api', '');
      if (spec.method === 'GET') {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== '') qs.set(k, v);
        });
        const q = qs.toString();
        if (q) url += (url.includes('?') ? '&' : '?') + q;
        const r = await fetch(url);
        setResult(JSON.stringify(await r.json(), null, 2));
      } else {
        const body: Record<string, unknown> = {};
        Object.entries(params).forEach(([k, v]) => {
          if (v === undefined || v === '') return;
          // 尝试解析数字/布尔/数组
          if (v === 'true') body[k] = true;
          else if (v === 'false') body[k] = false;
          else if (/^-?\d+$/.test(v)) body[k] = parseInt(v, 10);
          else if (/^\[.*\]$/.test(v)) {
            try { body[k] = JSON.parse(v); } catch { body[k] = v; }
          } else body[k] = v;
        });
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const text = await r.text();
        try { setResult(JSON.stringify(JSON.parse(text), null, 2)); } catch { setResult(text); }
      }
    } catch (e) {
      setResult('请求失败: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {spec.params.length > 0 ? (
        <Table
          size="small"
          rowKey="name"
          pagination={false}
          dataSource={spec.params}
          columns={[
            { title: '参数', dataIndex: 'name', width: 130, render: (n: string) => <Text code>{n}</Text> },
            { title: '类型', dataIndex: 'type', width: 90 },
            { title: '说明', dataIndex: 'desc' },
            {
              title: '测试值',
              width: 260,
              render: (_, p: ApiParam) => (
                <Input
                  size="small"
                  value={params[p.name] ?? ''}
                  onChange={(e) => setParams((prev) => ({ ...prev, [p.name]: e.target.value }))}
                />
              ),
            },
          ]}
        />
      ) : (
        <Alert type="info" showIcon message="该接口无需参数，直接发送请求即可。" />
      )}
      <Button type="primary" icon={<ThunderboltOutlined />} loading={loading} onClick={run}>
        发送测试请求
      </Button>
      {result && <CodeBlock text={result} />}
    </Space>
  );
}

export default function ApiDocs() {
  const groups = groupApis(APIS);

  return (
    <div style={{ padding: 4 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        <ApiOutlined /> API 接口文档
      </Typography.Title>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <Space direction="vertical" size={0}>
            <Text>
              <GlobalOutlined /> 基础地址: <Text code>{BASE}</Text>（所有接口无需认证）
            </Text>
            <Text type="secondary">
              统一响应格式: 成功 <Text code>{'{"ok":true,...}'}</Text>，失败{' '}
              <Text code>{'{"ok":false,"error":"..."}'}</Text>；仅个别早期接口（IP/端口扫描）返回裸对象。
            </Text>
          </Space>
        }
      />

      {groups.map(([group, apis]) => (
        <Card
          key={group}
          title={
            <Space>
              <CodeOutlined />
              {group}
              <Tag>{apis.length} 个接口</Tag>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Collapse
            accordion={false}
            items={apis.map((spec) => ({
              key: spec.id,
              label: (
                <Space>
                  <Tag color={methodColor[spec.method]}>{spec.method}</Tag>
                  <Text code>{spec.path}</Text>
                  <Text type="secondary">{spec.name}</Text>
                </Space>
              ),
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <Paragraph>{spec.desc}</Paragraph>
                  {spec.params.length > 0 && (
                    <>
                      <Text strong>请求参数</Text>
                      <Table
                        size="small"
                        rowKey="name"
                        pagination={false}
                        dataSource={spec.params}
                        columns={[
                          {
                            title: '参数',
                            dataIndex: 'name',
                            render: (n: string) => (
                              <Text code>
                                {n} {spec.params.find((p) => p.name === n)?.required ? <Tag color="red">必填</Tag> : <Tag>选填</Tag>}
                              </Text>
                            ),
                          },
                          { title: '类型', dataIndex: 'type', width: 100 },
                          { title: '说明', dataIndex: 'desc' },
                          { title: '示例', dataIndex: 'example', width: 200, render: (v: unknown) => (v !== undefined ? <Text code>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</Text> : '-') },
                        ]}
                      />
                    </>
                  )}
                  {spec.bodyExample && (
                    <>
                      <Text strong>请求体示例</Text>
                      <CodeBlock text={spec.bodyExample} />
                    </>
                  )}
                  <Text strong>响应示例</Text>
                  <CodeBlock text={spec.responseExample} />
                  <Text strong>curl 命令</Text>
                  <CodeBlock text={spec.curl} />
                  <Tabs
                    size="small"
                    items={[
                      {
                        key: 'test',
                        label: <Space><ThunderboltOutlined />在线测试</Space>,
                        children: <TestForm spec={spec} />,
                      },
                    ]}
                  />
                </Space>
              ),
            }))}
          />
        </Card>
      ))}
    </div>
  );
}
