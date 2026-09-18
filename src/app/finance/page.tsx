import { getProperties, getPresentationList } from '@/lib/db';
import FinancePortalClient from './FinancePortalClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'マイホーム資金計画',
  description: '長友ホームのマイホーム資金計画ポータル。',
};

// ページを常に最新の状態に保つため、キャッシュを無効化します
export const revalidate = 0;

/**
 * 資金計画ポータル（サーバーコンポーネント）
 * サーバー側でVercel KV / JSONファイルからデータを取得し、
 * インタラクティブな操作を担当するクライアントコンポーネントへPropsとして引き渡します。
 */
export default async function FinancePortalPage() {
  // 物件計画データの取得
  const properties = await getProperties();

  // プレゼンデータポータルから、登録済みの顧客ID候補を自動抽出します (Vercel KV または ローカル)
  const customerIds = await getPresentationList();

  // クライアントコンポーネントへ引き渡してレンダリング
  return (
    <FinancePortalClient initialProperties={properties} customerIds={customerIds} />
  );
}
