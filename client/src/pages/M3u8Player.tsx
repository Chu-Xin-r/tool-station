import { useRef, useState, useEffect } from 'react';
import { Card, Input, Button, Space, Alert, Typography, message } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import Hls from 'hls.js';

const sample = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export default function M3u8Player() {
  const [url, setUrl] = useState(sample);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const stop = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.removeAttribute('src');
      v.load();
    }
    setPlaying(false);
  };

  const play = () => {
    stop();
    const video = videoRef.current;
    if (!video) return;
    if (!url.trim()) {
      message.warning('请输入 M3U8 地址');
      return;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const proxied = `/api/m3u8/proxy?url=${encodeURIComponent(url)}`;
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup(xhr) {
            xhr.open('GET', proxied, true);
          },
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            message.error('播放出错: ' + data.type);
            stop();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxied;
      } else {
        message.error('当前浏览器不支持 HLS 播放');
      }
    } else {
      // 本地文件路径，直接播放
      video.src = url;
    }
    video.play();
    setPlaying(true);
  };

  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, []);

  return (
    <Card title="M3U8 播放器">
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入 M3U8 播放地址..."
            style={{ width: '100%' }}
            className="monospace"
          />
          {!playing ? (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={play}>
              播放
            </Button>
          ) : (
            <Button danger icon={<StopOutlined />} onClick={stop}>
              停止
            </Button>
          )}
        </Space.Compact>
        <Alert
          type="info"
          showIcon
          message="跨域说明"
          description="为规避浏览器 CORS 限制，播放通过本地后端代理转发，大部分在线 M3U8 源可直接播放；带鉴权或防盗链的源可能失败。"
        />
        <video
          ref={videoRef}
          controls
          style={{ width: '100%', maxHeight: 420, background: '#000', borderRadius: 8 }}
        />
        <Typography.Text type="secondary">
          支持 hls.js 的浏览器将使用 MSE 播放；本地文件路径需填写可访问的地址。
        </Typography.Text>
      </Space>
    </Card>
  );
}
