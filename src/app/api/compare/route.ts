import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

// Base64データURLからGemini APIが受け付ける形式に変換するユーティリティ関数
function fileToGenerativePart(base64DataUrl: string) {
  const matches = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("画像データの形式が正しくありません。");
  }
  return {
    inlineData: {
      data: matches[2],
      mimeType: matches[1]
    },
  };
}

// AIから返されるレスポンスのJSONスキーマ定義
const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    changes: {
      type: SchemaType.ARRAY,
      description: "BeforeとAfterの図面の違いから特定されたリノベーション変更点のリスト",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { 
            type: SchemaType.STRING, 
            description: "変更点の管理番号 (連番: 1, 2, 3...)" 
          },
          title: { 
            type: SchemaType.STRING, 
            description: "変更箇所の短いタイトル（例: キッチンの配置変更, 壁の撤去によるLDK一体化）" 
          },
          descriptionClient: { 
            type: SchemaType.STRING, 
            description: "お施主様向けの、分かりやすく温かみのある、生活イメージが膨らむような解説文" 
          },
          descriptionBuilder: { 
            type: SchemaType.STRING, 
            description: "施工業者・職人・設計士向けの、専門用語を含めた簡潔で正確な工事・設計上の指示・解説文" 
          },
          coordinate: {
            type: SchemaType.OBJECT,
            description: "After（改装後）図面内における変更箇所の中心的な大まかな相対座標 (左上を0, 右下を100としたパーセンテージ値)",
            properties: {
              x: { 
                type: SchemaType.NUMBER, 
                description: "画像の左端を0%、右端を100%とした場合のX座標" 
              },
              y: { 
                type: SchemaType.NUMBER, 
                description: "画像の上端を0%、下端を100%とした場合のY座標" 
              }
            },
            required: ["x", "y"]
          },
          category: {
            type: SchemaType.STRING,
            description: "変更箇所のカテゴリ分類",
            format: "enum", // TypeScriptのEnumStringSchema型に準拠するため必須
            enum: ["floorplan", "equipment", "opening", "storage", "other"]
          }
        },
        required: ["id", "title", "descriptionClient", "descriptionBuilder", "coordinate", "category"]
      }
    }
  },
  required: ["changes"]
};

// API POST ハンドラ
export async function POST(req: Request) {
  try {
    // APIキーの存在チェック
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "GEMINI_API_KEYが環境変数に設定されていません。プロジェクトのルートに .env.local を作成し、GEMINI_API_KEY=あなたのキー を設定してください。" 
        },
        { status: 500 }
      );
    }

    // リクエストパラメータの取得
    const { before, after } = await req.json();

    if (!before || !after) {
      return NextResponse.json(
        { error: "Before（改装前）とAfter（改装後）の両方の画像データが必要です。" },
        { status: 400 }
      );
    }

    // 画像データの解析
    const beforePart = fileToGenerativePart(before);
    const afterPart = fileToGenerativePart(after);

    // Gemini APIクライアントの初期化 (GoogleGenerativeAIクラスを使用)
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // モデル設定（JSON構造化出力を指定）
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    // AIに送信するシステム的指示およびプロンプト
    const prompt = `
あなたはリノベーション住宅 of 設計および施工の専門家です。
アップロードされた2枚の図面（1枚目がBefore/改装前、2枚目がAfter/改装後）を注意深く比較し、変更された箇所を全て抽出してください。

以下のルールを厳守して分析してください：
1. 壁の撤去、部屋の増設・用途変更、水回り設備の位置変更、建具（窓・ドア）の配置や開き勝手の変更、収納の追加などを検出します。
2. 検出した変更箇所が、2枚目の「After（改装後）図面」上のどこに位置するかを特定し、画像の左上を(0,0)、右下を(100,100)とした「相対的なX・Yパーセンテージ座標」で答えてください。
   ※座標がAfter画像上の正しい位置を指すよう細心の注意を払ってください。
3. それぞれの変更点に対して、以下の2種類の説明文を作成してください：
   - お施主様向け(descriptionClient): 専門用語を避け、「対面式にして家族の顔が見えるように」「収納が増えて片付けが楽に」など、リノベ後の暮らしやすさが伝わる温かみのある日本語表現。
   - 現場・施工向け(descriptionBuilder): 「柱撤去に伴う梁補強」「引き戸への変更」「給排水管の移設」など、技術的かつ簡潔で正確な表現。

図面の解析を開始し、指定されたJSONフォーマットで結果を出力してください。
`;

    // AIの呼び出し（画像2枚とプロンプトを送信）
    const result = await model.generateContent([
      prompt,
      beforePart,
      afterPart
    ]);

    const responseText = result.response.text();
    
    // JSONとしてレスポンスを解析し、フロントにそのまま返す
    const data = JSON.parse(responseText);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { 
        error: "AIでの図面比較中にエラーが発生しました。", 
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
