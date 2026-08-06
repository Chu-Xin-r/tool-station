import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

const JsonFormatter = lazy(() => import('./pages/JsonFormatter'));
const UrlCodec = lazy(() => import('./pages/UrlCodec'));
const ColorConverter = lazy(() => import('./pages/ColorConverter'));
const TextStats = lazy(() => import('./pages/TextStats'));
const Base64Tool = lazy(() => import('./pages/Base64Tool'));
const Md5Tool = lazy(() => import('./pages/Md5Tool'));
const Crc32Tool = lazy(() => import('./pages/Crc32Tool'));
const PasswordGenerator = lazy(() => import('./pages/PasswordGenerator'));
const UuidTool = lazy(() => import('./pages/UuidTool'));
const MarkdownEditor = lazy(() => import('./pages/MarkdownEditor'));
const DiffTool = lazy(() => import('./pages/DiffTool'));
const RegexTester = lazy(() => import('./pages/RegexTester'));
const HttpStatus = lazy(() => import('./pages/HttpStatus'));
const M3u8Player = lazy(() => import('./pages/M3u8Player'));
const ImageBase64 = lazy(() => import('./pages/ImageBase64'));
const QrcodeTool = lazy(() => import('./pages/QrcodeTool'));
const TimestampTool = lazy(() => import('./pages/TimestampTool'));
const WebSocketTester = lazy(() => import('./pages/WebSocketTester'));
const ApiTester = lazy(() => import('./pages/ApiTester'));
const IpQuery = lazy(() => import('./pages/IpQuery'));
const PortScanner = lazy(() => import('./pages/PortScanner'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));

interface RouterProps {
  dark: boolean;
  onToggleDark: (d: boolean) => void;
}

export default function AppRouter({ dark, onToggleDark }: RouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<MainLayout dark={dark} onToggleDark={onToggleDark} />}
        >
          <Route index element={<JsonFormatter />} />
          <Route path="json" element={<JsonFormatter />} />
          <Route path="url" element={<UrlCodec />} />
          <Route path="color" element={<ColorConverter />} />
          <Route path="text-stats" element={<TextStats />} />
          <Route path="base64" element={<Base64Tool />} />
          <Route path="md5" element={<Md5Tool />} />
          <Route path="crc32" element={<Crc32Tool />} />
          <Route path="password" element={<PasswordGenerator />} />
          <Route path="uuid" element={<UuidTool />} />
          <Route path="markdown" element={<MarkdownEditor />} />
          <Route path="diff" element={<DiffTool />} />
          <Route path="regex" element={<RegexTester />} />
          <Route path="http-status" element={<HttpStatus />} />
          <Route path="m3u8" element={<M3u8Player />} />
          <Route path="image-base64" element={<ImageBase64 />} />
          <Route path="qrcode" element={<QrcodeTool />} />
          <Route path="timestamp" element={<TimestampTool />} />
          <Route path="websocket" element={<WebSocketTester />} />
          <Route path="api-test" element={<ApiTester />} />
          <Route path="ip" element={<IpQuery />} />
          <Route path="port-scan" element={<PortScanner />} />
          <Route path="api-docs" element={<ApiDocs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
