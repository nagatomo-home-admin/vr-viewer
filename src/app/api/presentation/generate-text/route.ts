import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const conceptSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    proposals: {
      type: SchemaType.ARRAY,
      description: "異なる切り口のコンセプト提案（3案）",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          subtitle: { 
            type: SchemaType.STRING, 
            description: "コンセプトのサブタイトル（英語、おしゃれ、8ワード以内、例: MODERN COMFORT）" 
          },
          title: { 
            type: SchemaType.STRING, 
            description: "コンセプトのメインタイトル（日本語、30文字以内。見切れ防止のため改行「\\n」は最大1回（最大2行）までに制限）" 
          }
        },
        required: ["subtitle", "title"]
      }
    }
  },
  required: ["proposals"]
};

const storySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    proposals: {
      type: SchemaType.ARRAY,
      description: "異なるアプローチの設計ストーリー3点セット提案（3案）",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          stories: {
            type: SchemaType.ARRAY,
            description: "お施主様向けの温かみのある設計ストーリー3点",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                num: { type: SchemaType.INTEGER },
                title: { 
                  type: SchemaType.STRING, 
                  description: "ストーリーのタイトル（日本語、15文字以内）" 
                },
                desc: { 
                  type: SchemaType.STRING, 
                  description: "お施主様の生活イメージが湧く説明文（日本語、70〜80文字程度。見切れ防止のため、改行を含めず、最大2行に収まる長さで簡潔に記述すること）" 
                }
              },
              required: ["num", "title", "desc"]
            }
          }
        },
        required: ["stories"]
      }
    }
  },
  required: ["proposals"]
};

// 外部設計アドバイス ＆ インテリア提案用のスキーマ定義
const adviceSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    proposals: {
      type: SchemaType.ARRAY,
      description: "異なる切り口のアドバイス・提案文章（3案）",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          advice: { 
            type: SchemaType.STRING, 
            description: "提案アドバイス文（日本語、100〜120文字程度。見切れ防止のため、改行「\\n」は最大1回（最大2行）までに厳格に制限すること）" 
          }
        },
        required: ["advice"]
      }
    }
  },
  required: ["proposals"]
};

