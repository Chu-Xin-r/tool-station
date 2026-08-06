import { useState } from 'react';
import { Card, InputNumber, Button, Space, Typography, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

export default function UuidTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  const gen = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      const arr = crypto.getRandomValues(new Uint8Array(16));
      arr[6] = (arr[6] & 0x0f) | 0x40;
      arr[8] = (arr[8] & 0x3f) | 0x80;
      const hex = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
      let id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setIds(list);
  };

  const genAll = () => ids.join('\n');

  return (
    <Card title="UUID 生成器">
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Space>
          <span>生成数量:</span>
          <InputNumber min={1} max={100} value={count} onChange={(v) => setCount(v || 1)} />
          <CheckboxToggle checked={uppercase} onChange={setUppercase} />
        </Space>
        <Space>
          <Button type="primary" icon={<ReloadOutlined />} onClick={gen}>
            生成 UUID
          </Button>
          {ids.length > 0 && (
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(genAll());
                message.success('已复制全部');
              }}
            >
              复制全部
            </Button>
          )}
        </Space>
        {ids.length > 0 && (
          <Card size="small" style={{ background: 'rgba(128,128,128,0.06)' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {ids.map((id, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <Typography.Text code style={{ flex: 1, wordBreak: 'break-all' }}>
                    {id}
                  </Typography.Text>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(id);
                      message.success('已复制');
                    }}
                  />
                </div>
              ))}
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
}

function CheckboxToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ marginLeft: 6 }}>大写</span>
    </label>
  );
}
