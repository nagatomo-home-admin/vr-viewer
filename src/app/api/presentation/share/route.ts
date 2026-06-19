import { NextResponse } from "next/server";
import { getProperties, saveProperties } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, currentRent, propertyPrice, renovePrice, customerId } = body;

    if (!customerName) {
      return NextResponse.json({ error: '顧客名は必須パラメータです。' }, { status: 400 });
    }

    console.log(`お住まい探し計画書（ヒアリング）からのデータを受信: ${customerName}様`, body);

    const properties = await getProperties();
    const propertyName = `${customerName}様邸 お住まい探し計画・資金計画`;

    // 新規顧客データをマッピングして資金計画データオブジェクトを作成
    const newProperty = {
      property_name: propertyName,
      client_name: `${customerName} 様`,
      customer_id: customerId || '',               // 顧客IDを連携・保存
      price_man: propertyPrice || 1500,           // 物件費用 (万円)
      renovation_cost_man: renovePrice || 1000,    // リノベ費用 (万円)
      down_payment_man: 0,
      bank_id: 'miya-bank',                       // 標準で宮崎銀行を選択
      term_years: 35,                             // 35年返済
      insulation_plan: 'premium',                 // 標準でプレミアムG2断熱推奨
      solar_option: true,                         // 太陽光標準あり
      current_rent: currentRent || 60000,         // 現在の家賃
      current_electric: 15000,
      annual_income_man: 500,
      property_url: '',
      advisor_comment: `【長友ホームのマイホームアドバイス】
■ 本計画書は「お住まい探し計画書（ヒアリング）」のデータと自動連動して作成されました。
■ 物件ご予算 ${propertyPrice || 1500}万円 ＋ 高性能フルリノベーション ${renovePrice || 1000}万円の総額をベースに算出。
■ 高断熱（G2仕様）と太陽光発電の組み合わせにより、毎月の光熱費を大幅に削減し、現在のご家賃（月額 ${currentRent || 60000}円）と同等かそれ以下の実質負担で、健康的で快適な暮らしを実現します。`
    };

    // 重複する顧客名（古い計画）があればリストから削除
    let updatedProperties = properties.filter(prop => prop.client_name !== `${customerName} 様`);

    // リストの先頭に追加
    updatedProperties.unshift(newProperty);

    await saveProperties(updatedProperties);
    console.log(`お住まい探し計画書より物件を追加・保存しました: ${propertyName}`);

    return NextResponse.json({
      success: true,
      message: 'お住まい探し計画書の保存と資金計画の生成が成功しました。',
      propertyName: propertyName,
      clientName: `${customerName} 様`
    });

  } catch (error: any) {
    console.error("ヒアリングデータからの資金計画生成エラー:", error);
    return NextResponse.json(
      { 
        error: "資金計画データの保存に失敗しました。", 
        details: error.message || String(error) 
      },
      { status: 500 }
    );
  }
}