// Gemini APIを用いてプレゼンボード用のテキストを動的生成するAPI
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEYが環境変数に設定されていません。.env.local を確認してください。" },
        { status: 500 }
      );
    }

    const { clientName, planName, requestKeywords, selectedSpecs, generateType } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    
    let schema = storySchema;
    if (generateType === "concept") {
      schema = conceptSchema;
    } else if (generateType === "exterior_advice" || generateType === "interior_advice") {
      schema = adviceSchema;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const specText = `サッシ仕様: ${selectedSpecs.sash || "未選択"}, ドア仕様: ${selectedSpecs.door || "未選択"}, インテリア仕様: ${selectedSpecs.interior || "未選択"}, 水回り設備: ${selectedSpecs.equipment || "未選択"} (グレード: ${selectedSpecs.equipmentGrade || "未選択"})`;

    let prompt = "";
    if (generateType === "concept") {
      prompt = `
あなたはナガトモホームの優秀な建築デザイナーです。お施主様向けリノベーション提案ボードの「コンセプトのメインタイトル（日本語）」と「サブタイトル（おしゃれな英語）」について、異なる切り口のものを【3つの案（proposalsとして3つ）】考えてください。
お施主様名: ${clientName}
プラン名: ${planName}
お施主様のご要望・キーワード: ${requestKeywords}
現在決定している仕様データ: ${specText}

【ルール】:
1. 指定された仕様と矛盾のないコンセプトにしてください。
2. 日本語のメインタイトルは、お施主様のこれからの豊かな暮らしがイメージできる温かい言葉にしてください。見切れを防ぐため、30文字以内とし、改行は「\\n」を用いて最大1回（最大2行）までに制限してください。
3. 英語のサブタイトルは短くスタイリッシュにしてください（8ワード以内）。
4. proposals配列の中に、それぞれ異なるアプローチの提案を3つ格納してください。
`;
    } else if (generateType === "story") {
      prompt = `
    あなたはナガトモホームの優秀な建築デザイナーです。お施主様向けリノベーション提案ボードの「設計ストーリー（3点）」について、異なるアプローチのセットを【3つの案（proposalsとして3つ、それぞれの案の中にstoryが3点含まれる）】考えてください。
    各ストーリーには、見出し（タイトル）と、お施主様向けの説明文（暮らしのメリット）を含めてください。
    お施主様名: ${clientName}
    プラン名: ${planName}
    お施主様のご要望・キーワード: ${requestKeywords}
    現在決定している仕様データ: ${specText}

    【ルール】:
    1. ストーリーの3点は、現在決定している仕様（例えば樹脂サッシAPW 430の圧倒的断熱性、タカラ製ホーローキッチンの家事ラク性、スマエル内装ドアによるハイドアの開放感など）や、動線プランとお施主様のメリットを直結させて構成してください。
    2. 専門用語は噛み砕き、お施主様が生活を実感できる温かい表現にしてください。
    3. 見切れを防ぐため、説明文（desc）は【70〜80文字程度】とし、改行を含めず、最大2行に収まる長さで簡潔に記述してください。
    4. proposals配列の中に、それぞれ異なるテーマを持たせたストーリー3点セットを、合計3セット（proposals[0], proposals[1], proposals[2]）格納してください。
    `;
    } else if (generateType === "exterior_advice") {
      prompt = `
あなたはナガトモホームの優秀な建築デザイナーです。お施主様向けリノベーション提案ボードのスライド2（外観・外部仕様面）の「外部設計アドバイス」について、異なる切り口のものを【3つの案（proposalsとして3つ）】考えてください。
お施主様名: ${clientName}
プラン名: ${planName}
お施主様のご要望・キーワード: ${requestKeywords}
現在決定している仕様データ: ${specText}

【ルール】:
1. 決定している玄関ドア（例: ヴェナート D30）や外装材、サッシ仕様（例: APW 430）に合わせ、その良さ（断熱性、防犯性、耐久性など）や外装全体の設計意図、およびお施主様の快適な暮らしを伝える内容にしてください。
2. 文章は温かみがあり、お施主様が納得感を持てる表現にしてください。
3. 見切れ（はみ出し）を防ぐため、文章は全体で【100〜120文字程度】とし、改行「\\n」は最大1回（最大2行）までに厳格に制限してください。
4. proposals配列の中に、それぞれ異なるアプローチの提案を3つ格納してください。
`;
    } else if (generateType === "interior_advice") {
      prompt = `
            あなたはナガトモホームの優秀な建築デザイナーです。お施主様向けリノベーション提案ボードのスライド4（内装・インテリア仕様面）の「インテリア提案」について、異なる切り口のものを【3つの案（proposalsとして3つ）】考えてください。
            お施主様名: ${clientName}
            プラン名: ${planName}
            お施主様のご要望・キーワード: ${requestKeywords}
            現在決定している仕様データ: ${specText}

            【ルール】:
    1. 決定しているインテリアプラン（例: モダン、ナチュラルなど）や床材、室内建具（SMayellなど）に合わせ、その空間デザインの魅力（色合い、質感、照明プランなど）や、快適な居住空間を演出する設計意図を伝える内容にしてください。
    2. 文章は温かみがあり、お施主様が納得感を持てる表現にしてください。
    3. 見切れ（はみ出し）を防ぐため、文章は全体で【100〜120文字程度】とし、改行「\\n」は最大1回（最大2行）までに厳格に制限してください。
    4. proposals配列の中に、それぞれ異なるアプローチの提案を3つ格納してください。
    `;
    }

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini generation error:", error);
    return NextResponse.json(
      { error: "テキストの自動生成に失敗しました。", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
