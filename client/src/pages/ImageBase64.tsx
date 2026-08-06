import { useState, useRef } from 'react';
import { Card, Button, Space, Input, Segmented, message, Image, Typography } from 'antd';
import { UploadOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';

const { TextArea } = Input;

function formatDataUrl(dataUrl: string): string {
  // 去掉前缀，仅返回纯 base64 数据
  const idx = dataUrl.indexOf(',');
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

export default function ImageBase64() {
  const [mode, setMode] = useState<'to' | 'from'>('to');
  const [base64, setBase64] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.warning('请选择图片文件');
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      setDataUrl(url);
      setBase64(formatDataUrl(url));
      message.success('图片已转换');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const renderFrom = () => {
    if (!base64.trim()) {
      message.warning('请输入 Base64 数据');
      return;
    }
    try {
      const cleaned = base64.trim();
      let url = cleaned;
      if (!cleaned.startsWith('data:')) {
        // 尝试探测图片类型
        let mime = 'image/png';
        if (cleaned.startsWith('/9j/')) mime = 'image/jpeg';
        else if (cleaned.startsWith('iVBORw0KGgo')) mime = 'image/png';
        else if (cleaned.startsWith('R0lGOD')) mime = 'image/gif';
        else if (cleaned.startsWith('UklGR')) mime = 'image/webp';
        else if (cleaned.startsWith('PHN2Zy')) mime = 'image/svg+xml';
        else {
          message.info('无法识别图片类型，默认按 PNG 处理');
        }
        url = `data:${mime};base64,${cleaned}`;
      }
      setPreview(url);
      setDataUrl(url);
    } catch {
      message.error('Base64 数据无效');
    }
  };

  const toText = () => {
    if (!preview) {
      message.warning('请先选择图片');
      return;
    }
    navigator.clipboard.writeText(base64).then(
      () => message.success('已复制 Base64'),
      () => message.error('复制失败'),
    );
  };

  const toDataUrl = () => {
    if (!dataUrl) {
      message.warning('请先选择图片');
      return;
    }
    navigator.clipboard.writeText(dataUrl).then(
      () => message.success('已复制 Data URL'),
      () => message.error('复制失败'),
    );
  };

  return (
    <Card title="图片转 Base64 / 回转">
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Segmented
          options={[
            { label: '图片 → Base64', value: 'to' },
            { label: 'Base64 → 图片', value: 'from' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'to' | 'from')}
        />
        {mode === 'to' ? (
          <div className="split-layout">
            <div className="split-pane">
              <Typography.Text strong className="split-title">
                图片
              </Typography.Text>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed rgba(128,128,128,0.3)',
                  borderRadius: 8,
                  gap: 12,
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {preview ? (
                  <Image
                    src={preview}
                    alt="preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography.Text type="secondary">未选择图片</Typography.Text>
                )}
                <Space>
                  <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                    选择图片
                  </Button>
                  <Button icon={<CopyOutlined />} onClick={toText} disabled={!preview}>
                    复制 Base64
                  </Button>
                  <Button icon={<CopyOutlined />} onClick={toDataUrl} disabled={!preview}>
                    复制 DataURL
                  </Button>
                </Space>
              </div>
            </div>
            <div className="split-bar" />
            <div className="split-pane">
              <Typography.Text strong className="split-title">
                Base64 输出
              </Typography.Text>
              <TextArea
                value={base64}
                onChange={(e) => setBase64(e.target.value)}
                readOnly={!!preview}
                placeholder="图片的 Base64 编码..."
                className="code-area"
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <div className="split-layout">
            <div className="split-pane">
              <Typography.Text strong className="split-title">
                Base64 输入
              </Typography.Text>
              <TextArea
                value={base64}
                onChange={(e) => setBase64(e.target.value)}
                placeholder="粘贴 Base64 数据（纯数据或带 data: 前缀均可）..."
                className="code-area"
                spellCheck={false}
              />
              <div style={{ marginTop: 8 }}>
                <Button type="primary" onClick={renderFrom} style={{ marginRight: 8 }}>
                  显示图片
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setBase64('');
                    setPreview('');
                    setDataUrl('');
                  }}
                >
                  清空
                </Button>
              </div>
            </div>
            <div className="split-bar" />
            <div className="split-pane">
              <Typography.Text strong className="split-title">
                图片预览
              </Typography.Text>
              {preview ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(128,128,128,0.2)',
                    borderRadius: 8,
                    minHeight: 0,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={preview}
                    alt="result"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
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
                  图片预览区
                </div>
              )}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
}
