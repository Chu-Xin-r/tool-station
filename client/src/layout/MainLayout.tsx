import { useMemo, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Switch, Space, Spin } from 'antd';
import {
  CodeOutlined,
  LockOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  GlobalOutlined,
  ToolOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import SearchBox, { SearchItem } from '../components/SearchBox';

const { Sider, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
  keywords: string[];
}

const menus: { group: string; icon: React.ReactNode; items: MenuItem[] }[] = [
  {
    group: '格式处理',
    icon: <CodeOutlined />,
    items: [
      { key: '/json', label: 'JSON 格式化', keywords: ['格式化', 'format', 'json'] },
      { key: '/url', label: 'URL 编解码', keywords: ['编码', '解码', 'url', 'encode', 'decode'] },
      { key: '/color', label: '颜色转换', keywords: ['颜色', 'hex', 'rgb', 'hsl', '色值', 'color'] },
      { key: '/text-stats', label: '字符统计', keywords: ['字数', '统计', 'text', 'count', '字符'] },
    ],
  },
  {
    group: '加密解密',
    icon: <LockOutlined />,
    items: [
      { key: '/base64', label: 'Base64', keywords: ['base64', '编码', '解码', '加密'] },
      { key: '/md5', label: 'MD5 加密', keywords: ['md5', 'sha1', 'sha256', 'sha512', '哈希', '加密'] },
      { key: '/crc32', label: 'CRC32 校验', keywords: ['crc32', '校验', 'crc', '哈希'] },
      { key: '/password', label: '密码生成器', keywords: ['密码', '随机', 'password', '生成'] },
      { key: '/uuid', label: 'UUID 生成', keywords: ['uuid', 'guid', '生成'] },
    ],
  },
  {
    group: '文本编辑',
    icon: <FileTextOutlined />,
    items: [
      { key: '/markdown', label: 'Markdown 编辑', keywords: ['markdown', 'md', '编辑器', '预览'] },
      { key: '/diff', label: '文本对比', keywords: ['diff', '对比', '比较', '差异'] },
      { key: '/regex', label: '正则测试', keywords: ['regex', '正则', 're', '匹配', 'test'] },
      { key: '/http-status', label: 'HTTP 状态码', keywords: ['http', '状态码', 'status', '404', '500'] },
    ],
  },
  {
    group: '媒体工具',
    icon: <PlayCircleOutlined />,
    items: [
      { key: '/m3u8', label: 'M3U8 播放器', keywords: ['m3u8', '播放', '视频', 'hls', 'player'] },
      { key: '/image-base64', label: '图片转 Base64', keywords: ['图片', 'image', 'base64', '图'] },
      { key: '/qrcode', label: '二维码生成', keywords: ['二维码', 'qr', 'qrcode', '扫码'] },
      { key: '/timestamp', label: '时间戳转换', keywords: ['时间戳', 'timestamp', '日期', '时间'] },
    ],
  },
  {
    group: '网络工具',
    icon: <GlobalOutlined />,
    items: [
      { key: '/websocket', label: 'WebSocket 测试', keywords: ['websocket', 'ws', '长连接', 'socket'] },
      { key: '/api-test', label: 'API 接口测试', keywords: ['api', '接口', '请求', 'http', '测试'] },
      { key: '/ip', label: 'IP 查询', keywords: ['ip', '地址', '归属地', '查询', '公网'] },
      { key: '/port-scan', label: '端口扫描', keywords: ['端口', '扫描', 'port', 'scan', 'tcp'] },
    ],
  },
  {
    group: '开发者',
    icon: <ApiOutlined />,
    items: [{ key: '/api-docs', label: 'API 文档', keywords: ['api', '文档', '接口', 'documentation'] }],
  },
];

const searchItems: SearchItem[] = menus.flatMap((g) =>
  g.items.map((i) => ({ key: i.key, label: i.label, group: g.group, keywords: i.keywords })),
);

export default function MainLayout({
  dark,
  onToggleDark,
}: {
  dark: boolean;
  onToggleDark: (d: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(() => {
    return menus.map((g) => ({
      key: g.group,
      label: g.group,
      icon: g.icon,
      children: g.items.map((i) => ({ key: i.key, label: i.label })),
    }));
  }, []);

  const selectedKey = location.pathname === '/' ? '/json' : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        theme={dark ? 'dark' : 'light'}
        style={{ borderRight: '1px solid rgba(128,128,128,0.15)' }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            gap: 8,
          }}
        >
          <ToolOutlined style={{ color: '#1677ff' }} />
          <span>在线工具箱</span>
        </div>
        <Menu
          mode="inline"
          theme={dark ? 'dark' : 'light'}
          items={menuItems}
          selectedKeys={[selectedKey]}
          defaultOpenKeys={menus.map((g) => g.group)}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Layout.Header
          style={{
            height: 48,
            lineHeight: '48px',
            padding: '0 16px',
            background: dark ? '#141414' : '#fff',
            borderBottom: '1px solid rgba(128,128,128,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Typography.Text strong>Tool Station</Typography.Text>
          <SearchBox items={searchItems} />
          <Space>
            <span>暗色</span>
            <Switch checked={dark} onChange={onToggleDark} size="small" />
          </Space>
        </Layout.Header>
        <Content style={{ padding: 16, overflow: 'auto' }}>
          <Suspense
            fallback={
              <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <Spin size="large" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}
