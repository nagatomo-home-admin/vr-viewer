import { NextResponse } from "next/server";
import { savePresentationData } from "@/lib/db";

// フォームから送信された顧客データをサーバー側に保存するAPI (Vercel KV または ローカル)
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

    // 顧客IDが半角英数字とハイフン・アンダースコアのみであるか簡易チェック (セキュリティ対策)
    const safeCustomerId = customerId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (safeCustomerId !== customerId || customerId === "") {
      return NextResponse.json(
        { error: "Invalid customer ID format. Use only alphanumeric characters, hyphens, and underscores." },
        { status: 400 }
      );
    }

    const clientName = data.clientName || safeCustomerId;
    
    // データベース抽象化層を通じて保存を実行
    const success = await savePresentationData(safeCustomerId, clientName, data);

    if (!success) {
      throw new Error("Failed to write presentation data to storage.");
    }

    return NextResponse.json({ success: true, customerId: safeCustomerId });
  } catch (error: any) {
    console.error("Failed to save presentation data:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: error.message || String(error),
        stack: error.stack || ""
      },
      { status: 500 }
    );
  }
}
