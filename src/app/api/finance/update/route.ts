import { NextResponse } from 'next/server';
import { getProperties, saveProperties } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { index, propertyData } = await req.json();

    if (index === undefined || !propertyData) {
      return NextResponse.json({ error: 'インデックスと物件データは必須パラメータです。' }, { status: 400 });
    }

    const properties = await getProperties();
    const idx = parseInt(index);

    if (isNaN(idx) || idx < 0 || idx >= properties.length) {
      return NextResponse.json({ error: '無効なインデックスが指定されました。' }, { status: 400 });
    }

    // 該当するインデックスの物件計画データをマージ・更新します
    properties[idx] = {
      ...properties[idx],
      ...propertyData
    };

    await saveProperties(properties);

    return NextResponse.json({
      success: true,
      message: '物件データを更新しました。',
      updatedProperty: properties[idx]
    });
  } catch (error: any) {
    console.error("物件データ更新エラー:", error);
    return NextResponse.json({ error: `サーバーエラーが発生しました: ${error.message}` }, { status: 500 });
  }
}
