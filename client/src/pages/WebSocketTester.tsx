import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, List, Tag, message } from 'antd';
import { SendOutlined, CloseCircleOutlined, ApiOutlined, ClearOutlined } from '@ant-design/icons';

interface LogItem {
  id: string;
  time: string;
  type: 'connected' | 'disconnected' | 'message' | 'sent' | 'error';
  content: string;
}

function formatTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds())}`;
}

export default function WebSocketTester() {
  const [url, setUrl] = useState('wss://echo.websocket.org');
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogItem[]>([]);
const wsRef = useRef<WebSocket | null>(null);
const logRef = useRef<HTMLDivElement>(null);
const idRef = useRef(0);

useEffect(() => {
  return () => {
    wsRef.current?.close();
  };
}, []);

useEffect(() => {
  if (logRef.current) {
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }
}, [logs]);

const addLog = (type: LogItem['type'], content: string) => {
  idRef.current += 1;
  setLogs((prev) => [...prev, { id: String(idRef.current), time: formatTime(), type, content }]);
};

  const connect = () => {
    if (!url.trim()) {
      message.warning('请输入 WebSocket 地址');
      return;
    }
    let target = url.trim();
    try {
      // 允许用户省略 ws:// 或 wss:// 前缀
      if (!/^(ws|wss):\/\//.test(target)) {
        target = 'ws://' + target;
      }
      const ws = new WebSocket(target);
      wsRef.current = ws;
      addLog('connected', `正在连接 ${target} ...`);
      ws.onopen = () => {
        setConnected(true);
        addLog('connected', '连接已建立');
      };
      ws.onmessage = (e) => {
        addLog('message', typeof e.data === 'string' ? e.data : JSON.stringify(e.data));
      };
      ws.onerror = () => {
        addLog('error', 'WebSocket 错误');
      };
      ws.onclose = (e) => {
        setConnected(false);
        addLog('disconnected', `连接已关闭 (code: ${e.code}${e.reason ? ', reason: ' + e.reason : ''})`);
      };
    } catch (e) {
      addLog('error', '连接失败: ' + (e as Error).message);
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
  };

  const send = () => {
    if (!connected || !wsRef.current) {
      message.warning('请先建立连接');
      return;
    }
    wsRef.current.send(input);
    addLog('sent', input);
    setInput('');
  };

  const tagColor = (type: LogItem['type']) => {
    switch (type) {
      case 'connected':
        return 'green';
      case 'disconnected':
        return 'default';
      case 'sent':
        return 'blue';
      case 'error':
        return 'red';
      default:
        return 'purple';
    }
  };

  const tagText = (type: LogItem['type']) => {
    switch (type) {
      case 'connected':
        return '连接';
      case 'disconnected':
        return '关闭';
      case 'sent':
        return '发送';
      case 'error':
        return '错误';
      default:
        return '接收';
    }
  };

  return (
    <Card title="WebSocket 在线测试">
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ws:// 或 wss:// 地址"
            style={{ width: '100%' }}
            className="monospace"
          />
          {!connected ? (
            <Button type="primary" icon={<ApiOutlined />} onClick={connect}>
              连接
            </Button>
          ) : (
            <Button danger icon={<CloseCircleOutlined />} onClick={disconnect}>
              断开
            </Button>
          )}
        </Space.Compact>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={send}
            placeholder="输入要发送的消息..."
            disabled={!connected}
            style={{ width: '100%' }}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={send} disabled={!connected}>
            发送
          </Button>
        </Space.Compact>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text type="secondary">消息日志（{logs.length} 条）</Typography.Text>
          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={() => setLogs([])}
            disabled={logs.length === 0}
          >
            清空日志
          </Button>
        </div>
        <div
          ref={logRef}
          style={{
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid rgba(128,128,128,0.2)',
            borderRadius: 8,
            padding: 8,
            background: 'rgba(128,128,128,0.04)',
          }}
        >
          {logs.length === 0 ? (
            <Typography.Text type="secondary">暂无消息</Typography.Text>
          ) : (
            <List
              size="small"
              dataSource={logs}
              renderItem={(item) => (
                <List.Item style={{ padding: '4px 0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ marginBottom: 2 }}>
                      <Tag color={tagColor(item.type)} style={{ marginRight: 8 }}>
                        {tagText(item.type)}
                      </Tag>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Typography.Text>
                    </div>
                    <Typography.Text
                      style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: 13 }}
                    >
                      {item.content}
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Space>
    </Card>
  );
}
