import { NextResponse } from "next/server";
import { getHearingData } from "@/lib/db";

// 指定された顧客IDのデータ（JSONまたはVercel KV）を読み込むAPI
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    // バリデーション
    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // 顧客IDの安全な形式チェック
    const safeCustomerId = customerId.replace(/[^a-zA-Z0-9-_]/g, "");

    // Vercel KV（またはローカルJSON）から取得
    const data = await getHearingData(safeCustomerId);

    // データが存在するか確認
    if (!data) {
      return NextResponse.json(
        { error: "Customer data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load hearing data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

