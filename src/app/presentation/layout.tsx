import type { Metadata } from "next";

// /presentation ページ専用のメタデータ定義
export const metadata: Metadata = {
  title: "長友ホーム AI提案ボード（A3印刷対応）",
  description: "お施主様との打合せで使用するデジタルプレゼンボード。外観・内装コーディネート・水回り設備の比較検討が可能です。",
};

export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
