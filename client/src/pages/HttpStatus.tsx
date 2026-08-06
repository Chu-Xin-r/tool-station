import { useState, useMemo } from 'react';
import { Card, Input, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface StatusInfo {
  code: string;
  category: string;
  name: string;
  description: string;
  color: string;
}

const STATUSES: StatusInfo[] = [
  // 1xx 信息
  { code: '100', category: '1xx 信息', name: 'Continue', description: '继续。服务器已收到请求头，客户端应继续发送请求体', color: 'blue' },
  { code: '101', category: '1xx 信息', name: 'Switching Protocols', description: '切换协议。服务器根据 Upgrade 头切换协议', color: 'blue' },
  { code: '102', category: '1xx 信息', name: 'Processing', description: '处理中（WebDAV）', color: 'blue' },
  { code: '103', category: '1xx 信息', name: 'Early Hints', description: '提前提示，服务器正在发送响应头', color: 'blue' },
  // 2xx 成功
  { code: '200', category: '2xx 成功', name: 'OK', description: '请求成功。返回所请求的数据', color: 'green' },
  { code: '201', category: '2xx 成功', name: 'Created', description: '已创建。请求成功且服务器创建了新资源', color: 'green' },
  { code: '202', category: '2xx 成功', name: 'Accepted', description: '已接受。请求已接受但尚未处理', color: 'green' },
  { code: '203', category: '2xx 成功', name: 'Non-Authoritative Information', description: '非权威信息', color: 'green' },
  { code: '204', category: '2xx 成功', name: 'No Content', description: '无内容。请求成功但无内容返回', color: 'green' },
  { code: '205', category: '2xx 成功', name: 'Reset Content', description: '重置内容', color: 'green' },
  { code: '206', category: '2xx 成功', name: 'Partial Content', description: '部分内容。范围请求成功', color: 'green' },
  { code: '207', category: '2xx 成功', name: 'Multi-Status', description: '多状态（WebDAV）', color: 'green' },
  { code: '208', category: '2xx 成功', name: 'Already Reported', description: '已报告（WebDAV）', color: 'green' },
  { code: '226', category: '2xx 成功', name: 'IM Used', description: '使用了实例操作', color: 'green' },
  // 3xx 重定向
  { code: '300', category: '3xx 重定向', name: 'Multiple Choices', description: '多种选择', color: 'cyan' },
  { code: '301', category: '3xx 重定向', name: 'Moved Permanently', description: '永久重定向', color: 'cyan' },
  { code: '302', category: '3xx 重定向', name: 'Found', description: '临时重定向', color: 'cyan' },
  { code: '303', category: '3xx 重定向', name: 'See Other', description: '查看其他位置', color: 'cyan' },
  { code: '304', category: '3xx 重定向', name: 'Not Modified', description: '未修改。使用缓存', color: 'cyan' },
  { code: '305', category: '3xx 重定向', name: 'Use Proxy', description: '使用代理（已废弃）', color: 'cyan' },
  { code: '307', category: '3xx 重定向', name: 'Temporary Redirect', description: '临时重定向', color: 'cyan' },
  { code: '308', category: '3xx 重定向', name: 'Permanent Redirect', description: '永久重定向', color: 'cyan' },
  // 4xx 客户端错误
  { code: '400', category: '4xx 客户端错误', name: 'Bad Request', description: '请求语法错误或无法满足请求', color: 'orange' },
  { code: '401', category: '4xx 客户端错误', name: 'Unauthorized', description: '未授权，需要身份验证', color: 'orange' },
  { code: '402', category: '4xx 客户端错误', name: 'Payment Required', description: '需要付款（保留）', color: 'orange' },
  { code: '403', category: '4xx 客户端错误', name: 'Forbidden', description: '禁止访问，服务器拒绝请求', color: 'orange' },
  { code: '404', category: '4xx 客户端错误', name: 'Not Found', description: '资源不存在', color: 'orange' },
  { code: '405', category: '4xx 客户端错误', name: 'Method Not Allowed', description: '请求方法不被允许', color: 'orange' },
  { code: '406', category: '4xx 客户端错误', name: 'Not Acceptable', description: '无法生成客户端接受的响应', color: 'orange' },
  { code: '407', category: '4xx 客户端错误', name: 'Proxy Authentication Required', description: '需要代理认证', color: 'orange' },
  { code: '408', category: '4xx 客户端错误', name: 'Request Timeout', description: '请求超时', color: 'orange' },
  { code: '409', category: '4xx 客户端错误', name: 'Conflict', description: '冲突', color: 'orange' },
  { code: '410', category: '4xx 客户端错误', name: 'Gone', description: '资源已永久删除', color: 'orange' },
  { code: '411', category: '4xx 客户端错误', name: 'Length Required', description: '需要 Content-Length', color: 'orange' },
  { code: '412', category: '4xx 客户端错误', name: 'Precondition Failed', description: '前置条件失败', color: 'orange' },
  { code: '413', category: '4xx 客户端错误', name: 'Payload Too Large', description: '请求体过大', color: 'orange' },
  { code: '414', category: '4xx 客户端错误', name: 'URI Too Long', description: 'URI 过长', color: 'orange' },
  { code: '415', category: '4xx 客户端错误', name: 'Unsupported Media Type', description: '不支持的媒体类型', color: 'orange' },
  { code: '416', category: '4xx 客户端错误', name: 'Range Not Satisfiable', description: '请求范围无法满足', color: 'orange' },
  { code: '417', category: '4xx 客户端错误', name: 'Expectation Failed', description: 'Expect 头失败', color: 'orange' },
  { code: '418', category: '4xx 客户端错误', name: "I'm a teapot", description: '我是茶壶（愚人节玩笑）', color: 'orange' },
  { code: '421', category: '4xx 客户端错误', name: 'Misdirected Request', description: '请求被错误地发送', color: 'orange' },
  { code: '422', category: '4xx 客户端错误', name: 'Unprocessable Entity', description: '无法处理的实体（WebDAV）', color: 'orange' },
  { code: '423', category: '4xx 客户端错误', name: 'Locked', description: '已锁定（WebDAV）', color: 'orange' },
  { code: '424', category: '4xx 客户端错误', name: 'Failed Dependency', description: '依赖失败（WebDAV）', color: 'orange' },
  { code: '425', category: '4xx 客户端错误', name: 'Too Early', description: '太早（HTTP/2）', color: 'orange' },
  { code: '426', category: '4xx 客户端错误', name: 'Upgrade Required', description: '需要升级协议', color: 'orange' },
  { code: '428', category: '4xx 客户端错误', name: 'Precondition Required', description: '需要前置条件', color: 'orange' },
  { code: '429', category: '4xx 客户端错误', name: 'Too Many Requests', description: '请求过多，限流', color: 'orange' },
  { code: '431', category: '4xx 客户端错误', name: 'Request Header Fields Too Large', description: '请求头过大', color: 'orange' },
  { code: '451', category: '4xx 客户端错误', name: 'Unavailable For Legal Reasons', description: '因法律原因不可用', color: 'orange' },
  // 5xx 服务器错误
  { code: '500', category: '5xx 服务器错误', name: 'Internal Server Error', description: '服务器内部错误', color: 'red' },
  { code: '501', category: '5xx 服务器错误', name: 'Not Implemented', description: '未实现', color: 'red' },
  { code: '502', category: '5xx 服务器错误', name: 'Bad Gateway', description: '网关错误', color: 'red' },
  { code: '503', category: '5xx 服务器错误', name: 'Service Unavailable', description: '服务不可用', color: 'red' },
  { code: '504', category: '5xx 服务器错误', name: 'Gateway Timeout', description: '网关超时', color: 'red' },
  { code: '505', category: '5xx 服务器错误', name: 'HTTP Version Not Supported', description: 'HTTP 版本不支持', color: 'red' },
  { code: '506', category: '5xx 服务器错误', name: 'Variant Also Negotiates', description: '变体协商循环', color: 'red' },
  { code: '507', category: '5xx 服务器错误', name: 'Insufficient Storage', description: '存储不足（WebDAV）', color: 'red' },
  { code: '508', category: '5xx 服务器错误', name: 'Loop Detected', description: '检测到循环（WebDAV）', color: 'red' },
  { code: '510', category: '5xx 服务器错误', name: 'Not Extended', description: '未扩展', color: 'red' },
  { code: '511', category: '5xx 服务器错误', name: 'Network Authentication Required', description: '需要网络认证', color: 'red' },
];

export default function HttpStatus() {
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    if (!keyword.trim()) return STATUSES;
    const k = keyword.trim().toLowerCase();
    return STATUSES.filter(
      (s) => s.code.includes(k) || s.name.toLowerCase().includes(k) || s.category.includes(k),
    );
  }, [keyword]);

  return (
    <Card title="HTTP 状态码速查">
      <Input
        prefix={<SearchOutlined />}
        placeholder="搜索状态码或名称，如 404 / Forbidden"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 360 }}
        allowClear
      />
      <Table
        size="small"
        rowKey="code"
        dataSource={filtered}
        pagination={keyword ? false : { pageSize: 30, showSizeChanger: false }}
        columns={[
          {
            title: '状态码',
            dataIndex: 'code',
            width: 100,
            render: (code: string, r) => (
              <Tag color={r.color} style={{ fontFamily: 'Consolas, monospace', margin: 0 }}>
                {code}
              </Tag>
            ),
          },
          { title: '类别', dataIndex: 'category', width: 140 },
          { title: '英文名', dataIndex: 'name', width: 260 },
          { title: '说明', dataIndex: 'description' },
        ]}
      />
      <Typography.Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
        共 {STATUSES.length} 个状态码
      </Typography.Text>
    </Card>
  );
}
