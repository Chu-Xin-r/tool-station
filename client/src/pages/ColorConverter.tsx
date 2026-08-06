import { useState } from 'react';
import { Card, Input, Space, Typography, Row, Col, Button, message, Statistic } from 'antd';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').trim();
  let h = m;
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export default function ColorConverter() {
  const [hex, setHex] = useState('#1677ff');
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    message.success('已复制: ' + t);
  };

  return (
    <Card title="颜色转换 (HEX / RGB / HSL)">
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Space size="large" align="center">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'}
            onChange={(e) => setHex(e.target.value)}
            style={{ width: 64, height: 40, cursor: 'pointer', border: 'none', background: 'transparent' }}
          />
          <Input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            style={{ width: 140 }}
            placeholder="#1677ff"
            className="monospace"
          />
        </Space>
        {rgb ? (
          <>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="HEX" value={hex.toUpperCase()} />
                  <Button size="small" type="link" onClick={() => copy(hex.toUpperCase())}>
                    复制
                  </Button>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="RGB"
                    value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                    valueStyle={{ fontSize: 18 }}
                  />
                  <Button size="small" type="link" onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>
                    复制
                  </Button>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="HSL"
                    value={`hsl(${hsl!.h}, ${hsl!.s}%, ${hsl!.l}%)`}
                    valueStyle={{ fontSize: 18 }}
                  />
                  <Button size="small" type="link" onClick={() => copy(`hsl(${hsl!.h}, ${hsl!.s}%, ${hsl!.l}%)`)}>
                    复制
                  </Button>
                </Card>
              </Col>
            </Row>
            <div
              style={{
                height: 60,
                borderRadius: 8,
                background: hex,
                border: '1px solid rgba(128,128,128,0.3)',
                transition: 'background 0.2s',
              }}
            />
          </>
        ) : (
          <Typography.Text type="warning">请输入合法的 HEX 颜色（如 #1677ff 或 1677ff）</Typography.Text>
        )}
      </Space>
    </Card>
  );
}
