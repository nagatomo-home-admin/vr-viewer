import { NextResponse } from "next/server";
import { deleteHearingData } from "@/lib/db";

// 指定された顧客IDのヒアリングデータを完全に削除するAPI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId } = body;

    // バリデーション
    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // 顧客IDの安全な形式チェック
    const safeCustomerId = customerId.replace(/[^a-zA-Z0-9-_]/g, "");

    // Vercel KV（またはローカルJSON）から削除
    const success = await deleteHearingData(safeCustomerId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Customer data not found or failed to delete" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Failed to delete hearing data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

