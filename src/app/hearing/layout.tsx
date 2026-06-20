import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest-hearing.json",
};

export default function HearingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
