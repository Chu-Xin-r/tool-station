import { useState } from 'react';
import { Card, Input, Button, Space, message, Row, Col } from 'antd';
import { Typography } from 'antd';
import CryptoJS from 'crypto-js';

const { TextArea } = Input;
const { Text } = Typography;

const algos = [
  { key: 'MD5', label: 'MD5 (32位)' },
  { key: 'MD5_16', label: 'MD5 (16位)' },
  { key: 'SHA1', label: 'SHA1' },
  { key: 'SHA256', label: 'SHA256' },
  { key: 'SHA512', label: 'SHA512' },
];

export default function Md5Tool() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});

  const compute = () => {
    if (!input) {
      message.warning('请输入内容');
      return;
    }
    const md5 = CryptoJS.MD5(input).toString();
    setResults({
      MD5: md5,
      MD5_16: md5.slice(8, 24),
      SHA1: CryptoJS.SHA1(input).toString(),
      SHA256: CryptoJS.SHA256(input).toString(),
      SHA512: CryptoJS.SHA512(input).toString(),
    });
  };

  return (
    <Card title="哈希加密 (MD5 / SHA 系列)">
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要加密的文本..."
          className="code-area full-area"
        />
        <Space>
          <Button type="primary" onClick={compute}>
            加密
          </Button>
        </Space>
        {Object.keys(results).length > 0 && (
          <Row gutter={[12, 12]}>
            {algos.map((a) => (
              <Col span={24} key={a.key}>
                <Card size="small">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Text strong style={{ minWidth: 100, display: 'inline-block' }}>
                      {a.label}
                    </Text>
                    <Text
                      copyable={{ text: results[a.key] }}
                      style={{
                        flex: 1,
                        fontFamily: 'Consolas, monospace',
                        fontSize: 13,
                        wordBreak: 'break-all',
                      }}
                    >
                      {results[a.key]}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </Card>
  );
}
