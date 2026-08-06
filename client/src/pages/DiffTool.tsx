import { useState, useMemo } from 'react';
import { Card, Input, Button, Tag, Typography } from 'antd';
import { diffLines } from 'diff';
import { ClearOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function DiffTool() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');

  const diffs = useMemo(() => diffLines(left, right), [left, right]);

  const renderLine = (line: string, type: string, key: number) => {
    const trimmed = line.startsWith('+') || line.startsWith('-') ? line.slice(1) : line;
    const bg =
      type === 'add' ? 'rgba(0,255,0,0.12)' : type === 'remove' ? 'rgba(255,0,0,0.12)' : 'transparent';
    const color =
      type === 'add' ? '#52c41a' : type === 'remove' ? '#ff4d4f' : 'rgba(128,128,128,0.6)';
    return (
      <div
        key={key}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          background: bg,
          padding: '2px 8px',
          borderLeft: `3px solid ${color}`,
        }}
      >
        {type !== 'normal' && (
          <Tag color={type === 'add' ? 'green' : 'red'} style={{ marginRight: 6 }}>
            {type === 'add' ? '+' : '-'}
          </Tag>
        )}
        {trimmed || '\u00a0'}
      </div>
    );
  };

  return (
    <Card
      title="文本对比 (Diff)"
      extra={
        <Button
          size="small"
          icon={<ClearOutlined />}
          onClick={() => {
            setLeft('');
            setRight('');
          }}
        >
          清空
        </Button>
      }
    >
      <div className="split-layout" style={{ height: 'calc(100vh - 210px)' }}>
        <div className="split-pane">
          <Typography.Text strong className="split-title">
            原始文本
          </Typography.Text>
          <TextArea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="code-area"
            spellCheck={false}
          />
        </div>
        <div className="split-bar" />
        <div className="split-pane">
          <Typography.Text strong className="split-title">
            对比文本
          </Typography.Text>
          <TextArea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            className="code-area"
            spellCheck={false}
          />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
          差异结果
          <Tag color="green" style={{ marginLeft: 8 }}>新增</Tag>
          <Tag color="red">删除</Tag>
        </Typography.Text>
        <div
          className="code-area"
          style={{
            maxHeight: 300,
            overflow: 'auto',
            background: 'rgba(128,128,128,0.04)',
            borderRadius: 8,
          }}
        >
          {(() => {
            const rows: React.ReactNode[] = [];
            let key = 0;
            diffs.forEach((part) => {
              const type = part.added ? 'add' : part.removed ? 'remove' : 'normal';
              part.value
                .replace(/\n$/, '')
                .split('\n')
                .forEach((l) => rows.push(renderLine(l, type, key++)));
            });
            return rows;
          })()}
          {!left && !right && <Typography.Text type="secondary" style={{ padding: 12 }}>输入左右文本后自动对比</Typography.Text>}
        </div>
      </div>
    </Card>
  );
}
