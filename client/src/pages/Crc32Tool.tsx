import { useState } from 'react';
import { Card, Input, Button, Typography, message, Table } from 'antd';
import { CopyOutlined, ClearOutlined } from '@ant-design/icons';

const { TextArea } = Input;

function crc32(data: string): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export default function Crc32Tool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ dec: number; hex: string; hexLower: string } | null>(null);

  const compute = () => {
    if (!input) {
      message.warning('请输入内容');
      return;
    }
    const v = crc32(input);
    setResult({
      dec: v,
      hex: v.toString(16).toUpperCase().padStart(8, '0'),
      hexLower: v.toString(16).padStart(8, '0'),
    });
  };

  return (
    <Card title="CRC32 校验">
      <div className="split-layout">
        <div className="split-pane">
          <Typography.Text strong className="split-title">
            输入
          </Typography.Text>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入文本..."
            className="code-area"
          />
          <div style={{ marginTop: 8 }}>
            <Button type="primary" onClick={compute} style={{ marginRight: 8 }}>
              计算 CRC32
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                setInput('');
                setResult(null);
              }}
            >
              清空
            </Button>
          </div>
        </div>
        <div className="split-bar" />
        <div className="split-pane">
          <Typography.Text strong className="split-title">
            结果
          </Typography.Text>
          {result ? (
            <Table
              size="small"
              rowKey="name"
              pagination={false}
              dataSource={[
                { name: 'DEC', value: String(result.dec) },
                { name: 'HEX 大写', value: result.hex },
                { name: 'HEX 小写', value: result.hexLower },
              ]}
              columns={[
                { title: '格式', dataIndex: 'name', width: 110 },
                {
                  title: '值',
                  dataIndex: 'value',
                  render: (v: string) => (
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="monospace">{v}</span>
                      <Button
                        size="small"
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(v);
                          message.success('已复制');
                        }}
                      />
                    </span>
                  ),
                },
              ]}
            />
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(128,128,128,0.3)',
                borderRadius: 8,
                color: '#999',
              }}
            >
              点击「计算 CRC32」查看结果
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
