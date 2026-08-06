import { useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppRouter from './router';

export default function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('ts_theme') === 'dark';
  });

  const toggleDark = (d: boolean) => {
    setDark(d);
    localStorage.setItem('ts_theme', d ? 'dark' : 'light');
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { borderRadius: 6 },
      }}
    >
      <AppRouter dark={dark} onToggleDark={toggleDark} />
    </ConfigProvider>
  );
}
