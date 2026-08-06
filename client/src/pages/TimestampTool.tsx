import { useState, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, Row, Col, Statistic, message } from 'antd';
import { SwapOutlined } from '@ant-design/icons';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toLocalDate(ts: number): string {
  return formatDate(ts);
}

function toUtcDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export default function TimestampTool() {
  const [now, setNow] = useState(() => Date.now());
  const [tsInput, setTsInput] = useState('');
  const [tsResult, setTsResult] = useState<{
    ms: string;
    s: string;
    local: string;
    utc: string;
    error?: string;
  } | null>(null);
  const [dateInput, setDateInput] = useState('');
  const [dateResult, setDateResult] = useState<{
    ms: string;
    s: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const convertTs = () => {
    const raw = tsInput.trim();
    if (!raw) {
      message.warning('请输入时间戳');
      return;
    }
    const num = Number(raw);
    if (isNaN(num)) {
      setTsResult({ ms: '', s: '', local: '', utc: '', error: '无效的时间戳' });
      return;
    }
    // 自动判断秒/毫秒
    const ms = Math.abs(num) < 100000000000 ? num * 1000 : num;
    setTsResult({
      ms: String(ms),
      s: String(Math.floor(ms / 1000)),
      local: toLocalDate(ms),
      utc: toUtcDate(ms),
    });
  };

  const convertDate = () => {
    const raw = dateInput.trim();
    if (!raw) {
      message.warning('请输入日期');
      return;
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      setDateResult({ ms: '', s: '', error: '无效的日期格式' });
      return;
    }
    setDateResult({ ms: String(d.getTime()), s: String(Math.floor(d.getTime() / 1000)) });
  };

  return (
    <Card title="时间戳转换">
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card size="small" type="inner" title="当前时间戳（实时）">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="毫秒" value={now} />
            </Col>
            <Col span={6}>
              <Statistic title="秒" value={Math.floor(now / 1000)} />
            </Col>
            <Col span={12}>
              <Typography.Text style={{ fontSize: 20 }}>
                本地时间: {toLocalDate(now)}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary">UTC 时间: {toUtcDate(now)}</Typography.Text>
            </Col>
          </Row>
        </Card>

        <Card size="small" type="inner" title="时间戳 → 日期">
          <Space style={{ width: '100%' }}>
            <Input
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder="输入时间戳（自动识别秒/毫秒）"
              style={{ width: 300 }}
              className="monospace input-fluid"
            />
            <Button type="primary" onClick={convertTs}>
              转换
            </Button>
          </Space>
          {tsResult && (
            <Space direction="vertical" style={{ marginTop: 12 }}>
              {tsResult.error ? (
                <Typography.Text type="danger">{tsResult.error}</Typography.Text>
              ) : (
                <>
                  <Typography.Text copyable>毫秒时间戳: {tsResult.ms}</Typography.Text>
                  <Typography.Text copyable>秒时间戳: {tsResult.s}</Typography.Text>
                  <Typography.Text>本地时间: {tsResult.local}</Typography.Text>
                  <Typography.Text>UTC 时间: {tsResult.utc}</Typography.Text>
                </>
              )}
            </Space>
          )}
        </Card>

        <Card size="small" type="inner" title="日期 → 时间戳">
          <Space style={{ width: '100%' }}>
            <Input
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="如 2024-01-01 12:00:00 或 2024/01/01"
              style={{ width: 300 }}
              className="input-fluid"
            />
            <Button icon={<SwapOutlined />} type="primary" onClick={convertDate}>
              转换
            </Button>
          </Space>
          {dateResult && (
            <Space direction="vertical" style={{ marginTop: 12 }}>
              {dateResult.error ? (
                <Typography.Text type="danger">{dateResult.error}</Typography.Text>
              ) : (
                <>
                  <Typography.Text copyable>毫秒时间戳: {dateResult.ms}</Typography.Text>
                  <Typography.Text copyable>秒时间戳: {dateResult.s}</Typography.Text>
                </>
              )}
            </Space>
          )}
        </Card>
      </Space>
    </Card>
  );
}
