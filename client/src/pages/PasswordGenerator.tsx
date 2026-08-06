import { useState } from 'react';
import {
  Card,
  InputNumber,
  Checkbox,
  Button,
  Space,
  Typography,
  Slider,
  Row,
  Col,
  message,
} from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const lower = 'abcdefghijklmnopqrstuvwxyz';
const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const symbols = '!@#$%^&*()-_=+[]{};:,.<>?';

function randomOf(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)];
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);

  const generate = () => {
    let charset = '';
    if (useLower) charset += lower;
    if (useUpper) charset += upper;
    if (useDigits) charset += digits;
    if (useSymbols) charset += symbols;
    if (!charset) {
      message.warning('至少选择一种字符类型');
      return;
    }
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      let pwd = '';
      for (let j = 0; j < length; j++) {
        pwd += randomOf(charset);
      }
      result.push(pwd);
    }
    setPasswords(result);
  };

  return (
    <Card title="随机密码生成器">
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Row align="middle" gutter={16}>
          <Col>
            <span>密码长度: {length}</span>
            <Slider min={6} max={64} value={length} onChange={setLength} style={{ width: 240 }} />
          </Col>
        </Row>
        <Checkbox checked={useLower} onChange={(e) => setUseLower(e.target.checked)}>
          小写字母
        </Checkbox>
        <Checkbox checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)}>
          大写字母
        </Checkbox>
        <Checkbox checked={useDigits} onChange={(e) => setUseDigits(e.target.checked)}>
          数字
        </Checkbox>
        <Checkbox checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)}>
          特殊符号
        </Checkbox>
        <Space>
          <span>生成数量:</span>
          <InputNumber min={1} max={20} value={count} onChange={(v) => setCount(v || 1)} />
        </Space>
        <Space>
          <Button type="primary" icon={<ReloadOutlined />} onClick={generate}>
            生成
          </Button>
        </Space>
        {passwords.length > 0 && (
          <Space direction="vertical" style={{ width: '100%' }}>
            {passwords.map((p, i) => (
              <Card size="small" key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <Typography.Text code style={{ fontSize: 14, wordBreak: 'break-all' }}>
                    {p}
                  </Typography.Text>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(p);
                      message.success('已复制');
                    }}
                  >
                    复制
                  </Button>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Space>
    </Card>
  );
}
