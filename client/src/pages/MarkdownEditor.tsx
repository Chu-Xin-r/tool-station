import { useState, useMemo } from 'react';
import { Card, Segmented, Input } from 'antd';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const { TextArea } = Input;

const sample = `# Markdown 在线编辑

支持 **粗体**、*斜体*、~~删除线~~ 和 \`行内代码\`。

## 列表
- 项目一
- 项目二
  - 子项目

## 引用
> 这是一个引用块

## 代码块
\`\`\`js
const hello = () => console.log('Hello!');
\`\`\`

## 链接与表格
[链接文字](https://example.com)

| 列1 | 列2 |
|-----|-----|
| A   | B   |
`;

export default function MarkdownEditor() {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [text, setText] = useState(sample);

  const html = useMemo(() => {
    return DOMPurify.sanitize(marked.parse(text) as string);
  }, [text]);

  return (
    <Card
      title="Markdown 在线编辑"
      extra={
        <Segmented
          options={[
            { label: '编辑', value: 'edit' },
            { label: '预览', value: 'preview' },
            { label: '分屏', value: 'split' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'edit' | 'preview' | 'split')}
        />
      }
    >
      {mode === 'edit' && (
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ minHeight: 480, resize: 'vertical' }}
          className="code-area"
          spellCheck={false}
        />
      )}
      {mode === 'preview' && <Preview html={html} />}
      {mode === 'split' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ minHeight: 480, resize: 'vertical' }}
            className="code-area"
            spellCheck={false}
          />
          <div style={{ minHeight: 480, overflow: 'auto' }}>
            <Preview html={html} />
          </div>
        </div>
      )}
    </Card>
  );
}

function Preview({ html }: { html: string }) {
  return (
    <div className="md-preview">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <style>{`
        .md-preview { padding: 12px 16px; border: 1px solid rgba(128,128,128,0.2); border-radius: 8px; min-height: 100px; }
        .md-preview h1, .md-preview h2, .md-preview h3 { margin-top: 8px; }
        .md-preview code { background: rgba(128,128,128,0.15); padding: 2px 6px; border-radius: 4px; font-family: Consolas, monospace; }
        .md-preview pre { background: rgba(128,128,128,0.1); padding: 12px; border-radius: 8px; overflow: auto; }
        .md-preview pre code { background: transparent; padding: 0; }
        .md-preview table { border-collapse: collapse; }
        .md-preview th, .md-preview td { border: 1px solid rgba(128,128,128,0.3); padding: 6px 12px; }
        .md-preview blockquote { border-left: 4px solid #1677ff; margin: 0; padding: 4px 12px; background: rgba(128,128,128,0.08); }
        .md-preview img { max-width: 100%; }
      `}</style>
    </div>
  );
}
