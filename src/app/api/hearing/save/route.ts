import { NextResponse } from "next/server";
import { saveHearingData } from "@/lib/db";

// スマート提案ボードの入力データをJSONファイルまたはVercel KVとして上書き保存するAPI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, data } = body;

    // バリデーション
    if (!customerId || !data) {
      return NextResponse.json(
        { error: "customerId and data are required" },
        { status: 400 }
      );
    }

    // 顧客IDの安全な形式チェック（セキュリティ対策）
    const safeCustomerId = customerId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (safeCustomerId !== customerId || customerId === "") {
      return NextResponse.json(
        { error: "Invalid customer ID format. Use only alphanumeric characters, hyphens, and underscores." },
        { status: 400 }
      );
    }

    // Vercel KV（またはローカルJSON）へ保存
    const success = await saveHearingData(safeCustomerId, data.customerName || "", data);

    if (success) {
      return NextResponse.json({ success: true, customerId: safeCustomerId });
    } else {
      throw new Error("Failed to save data via saveHearingData");
    }
  } catch (error: any) {
    console.error("Failed to save hearing data:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || String(error) },
      { status: 500 }
    );
  }
}


