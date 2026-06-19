import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

// 営業メモから自動生成する顧客データのJSONスキーマ
const hearingSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    customerName: { 
      type: SchemaType.STRING, 
      description: "お客様の苗字（様などの敬称や邸は不要。例: 田中、佐藤。不明な場合は 空文字）" 
    },
    advisorName: { 
      type: SchemaType.STRING, 
      description: "担当者名（例: 長友。不明な場合は 空文字）" 
    },
    issues: {
      type: SchemaType.ARRAY,
      description: "現状のきっかけや課題。体言止めで簡潔に記述すること（無制限）。",
      items: { type: SchemaType.STRING }
    },
    ideals: {
      type: SchemaType.ARRAY,
      description: "理想の暮らしや解決したいこと。体言止めで簡潔に記述すること（無制限）。",
      items: { type: SchemaType.STRING }
    },
    propertyType: { 
      type: SchemaType.STRING, 
      description: "希望する物件種別（例: 戸建てリノベーション、マンションなど。不明なら「戸建てリノベーション」）" 
    },
    area: { 
      type: SchemaType.STRING, 
      description: "希望エリア（例: 都城市、三股町など。不明なら「都城市周辺」）" 
    },
    station: { 
      type: SchemaType.STRING, 
      description: "最寄駅や交通などのアクセス条件（例: 都城駅 車で10分など。不明なら 空文字）" 
    },
    budget: { 
      type: SchemaType.STRING, 
      description: "総予算イメージ（例: 2,500万円）" 
    },
    layout: { 
      type: SchemaType.STRING, 
      description: "希望間取り・面積（例: 3LDK・80㎡など。不明なら 空文字）" 
    },
    age: { 
      type: SchemaType.STRING, 
      description: "希望築年数や状態（例: 築30年以内、リノベ向きなど。不明なら 空文字）" 
    },
    mustConditions: {
      type: SchemaType.ARRAY,
      description: "MUST条件（絶対に譲れない条件。3〜5点、簡潔に）",
      items: { type: SchemaType.STRING }
    },
    wantConditions: {
      type: SchemaType.ARRAY,
      description: "WANT条件（できれば叶えたい条件。3〜5点、簡潔に）",
      items: { type: SchemaType.STRING }
    },
    currentRent: { 
      type: SchemaType.INTEGER, 
      description: "現在の家賃（共益費・駐車場等含む毎月の支払額。円単位の数値。例: 65000。不明なら 60000）" 
    },
    propertyPrice: { 
      type: SchemaType.INTEGER, 
      description: "想定物件購入価格（万円単位の数値。例: 1500。不明なら 1200）" 
    },
    renovePrice: { 
      type: SchemaType.INTEGER, 
      description: "想定リノベーション費用（万円単位の数値。例: 1000。不明なら 1300）" 
    },
    loanRate: { 
      type: SchemaType.NUMBER, 
      description: "住宅ローン金利％（数値。例: 0.95。不明なら 0.95）" 
    },
    loanTerm: { 
      type: SchemaType.INTEGER, 
      description: "住宅ローン返済期間（年数、数値。例: 35。不明なら 35）" 
    },
    strategy: { 
      type: SchemaType.STRING, 
      description: "資金計画先行フローに基づく戦略提案。体言止め・20字以内。" 
    },
    schedule: { 
      type: SchemaType.STRING, 
      description: "今後のスケジュール提案。体言止め・20字以内。" 
    },
    estimate: { 
      type: SchemaType.STRING, 
      description: "資金概算の総括（例: 総額〇〇万円の安定返済プラン）。体言止め・20字以内。" 
    }
  },
  required: [
    "customerName", "advisorName", "issues", "ideals", "propertyType", "area", "station", 
    "budget", "layout", "age", "mustConditions", "wantConditions", "currentRent", 
    "propertyPrice", "renovePrice", "loanRate", "loanTerm", "strategy", "schedule", "estimate"
  ]
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEYが環境変数に設定されていません。.env.local を確認してください。" },
        { status: 500 }
      );
    }

    // 各ステップの対話メモデータを受信
    const { stepData } = await req.json();

    if (!stepData) {
      return NextResponse.json(
        { error: "対話データ（stepData）が空です。" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: hearingSchema,
      }
    });

    const prompt = `
あなたは長友ホームの優秀なマイホームアドバイザー（住宅営業）です。
営業がお客様（ご家族）と対話してメモした以下のステップ0〜4の情報をもとに、お住まい探し計画書として最適な構造化データに整理・自動要約してください。

【入力された対話メモデータ】:
------------------------------------------
■ステップ0: 基本情報
お客様名・担当者名:
${stepData.step0 || "未入力"}

■ステップ1: きっかけ・課題・理想の暮らし
きっかけ・課題・理想の暮らし:
${stepData.step1 || "未入力"}

■ステップ2: 希望条件（エリア/予算/広さ/築年等）
希望条件:
${stepData.step2 || "未入力"}

■ステップ3: MUST条件・WANT条件
絶対に譲れないこと(MUST) / できれば叶えたいこと(WANT):
${stepData.step3 || "未入力"}

■ステップ4: 資金計画先行フローに基づくスケジュール・資金概算など
現在の家賃や希望の返済額、金利や返済期間、スケジュール・概算に関するメモ:
${stepData.step4 || "未入力"}
------------------------------------------

【自動整理・生成のルール】:
1. 入力された「課題」や「希望」「MUST/WANT」の内容は、言葉遣いをきれいに整えつつ、お客様の生の声を**一切欠落させずに網羅**してください。
2. 課題や理想、戦略、スケジュール、資金概算は**体言止め**で簡潔に要約してください。
3. 戦略（strategy）、スケジュール（schedule）、資金概算（estimate）は、スライド内に美しく収まるよう**必ず20字以内**で表現してください。
4. 家賃や各種価格、金利、期間などの数値項目は、テキスト内の文脈から抽出し、数値型に変換してください（例: 「家賃6.5万」➔ currentRent: 65000 / 「物件1500万」➔ propertyPrice: 1500 / 「リノベ1000万」➔ renovePrice: 1000）。見当たらない場合は説明文に書いてあるデフォルト値を使用してください。
5. 出力は必ず指定されたJSONスキーマに完全に従う形式にしてください。
`;

    console.log("Gemini対話ヒアリング自動整理API呼び出し開始...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Geminiからの返却データ:", text);

    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Gemini hearing generation error:", error);
    return NextResponse.json(
      { error: "対話データの自動整理に失敗しました。", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
