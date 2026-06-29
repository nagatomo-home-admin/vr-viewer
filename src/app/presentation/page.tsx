export const dynamic = "force-dynamic";

import { getPresentationList, getPresentationData } from "@/lib/db";
import PresentationPortalClient from "./PresentationPortalClient";

// サーバーサイドで登録されているJSONデータを全スキャンし、管理ポータル画面へ表示 (Vercel KV または ローカル)
export default async function PresentationPage() {
  const customerIds = await getPresentationList();
  
  let clientList: Array<{ id: string; clientName: string; planName: string; updatedAt?: number; fullData?: any }> = [];

  for (const id of customerIds) {
    try {
      const data = await getPresentationData(id);
      if (data) {
        clientList.push({
          id,
          clientName: data.clientName ? data.clientName.replace("様邸", "").replace("様", "") : "未設定",
          planName: data.planName || "提案プラン",
          updatedAt: Date.now(), // 簡易的に現在時刻（またはデータ内の更新フラグ等）を設定
          fullData: data
        });
      }
    } catch (err) {
      console.error(`Failed to load client data for portal: ${id}`, err);
    }
  }

  // 顧客リストが空の場合のフォールバック
  if (clientList.length === 0) {
    clientList = [
      { id: "default", clientName: "〇〇", planName: "新築ご提案プラン [平屋]" }
    ];
  }

  return <PresentationPortalClient initialList={clientList} />;
}
