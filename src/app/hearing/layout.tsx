import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お住まい探し計画書",
  description: "対話型お住まい探し計画書・顧客要望ヒアリング",
  manifest: "/manifest-hearing.json?v=8",
};

export default function HearingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
