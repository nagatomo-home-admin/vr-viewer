'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Property {
  property_name: string;
  client_name?: string;
  customer_id?: string;
  price_man: number;
  renovation_cost_man: number;
  down_payment_man?: number;
  bank_id?: string;
  term_years?: number;
  insulation_plan?: string;
  solar_option?: boolean;
  current_rent?: number;
  current_electric?: number;
  annual_income_man?: number;
  property_url?: string;
  advisor_comment?: string;
}

interface FinancePortalClientProps {
  initialProperties: Property[];
  customerIds: string[];
}

/**
 * 資金計画ポータル（クライアントコンポーネント）
 * 高級感のあるナガトモ・テーマ（ネイビー & ゴールド & セージ）による
 * レスポンシブ対応の物件一覧・ソート・新規作成画面を提供します。
 * 顧客IDの後期登録・編集、プランの削除、初期表示「登録順・昇順」への対応版。
 */
export default function FinancePortalClient({ initialProperties, customerIds }: FinancePortalClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [urlInput, setUrlInput] = useState('');
  const [customerIdInput, setCustomerIdInput] = useState('');
  const [sortKey, setSortKey] = useState<'index' | 'price' | 'total' | 'name'>('index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 初期表示を昇順（asc）に変更
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 各カードでの顧客ID入力用一時ステート
  const [editingCustomerIds, setEditingCustomerIds] = useState<{ [index: number]: string | undefined }>({});

  // コンポーネントマウント時およびソートキー変更時にソートを実行
  useEffect(() => {
    sortPropertiesList();
  }, [sortKey, sortOrder]);

  // 物件リストのソート処理
  const sortPropertiesList = () => {
    const sorted = [...properties].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortKey === 'index') {
        // 登録順（インデックス）
        valA = initialProperties.indexOf(a);
        valB = initialProperties.indexOf(b);
      } else if (sortKey === 'price') {
        valA = a.price_man;
        valB = b.price_man;
      } else if (sortKey === 'total') {
        valA = a.price_man + a.renovation_cost_man;
        valB = b.price_man + b.renovation_cost_man;
      } else if (sortKey === 'name') {
        valA = a.property_name;
        valB = b.property_name;
        const res = valA.localeCompare(valB, 'ja');
        return sortOrder === 'asc' ? res : -res;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setProperties(sorted);
  };

  // 昇順・降順の切り替え
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // 新規計画書の作成
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      alert('物件販売ページのURLを入力してください。');
      return;
    }

    setLoading(true);
    setStatusMessage({ text: '⏳ 物件情報を解析し、資金計画書を自動生成しています...', isError: false });

    try {
      const response = await fetch('/api/finance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput.trim(),
          customerId: customerIdInput.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage({ text: '✅ 資金計画書の作成が完了しました！データを更新しています...', isError: false });
        // 2秒後に画面をリロードして最新データをロードします
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || '作成に失敗しました。');
      }
    } catch (error: any) {
      console.error('Error creating report:', error);
      setStatusMessage({ text: `❌ エラー: ${error.message}`, isError: true });
      setLoading(false);
    }
  };

  // 各カードでの顧客ID入力値変更処理
  const handleCardCustomerIdChange = (originalIndex: number, val: string) => {
    const safeVal = val.replace(/[^a-zA-Z0-9-_]/g, "");
    setEditingCustomerIds(prev => ({
      ...prev,
      [originalIndex]: safeVal
    }));
  };

  // 各カードでの顧客IDの更新処理
  const handleSaveCardCustomerId = async (originalIndex: number) => {
    const inputVal = editingCustomerIds[originalIndex];
    if (inputVal === undefined) return;

    setLoading(true);
    setStatusMessage({ text: '⏳ 顧客IDを保存しています...', isError: false });

    try {
      const targetProperty = initialProperties[originalIndex];
      const response = await fetch('/api/finance/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          index: originalIndex,
          propertyData: {
            ...targetProperty,
            customer_id: inputVal
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage({ text: `✅ 顧客IDを「${inputVal}」に更新しました。`, isError: false });
        
        // ローカルステートの更新
        const newProps = [...properties];
        const pIdx = newProps.findIndex(p => initialProperties.indexOf(p) === originalIndex);
        if (pIdx !== -1) {
          newProps[pIdx] = { ...newProps[pIdx], customer_id: inputVal };
          setProperties(newProps);
        }
        
        // 編集モードを抜ける
        setEditingCustomerIds(prev => ({
          ...prev,
          [originalIndex]: undefined
        }));
        
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        throw new Error(result.error || '保存に失敗しました。');
      }
    } catch (error: any) {
      console.error('Error saving customer ID:', error);
      setStatusMessage({ text: `❌ ID保存エラー: ${error.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  // 物件削除処理
  const handleDeleteProperty = async (originalIndex: number, propName: string) => {
    if (!confirm(`⚠️ 本当に「${propName}」の資金計画データを完全に削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    setLoading(true);
    setStatusMessage({ text: '⏳ 資金計画データを削除しています...', isError: false });

    try {
      const response = await fetch('/api/finance/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          index: originalIndex
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage({ text: `✅ データを正常に削除しました。`, isError: false });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(result.error || '削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('Error deleting property:', error);
      setStatusMessage({ text: `❌ 削除エラー: ${error.message}`, isError: true });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* ヘッダー */}
      <header className="bg-[#0A1D37] text-white py-6 shadow-lg flex-shrink-0 border-b border-[#C89D7C]/20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-3">
            <div className="border border-[#C89D7C] rounded w-8 h-8 flex items-center justify-center font-black text-[#C89D7C] flex-shrink-0">N</div>
            <div>
              <span className="text-[#C89D7C] text-xs font-bold tracking-widest uppercase block">
                Nagatomo Home AI Strategy Office
              </span>
              <h1 className="text-2xl font-bold mt-1 tracking-tight">
                マイホーム資金計画提案書 ポータル
              </h1>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p className="bg-[#0A1D37]/50 border border-slate-700/50 px-4 py-1.5 rounded-full text-[#C89D7C] font-bold shadow-inner">
              クラウド移行版 (Vercel KV対応)
            </p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-grow w-full">
        {/* 使い方バナー */}
        <div className="mb-8 p-5 bg-yellow-50 border-l-4 border-[#C89D7C] rounded-r-xl text-xs md:text-sm text-slate-700 shadow-sm flex items-start gap-3">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <strong className="font-bold text-slate-800">使い方:</strong> 対象物件の「資金計画提案書を開く」ボタンをクリックすると、A3印刷対応 of シミュレーター画面が開きます。新規物件を追加する場合は、下部の自動作成フォームにURLを入力して作成してください。
          </div>
        </div>

        {/* 新規計画書作成フォーム */}
        <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-md">
          <h2 className="text-base font-bold text-[#0A1D37] mb-4 flex items-center gap-2">
            <span className="text-lg">✨</span> 新規資金計画書の自動作成
          </h2>
          <form onSubmit={handleCreateReport} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                🔗 物件販売ページURL（新興不動産、まるさ住宅など）
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-400 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C89D7C] bg-white text-slate-800 font-bold placeholder-slate-400"
                placeholder="例: https://www.m-shinko.co.jp/sale/detail/600309-6103"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                👤 顧客ID（省略時は新規、指定時は図面面積連動）
              </label>
              <input
                type="text"
                value={customerIdInput}
                onChange={e => setCustomerIdInput(e.target.value)}
                disabled={loading}
                list="customerIdList"
                className="w-full px-4 py-2.5 border border-slate-400 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C89D7C] bg-white text-slate-800 font-bold placeholder-slate-400"
                placeholder="例: tanaka-reno"
              />
              <datalist id="customerIdList">
                {customerIds.map(id => (
                  <option key={id} value={id} />
                ))}
              </datalist>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C89D7C] hover:bg-[#0A1D37] hover:text-[#C89D7C] text-[#0A1D37] border border-[#C89D7C] font-bold py-2.5 px-4 rounded-xl shadow transition-all duration-200 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? '作成中...' : '🚀 作成する'}
              </button>
            </div>
          </form>
          {statusMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs font-bold ${
                statusMessage.isError
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* コントロールバー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
          <span className="text-xs md:text-sm text-slate-500 font-bold">
            登録物件数: <span className="text-[#0A1D37] text-base font-extrabold">{properties.length}</span> 件
          </span>
          <div className="flex items-center gap-3 text-xs md:text-sm w-full sm:w-auto">
            <div className="flex items-center gap-1.5 flex-grow sm:flex-grow-0">
              <span className="font-bold text-slate-700 whitespace-nowrap">並び替え:</span>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as any)}
                className="border border-slate-350 rounded-lg px-2.5 py-1.5 bg-white font-bold text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
              >
                <option value="index">登録順</option>
                <option value="price">本体価格</option>
                <option value="total">総事業費</option>
                <option value="name">物件名 (五十音)</option>
              </select>
            </div>
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-[#0A1D37] font-bold px-3 py-1.5 rounded-lg border border-slate-300 transition duration-150 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>{sortOrder === 'asc' ? '↑ 昇順' : '↓ 降順'}</span>
            </button>
          </div>
        </div>

        {/* 物件一覧グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map(item => {
            // 元の配列のインデックスを特定してURLパラメータとします
            const originalIndex = initialProperties.indexOf(item);
            const totalCost = item.price_man + item.renovation_cost_man;

            return (
              <div
                key={originalIndex}
                className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between hover:border-[#C89D7C]/50 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <div className="flex flex-col gap-1.5 flex-grow">
                      <h2 className="text-base md:text-lg font-bold text-[#0A1D37] line-clamp-2 leading-snug group-hover:text-[#C89D7C] transition-colors duration-200">
                        {item.property_name}
                      </h2>
                      
                      {/* 顧客ID表示・追加・編集エリア */}
                      <div className="flex flex-col gap-1 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-[#C89D7C] bg-[#0A1D37] px-2.5 py-1 rounded-md shadow-sm whitespace-nowrap">
                            👤 顧客ID: {item.customer_id || "未登録"}
                          </span>
                          <button
                            onClick={() => {
                              setEditingCustomerIds(prev => ({
                                ...prev,
                                [originalIndex]: editingCustomerIds[originalIndex] !== undefined ? undefined : (item.customer_id || "")
                              }));
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-[#0A1D37] hover:underline whitespace-nowrap transition cursor-pointer"
                          >
                            {editingCustomerIds[originalIndex] !== undefined ? "閉じる" : (item.customer_id ? "編集" : "ID登録")}
                          </button>
                        </div>
                        
                        {editingCustomerIds[originalIndex] !== undefined && (
                          <div className="flex items-center gap-1.5 mt-2 no-print">
                            <input
                              type="text"
                              value={editingCustomerIds[originalIndex] || ""}
                              onChange={(e) => handleCardCustomerIdChange(originalIndex, e.target.value)}
                              placeholder="IDを入力 (例: tanaka-reno)"
                              className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#C89D7C] flex-grow"
                            />
                            <button
                              onClick={() => handleSaveCardCustomerId(originalIndex)}
                              disabled={loading}
                              className="bg-[#C89D7C] hover:bg-[#0A1D37] hover:text-[#C89D7C] text-[#0A1D37] border border-[#C89D7C] font-bold text-[10px] px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                            >
                              💾 保存
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="bg-[#A3B899]/15 text-[#0A1D37] text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 shadow-sm">
                      {item.client_name ? '個別提案' : '標準モデル'}
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs md:text-sm text-slate-650 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium">物件本体価格:</span>
                      <span className="font-extrabold text-slate-800 text-sm">{item.price_man.toLocaleString()} 万円</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium">想定リノベーション費用:</span>
                      <span className="font-extrabold text-slate-800 text-sm">{item.renovation_cost_man.toLocaleString()} 万円</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#0A1D37] bg-white border border-[#0A1D37]/10 p-2 rounded-xl">
                      <span className="font-bold">総事業費目安 (税込):</span>
                      <span className="text-base font-black text-[#0A1D37]">{totalCost.toLocaleString()} 万円</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center mt-auto no-print">
                  <Link
                    href={`/finance/${originalIndex}`}
                    className="flex-grow text-center bg-[#0A1D37] hover:bg-[#C89D7C] hover:text-[#0A1D37] border border-[#0A1D37] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-250 text-xs md:text-sm cursor-pointer"
                  >
                    📂 資金計画提案書を開く
                  </Link>
                  <button
                    onClick={() => handleDeleteProperty(originalIndex, item.property_name)}
                    disabled={loading}
                    className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border border-red-200 hover:border-red-500 font-bold p-3.5 rounded-2xl shadow-sm transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                    title="計画書を完全に削除する"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 text-center text-xs text-slate-500 flex-shrink-0 font-semibold">
        © Nagatomo Home Co., Ltd. All Rights Reserved.
      </footer>
    </div>
  );
}

