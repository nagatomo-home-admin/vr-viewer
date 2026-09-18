import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PresentationClientPage from "./PresentationClientPage";
import { getPresentationData } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    customerId: string;
  }>;
}

// 顧客IDから提案ボードのタイトルを動的に生成するSEO・メタデータ関数
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { customerId } = await params;
  
  let clientName = customerId;
  try {
    const clientData = await getPresentationData(customerId);
    if (clientData) {
      clientName = clientData.clientName || customerId;
    }
  } catch (e) {
    // エラー時はフォールバック
  }

  // 「AI提案プレゼンボード | 物件名（または顧客名）」の形式に統一します
  const pageTitle = clientName ? `AI提案プレゼンボード | ${clientName}` : 'AI提案プレゼンボード';

  return {
    title: `${pageTitle} | 長友ホーム`,
    description: `長友ホームから${clientName}様へお届けする、リノベーションの設計コンセプト・空間コーディネート提案ボードです。`,
  };
}

// 顧客IDに対応するデータを動的に読み込むサーバーコンポーネント
export default async function Page({ params }: PageProps) {
  const { customerId } = await params;

  let clientData;
  try {
    clientData = await getPresentationData(customerId);
    
    if (!clientData) {
      // 指定したIDのデータが存在しない場合は、default.jsonをフォールバックとして読み込む
      const defaultPath = path.join(
        process.cwd(),
        "src",
        "data",
        "presentation",
        "default.json"
      );
      if (fs.existsSync(defaultPath)) {
        const fileContent = fs.readFileSync(defaultPath, "utf8");
        clientData = JSON.parse(fileContent);
      } else {
        return notFound();
      }
    }
  } catch (error) {
    console.error("Failed to load customer presentation data:", error);
    return notFound();
  }

  return <PresentationClientPage initialData={clientData} customerId={customerId} />;
}
