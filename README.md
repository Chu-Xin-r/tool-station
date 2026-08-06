# Tool Station · 在线工具箱

轻量化在线工具箱，纯前端 + 极简 Node 后端。

## 技术栈

- **前端**: Vite + React 18 + TypeScript + Ant Design 5
- **后端**: Express (Node.js)，仅用于端口扫描、IP 查询、M3U8/API 代理

## 功能列表

### 格式处理
- JSON 格式化 / 压缩
- URL 编解码
- 颜色转换 (HEX/RGB/HSL)
- 字符统计

### 加密解密
- Base64 编码 / 解码
- MD5 / SHA1 / SHA256 / SHA512
- CRC32 校验
- 随机密码生成器
- UUID 生成

### 文本编辑
- Markdown 在线编辑（编辑/预览/分屏）
- 文本对比 (Diff)
- 正则表达式测试
- HTTP 状态码速查

### 媒体工具
- M3U8 播放器（后端代理转发，规避 CORS）
- 图片转 Base64 / 回转
- 在线二维码生成
- 时间戳转换

### 网络工具
- WebSocket 在线测试
- API 接口测试（后端代理）
- IP 查询（本机公网/内网 + 任意 IP 归属地）
- 端口扫描（Node 后端真实 TCP 扫描）

## 快速开始

```bash
# 安装依赖
npm run install:all

# 同时启动前后端
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:8002

## 单独启动

```bash
# 前端
npm run dev:client

# 后端
npm run dev:server
```

## 项目结构

```
tool-station/
├── client/                # React 前端
│   └── src/
│       ├── pages/         # 各工具页面
│       ├── layout/        # 布局（侧边栏）
│       └── router.tsx     # 路由配置
├── server/                # Node 后端
│   ├── index.js           # Express 入口
│   └── routes/
│       ├── portScan.js    # 端口扫描
│       ├── ip.js          # IP 查询
│       └── proxy.js       # 通用代理（M3U8/API）
├── scripts/dev.js         # 并行启动脚本
└── package.json
```

## 说明

- 端口扫描仅支持 TCP 端口，需注意目标主机防火墙策略
- IP 查询使用 ip-api.com 免费接口，需后端可访问公网
- 请勿对未授权的主机进行端口扫描
