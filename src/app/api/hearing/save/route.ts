import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// スマート提案ボードの入力データをJSONファイルとしてサーバー側に直接上書き保存するAPI
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

    // 保存ディレクトリの決定
    const dirPath = path.join(process.cwd(), "src", "data", "hearing");
    
    // ディレクトリが存在しない場合は自動作成
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, `${safeCustomerId}.json`);
    
    // JSONファイルとして上書き保存
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({ success: true, customerId: safeCustomerId });
  } catch (error) {
    console.error("Failed to save hearing data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
