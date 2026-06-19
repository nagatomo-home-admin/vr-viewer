import { NextResponse } from 'next/server';
import { getProperties, saveProperties } from '@/lib/db';

// 指定されたインデックスの資金計画プランをリストから削除するAPI
export async function POST(req: Request) {
  try {
    const { index } = await req.json();

    if (index === undefined) {
      return NextResponse.json({ error: 'インデックスは必須パラメータです。' }, { status: 400 });
    }

    const properties = await getProperties();
    const idx = parseInt(index);

    if (isNaN(idx) || idx < 0 || idx >= properties.length) {
      return NextResponse.json({ error: '無効なインデックスが指定されました。' }, { status: 400 });
    }

    // 指定されたインデックスの物件計画データを削除
    const deletedProperty = properties[idx];
    properties.splice(idx, 1);

    // データベースを保存して上書き
    await saveProperties(properties);

    console.log(`資金計画を削除しました: ${deletedProperty.property_name}`);

    return NextResponse.json({
      success: true,
      message: `物件データ「${deletedProperty.property_name}」の削除が完了しました。`
    });
  } catch (error: any) {
    console.error("物件データ削除エラー:", error);
    return NextResponse.json({ error: `サーバーエラーが発生しました: ${error.message}` }, { status: 500 });
  }
}
