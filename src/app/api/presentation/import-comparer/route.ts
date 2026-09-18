import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getPresentationData, savePresentationData } from "@/lib/db";

// 図面比較ツールから送信されたBefore/After図面（Base64）とアノテーションデータを、
// お施主様別プレゼンボードJSONへ同期・保存するAPI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, beforeImage, afterImage, annotations } = body;

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
        { error: "IDは半角英数字、ハイフン、アンダースコアのみ使用可能です。" },
        { status: 400 }
      );
    }

    // Vercel(クラウド)環境かどうかの判定 (Bypass for Read-Only FS)
    const isCloud = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

    let beforeFloorplanPath = "";
    let afterFloorplanPath = "";

    if (isCloud) {
      // クラウド環境（Vercel）では、画像のローカル書き出しを行わずBase64データをインラインで使用
      if (beforeImage) beforeFloorplanPath = beforeImage;
      if (afterImage) afterFloorplanPath = afterImage;
      console.log("Vercel環境：画像をBase64形式のままJSONにインライン保存します。");
    } else {
      // 1. ローカル環境での画像保存処理 (Base64画像をPNGファイルとしてサーバー内に保存)
      const uploadDir = path.join(process.cwd(), "public", "upload");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      if (beforeImage && beforeImage.startsWith("data:image")) {
        const base64Data = beforeImage.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `${safeCustomerId}_before.png`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        beforeFloorplanPath = `/upload/${filename}`;
      }

      if (afterImage && afterImage.startsWith("data:image")) {
        const base64Data = afterImage.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `${safeCustomerId}_after.png`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        afterFloorplanPath = `/upload/${filename}`;
      }
    }

    // 2. 顧客プレゼンデータのロードまたはテンプレート作成
    let clientData = await getPresentationData(safeCustomerId);

    if (!clientData) {
      // 既存データが無い場合はテンプレート (default.json) を読み込む (default.jsonはデプロイに含まれるためfsで読み込み可能)
      const defaultPath = path.join(process.cwd(), "src", "data", "presentation", "default.json");
      if (fs.existsSync(defaultPath)) {
        const fileContent = fs.readFileSync(defaultPath, "utf8");
        clientData = JSON.parse(fileContent);
      } else {
        clientData = {
          clientName: "〇〇様邸",
          planName: "新築ご提案プラン [平屋]",
          concept: { subtitle: "NAGATOMO HOME CONCEPT", title: "ご提案コンセプト" },
          stories: [],
          assets: {}
        };
      }
      // 新規作成の場合、お施主様名とデフォルトのプラン名をリノベーション用に設定
      clientData.clientName = `${safeCustomerId}様邸`;
      clientData.planName = "リノベーションご提案プラン [平屋]";
    }

    // 3. アセット画像パスの更新 (画像が送られてきた場合のみ更新)
    if (!clientData.assets) {
      clientData.assets = {};
    }
    if (beforeFloorplanPath) {
      clientData.assets.beforeFloorplan = beforeFloorplanPath;
    }
    if (afterFloorplanPath) {
      clientData.assets.afterFloorplan = afterFloorplanPath;
    }

    // 4. アノテーションから設計ストーリーへの自動マッピング (最大3件)
    if (annotations && Array.isArray(annotations)) {
      const mappedStories = annotations.slice(0, 3).map((ann: any, idx: number) => {
        // お施主様向け説明（descriptionClient）を優先、無ければ施工向け説明を使用
        const desc = ann.descriptionClient || ann.descriptionBuilder || "";
        return {
          num: idx + 1,
          title: ann.title || `設計ストーリー${idx + 1}`,
          desc: desc
        };
      });

      // 3件に満たない場合は、デフォルトストーリーを補完
      while (mappedStories.length < 3) {
        const nextIdx = mappedStories.length;
        mappedStories.push({
          num: nextIdx + 1,
          title: `設計ストーリー ${nextIdx + 1}`,
          desc: "ここにお施主様への設計意図や変更点の詳細を入力します。"
        });
      }

      clientData.stories = mappedStories;
    }

    // アノテーション情報の保存（共通顧客データスキーマ適合用）
    clientData.annotations = annotations || [];
    clientData.renovationDesign = {
      beforeDiagramUrl: beforeFloorplanPath || (clientData.assets && clientData.assets.beforeFloorplan) || "",
      afterDiagramUrl: afterFloorplanPath || (clientData.assets && clientData.assets.afterFloorplan) || "",
      annotations: annotations || []
    };

    // 5. データベース抽象化層を通じて保存を実行
    const success = await savePresentationData(safeCustomerId, clientData.clientName, clientData);
    if (!success) {
      throw new Error("Failed to write imported data to storage.");
    }

    return NextResponse.json({
      success: true,
      customerId: safeCustomerId,
      message: `${safeCustomerId} へ図面と比較ストーリーの流用同期が完了しました。`
    });
  } catch (error) {
    console.error("Failed to import comparer data:", error);
    return NextResponse.json(
      { error: "サーバー側で同期処理中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
