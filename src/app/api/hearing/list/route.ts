import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 保存されているすべてのお施主様データのIDと名前の一覧を取得するAPI
export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), "src", "data", "hearing");
    const list: Array<{ id: string; name: string }> = [];

    // ディレクトリが存在する場合のみファイルをスキャン
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        if (file.endsWith(".json")) {
          const id = file.replace(".json", "");
          const filePath = path.join(dirPath, file);
          const fileContent = fs.readFileSync(filePath, "utf8");
          try {
            const data = JSON.parse(fileContent);
            list.push({
              id,
              name: data.customerName ? `${data.customerName}様` : `${id}（名前未設定）`
            });
          } catch (jsonErr) {
            console.error(`Failed to parse json: ${file}`, jsonErr);
          }
        }
      });
    }

    return NextResponse.json({ list });
  } catch (error) {
    console.error("Failed to list hearing files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
