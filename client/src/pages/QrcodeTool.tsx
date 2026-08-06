import { useState } from 'react';
import { Card, Input, Button, Space, InputNumber, Segmented, message, Typography, Image } from 'antd';
import { QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

export default function QrcodeTool() {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<ErrorLevel>('M');
  const [dataUrl, setDataUrl] = useState('');

  const generate = async () => {
    if (!text.trim()) {
      message.warning('请输入内容');
      return;
    }
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: level,
      });
      setDataUrl(url);
    } catch (e) {
      message.error('生成失败: ' + (e as Error).message);
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode_${Date.now()}.png`;
    a.click();
  };

  return (
    <Card title="在线二维码生成">
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文本、URL、内容..."
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
        <Space wrap>
          <span>尺寸:</span>
          <InputNumber min={100} max={1024} value={size} onChange={(v) => setSize(v || 256)} />
          <span>容错等级:</span>
          <Segmented
            options={['L', 'M', 'Q', 'H'].map((l) => ({ label: l, value: l }))}
            value={level}
            onChange={(v) => setLevel(v as ErrorLevel)}
          />
          <Button type="primary" icon={<QrcodeOutlined />} onClick={generate}>
            生成二维码
          </Button>
          <Button icon={<DownloadOutlined />} disabled={!dataUrl} onClick={download}>
            下载 PNG
          </Button>
        </Space>
        {dataUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Image src={dataUrl} width={size} preview={{ src: dataUrl }} />
            <Typography.Text type="secondary">
              容错等级: {level}
              <br />
              尺寸: {size}×{size}
            </Typography.Text>
          </div>
        )}
      </Space>
    </Card>
  );
}
