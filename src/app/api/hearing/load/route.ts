import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 指定された顧客IDのJSONデータをサーバー側から読み込むAPI
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
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "hearing",
      `${safeCustomerId}.json`
    );

    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Customer data not found" },
        { status: 404 }
      );
    }

    // JSONファイルを読み込んで解析して返す
    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load hearing data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
