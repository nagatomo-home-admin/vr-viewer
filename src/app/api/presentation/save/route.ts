import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// フォームから送信された顧客データをJSONファイルとしてサーバー側に保存するAPI
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

    // 保存ディレクトリの決定
    const dirPath = path.join(process.cwd(), "src", "data", "presentation");
    
    // ディレクトリが存在しない場合は自動作成
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, `${safeCustomerId}.json`);
    
    // JSONファイルとして書き込み (整形して保存)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({ success: true, customerId: safeCustomerId });
  } catch (error) {
    console.error("Failed to save presentation data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
