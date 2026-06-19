import { NextResponse } from "next/server";

// GitHubリポジトリ内の特定フォルダ（ディレクトリ）から画像ファイル一覧、またはフォルダ一覧を取得するAPI
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const path = searchParams.get("path") || "";
    const mode = searchParams.get("mode") || "images"; // "images" または "dirs"

    // バリデーション
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "リポジトリの所有者名（owner）およびリポジトリ名（repo）は必須です。" },
        { status: 400 }
      );
    }

    // GitHub Contents API URL の構築
    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // GitHub APIへのリクエスト送信 (GitHub APIはUser-Agentヘッダーの指定が必須)
    const res = await fetch(githubUrl, {
      headers: {
        "User-Agent": "renovation-comparer-app",
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 60 } // キャッシュ時間を60秒に設定
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("GitHub Contents API Error:", errText);
      return NextResponse.json(
        { error: "GitHubデータの取得に失敗しました。リポジトリ設定やフォルダ名が正しいかご確認ください。" },
        { status: res.status }
      );
    }

    const files = await res.json();

    if (!Array.isArray(files)) {
      return NextResponse.json(
        { error: "指定されたパスはフォルダ（ディレクトリ）ではありません。" },
        { status: 400 }
      );
    }

    // フォルダ（ディレクトリ）一覧取得モード
    if (mode === "dirs") {
      const dirs = files
        .filter((file: any) => file.type === "dir")
        .map((file: any) => ({
          name: file.name,
          path: file.path
        }));
      return NextResponse.json({ success: true, dirs });
    }

    // 対象とする画像ファイルの拡張子
    const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];

    // 画像ファイルを抽出して整形
    const images = files
      .filter((file: any) => {
        if (file.type !== "file") return false;
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map((file: any) => ({
        name: file.name,
        path: file.path,
        downloadUrl: file.download_url
      }));

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Failed to fetch Github folder contents:", error);
    return NextResponse.json(
      { error: "サーバー側でGitHub通信中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
