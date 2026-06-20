import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest-hearing.json?v=4",
};

export default function HearingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
