import type { Metadata } from "next";

// /hearing ページ専用のメタデータ定義
export const metadata: Metadata = {
  title: "長友スマート提案ボード（対話型お住まい探し計画書）",
  description: "お施主様の資金計画先行型リノベーションにおけるご要望の整理と資金計画シミュレーションを行います。",
};

export default function HearingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
