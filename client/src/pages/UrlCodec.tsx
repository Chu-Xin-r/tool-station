import { useState } from 'react';
import { Card, Input, Button, Segmented, Typography, message } from 'antd';
import { CopyOutlined, ClearOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function UrlCodec() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const process = () => {
    if (!input) {
      message.warning('请输入内容');
      return;
    }
    try {
      const result =
        mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
      setOutput(result);
    } catch (e) {
      message.error(`处理失败: ${(e as Error).message}`);
    }
  };

  return (
    <Card
      title="URL 编解码"
      extra={
        <Segmented
          options={[
            { label: '编码 (encodeURIComponent)', value: 'encode' },
            { label: '解码 (decodeURIComponent)', value: 'decode' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'encode' | 'decode')}
        />
      }
    >
      <div className="split-layout">
        <div className="split-pane">
          <Typography.Text strong className="split-title">
            输入
          </Typography.Text>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本或 URL...' : '输入要解码的 URL 编码字符串...'}
            className="code-area"
          />
        </div>
        <div className="split-bar">
          <Button type="primary" onClick={process} style={{ whiteSpace: 'nowrap' }}>
            {mode === 'encode' ? '编码 →' : '解码 →'}
          </Button>
        </div>
        <div className="split-pane">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Typography.Text strong className="split-title" style={{ marginBottom: 0 }}>
              输出
            </Typography.Text>
            <span>
              <Button
                size="small"
                icon={<CopyOutlined />}
                disabled={!output}
                style={{ marginRight: 6 }}
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  message.success('已复制');
                }}
              >
                复制
              </Button>
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={() => {
                  setInput('');
                  setOutput('');
                }}
              >
                清空
              </Button>
            </span>
          </div>
          <TextArea
            value={output}
            readOnly
            placeholder="结果..."
            className="code-area"
          />
        </div>
      </div>
    </Card>
  );
}
