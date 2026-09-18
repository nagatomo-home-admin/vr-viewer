import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import SmartBoardMenu from "@/components/SmartBoardMenu";

// Google Fontsからフォントをインポートします
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// アプリケーションのメタデータ（SEOおよびタイトル設定）
export const metadata: Metadata = {
  title: "図面比較・変更点AI抽出",
  description: "AI（Gemini）を活用してリノベーション図面の変更点を自動抽出し、注釈を管理・書き出しするシステムです。",
  manifest: "/manifest.json?v=6",
};

// ルートレイアウトコンポーネント
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmartBoardMenu />
        {children}
        {/* PWAサービスワーカーの自動登録 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) {
                      console.log('PWA ServiceWorker registered successfully with scope: ', reg.scope);
                    },
                    function(err) {
                      console.log('PWA ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
