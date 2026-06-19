import { getProperties, getBankConfig } from '@/lib/db';
import { notFound } from 'next/navigation';
import FinanceCalculatorClient from './FinanceCalculatorClient';
import { Metadata } from 'next';

// キャッシュを無効化し、常に最新のVercel KV/JSONの値を参照します
export const revalidate = 0;

interface FinanceDetailPageProps {
  params: Promise<{
    propertyIndex: string;
  }>;
}

/**
 * 印刷デフォルト名（HTMLソース上のtitleタグ）を正しくするため、
 * サーバーサイドから動的なメタデータを配信します。
 */
export async function generateMetadata({ params }: FinanceDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const index = parseInt(resolvedParams.propertyIndex);
  if (isNaN(index) || index < 0) {
    return { title: 'マイホーム資金計画 | 長友ホーム' };
  }
  const properties = await getProperties();
  if (index >= properties.length) {
    return { title: 'マイホーム資金計画 | 長友ホーム' };
  }
  const property = properties[index];
  const clientName = property.client_name?.replace(/ 様$/, '') || '';
  const propName = property.property_name || '';
  
  // 顧客名がある場合は「マイホーム資金計画 | 顧客名様」
  // 顧客名がなく物件名がある場合は「マイホーム資金計画 | 物件名」
  // いずれも無い場合は「マイホーム資金計画」
  let pageTitle = 'マイホーム資金計画';
  if (clientName.trim()) {
    pageTitle = `マイホーム資金計画 | ${clientName.trim()}様`;
  } else if (propName.trim()) {
    pageTitle = `マイホーム資金計画 | ${propName.trim()}`;
  }
  
  return {
    title: `${pageTitle} | 長友ホーム`,
  };
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
