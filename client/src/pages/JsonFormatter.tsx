import { useState } from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { CopyOutlined, ClearOutlined, BgColorsOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) {
      message.warning('请输入 JSON 内容');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      message.error(`JSON 解析失败: ${(e as Error).message}`);
    }
  };

  const compress = () => {
    if (!input.trim()) {
      message.warning('请输入 JSON 内容');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      message.error(`JSON 解析失败: ${(e as Error).message}`);
    }
  };

  return (
    <Card title="JSON 格式化 / 压缩">
      <div className="split-layout">
        <div className="split-pane">
          <Typography.Text strong className="split-title">
            输入
          </Typography.Text>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴 JSON 内容..."
            className="code-area"
            spellCheck={false}
          />
        </div>
        <div className="split-bar">
          <Typography.Paragraph type="secondary" style={{ textAlign: 'center', margin: 0 }}>
            输入: {input.length} 字符
          </Typography.Paragraph>
        </div>
        <div className="split-pane">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Typography.Text strong className="split-title" style={{ marginBottom: 0 }}>
              输出
            </Typography.Text>
            <span>
              <Button type="primary" size="small" icon={<BgColorsOutlined />} onClick={format} style={{ marginRight: 6 }}>
                格式化
              </Button>
              <Button size="small" onClick={compress} style={{ marginRight: 6 }}>
                压缩
              </Button>
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
            placeholder="格式化结果..."
            className="code-area"
            spellCheck={false}
            readOnly
          />
        </div>
      </div>
    </Card>
  );
}
