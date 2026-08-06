import { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Descriptions,
  Tag,
  Typography,
  message,
  Alert,
} from 'antd';
import { SearchOutlined, GlobalOutlined } from '@ant-design/icons';
import { apiBase } from '../config';

interface IpDetail {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  org?: string;
  timezone?: string;
}

export default function IpQuery() {
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<IpDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [publicIp, setPublicIp] = useState('');
  const [publicLoading, setPublicLoading] = useState(true);
  const [publicError, setPublicError] = useState('');

  useEffect(() => {
    getPublicIp();
  }, []);

  const getPublicIp = async () => {
    setPublicLoading(true);
    setPublicError('');
    try {
      const res = await fetch(`${apiBase}/ip/public`);
      const data = await res.json();
      if (data.ip) {
        setPublicIp(data.ip);
      } else if (data.error) {
        setPublicError(data.error);
      }
    } catch {
      setPublicError('获取失败，请确认后端已启动');
    } finally {
      setPublicLoading(false);
    }
  };

  const queryIp = async () => {
    const ip = query.trim();
    if (!ip) {
      message.warning('请输入 IP 地址');
      return;
    }
    setLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`${apiBase}/ip/query?ip=${encodeURIComponent(ip)}`);
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        setDetail(data);
      }
    } catch {
      message.error('查询失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="IP 查询">
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Alert type="info" showIcon message="公网 IP 通过后端多接口获取；归属地查询优先 ip-api.com，失败自动切换百度接口。" />

        <Card
          size="small"
          type="inner"
          title="本机公网 IP"
          extra={
            <Button size="small" onClick={getPublicIp} disabled={publicLoading}>
              {publicLoading ? '查询中...' : '刷新'}
            </Button>
          }
        >
          {publicIp ? (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="公网 IP">
                <Tag color="green" icon={<GlobalOutlined />} style={{ fontSize: 15 }}>
                  {publicIp}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Typography.Text type={publicError ? 'danger' : 'secondary'}>
              {publicError || '正在获取...'}
            </Typography.Text>
          )}
        </Card>

        <Card size="small" type="inner" title="查询其他 IP">
          <Space>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPressEnter={queryIp}
              placeholder="输入 IP 地址，如 8.8.8.8"
              style={{ width: 300 }}
              className="monospace"
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={queryIp} loading={loading}>
              查询
            </Button>
          </Space>
          {detail && (
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginTop: 16 }}
              items={[
                { key: 'ip', label: 'IP 地址', children: detail.ip },
                { key: 'country', label: '国家', children: detail.country },
                { key: 'region', label: '省份', children: detail.region },
                { key: 'city', label: '城市', children: detail.city },
                { key: 'isp', label: '运营商', children: detail.isp },
                { key: 'org', label: '组织', children: detail.org || '-' },
                { key: 'tz', label: '时区', children: detail.timezone || '-' },
              ]}
            />
          )}
        </Card>
      </Space>
    </Card>
  );
}
