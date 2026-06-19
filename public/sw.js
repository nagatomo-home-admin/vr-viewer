// Android ChromeのPWAインストール要件を満たすための最小限のService Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // キャッシュを一切せず、直接ネットワークリクエストを通す（パススルー）
  // これによりアプリ本体のデータ同期（Vercel KV）やリアルタイム更新を阻害しません
  event.respondWith(fetch(event.request));
});
