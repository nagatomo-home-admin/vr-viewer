import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 指定された顧客IDのJSONファイルをサーバー側から完全に物理削除するAPI
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
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "hearing",
      `${safeCustomerId}.json`
    );

    // ファイルが存在すれば削除
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Customer data file not found" },
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
