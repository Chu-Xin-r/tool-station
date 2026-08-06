import { useState, useMemo } from 'react';
import { Card, Input, Button, Typography, Table, Tag } from 'antd';
import { ClearOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface Match {
  index: number;
  text: string;
  groups: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const [lastError, setLastError] = useState('');
  const [renderVersion, setRenderVersion] = useState(0);

  const matches = useMemo(() => {
    if (!pattern) return [];
    try {
      setLastError('');
      const re = new RegExp(pattern, flags);
      const result: Match[] = [];
      let m: RegExpExecArray | null;
      let i = 0;
      while ((m = re.exec(text)) !== null) {
        result.push({ index: m.index, text: m[0], groups: m.slice(1) });
        if (m[0] === '') re.lastIndex++;
        if (++i > 10000) break;
      }
      return result;
    } catch (e) {
      setLastError((e as Error).message);
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, flags, text, renderVersion]);

  const highlighted = useMemo(() => {
    if (!pattern || !text) return [{ key: 'plain', text }];
    try {
      const re = new RegExp(pattern, flags === 'g' || flags.includes('g') ? flags : flags + 'g');
      const parts: { key: string; text: string; matched?: boolean }[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      let guard = 0;
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push({ key: `n${guard}`, text: text.slice(last, m.index) });
        parts.push({ key: `m${guard}`, text: m[0], matched: true });
        last = m.index + m[0].length;
        if (m[0] === '') re.lastIndex++;
        if (++guard > 10000) break;
      }
      if (last < text.length) parts.push({ key: 'tail', text: text.slice(last) });
      return parts;
    } catch {
      return [{ key: 'plain', text }];
    }
  }, [pattern, flags, text]);

  return (
    <Card
      title="正则表达式测试"
      extra={
        <span>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="正则表达式，如 \d{3}-?\d{4}"
            style={{ width: 260, marginRight: 8 }}
            className="monospace"
            size="small"
          />
          <Input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            style={{ width: 70, marginRight: 8 }}
            className="monospace"
            size="small"
          />
          <Button type="primary" size="small" onClick={() => setRenderVersion((v) => v + 1)}>
            测试
          </Button>
          <Button
            size="small"
            icon={<ClearOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => {
              setPattern('');
              setText('');
            }}
          >
            清空
          </Button>
        </span>
      }
    >
      {lastError && (
        <Typography.Text type="danger" style={{ display: 'block', marginBottom: 8 }}>
          正则错误: {lastError}
        </Typography.Text>
      )}
      <div className="split-layout">
        <div className="split-pane">
          <Typography.Text strong className="split-title">
            测试文本
          </Typography.Text>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入测试文本..."
            className="code-area"
            spellCheck={false}
          />
        </div>
        <div className="split-bar" />
        <div className="split-pane">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Typography.Text strong className="split-title" style={{ marginBottom: 0 }}>
              匹配结果
              <Tag color="blue" style={{ marginLeft: 8 }}>{matches.length} 处</Tag>
            </Typography.Text>
          </div>
          <div
            className="code-area"
            style={{
              flex: 1,
              overflow: 'auto',
              border: '1px solid rgba(128,128,128,0.2)',
              borderRadius: 8,
              padding: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {highlighted.map((p) =>
              p.matched ? (
                <span key={p.key} style={{ background: '#ffe58f', borderRadius: 3, padding: '0 2px' }}>
                  {p.text}
                </span>
              ) : (
                <span key={p.key}>{p.text}</span>
              ),
            )}
            {!text && (
              <Typography.Text type="secondary">输入测试文本后点击「测试」查看高亮匹配</Typography.Text>
            )}
          </div>
          {matches.length > 0 && (
            <Table
              size="small"
              rowKey={(r) => `${r.index}-${r.text}`}
              dataSource={matches.slice(0, 50)}
              style={{ marginTop: 8 }}
              pagination={false}
              scroll={{ y: 160 }}
              columns={[
                { title: '序号', render: (_: unknown, __: unknown, i: number) => i + 1, width: 60 },
                { title: '位置', dataIndex: 'index', width: 80 },
                { title: '匹配内容', dataIndex: 'text' },
                {
                  title: '捕获分组',
                  render: (_, r) => r.groups.join(', ') || '-',
                },
              ]}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
