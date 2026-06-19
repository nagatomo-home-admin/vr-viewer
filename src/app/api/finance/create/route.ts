import { NextResponse } from 'next/server';
import { getProperties, saveProperties } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// ユーティリティ: 文字列から数値を抽出する関数
function extractNumber(str: string | null): number | null {
  if (!str) return null;
  const match = str.match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// 簡易HTMLスクレイピング処理 (不動産詳細ページの解析)
async function scrapePropertyPage(url: string) {
  const data = {
    name: '新規追加物件',
    priceMan: 500, // デフォルト500万円
    landArea: 200, // デフォルト200㎡
    floorArea: 100 // デフォルト100㎡
  };

  // トップページなどの場合は解析せずデフォルト値を返す
  if (url.endsWith('/') || url.split('/').length <= 3) {
    return data;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 } // Vercelのキャッシュを無効化
    });

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const html = await response.text();

    // 1. 価格の抽出 (例: 「400万円」「4,000,000円」など)
    const priceMatch = html.match(/(?:価格|販売価格|本体価格)[^\d]*(\d{1,4})[^\d]*万円/) || 
                       html.match(/(\d{1,4})万円/);
    if (priceMatch) {
      data.priceMan = parseFloat(priceMatch[1]);
    }

    // 2. 土地面積の抽出 (例: 「土地面積 200.50㎡」「土地 150m²」など)
    const landMatch = html.match(/(?:土地面積|土地)[^\d]*(\d+(?:\.\d+)?)[^\d]*(?:㎡|㎡|平米|m2|m²)/);
    if (landMatch) {
      data.landArea = parseFloat(landMatch[1]);
    }

    // 3. 建物面積/延床面積の抽出 (例: 「建物面積 98.50㎡」「延べ床 80m²」など)
    const floorMatch = html.match(/(?:建物面積|延床面積|延べ床面積|建物)[^\d]*(\d+(?:\.\d+)?)[^\d]*(?:㎡|㎡|平米|m2|m²)/);
    if (floorMatch) {
      data.floorArea = parseFloat(floorMatch[1]);
    }

    // 4. 所在地（住所）を物件名に仮設定
    const addressMatch = html.match(/(?:所在地|住所)[^\d]*((?:宮崎県)?都城市[^\s<"'\uff0c]+)/);
    if (addressMatch) {
      let cleanName = addressMatch[1].split(/[\r\n]/)[0].trim();
      try {
        cleanName = decodeURIComponent(cleanName);
      } catch (e) {}
      cleanName = cleanName.split('%')[0].split('http')[0].trim();
      data.name = cleanName;
    } else {
      if (url.includes('m-shinko')) {
        data.name = '新興不動産物件';
      } else if (url.includes('marusa')) {
        data.name = 'まるさ住宅物件';
      }
    }
  } catch (e: any) {
    console.error(`スクレイピング失敗（デフォルト値継続します）: ${e.message}`);
  }

  return data;
}

// 顧客プレゼンデータの取得
function getCustomerPresentationData(customerId: string) {
  if (!customerId) return null;
  const filePath = path.join(process.cwd(), 'src', 'data', 'presentation', `${customerId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (e: any) {
      console.error(`顧客プレゼンデータのパースに失敗しました: ${e.message}`);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { url, customerId } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URLは必須パラメータです。' }, { status: 400 });
    }

    // 1. 物件ページの解析
    const scrapedData = await scrapePropertyPage(url);

    // 2. 提案ボードデータとの連携
    let clientName = '';
    let linkedLandArea = null;
    let linkedFloorArea = null;

    const customerData = getCustomerPresentationData(customerId);
    if (customerData) {
      if (customerData.clientName) {
        clientName = customerData.clientName.replace(/様邸$/, '').replace(/邸$/, '').replace(/様$/, '');
      }

      if (customerData.exteriorSpec && Array.isArray(customerData.exteriorSpec.conditions)) {
        customerData.exteriorSpec.conditions.forEach((cond: any) => {
          if (cond.label === '敷地面積' || cond.label === '土地面積') {
            linkedLandArea = extractNumber(cond.val);
          }
          if (cond.label === '延床面積' || cond.label === '建物面積') {
            linkedFloorArea = extractNumber(cond.val);
          }
        });
      }
    }

    const finalLandArea = linkedLandArea || scrapedData.landArea;
    const finalFloorArea = linkedFloorArea || scrapedData.floorArea;
    const tsubo = Math.round((finalFloorArea * 0.3025) * 100) / 100;

    // リノベ費用概算（坪単価50万）
    const calculatedRenovationCost = tsubo > 0 ? Math.round(tsubo * 50) : 1500;

    let propertyName = scrapedData.name;
    if (clientName) {
      propertyName = `${clientName}様ご提案物件 (${propertyName})`;
    }

    const newProperty = {
      property_name: propertyName,
      client_name: clientName ? `${clientName} 様` : '',
      customer_id: customerId || '', // 顧客IDを連携・保存
      price_man: scrapedData.priceMan,
      renovation_cost_man: calculatedRenovationCost,
      down_payment_man: 0,
      bank_id: 'miya-bank',
      term_years: 35,
      insulation_plan: 'premium',
      solar_option: true,
      current_rent: 60000,
      current_electric: 16000,
      annual_income_man: 500,
      property_url: url,
      advisor_comment: `【物件特徴とプロのアドバイス】
■ この物件は、提案ボード（顧客ID: ${customerId || '未設定'}）の設計データと連動しています。
■ 土地面積: ${finalLandArea.toFixed(2)}㎡、延床面積: ${finalFloorArea.toFixed(2)}㎡（${tsubo.toFixed(1)}坪）に基づき、ゾーン断熱G2改修＋太陽光発電パッケージを計画。
■ 毎月の実質負担は現在の家賃並みに抑えながら、新築以上の耐震性能・快適性を実現する長友ホームの「新装平屋モデル」です。`
    };

    const properties = await getProperties();
    properties.unshift(newProperty);
    await saveProperties(properties);

    return NextResponse.json({
      success: true,
      message: '資金計画書の作成が完了しました。',
      propertyName: propertyName,
      customerId: customerId
    });
  } catch (error: any) {
    console.error("資金計画APIエラー:", error);
    return NextResponse.json({ error: `サーバーエラーが発生しました: ${error.message}` }, { status: 500 });
  }
}
