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
      </body>
    </html>
  );
}
