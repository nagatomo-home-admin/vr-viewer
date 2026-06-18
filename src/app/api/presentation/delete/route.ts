import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// お施主様別プレゼンボードのJSONデータをサーバー側から削除するAPI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId } = body;

    // バリデーション
    if (!customerId) {
      return NextResponse.json(
        { error: "顧客ID（customerId）は必須です。" },
        { status: 400 }
      );
    }

    // 顧客IDの安全なファイル名形式チェック
    const safeCustomerId = customerId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (safeCustomerId !== customerId || customerId === "") {
      return NextResponse.json(
        { error: "IDの形式が正しくありません。" },
        { status: 400 }
      );
    }

    // ファイルパスの決定
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "presentation",
      `${safeCustomerId}.json`
    );

    // ファイルが存在すれば削除
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({
        success: true,
        message: `${safeCustomerId} 様のプランを削除しました。`
      });
    } else {
      return NextResponse.json(
        { error: "指定されたプランが見つかりませんでした。" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Failed to delete presentation data:", error);
    return NextResponse.json(
      { error: "サーバー側で削除処理中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
