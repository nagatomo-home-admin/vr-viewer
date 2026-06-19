'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BankConfigItem {
  rate: number;
  evalRate: number;
}

interface BankConfig {
  [key: string]: BankConfigItem;
}

interface Property {
  property_name: string;
  client_name?: string;
  price_man: number;
  renovation_cost_man: number;
  down_payment_man?: number;
  bank_id?: string;
  term_years?: number;
  insulation_plan?: string;
  solar_option?: boolean | string;
  current_rent?: number;
  current_electric?: number;
  annual_income_man?: number;
  property_url?: string;
  advisor_comment?: string;
  misc_cost_man?: number;
  subsidy_man?: number;
  user_modified_misc?: boolean;
  user_modified_subsidy?: boolean;
  other_funding_man?: number;
}

interface FinanceCalculatorClientProps {
  property: Property;
  bankConfig: BankConfig;
  propertyIndex: number;
}

/**
 * 資金計画リアルタイムシミュレーター（クライアントコンポーネント）
 * 営業現場でのパラメータ微調整、リアルタイム計算、データの保存、およびA3横の印刷レイアウトに対応します。
 * 入力欄の黒字化・重なり解消、A3印刷用CSS埋め込み、および行間スペースを広げたUI改善版。
 */
export default function FinanceCalculatorClient({
  property,
  bankConfig,
  propertyIndex,
}: FinanceCalculatorClientProps) {
  // ハイドレーションエラー対策：クライアントでのマウント状態を管理
  const [mounted, setMounted] = useState(false);

  // パラメータ入力ステート
  const [propName, setPropName] = useState(property.property_name);
  const [clientName, setClientName] = useState(property.client_name?.replace(/ 様$/, '') || '');
  const [bankId, setBankId] = useState(property.bank_id || 'miya-bank');
  const [priceMan, setPriceMan] = useState(property.price_man);
  const [renovationCost, setRenovationCost] = useState(property.renovation_cost_man);
  const [downPayment, setDownPayment] = useState(property.down_payment_man || 0);

  // 諸費用と補助金の手動/自動切り替えフラグ
  const [miscCostInput, setMiscCostInput] = useState<number | ''>(
    property.misc_cost_man !== undefined ? property.misc_cost_man : ''
  );
  const [subsidyInput, setSubsidyInput] = useState<number | ''>(
    property.subsidy_man !== undefined ? property.subsidy_man : ''
  );
  const [userModifiedMisc, setUserModifiedMisc] = useState(
    property.user_modified_misc || false
  );
  const [userModifiedSubsidy, setUserModifiedSubsidy] = useState(
    property.user_modified_subsidy || false
  );
  // その他調達資金のステート
  const [otherFunding, setOtherFunding] = useState<number>(
    property.other_funding_man !== undefined ? property.other_funding_man : 0
  );

  // 金利、期間、年収
  const [rate, setRate] = useState(bankConfig[property.bank_id || 'miya-bank']?.rate || 0.975);
  const [termYears, setTermYears] = useState(property.term_years || 35);
  const [annualIncome, setAnnualIncome] = useState(property.annual_income_man || 500);

  // プランとオプション (太陽光オプションは文字列で保存される可能性を考慮して厳密にキャスト)
  const [insulationPlan, setInsulationPlan] = useState(property.insulation_plan || 'premium');
  const [solarOption, setSolarOption] = useState(
    property.solar_option !== undefined
      ? (property.solar_option === true || property.solar_option === 'true')
      : true
  );

  // 現在の住居費比較
  const [currentRent, setCurrentRent] = useState(property.current_rent || 60000);
  const [currentElectric, setCurrentElectric] = useState(property.current_electric || 16000);
  const [propUrl, setPropUrl] = useState(property.property_url || '');
  const [advisorComment, setAdvisorComment] = useState(
    property.advisor_comment ||
      `【物件特徴とプロのアドバイス】
■ 三股町・都城エリアの人気校区の中古平屋リノベーション計画です。
■ ゾーン断熱G2改修＋太陽光発電パッケージを導入。
■ 毎月の実質負担は現在の家賃並みに抑えながら、新築以上の快適性を実現する長友ホームの「新装平屋モデル」です。`
  );

  // 保存処理のステート
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // マウント時に状態を設定
  useEffect(() => {
    setMounted(true);
    // 背景色の途切れを防ぐため、html と body の高さと背景色を上書き
    document.documentElement.style.height = 'auto';
    document.documentElement.style.minHeight = '100%';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100%';
    document.body.style.backgroundColor = '#f1f5f9';

    return () => {
      // クリーンアップ
      document.documentElement.style.height = '';
      document.documentElement.style.minHeight = '';
      document.body.style.height = '';
      document.body.style.minHeight = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  // 顧客名や物件名が変更されたらブラウザタイトルを動的に更新する（印刷時のPDFデフォルトファイル名に反映される）
  useEffect(() => {
    if (mounted) {
      const displayClient = clientName.trim() ? `${clientName.trim()}様` : '';
      const displayProp = propName.trim() ? ` (${propName.trim()})` : '';
      document.title = `【資金計画書】${displayClient}${displayProp} | 長友ホーム`;
    }
  }, [clientName, propName, mounted]);

  // 銀行の変更時
  const handleBankChange = (newBankId: string) => {
    setBankId(newBankId);
    const bankData = bankConfig[newBankId];
    if (bankData) {
      setRate(bankData.rate);
    }
  };

  // 毎月返済額の元利均等返済計算 (円)
  const calculateMonthlyPayment = (principalYen: number, annualRatePercent: number, years: number) => {
    if (annualRatePercent <= 0) {
      return Math.floor(principalYen / (years * 12));
    }
    const monthlyRate = annualRatePercent / 100.0 / 12.0;
    const months = years * 12;
    try {
      const power = Math.pow(1 + monthlyRate, months);
      const payment = (principalYen * (monthlyRate * power)) / (power - 1);
      return Math.floor(payment);
    } catch (e) {
      return Math.floor(principalYen / months);
    }
  };

  // データの自動計算
  const calcResults = () => {
    // 諸費用を算出
    let finalMiscCost: number;
    if (!userModifiedMisc) {
      // 物件価格の8% ＋ リノベ工事費の3% ＋ 雑費60万
      finalMiscCost = Math.round((priceMan * 0.08 + renovationCost * 0.03 + 60.0) * 10) / 10;
    } else {
      finalMiscCost = typeof miscCostInput === 'number' ? miscCostInput : 0;
    }

    // 補助金の算出
    let finalSubsidy: number;
    if (!userModifiedSubsidy) {
      if (insulationPlan === 'standard') {
        finalSubsidy = 100.0;
      } else if (insulationPlan === 'premium') {
        finalSubsidy = 150.0;
      } else {
        finalSubsidy = 0.0;
      }
    } else {
      finalSubsidy = typeof subsidyInput === 'number' ? subsidyInput : 0;
    }

    // 太陽光費用
    const solarCost = solarOption ? 120.0 : 0.0;

    // 総事業費
    const totalProjectCost = priceMan + renovationCost + finalMiscCost + solarCost;

    // ローン借入額 (万円) ＝ 総事業費 − 頭金 − 補助金（支払割当） − その他調達資金
    const loanAmount = Math.max(0.0, totalProjectCost - downPayment - finalSubsidy - otherFunding);
    const loanAmountYen = loanAmount * 10000;

    // ローン返済額計算
    const monthlyPayment = calculateMonthlyPayment(loanAmountYen, rate, termYears);

    // 審査金利に基づくローン返済額 (DTI審査判定用)
    const bankData = bankConfig[bankId] || { rate: 0.975, evalRate: 3.25 };
    const evalRate = bankData.evalRate;
    const monthlyPaymentEval = calculateMonthlyPayment(loanAmountYen, evalRate, termYears);

    // DTI（返済負担率）
    const annualPaymentEval = monthlyPaymentEval * 12;
    const annualIncomeYen = annualIncome * 10000;
    const dtiRatio = annualIncomeYen > 0 ? Math.round((annualPaymentEval / annualIncomeYen) * 10000) / 100 : 0;

    let dtiStatus = '-';
    if (dtiRatio <= 25.0) {
      dtiStatus = '安全圏 (地銀融資適正内)';
    } else if (dtiRatio <= 35.0) {
      dtiStatus = '個別相談 (給与振込等の条件交渉枠)';
    } else {
      dtiStatus = '要検討 (自己資金増額またはリノベ見直し推奨)';
    }

    // 断熱プランごとの電気代
    let insulationElectric = 16000;
    if (insulationPlan === 'standard') {
      insulationElectric = 8000;
    } else if (insulationPlan === 'premium') {
      insulationElectric = 4000;
    }

    // 太陽光売電メリット (月8,000円換算)
    const solarBenefit = solarOption ? 8000 : 0;

    // 実質住居費
    const actualHousingCost = monthlyPayment + insulationElectric - solarBenefit;
    const currentHousingCost = currentRent + currentElectric;

    // 家計改善効果
    const monthlyDiff = currentHousingCost - actualHousingCost;
    const lifetimeDiff = monthlyDiff * 12 * termYears;

    return {
      finalMiscCost,
      finalSubsidy,
      solarCost,
      totalProjectCost,
      loanAmount,
      monthlyPayment,
      dtiRatio,
      dtiStatus,
      actualHousingCost,
      currentHousingCost,
      monthlyDiff,
      lifetimeDiff,
    };
  };

  const results = calcResults();

  // 諸費用手動入力時
  const handleMiscInput = (val: string) => {
    setUserModifiedMisc(true);
    if (val === '') {
      setMiscCostInput('');
    } else {
      setMiscCostInput(parseFloat(val));
    }
  };

  // 補助金手動入力時
  const handleSubsidyInput = (val: string) => {
    setUserModifiedSubsidy(true);
    if (val === '') {
      setSubsidyInput('');
    } else {
      setSubsidyInput(parseFloat(val));
    }
  };

  // 変更データの保存処理 (太陽光オプションをbooleanで厳密に送信)
  const handleSaveData = async () => {
    setSaveLoading(true);
    setSaveStatus('⏳ 保存しています...');

    try {
      const response = await fetch('/api/finance/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          index: propertyIndex,
          propertyData: {
            property_name: propName,
            client_name: clientName ? `${clientName} 様` : '',
            price_man: priceMan,
            renovation_cost_man: renovationCost,
            down_payment_man: downPayment,
            bank_id: bankId,
            term_years: termYears,
            insulation_plan: insulationPlan,
            solar_option: solarOption, // boolean値がそのまま送信されます
            current_rent: currentRent,
            current_electric: currentElectric,
            annual_income_man: annualIncome,
            property_url: propUrl,
            advisor_comment: advisorComment,
            misc_cost_man: typeof miscCostInput === 'number' ? miscCostInput : undefined,
            subsidy_man: typeof subsidyInput === 'number' ? subsidyInput : undefined,
            user_modified_misc: userModifiedMisc,
            user_modified_subsidy: userModifiedSubsidy,
            other_funding_man: otherFunding,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveStatus('✅ 保存が完了しました！');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(result.error || '保存に失敗しました。');
      }
    } catch (e: any) {
      console.error(e);
      setSaveStatus(`❌ 保存エラー: ${e.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // 銀行名の特定
  const getBankName = () => {
    if (bankId === 'miya-bank' || bankId === 'miya-bank-fix') return '宮崎銀行';
    if (bankId === 'taiyo-bank') return '宮崎太陽銀行';
    if (bankId === 'kago-bank' || bankId === 'kago-bank-fix') return '鹿児島銀行';
    if (bankId === 'ja-bank' || bankId === 'ja-bank-fix') return 'JA都城';
    if (bankId === 'flat35') return 'フラット35';
    return '-';
  };

  // ハイドレーション対策：クライアントマウント完了までローディングを表示
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500 font-bold text-sm">シミュレーターを初期化中...</p>
      </div>
    );
  }

  // 作成日の動的生成
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  })();

  // 外部API経由のQRコードURL
  const qrCodeUrl = propUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(propUrl)}`
    : '';

  // 印刷用CSSスタイルシートの定義 (A3 Landscape をブラウザに強制選択させる)
  const printStyles = `
    @page {
      size: A3 landscape !important;
      margin: 6mm !important;
    }
    @media print {
      html, body {
        width: 420mm !important;
        height: 297mm !important;
        background-color: white !important;
        color: #0A1D37 !important;
        padding: 0 !important;
        margin: 0 !important;
        zoom: 1.0 !important;
        overflow: hidden !important; /* 2ページ目の発生をブラウザレベルで強制カット */
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .print-card {
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
      }
      /* 印刷時は外側の左右分割グリッドのみ無効化して全幅にする */
      .grid-cols-12 {
        display: block !important;
      }
      .no-print {
        display: none !important;
      }
      /* 印刷時は外側の親コンテナのサイズを制限し、2ページ目の発生をカットする */
      div.w-full.flex-1 {
        padding: 0 !important;
        margin: 0 !important;
        height: 290mm !important;
        max-height: 290mm !important;
        overflow: hidden !important;
      }
      .print-card {
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 275mm !important; /* 安全マージンを考慮した用紙全体の縦幅 */
        max-height: 275mm !important;
        overflow: hidden !important; /* 2ページ目を絶対に発生させない */
      }
      /* 入力欄の背景や枠線を印刷向けにすっきりさせる */
      input, select, textarea {
        border: none !important;
        background-color: transparent !important;
        padding: 0 !important;
        font-weight: bold !important;
        color: #0A1D37 !important;
      }
      /* 印刷時にスクロールバーをなくし、テキストエリアの中身を全表示 */
      textarea {
        resize: none !important;
        overflow: hidden !important;
        background-color: transparent !important;
        border: none !important;
      }
      /* 印刷時は外側の左右分割グリッドのみ無効化し、印刷エリアを横幅いっぱいにフィットさせる */
      .grid-cols-12 {
        display: block !important;
      }
      .divide-x > :not([hidden]) ~ :not([hidden]) {
        border-left-width: 0px !important;
      }
      #printArea {
        width: 100% !important;
        max-width: 100% !important;
        flex-basis: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important; /* 等間隔に美しく分散配置 */
        height: 238mm !important; /* 要素が詰まらないよう高さを確保 */
      }
    }
  `;

  return (
    <div className="w-full flex-1 p-4 md:p-6 bg-slate-100 flex flex-col items-center justify-center">
      {/* 印刷用CSSの差し込み */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* 営業マン・社長向け操作コントロール（印刷非表示） */}
      <div className="w-full max-w-[1400px] mb-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/finance"
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-[#0A1D37] font-bold text-xs rounded-full transition cursor-pointer"
          >
            ← ポータルに戻る
          </Link>
          <span className="text-xs font-bold text-slate-500">
            ※数値を変更すると、右側の資金計画書（印刷プレビュー）にリアルタイム反映されます。
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {saveStatus && <span className="text-xs font-bold text-slate-600 mr-2">{saveStatus}</span>}
          <button
            onClick={handleSaveData}
            disabled={saveLoading}
            className="px-5 py-2 bg-[#0A1D37] hover:bg-[#C89D7C] hover:text-[#0A1D37] border border-[#0A1D37] text-white font-bold text-xs rounded-full shadow transition cursor-pointer disabled:opacity-50"
          >
            💾 この条件で保存する
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-[#C89D7C] hover:bg-[#0A1D37] hover:text-[#C89D7C] text-[#0A1D37] font-bold text-xs rounded-full shadow transition cursor-pointer"
          >
            🖨️ A3横で印刷・PDF保存
          </button>
        </div>
      </div>

      {/* A3横サイズを意識した横型大判カード（1400px設計・縦幅拡張版） */}
      <div className="w-full max-w-[1400px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col print-card min-h-0 h-auto">
        {/* ヘッダー */}
        <div className="bg-[#0A1D37] text-white px-8 py-5 flex justify-between items-center border-b border-slate-800 flex-shrink-0">
          <div>
            <span className="text-[#C89D7C] text-xs font-bold tracking-widest uppercase">Nagatomo Home</span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">マイホーム資金計画書</h1>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            株式会社 長友ホーム AI戦略本部
          </div>
        </div>

        {/* メイン2カラムエリア */}
        <div className="grid grid-cols-12 divide-x divide-slate-100 flex-grow">
          {/* ==========================================
               左半分：入力フォーム（営業マン・社長操作用）
               ========================================== */}
          <div
            className="col-span-12 lg:col-span-4 p-6 bg-slate-50/50 text-sm no-print border-r border-slate-200 flex flex-col h-full min-h-full"
            style={{ gap: '1rem' }}
          >
            {/* シミュレーション見出しを大きく太く調整 */}
            <h2 className="text-lg font-extrabold text-[#0A1D37] border-b-2 border-[#0A1D37]/20 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
              ⚙️ 資金計画シミュレーション入力
            </h2>

            {/* 物件設定 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">物件名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                  value={propName}
                  onChange={e => setPropName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">地銀ローン選択</label>
                <select
                  className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                  value={bankId}
                  onChange={e => handleBankChange(e.target.value)}
                >
                  <option value="miya-bank">宮崎銀行（変動 0.975%）</option>
                  <option value="miya-bank-fix">宮崎銀行（固定 2.850%）</option>
                  <option value="taiyo-bank">宮崎太陽銀行（変動 1.075%）</option>
                  <option value="kago-bank">鹿児島銀行（変動 1.350%）</option>
                  <option value="kago-bank-fix">鹿児島銀行（固定 2.700%）</option>
                  <option value="ja-bank">JA都城（変動 1.395%）</option>
                  <option value="ja-bank-fix">JA都城（固定 2.300%）</option>
                  <option value="flat35">フラット35（固定 1.900%）</option>
                </select>
              </div>
            </div>

            {/* 資金計画 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5 leading-tight">物件本体価格</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={priceMan}
                    onChange={e => setPriceMan(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    万円
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5 leading-tight">リノベ工事費用</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={renovationCost}
                    onChange={e => setRenovationCost(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    万円
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5 leading-tight">自己資金 (頭金)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={downPayment}
                    onChange={e => setDownPayment(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    万円
                  </span>
                </div>
              </div>
            </div>

            {/* 諸費用 & 補助金（手入力切替可能） & その他調達資金 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5 leading-tight">
                  諸費用想定 (空欄で自動)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={miscCostInput}
                    onChange={e => handleMiscInput(e.target.value)}
                    placeholder={`${Math.round((priceMan * 0.08 + renovationCost * 0.03 + 60.0) * 10) / 10}万`}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    万円
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5 leading-tight">
                  省エネ補助金 (空欄で自動)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={subsidyInput}
                    onChange={e => handleSubsidyInput(e.target.value)}
                    placeholder={insulationPlan === 'premium' ? '150万' : insulationPlan === 'standard' ? '100万' : '0万'}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    万円
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5 leading-tight">
                  その他調達資金 (贈与等)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={otherFunding || ''}
                    onChange={e => setOtherFunding(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    万円
                  </span>
                </div>
              </div>
            </div>

            {/* 金利・返済期間・年収 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">適用金利</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.001"
                    className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={rate}
                    onChange={e => setRate(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">返済期間</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={termYears}
                    onChange={e => setTermYears(parseInt(e.target.value) || 35)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    年
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">世帯年収</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={annualIncome}
                    onChange={e => setAnnualIncome(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    万
                  </span>
                </div>
              </div>
            </div>

            {/* 断熱性能プランの選択 */}
            <div className="space-y-1.5 border-t border-slate-200 pt-3">
              <label className="block text-sm font-bold text-[#0A1D37]">断熱性能プランの選択</label>
              <div className="grid grid-cols-3 gap-2">
                <label
                  className={`flex flex-col justify-center items-center py-3 px-2 border rounded-lg cursor-pointer text-center bg-white hover:bg-slate-50 transition min-h-[96px] gap-1 ${
                    insulationPlan === 'none' ? 'border-[#0A1D37] ring-2 ring-[#0A1D37]' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="insulationPlan"
                    value="none"
                    className="sr-only"
                    checked={insulationPlan === 'none'}
                    onChange={() => setInsulationPlan('none')}
                  />
                  <span className="text-sm font-extrabold text-[#0A1D37] block leading-tight">未改修 (UA 1.5)</span>
                  <span className="text-xs font-bold text-slate-600 leading-tight block">
                    エアコン代目安
                    <br />
                    1.6万円/月
                  </span>
                </label>
                <label
                  className={`flex flex-col justify-center items-center py-3 px-2 border rounded-lg cursor-pointer text-center bg-white hover:bg-slate-50 transition min-h-[96px] gap-1 ${
                    insulationPlan === 'standard' ? 'border-[#0A1D37] ring-2 ring-[#0A1D37]' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="insulationPlan"
                    value="standard"
                    className="sr-only"
                    checked={insulationPlan === 'standard'}
                    onChange={() => setInsulationPlan('standard')}
                  />
                  <span className="text-sm font-extrabold text-[#0A1D37] block leading-tight">ZEH (UA 0.6)</span>
                  <span className="text-xs font-bold text-emerald-700 leading-tight block">
                    エアコン: 8千円/月
                    <br />
                    (月8千円削減)
                  </span>
                </label>
                <label
                  className={`flex flex-col justify-center items-center py-3 px-2 border rounded-lg cursor-pointer text-center bg-white hover:bg-slate-50 transition min-h-[96px] gap-1 ${
                    insulationPlan === 'premium' ? 'border-[#0A1D37] ring-2 ring-[#0A1D37]' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="insulationPlan"
                    value="premium"
                    className="sr-only"
                    checked={insulationPlan === 'premium'}
                    onChange={() => setInsulationPlan('premium')}
                  />
                  <span className="text-sm font-extrabold text-[#0A1D37] block leading-tight">G2プレミアム</span>
                  <span className="text-xs font-bold text-amber-800 leading-tight block">
                    エアコン: 4千円/月
                    <br />
                    (月1.2万円節約)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="text-sm font-bold text-[#0A1D37] flex items-center gap-1">
                ☀️ 太陽光発電オプション導入 (120万円)
              </span>
              <input
                type="checkbox"
                checked={solarOption}
                onChange={e => setSolarOption(e.target.checked)}
                className="h-5 w-5 text-[#0A1D37] rounded border-slate-300 focus:ring-[#C89D7C] cursor-pointer"
              />
            </div>

            {/* 家賃比較のインプット */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3">
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">現在の月家賃（管理費込）</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={currentRent}
                    onChange={e => setCurrentRent(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    円
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">現在の月電気代目安</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-full px-2 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-right bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                    value={currentElectric}
                    onChange={e => setCurrentElectric(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-[#0A1D37] font-bold whitespace-nowrap flex-shrink-0">
                    円
                  </span>
                </div>
              </div>
            </div>

            {/* QRコード用URLペースト欄 */}
            <div className="border-t border-slate-200 pt-3">
              <label className="block text-sm font-bold text-[#0A1D37] mb-1.5">
                🔗 物件掲載元URL (QRコードの生成用)
              </label>
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white text-[#0A1D37] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                value={propUrl}
                onChange={e => setPropUrl(e.target.value)}
                placeholder="物件URLを入力してください"
              />
            </div>
          </div>

          {/* ==========================================
               右半分：資金計画書（銀行提出用レイアウト）
               ========================================== */}
          <div className="col-span-12 lg:col-span-8 p-6 flex flex-col justify-between" id="printArea">
            <div className="space-y-4">
              {/* 融資申込ヘッダー情報 */}
              <div className="flex justify-between items-start border-b-2 border-[#0A1D37] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-[#0A1D37] px-2 py-0.5 rounded">
                      融資申込用
                    </span>
                    <h2 className="text-base font-bold text-[#0A1D37] flex items-center gap-1">
                      御申込予定者様名：
                      <input
                        type="text"
                        className="border-b border-slate-400 focus:outline-none focus:border-[#0A1D37] font-bold px-2 py-0.5 text-sm w-48 bg-transparent text-[#0A1D37]"
                        placeholder="（顧客名を入力）"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                      />{' '}
                      様
                    </h2>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-none">
                    ※本資金計画書は、対象物件の購入および当社ゾーン断熱改修工事の設計・資金内訳を証明するものです。
                  </p>
                </div>
                <div className="text-right flex items-start gap-4">
                  <div className="text-[10px] text-slate-500 font-medium leading-normal">
                    <p>作成年月日：{todayStr}</p>
                    <p>ご提案会社：株式会社 長友ホーム</p>
                    <p className="text-[9px] text-slate-400 font-normal">
                      住所：〒885-0012 宮崎県都城市上川東3-4-14
                    </p>
                    <p className="text-[9px] text-slate-400 font-normal">
                      TEL：0986-45-0157 / FAX：0986-45-0158
                    </p>
                  </div>
                  {/* 捺印枠 */}
                  <div className="flex items-center gap-1.5 -mt-1.5">
                    <div className="border border-slate-300 w-12 text-center text-[8px] text-slate-400 rounded">
                      <div className="bg-slate-50 py-0.5 border-b border-slate-200 font-bold">検印</div>
                      <div className="h-8"></div>
                    </div>
                    <div className="border border-slate-300 w-12 text-center text-[8px] text-slate-400 rounded">
                      <div className="bg-slate-50 py-0.5 border-b border-slate-200 font-bold">担当</div>
                      <div className="h-8"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 物件名表示 */}
              <div className="flex justify-between items-center bg-[#0A1D37]/5 px-4 py-2 rounded-lg border border-[#0A1D37]/10">
                <span className="text-xs font-bold text-[#0A1D37]">■ 対象物件名/計画モデル:</span>
                <strong className="text-sm font-bold text-[#0A1D37]">{propName}</strong>
              </div>

              {/* 使途 & 調達 バランスシート対比 (縦の文字間・行間スペースを確保) */}
              <div className="grid grid-cols-2 gap-6">
                {/* 左：使途（必要資金） */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                  <h3 className="font-bold text-[#0A1D37] border-b-2 border-[#0A1D37]/30 pb-1.5 mb-2.5 flex justify-between items-center text-xs">
                    <span>【資金の使途（必要資金）】</span>
                    <span className="text-[10px] text-slate-400">用途内訳</span>
                  </h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-150 pb-1">
                      <span>① 物件本体購入価格:</span>
                      <span className="font-bold text-slate-900">{priceMan.toFixed(1)} 万円</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-1">
                      <span>② リノベーション工事費用:</span>
                      <span className="font-bold text-slate-900">{renovationCost.toFixed(1)} 万円</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-1">
                      <span>③ 太陽光発電設備 (オプション):</span>
                      <span className="font-bold text-slate-900">{results.solarCost.toFixed(1)} 万円</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-1">
                      <span>④ 諸費用概算 (登記・諸税金等):</span>
                      <span className="font-bold text-slate-900 bg-amber-50/50 px-1 rounded">
                        {results.finalMiscCost.toFixed(1)} 万円
                      </span>
                    </div>
                    <div className="flex justify-between border-t-2 border-[#0A1D37]/40 pt-2 font-bold text-red-650 text-sm">
                      <span>必要資金合計 (総事業費):</span>
                      <span>{results.totalProjectCost.toFixed(1)} 万円</span>
                    </div>
                  </div>
                </div>

                {/* 右：調達（調達計画） */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                  <h3 className="font-bold text-[#0A1D37] border-b-2 border-[#0A1D37]/30 pb-1.5 mb-2.5 flex justify-between items-center text-xs">
                    <span>【資金の調達（調達計画）】</span>
                    <span className="text-[10px] text-slate-400">調達内訳</span>
                  </h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-150 pb-1 font-bold text-[#0A1D37] bg-[#0A1D37]/5 p-1 rounded -mx-1">
                      <span>① 住宅ローン借入希望額:</span>
                      <span>{results.loanAmount.toFixed(1)} 万円</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-1">
                      <span>② 自己資金 (頭金投入分):</span>
                      <span className="font-bold text-slate-900">{downPayment.toFixed(1)} 万円</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-1 text-[#A3B899] font-bold">
                      <span>③ 省エネ補助金 (支払割当分):</span>
                      <span>🎁 {results.finalSubsidy.toFixed(1)} 万円</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-1 text-slate-700">
                      <span>④ その他調達資金:</span>
                      <span className="font-bold text-slate-900">{otherFunding.toFixed(1)} 万円</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-[#0A1D37]/40 pt-2 font-bold text-[#0A1D37] text-sm">
                      <span>調達資金合計:</span>
                      <span>{results.totalProjectCost.toFixed(1)} 万円</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 住宅ローン返済 ＆ DTI審査判定 */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1.5">
                  <p className="text-slate-700 font-bold">【毎月返済額の試算】</p>
                  <p className="text-slate-800">
                    ■ 毎月の住宅ローン返済額:{' '}
                    <strong className="text-lg text-[#0A1D37] font-bold">
                      {results.monthlyPayment.toLocaleString()} 円
                    </strong>{' '}
                    /月
                  </p>
                  <p className="text-[10px] text-slate-500">
                    ※適用金利：<strong className="text-[#0A1D37]">{rate.toFixed(3)}%</strong> （ローン先：
                    <span>{getBankName()}</span> / {termYears}年返済）
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-slate-700 font-bold">【金融機関 審査基準チェック】</p>
                  <p className="text-slate-800">
                    ■ 返済負担率 (DTI審査目安):{' '}
                    <strong className="text-sm text-slate-900 font-bold">
                      {results.dtiRatio.toFixed(2)} %
                    </strong>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    ■ 地銀融資審査の適正判定:{' '}
                    <strong className="text-xs text-white bg-[#0A1D37] px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                      {results.dtiStatus}
                    </strong>
                  </p>
                </div>
              </div>

              {/* QRコード表示エリア */}
              {qrCodeUrl && (
                <div className="flex items-center gap-4 bg-yellow-50/20 p-3 rounded-xl border border-yellow-100/40 text-xs">
                  <a
                    href={propUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block flex-shrink-0 hover:scale-105 transition cursor-pointer"
                  >
                    <div className="w-14 h-14 border border-slate-200 p-1 bg-white rounded-lg flex items-center justify-center">
                      <img src={qrCodeUrl} alt="物件詳細QR" className="w-full h-full object-contain" />
                    </div>
                  </a>
                  <div className="no-print">
                    <h4 className="font-bold text-[#0A1D37] text-[11px]">
                      📱 スマホでスキャンして元の物件販売ページを確認
                    </h4>
                    <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                      チラシとして印刷後、融資担当者やご家族がスマホでスキャンして元の物件概要（間取り、敷地、写真等）を確認できます。クリックでも遷移可能です。
                    </p>
                  </div>
                  <div className="hidden print:block text-[9px] text-slate-400">
                    <p>
                      ※本資金計画書の詳細な販売情報・土地建物登記スペックを確認する場合は、左記QRコードをスマホでスキャンしてください。
                    </p>
                  </div>
                </div>
              )}

              {/* 光熱費削減 & 家賃相殺 (行間・パディング調整) */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[#0A1D37]/70 text-[10px] font-bold block">
                      現在の賃貸住居費 (家賃＋電気代)
                    </span>
                    <span className="text-base font-bold text-slate-700 block mt-0.5">
                      {results.currentHousingCost.toLocaleString()} 円/月
                    </span>
                  </div>
                  {/* 白飛びしていた金額を濃いネイビー(#0A1D37)に修正 */}
                  <div className="bg-[#A3B899]/10 p-3 rounded-xl border border-[#A3B899]/20 text-center">
                    <span className="text-[#0A1D37] text-[10px] font-bold block">
                      購入後の実質住居費 (ローン＋電気代−太陽光売電)
                    </span>
                    <span className="text-base text-[#0A1D37] font-bold block mt-0.5">
                      {results.actualHousingCost.toLocaleString()} 円/月
                    </span>
                  </div>
                </div>

                <div className="bg-[#0A1D37] text-white p-3.5 rounded-xl text-center shadow-md">
                  <p className="text-[10px] text-[#C89D7C] font-bold">
                    住み替えることで得られる生涯の家計改善効果（ローン返済期間）
                  </p>
                  <p className="text-sm font-bold mt-1">
                    毎月 {' '}
                    <span className="text-base text-[#C89D7C] font-extrabold">
                      {results.monthlyDiff.toLocaleString()} 円
                    </span>{' '}
                    の家計負担を削減！
                  </p>
                  <p className="text-[9px] text-slate-300 mt-1">
                    返済期間の生涯合計で{' '}
                    <strong className="text-white text-xs font-extrabold">
                      {results.lifetimeDiff.toLocaleString()} 円
                    </strong>{' '}
                    の負担を削減し、将来に大きな資産価値を残します。
                  </p>
                </div>
              </div>
            </div>

            {/* 物件特徴とプロのアドバイス（編集可能なテキストエリア） */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3 flex-grow flex flex-col justify-end mt-3">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider block uppercase">
                📝 物件特徴とプロの融資審査向けアドバイス (画面上で編集・追記可能です)
              </span>
              <textarea
                value={advisorComment}
                onChange={e => setAdvisorComment(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-[10px] leading-relaxed text-slate-700 bg-slate-50 resize-none h-[110px] min-h-[110px] focus:outline-none focus:ring-1 focus:ring-[#C89D7C]"
                placeholder="アドバイスを記述してください..."
              />
              <div className="text-[8px] text-slate-400 leading-normal mt-1 border-t border-dashed border-slate-200 pt-1.5">
                ※諸費用概算の内訳目安：仲介手数料、登録免許税（所有権移転・抵当権設定）、登記代行費用、融資手数料・保証料、火災保険料（10年）、契約印紙代等が含まれます。工事費および補助金は設計および国の交付規定に基づき精算されます。
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="bg-slate-50 border-t border-slate-100 py-3 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest flex-shrink-0">
          © Nagatomo Home Co., Ltd. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
