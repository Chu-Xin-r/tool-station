import { useState } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Tabs,
  Table,
  Tag,
  message,
  Radio,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { apiBase } from '../config';

const { TextArea } = Input;

type BodyMode = 'none' | 'json' | 'text' | 'form';

interface RespInfo {
  status: number;
  statusText: string;
  time: number;
  size: number;
  headers: [string, string][];
  body: string;
}

function prettyJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

export default function ApiTester() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://httpbin.org/get');
  const [headersText, setHeadersText] = useState('');
  const [bodyMode, setBodyMode] = useState<BodyMode>('none');
  const [jsonBody, setJsonBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [formBody, setFormBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<RespInfo | null>(null);
  const [error, setError] = useState('');

  const run = async () => {
    if (!url.trim()) {
      message.warning('请输入 URL');
      return;
    }
    setLoading(true);
    setError('');
    setResp(null);
    const start = performance.now();

    const headers: Record<string, string> = {};
    headersText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((l) => {
        const idx = l.indexOf(':');
        if (idx > 0) {
          headers[l.slice(0, idx).trim()] = l.slice(idx + 1).trim();
        }
      });

    let body: string | undefined;
    let contentType: string | undefined;
    if (bodyMode === 'json' && jsonBody.trim()) {
      body = jsonBody;
      contentType = 'application/json';
    } else if (bodyMode === 'text' && textBody) {
      body = textBody;
      contentType = 'text/plain';
    } else if (bodyMode === 'form' && formBody.trim()) {
      const params = new URLSearchParams();
      formBody
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((l) => {
          const idx = l.indexOf('=');
          if (idx > 0) {
            params.append(l.slice(0, idx).trim(), l.slice(idx + 1).trim());
          }
        });
      body = params.toString();
      contentType = 'application/x-www-form-urlencoded';
    }
    if (contentType && !headers['Content-Type']) headers['Content-Type'] = contentType;

    const useProxy = url.startsWith('http://') || url.startsWith('https://');

    try {
      const target = useProxy ? `${apiBase}/proxy?url=${encodeURIComponent(url)}` : url;
      const res = await fetch(target, {
        method,
        headers,
        body,
      });
      const text = await res.text();
      const end = performance.now();
      setResp({
        status: res.status,
        statusText: res.statusText,
        time: Math.round(end - start),
        size: new Blob([text]).size,
        headers: Object.entries(res.headers as unknown as Record<string, string>).map(([k, v]) => [k, v] as [string, string]),
        body: text,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: number) =>
    s < 300 ? 'green' : s < 400 ? 'cyan' : s < 500 ? 'orange' : 'red';

  return (
    <Card title="API 接口测试">
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Space.Compact style={{ width: '100%' }}>
          <Select
            value={method}
            onChange={setMethod}
            style={{ width: 110 }}
            options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => ({
              label: m,
              value: m,
            }))}
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/api"
            className="monospace"
          />
          <Button type="primary" icon={<SendOutlined />} onClick={run} loading={loading}>
            发送
          </Button>
        </Space.Compact>

        <Card size="small" type="inner" title="请求头 (每行 Header: Value)">
          <TextArea
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            placeholder={'Accept: application/json\nAuthorization: Bearer xxx'}
            autoSize={{ minRows: 2, maxRows: 6 }}
            className="code-area"
            spellCheck={false}
          />
        </Card>

        <Card size="small" type="inner" title="请求体">
          <Radio.Group
            value={bodyMode}
            onChange={(e) => setBodyMode(e.target.value as BodyMode)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: '无', value: 'none' },
              { label: 'JSON', value: 'json' },
              { label: '文本', value: 'text' },
              { label: '表单', value: 'form' },
            ]}
          />
          <div style={{ marginTop: 8 }}>
            {bodyMode === 'json' && (
              <TextArea
                value={jsonBody}
                onChange={(e) => setJsonBody(e.target.value)}
                placeholder={'{\n  "key": "value"\n}'}
                autoSize={{ minRows: 3, maxRows: 10 }}
                className="code-area"
                spellCheck={false}
              />
            )}
            {bodyMode === 'text' && (
              <TextArea
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                autoSize={{ minRows: 3, maxRows: 10 }}
                className="code-area"
                spellCheck={false}
              />
            )}
            {bodyMode === 'form' && (
              <TextArea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder={'key=value（每行一个）'}
                autoSize={{ minRows: 3, maxRows: 10 }}
                className="code-area"
                spellCheck={false}
              />
            )}
          </div>
        </Card>

        {error && <Typography.Text type="danger">请求失败: {error}</Typography.Text>}

        {resp && (
          <Card
            size="small"
            title={
              <Space>
                <Tag color={statusColor(resp.status)}>
                  {resp.status} {resp.statusText}
                </Tag>
                <Typography.Text type="secondary">
                  耗时 {resp.time} ms · 大小 {resp.size} B
                </Typography.Text>
              </Space>
            }
          >
            <Tabs
              items={[
                {
                  key: 'body',
                  label: '响应体',
                  children: (
                    <pre
                      className="code-area"
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: 420,
                        overflow: 'auto',
                        background: 'rgba(128,128,128,0.05)',
                        padding: 12,
                        borderRadius: 8,
                      }}
                    >
                      {prettyJson(resp.body)}
                    </pre>
                  ),
                },
                {
                  key: 'headers',
                  label: '响应头',
                  children: (
                    <Table
                      size="small"
                      rowKey={(r) => r[0]}
                      dataSource={resp.headers}
                      pagination={false}
                      columns={[
                        { title: 'Header', dataIndex: 0, width: 240 },
                        { title: 'Value', dataIndex: 1 },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        )}
        <Typography.Text type="secondary">
          说明: 请求会通过本地后端代理转发以规避 CORS 限制；响应体 JSON 自动美化。
        </Typography.Text>
      </Space>
    </Card>
  );
}
