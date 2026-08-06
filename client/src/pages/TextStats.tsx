import { useState } from 'react';
import { Card, Input, Row, Col, Statistic } from 'antd';

const { TextArea } = Input;

export default function TextStats() {
  const [text, setText] = useState('');

  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split(/\n/).length : 0;
  const bytes = new Blob([text]).size;
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const punct = chars - charsNoSpace - spaces;

  const stats = [
    { title: '总字符数', value: chars },
    { title: '非空白字符', value: charsNoSpace },
    { title: '单词数', value: words },
    { title: '行数', value: lines },
    { title: '字节数', value: bytes },
    { title: '中文字符', value: chinese },
    { title: '英文字母', value: letters },
    { title: '数字', value: digits },
    { title: '空格', value: spaces },
    { title: '标点符号', value: Math.max(0, punct) },
  ];

  return (
    <Card title="字符统计">
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在此输入或粘贴文本..."
        style={{ minHeight: 280, resize: 'vertical' }}
      />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {stats.map((s) => (
          <Col span={6} key={s.title}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
