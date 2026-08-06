# Tool Station 部署指南（Windows Server）

## 一、部署方式概览

生产环境采用**单进程**模式：

- 前端已构建为静态文件（`client/dist`）
- Express 后端同时托管前端页面 + API 接口
- 只需跑一个 `node server/index.js` 进程，端口 8002

> 前端 API 请求走相对路径 `/api/...`，生产环境由同一个服务处理，无需额外配置代理。

---

## 二、准备工作

在 Windows Server 上需要安装：

1. **Node.js**（≥ 18，建议 LTS）
   - 下载: https://nodejs.org/
   - 安装时勾选 "Add to PATH"

---

## 三、部署步骤

### 1. 上传项目

将本目录（`tool-station/`）整个复制到服务器，例如：

```
D:\tool-station\
├── client\
│   └── dist\          # 前端构建产物（已包含）
├── server\
│   ├── index.js
│   ├── routes\
│   └── node_modules\  # 需要安装
└── package.json
```

### 2. 安装后端依赖

```bat
cd D:\tool-station\server
npm install --omit=dev
```

> 前端 `dist` 是构建产物，服务器上不需要再装前端依赖、不需要跑构建。

### 3. 测试启动

```bat
cd D:\tool-station\server
node index.js
```

浏览器访问 `http://服务器IP:8002` 验证。

> 如果 8002 被占用，可用环境变量换端口：
> ```bat
> set PORT=8080
> node index.js
> ```

---

## 四、开机自启动（两种方式选一）

### 方式 A：任务计划程序（推荐，无需装软件）

1. 打开「任务计划程序」（Win+R 输入 `taskschd.msc`）
2. 右侧「创建任务」
3. **常规** 标签：
   - 名称: `tool-station`
   - 勾选「不管用户是否登录都要运行」+「使用最高权限运行」
4. **触发器** 标签 → 新建 → 开始任务: **启动时**
5. **操作** 标签 → 新建 → 操作: 启动程序
   - 程序或脚本: `C:\Program Files\nodejs\node.exe`
   - 添加参数: `D:\tool-station\server\index.js`
   - 起始于: `D:\tool-station\server`
6. 确定保存（需要输入服务器管理员账号密码）

### 方式 B：NSSM（Windows 服务方式，更稳定）

下载 NSSM: https://nssm.cc/

```bat
nssm install tool-station "C:\Program Files\nodejs\node.exe" "D:\tool-station\server\index.js"
nssm set tool-station AppDirectory D:\tool-station\server
nssm start tool-station
```

---

## 五、防火墙放行

打开「控制面板 → Windows Defender 防火墙 → 高级设置 → 入站规则」，新建规则：

- 规则类型: 端口
- TCP
- 特定本地端口: `8002`
- 允许连接
- 作用域: 所有

---

## 六、（可选）域名 + HTTPS

如果有域名，推荐用 Nginx 或 IIS 反向代理到 127.0.0.1:8002，再用 Let's Encrypt 配 HTTPS。

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name tool.example.com;

    location / {
        proxy_pass http://127.0.0.1:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 50m;
    }
}
```

---

## 七、升级版本

本地改完代码后：

```bat
# 本地重新构建前端
cd tool-station
npm run build
```

然后把 `client\dist` 和 `server`（不含 node_modules）重新上传覆盖，重启进程即可。

---

## 八、常见问题

| 问题 | 解决 |
|------|------|
| 访问 8002 无响应 | 检查防火墙是否放行 8002 |
| 端口被占用 (EADDRINUSE) | `netstat -ano \| findstr 8002` 找到 PID，任务管理器结束该进程，或用环境变量换端口 |
| IP 查询失败 | 服务器需要能访问外网（ip-api.com / api.ipify.org） |
| 端口扫描无结果 | 目标主机可能屏蔽探测；只扫描 TCP 端口 |
