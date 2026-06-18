import { getProperties, getBankConfig } from '@/lib/db';
import { notFound } from 'next/navigation';
import FinanceCalculatorClient from './FinanceCalculatorClient';

// キャッシュを無効化し、常に最新のVercel KV/JSONの値を参照します
export const revalidate = 0;

interface FinanceDetailPageProps {
  params: Promise<{
    propertyIndex: string;
  }>;
}

/**
 * 資金計画シミュレーター詳細（サーバーコンポーネント）
 * 動的ルートパラメータから指定の物件インデックスに対応するデータを取得し、
 * クライアントコンポーネントへPropsとして引き渡します。
 */
export default async function FinanceDetailPage({ params }: FinanceDetailPageProps) {
  const resolvedParams = await params;
  const index = parseInt(resolvedParams.propertyIndex);

  // 不正なインデックスが指定された場合は404ページを表示します
  if (isNaN(index) || index < 0) {
    return notFound();
  }

  // 共通のデータアクセス層から情報を取得します
  const properties = await getProperties();
  const bankConfig = await getBankConfig();

  if (index >= properties.length) {
    return notFound();
  }

  const property = properties[index];

  return (
    <FinanceCalculatorClient
      property={property}
      bankConfig={bankConfig}
      propertyIndex={index}
    />
  );
}
