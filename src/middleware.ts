import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic認証ミドルウェア
 * Vercel上などで環境変数 BASIC_AUTH_USER および BASIC_AUTH_PASSWORD が設定されている場合、
 * ページ全体にBasic認証を適用し、第三者の不正アクセスをブロックします。
 * ローカル開発環境など環境変数が存在しない場合は認証をスキップします。
 */
export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  // 環境変数が設定されていない場合はBasic認証をスキップ
  if (!user || !pass) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1];
      // atob を使用して Base64 デコード
      const [reqUser, reqPass] = atob(authValue).split(':');

      if (reqUser === user && reqPass === pass) {
        return NextResponse.next();
      }
    } catch (e) {
      console.error('Basic認証のデコードエラー:', e);
    }
  }

  // 認証が失敗、または未認証の場合は401を返しWWW-Authenticateヘッダーを付与
  return new NextResponse('認証が必要です。', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Nagatomo Home Secure Area"',
    },
  });
}

// 認証を適用する対象パスの設定 (API、静的アセット、アイコンなどを除外)
export const config = {
  matcher: [
    /*
     * 下記を除くすべてのリクエストパスにマッチします:
     * - api (外部連携API routesなど)
     * - _next/static (静的JS/CSS等)
     * - _next/image (画像最適化)
     * - favicon.ico (ファビコン)
     * - manifest.json / sw.js (PWA設定ファイル)
     * - 静的ファイル拡張子 (png, jpg, svg等)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
