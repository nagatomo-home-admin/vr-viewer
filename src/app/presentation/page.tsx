export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";
import PresentationPortalClient from "./PresentationPortalClient";

// サーバーサイドで登録されているJSONデータを全スキャンし、管理ポータル画面へ表示
export default function PresentationPage() {
  const dirPath = path.join(process.cwd(), "src", "data", "presentation");
  
  let clientList: Array<{ id: string; clientName: string; planName: string; fullData?: any }> = [];

  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        if (file.endsWith(".json")) {
          const id = file.replace(".json", "");
          const filePath = path.join(dirPath, file);
          const fileContent = fs.readFileSync(filePath, "utf8");
          try {
            const data = JSON.parse(fileContent);
            clientList.push({
              id,
              clientName: data.clientName ? data.clientName.replace("様邸", "").replace("様", "") : "未設定",
              planName: data.planName || "提案プラン",
              fullData: data
            });
          } catch (jsonErr) {
            console.error(`Failed to parse json: ${file}`, jsonErr);
          }
        }
      });
    }
  } catch (error) {
    console.error("Failed to read presentation data directory:", error);
  }

  // 顧客リストが空の場合のフォールバック
  if (clientList.length === 0) {
    clientList = [
      { id: "default", clientName: "〇〇", planName: "新築ご提案プラン [平屋]" }
    ];
  }

  return <PresentationPortalClient initialList={clientList} />;
}
