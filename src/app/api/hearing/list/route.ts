import { NextResponse } from "next/server";
import { getHearingList } from "@/lib/db";

// 保存されているすべてのお施主様データのIDと名前の一覧を取得するAPI
export async function GET() {
  try {
    const list = await getHearingList();
    return NextResponse.json({ list });
  } catch (error) {
    console.error("Failed to list hearing files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

