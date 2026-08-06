import { useState, useMemo, useRef } from 'react';
import { AutoComplete, Input, Tag, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export interface SearchItem {
  key: string;
  label: string;
  group: string;
  keywords: string[];
}

interface SearchBoxProps {
  items: SearchItem[];
}

export default function SearchBox({ items }: SearchBoxProps) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const options = useMemo(() => {
    return items.map((it) => ({
      value: it.key,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{it.label}</span>
          <Tag color="blue" style={{ marginRight: 0 }}>
            {it.group}
          </Tag>
        </div>
      ),
    }));
  }, [items]);

  const filterOption = (input: string, option?: { value: string }) => {
    const it = items.find((i) => i.key === option?.value);
    if (!it) return false;
    const q = input.trim().toLowerCase();
    if (!q) return false;
    return (
      it.label.toLowerCase().includes(q) ||
      it.group.toLowerCase().includes(q) ||
      it.key.toLowerCase().includes(q) ||
      it.keywords.some((k) => k.toLowerCase().includes(q))
    );
  };

  const onSelect = (key: string) => {
    navigate(key);
    setValue('');
  };

  const onSearch = (v: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // 支持直接输入路径回车跳转（如 /json）
      if (v.trim().startsWith('/')) {
        navigate(v.trim());
        setValue('');
      }
    }, 800);
  };

  return (
    <AutoComplete
      value={value}
      onChange={setValue}
      onSearch={onSearch}
      onSelect={onSelect}
      options={options}
      filterOption={filterOption}
      popupMatchSelectWidth={340}
      notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到匹配工具" />}
      style={{ width: 340 }}
    >
      <Input
        allowClear
        prefix={<SearchOutlined style={{ color: 'rgba(128,128,128,0.6)' }} />}
        placeholder="搜索工具（中文 / 英文 / 路径）..."
        style={{ borderRadius: 6 }}
      />
    </AutoComplete>
  );
}
