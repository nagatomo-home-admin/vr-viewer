"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// 顧客データのインターフェース定義
interface CustomerData {
  customerId: string;
  customerName: string;
  advisorName: string;
  issues: string[];
  ideals: string[];
  propertyType: string;
  area: string;
  station: string;
  budget: string;
  layout: string;
  age: string;
  mustConditions: string[];
  wantConditions: string[];
  currentRent: number;
  propertyPrice: number;
  renovePrice: number;
  loanRate: number;
  loanTerm: number;
  strategy: string;
  schedule: string;
  estimate: string;
  selfFund: number;
  otherExpense: number;
  concept: string;
}

// 初期データの定義（立野モデルをベースにしたデフォルト値）
const initialData: CustomerData = {
  customerId: "tateno",
  customerName: "立野",
  advisorName: "長友",
  issues: [
    "細切れで家事動線が分断された古い平屋",
    "冬場の厳しい底冷えと結露の発生",
    "収納スペースの不足とすきま風による不快感"
  ],
  ideals: [
    "お互いの時間を尊重し家事が半分になる平屋",
    "都城の激しい寒暖差に対抗する高断熱G2仕様",
    "家族全員がスムーズに動ける回遊型家事動線"
  ],
  propertyType: "戸建てリノベーション",
  area: "都城市立野町",
  station: "都城駅 車で10分",
  budget: "2,500万円以内",
  layout: "3LDK・98.50㎡",
  age: "築32年（リノベ向き木造平屋）",
  mustConditions: [
    "高断熱・高耐震（耐震等級3・断熱等級6）の確保",
    "「ただいま」から10秒でキッチンへ行ける裏動線",
    "部屋干しとアイロンが一箇所で完了するサニタリー"
  ],
  wantConditions: [
    "将来の子供部屋に可変間仕切りで対応できる設計",
    "光熱費を大幅に削減する太陽光発電パッケージ",
    "スマホで確認できる360°VRでの内観シミュレーション"
  ],
  currentRent: 65000,
  propertyPrice: 1500,
  renovePrice: 1000,
  loanRate: 1.395, // デフォルト金利を 1.395% に設定
  loanTerm: 35,
  strategy: "資金計画先行型リノベ",
  schedule: "年内着工・春先お引渡し",
  estimate: "総額2,500万（月々6.9万）",
  selfFund: 0,
  otherExpense: 150,
  concept: "資金計画先行型リノベに基づき、お施主様の理想の暮らしを実現するための最適設計を行います。"
};

export default function HearingPage() {
  const [data, setData] = useState<CustomerData>(initialData);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [hearingStep, setHearingStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<{ type: "success" | "error" | "info" | null; message: string }>({
    type: null,
    message: ""
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // マウント状態の管理（ハイドレーションミスマッチ防止）
  useEffect(() => {
    setMounted(true);
  }, []);

  // フルスクリーン状態変更の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // フルスクリーン切り替え処理
  const handleFullscreen = () => {
    const element = document.getElementById("slides-container");
    if (element) {
      if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
          element.requestFullscreen().catch((err) => {
            console.error("Error attempting to enable fullscreen:", err);
          });
        } else if ((element as any).webkitRequestFullscreen) { /* Safari */
          (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) { /* IE11 */
          (element as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    }
  };

  // 各セクションの開閉状態管理
  const [menuOpen, setMenuOpen] = useState({
    basic: true,
    issues: true,
    ideals: true,
    conditions: true,
    must: true,
    want: true,
    finance: true,
    strategy: true,
    output: true
  });

  const toggleMenu = (section: keyof typeof menuOpen) => {
    setMenuOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // モーダル表示時の背景スクロール防止
  useEffect(() => {
    if (isHearingModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isHearingModalOpen]);

  // 対話ヒアリング用の分割入力State
  const [wizardFields, setWizardFields] = useState({
    // ステップ1
    customerId: "tanaka",
    customerName: "田中",
    advisorName: "長友",
    // ステップ2
    issues: "今の賃貸は冬寒く結露がひどい。子供が生まれ手狭になった。",
    ideals: "家事がラクで、冬あったかく過ごせる平屋が良い。夫婦共働きなので時短したい。",
    // ステップ3
    propertyType: "戸建てリノベーション",
    area: "都城市南鷹尾町周辺、小学校の近く",
    station: "都城駅 車で10分",
    budget: "2,500万円以内",
    layout: "3LDK・98.50㎡",
    age: "築32年（リノベ向き木造平屋）",
    // ステップ4
    mustConditions: "・とにかく暖かい家（高断熱）\n・家事が劇的に楽になる間取り（洗濯動線）\n・耐震性がしっかりしていること",
    wantConditions: "・将来部屋を仕切れる可変性",
    // ステップ5
    currentRent: "65000",
    propertyPrice: "1500",
    renovePrice: "1000",
    loanRate: "1.395", // デフォルト金利を 1.395% に設定
    loanTerm: "35",
    schedule: "来年の春までに入居したい",
    notes: "支払いは現在の家賃（6.5万円）並みが理想。"
  });

  // 保存されている顧客リストのステート
  const [savedCustomers, setSavedCustomers] = useState<Array<{ id: string; name: string }>>([]);

  // サーバーから保存済みのお施主様一覧を取得する関数
  const fetchSavedCustomers = async () => {
    try {
      const res = await fetch("/api/hearing/list");
      const result = await res.json();
      if (res.ok) {
        setSavedCustomers(result.list || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved customers:", err);
    }
  };

  // 初回読み込み時にリストを取得
  useEffect(() => {
    fetchSavedCustomers();
  }, []);

  // サーバー側へ直接上書き保存する処理
  const handleSaveServer = async () => {
    const trimmedId = data.customerId?.trim();
    if (!trimmedId) {
      alert("お施主様の顧客ID（半角英数字）を入力してください。\n（※左側の編集メニューから入力できます）");
      return;
    }
    setShareStatus({ type: "info", message: "データをサーバーに上書き保存中..." });
    try {
      const res = await fetch("/api/hearing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: trimmedId, data })
      });
      const result = await res.json();
      if (res.ok) {
        setShareStatus({ type: "success", message: `顧客ID: ${trimmedId} で上書き保存が完了しました！` });
        fetchSavedCustomers(); // リストを最新に更新
      } else {
        throw new Error(result.error || "保存に失敗しました。");
      }
    } catch (err: any) {
      console.error(err);
      setShareStatus({ type: "error", message: `保存エラー: ${err.message}` });
    }
  };

  // サーバーから指定された顧客データを読み込む処理
  const handleLoadServer = async (selectedId: string) => {
    if (!selectedId) return;
    setShareStatus({ type: "info", message: `顧客データ ${selectedId} を読み込み中...` });
    try {
      const res = await fetch(`/api/hearing/load?customerId=${selectedId}`);
      const result = await res.json();
      if (res.ok) {
        setData(result);
        setShareStatus({ type: "success", message: `顧客データ ${selectedId} を読み込みました！` });
      } else {
        throw new Error(result.error || "読み込みに失敗しました。");
      }
    } catch (err: any) {
      console.error(err);
      setShareStatus({ type: "error", message: `読み込みエラー: ${err.message}` });
    }
  };

  // 画面の入力項目を真っさらにする処理 (金利1.395%、35年をデフォルトに)
  const handleClearAll = () => {
    if (confirm("画面の入力項目をすべてクリアして真っさらにしますか？\n（※保存していないデータは消去されます）")) {
      const emptyData: CustomerData = {
        customerId: "",
        customerName: "",
        advisorName: "長友",
        issues: [""],
        ideals: [""],
        propertyType: "",
        area: "",
        station: "",
        budget: "",
        layout: "",
        age: "",
        mustConditions: ["", "", ""],
        wantConditions: ["", "", ""],
        currentRent: 0,
        propertyPrice: 0,
        renovePrice: 0,
        loanRate: 1.395, // ご指定 of デフォルト金利
        loanTerm: 35, // 35年
        strategy: "",
        schedule: "",
        estimate: "",
        selfFund: 0,
        otherExpense: 150,
        concept: ""
      };
      setData(emptyData);
      setShareStatus({ type: "success", message: "入力項目をすべてクリアしました。新規ヒアリングを開始できます。" });
    }
  };

  // サーバー上のデータを完全に削除する処理
  const handleDeleteServer = async () => {
    const trimmedId = data.customerId?.trim();
    if (!trimmedId) {
      alert("削除対象の顧客IDが指定されていません。");
      return;
    }
    
    // 現在表示されているお客様のお名前を検索
    const currentCustomer = savedCustomers.find(c => c.id === trimmedId);
    const displayName = currentCustomer ? currentCustomer.name : `${trimmedId}様`;

    if (confirm(`本当に『${displayName}』のデータをサーバーから完全に削除しますか？\n※この操作は取り消せません。`)) {
      setShareStatus({ type: "info", message: "データをサーバーから削除中..." });
      try {
        const res = await fetch("/api/hearing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: trimmedId })
        });
        const result = await res.json();
        if (res.ok) {
          setShareStatus({ type: "success", message: `顧客ID: ${trimmedId} のデータを削除しました。` });
          
          // 削除後は画面の項目を全クリア（初期化）します
          const emptyData: CustomerData = {
            customerId: "",
            customerName: "",
            advisorName: "長友",
            issues: [""],
            ideals: [""],
            propertyType: "",
            area: "",
            station: "",
            budget: "",
            layout: "",
            age: "",
            mustConditions: ["", "", ""],
            wantConditions: ["", "", ""],
            currentRent: 0,
            propertyPrice: 0,
            renovePrice: 0,
            loanRate: 1.395,
            loanTerm: 35,
            strategy: "",
            schedule: "",
            estimate: "",
            selfFund: 0,
            otherExpense: 150,
            concept: ""
          };
          setData(emptyData);
          
          fetchSavedCustomers(); // ドロップダウンの一覧を更新
        } else {
          throw new Error(result.error || "削除に失敗しました。");
        }
      } catch (err: any) {
        console.error(err);
        setShareStatus({ type: "error", message: `削除エラー: ${err.message}` });
      }
    }
  };

  // 毎月のローン返済額を元利均等で計算する関数
  const calculateMonthlyPayment = (principalMan: number, yearlyRate: number, termYears: number) => {
    const principal = principalMan * 10000;
    const monthlyRate = (yearlyRate / 100) / 12;
    const numberOfPayments = termYears * 12;
    
    if (monthlyRate === 0) return Math.round(principal / numberOfPayments);
    
    const monthlyPayment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(monthlyPayment);
  };

  // 借入総額 = 物件価格 + リノベ費用 + 諸費用 - 自己資金（マイナスにならないように保護）
  const totalLoanAmount = Math.max(0, data.propertyPrice + data.renovePrice + (data.otherExpense || 0) - (data.selfFund || 0));

  const monthlyPayment = calculateMonthlyPayment(
    totalLoanAmount,
    data.loanRate,
    data.loanTerm
  );

  // loanTerm年間の賃貸家賃総額
  const totalRent35Years = data.currentRent * 12 * data.loanTerm;
  // loanTerm年間のローン総支払額
  const totalLoan35Years = monthlyPayment * 12 * data.loanTerm;

  // AIスライド生成リクエスト送信
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setShareStatus({ type: "info", message: "AIがヒアリングメモから提案スライドを生成しています..." });
    
    // wizardFields から API が期待する stepData フォーマットに整形（SWCマルチバイトバグ回避のためUnicodeエスケープを使用）
    const step0 = `\u304a\u5ba2\u69d8\u540d: ${wizardFields.customerName} \u69d8\n\u6205\u5f53\u8005\u540d: ${wizardFields.advisorName}`;
    const step1 = `\u3010\u304d\u3063\u304b\u3051\u30fb\u8ab2\u984c\u3011\n${wizardFields.issues}\n\u3010\u7406\u60f3\u3011\n${wizardFields.ideals}`;
    const step2 = `\u5e0c\u671b\u7a2e\u5225: ${wizardFields.propertyType}\n\u5e0c\u671b\u30a8\u30ea\u30a2: ${wizardFields.area}\n\u6700\u5bc4\u99c5\u30fb\u4ea4\u901a: ${wizardFields.station}\n\u5e0c\u671b\u9593\u53d6\u308a\u30fb\u9762\u7a4d: ${wizardFields.layout}\n\u5e0c\u671b\u7bc9\u5e74\u6570: ${wizardFields.age}\n\u4e88\u7b97\u30a4\u30e1\u30fc\u30b8: ${wizardFields.budget}`;
    const step3 = `\u3010MUST\uff08\u8b72\u308c\u306a\u3044\uff09\u3011\n${wizardFields.mustConditions}\n\u3010WANT\uff08\u3067\u304d\u308c\u3070\uff09\u3011\n${wizardFields.wantConditions}`;
    const step4 = `\u73fe\u5728\u306e\u5bb6\u8cca: ${wizardFields.currentRent}\u5186\n\u60f3\u5b9a\u7269\u4ef6\u4fa1\u683c: ${wizardFields.propertyPrice}\u4e00\u4e07\u5186\n\u60f3\u5b9a\u30ea\u30ce\u30d9\u8cbb\u7528: ${wizardFields.renovePrice}\u4e00\u4e07\u5186\n\u60f3\u5b9a\u91d1\u5229: ${wizardFields.loanRate}%\n\u8fd4\u6e08\u671f\u9593: ${wizardFields.loanTerm}\u5e74\n\u5e0c\u671b\u6642\u671f: ${wizardFields.schedule}\n\u5099\u8003: ${wizardFields.notes}`;

    const formattedStepData = {
      step0,
      step1,
      step2,
      step3,
      step4
    };

    try {
      const response = await fetch("/api/presentation/generate-hearing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ stepData: formattedStepData })
      });

      const result = await response.json();

      if (response.ok) {
        setData(result);
        setIsHearingModalOpen(false);
        setShareStatus({ type: "success", message: "AI提案スライドの生成に成功しました！" });
      } else {
        throw new Error(result.error || "生成に失敗しました。");
      }
    } catch (error: any) {
      console.error(error);
      setShareStatus({ type: "error", message: `AI生成エラー: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  // 資金計画への自動転送保存
  const handleShareData = async () => {
    setShareStatus({ type: "info", message: "資金計画にデータを共有中..." });
    
    try {
      const response = await fetch("/api/presentation/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerName: data.customerName,
          currentRent: data.currentRent,
          propertyPrice: data.propertyPrice,
          renovePrice: data.renovePrice,
          customerId: data.customerId,
          selfFund: data.selfFund,
          loanRate: data.loanRate,
          loanTerm: data.loanTerm,
          otherExpense: data.otherExpense
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShareStatus({ 
          type: "success", 
          message: `データ共有＆資金計画の再生成に成功しました！\n（連携物件: ${result.propertyName}）` 
        });
      } else {
        throw new Error(result.error || "データ共有に失敗しました。");
      }
    } catch (error: any) {
      console.error(error);
      setShareStatus({ 
        type: "error", 
        message: `資金計画連携に失敗しました。\n(エラー: ${error.message})` 
      });
    }
  };


  // 各個別入力フォームの変更ハンドラ
  const handleInputChange = (field: keyof CustomerData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // リスト（配列）項目の追加・削除ハンドラ
  const handleListChange = (field: "issues" | "ideals" | "mustConditions" | "wantConditions", index: number, value: string) => {
    setData(prev => {
      const newList = [...prev[field]];
      newList[index] = value;
      return { ...prev, [field]: newList };
    });
  };

  const handleAddListItem = (field: "issues" | "ideals" | "mustConditions" | "wantConditions") => {
    setData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  // Ctrl + Enter で自動行追加を行うハンドラ
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    field: "issues" | "ideals" | "mustConditions" | "wantConditions"
  ) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleAddListItem(field);
      // 新しいインプット追加後にフォーカスをあてる
      setTimeout(() => {
        const inputs = document.querySelectorAll(`[data-field="` + field + `"]`);
        const nextInput = inputs[inputs.length - 1] as HTMLTextAreaElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 50);
    }
  };

  const handleRemoveListItem = (field: "issues" | "ideals" | "mustConditions" | "wantConditions", index: number) => {
    setData(prev => {
      const newList = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: newList };
    });
  };

  // ブラウザ印刷の実行
  const handlePrint = () => {
    window.print();
  };

  // ローカルJSON保存
  const handleSaveJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (data.customerName || "customer") + "_hearing_data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // HTML書き出し
  const handleExportHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${data.customerName}様邸 お住まい探し計画書</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; background: #F8FAFC; }
    @media print {
      body { background: white; }
      .page-break { page-break-after: always; break-after: page; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto space-y-12">
    <!-- スライド1: 概要 & 今後のロードマップ -->
    <div class="bg-white text-[#0A192F] p-12 rounded-3xl shadow-xl border border-gray-150 flex flex-col justify-between h-[500px] page-break relative overflow-hidden">
      <!-- 装飾用の左側カラーバー -->
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-[#0A192F]"></div>
      
      <div class="grid grid-cols-12 gap-8 items-center h-full">
        <!-- 左半分：表紙エリア (col-span-5) -->
        <div class="col-span-5 flex flex-col justify-center h-full border-r border-gray-100 pr-8">
          <span class="text-xs text-[#D9A05B] font-extrabold uppercase tracking-widest mb-2">Nagatomo Home</span>
          <h1 class="text-3xl font-black text-[#0A192F] tracking-tight leading-tight mb-4">
            お住まい探し<br />計画書
          </h1>
          <p class="text-xs text-gray-500 font-semibold mb-8 leading-relaxed">
            未来の暮らしを豊かにする<br />リノベーションのご提案
          </p>
          
          <div class="space-y-2.5 pt-6 border-t border-gray-100 text-xs">
            <div class="flex justify-between border-b border-gray-50 pb-2">
              <span class="text-gray-400 font-bold">ご相談者様</span>
              <span class="font-black text-[#0A192F] text-sm">${data.customerName || "＿"} 様</span>
            </div>
            <div class="flex justify-between border-b border-gray-50 pb-2">
              <span class="text-gray-400 font-bold">ご提案日</span>
              <span class="font-bold text-[#0A192F]">${new Date().toLocaleDateString("ja-JP")}</span>
            </div>
            <div class="flex justify-between pb-1">
              <span class="text-gray-400 font-bold">担当アドバイザー</span>
              <span class="font-bold text-[#0A192F]">${data.advisorName || "＿"}</span>
            </div>
          </div>
        </div>

        <!-- 右半分：今後のロードマップ (col-span-7) -->
        <div class="col-span-7 flex flex-col justify-between h-full py-2 pl-4">
          <div>
            <h2 class="text-base font-black text-[#0A192F] border-b border-[#D9A05B] pb-2 mb-4 flex items-center gap-2">
              <span>🧭</span> 提案方針と今後のロードマップ
            </h2>
            
            <div class="space-y-4">
              <!-- Step 01 -->
              <div class="flex gap-4 items-start bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm">
                <span class="bg-[#0A192F] text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">Step 01</span>
                <div>
                  <h3 class="font-black text-xs text-[#0A192F]">戦略・進め方</h3>
                  <p class="text-[11px] text-gray-700 mt-1 font-bold leading-relaxed">${data.strategy || "（未入力）"}</p>
                </div>
              </div>

              <!-- Step 02 -->
              <div class="flex gap-4 items-start bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm">
                <span class="bg-[#D9A05B] text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">Step 02</span>
                <div>
                  <h3 class="font-black text-xs text-[#0A192F]">スケジュール</h3>
                  <p class="text-[11px] text-gray-700 mt-1 font-bold leading-relaxed">${data.schedule || "（未入力）"}</p>
                </div>
              </div>

              <!-- Step 03 -->
              <div class="flex gap-4 items-start bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm">
                <span class="bg-slate-300 text-gray-800 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">Step 03</span>
                <div>
                  <h3 class="font-black text-xs text-[#0A192F]">資金計画概算</h3>
                  <p class="text-[11px] text-gray-700 mt-1 font-bold leading-relaxed">${data.estimate || "（未入力）"}</p>
                </div>
              </div>
            </div>
          </div>

          <p class="text-[9px] text-gray-400 mt-4 leading-relaxed font-bold border-l border-gray-200 pl-2">
            ※資金計画先行フローに基づき、まずは安定したお借入の上限を見極めてから最適な物件探しに進みます。
          </p>
        </div>
      </div>
    </div>

    <!-- スライド2: ご要望の整理とご希望条件 -->
    <div class="bg-white p-12 rounded-3xl shadow-xl border border-gray-150 flex flex-col justify-between h-[500px] page-break relative overflow-hidden">
      <!-- 装飾用の左側カラーバー -->
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-[#D9A05B]"></div>
      
      <div>
        <div class="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <div class="flex items-center gap-3">
            <span class="bg-[#0A192F] text-white rounded px-2.5 py-0.5 text-xs font-bold">01</span>
            <h2 class="text-base font-bold text-[#0A192F]">ご要望の整理とご希望条件</h2>
          </div>
          <span class="text-xs text-gray-400 font-bold">Nagatomo Home</span>
        </div>
        
        <div class="grid grid-cols-12 gap-6 items-stretch w-full">
          <!-- 左半分：現状の課題・理想の暮らし・設計コンセプトの3段 (col-span-5) -->
          <div class="col-span-5 flex flex-col justify-between space-y-3">
            <!-- ① 課題 -->
            <div class="bg-rose-50/80 border-l-4 border-rose-400 p-3.5 rounded-r-xl shadow-sm flex-grow">
              <h3 class="font-bold text-rose-800 text-xs mb-1.5">⚠️ 現状のきっかけ・課題</h3>
              <ul class="space-y-1.5 text-xs text-gray-700 list-disc pl-4 leading-relaxed font-bold">
                ${data.issues.filter(item => item.trim() !== "").map(item => `<li>${item}</li>`).join("")}
                ${data.issues.filter(item => item.trim() !== "").length === 0 ? `<li class="list-none pl-0 text-gray-400">※課題未入力</li>` : ""}
              </ul>
            </div>
            <!-- ② 理想 -->
            <div class="bg-emerald-50/80 border-l-4 border-emerald-400 p-3.5 rounded-r-xl shadow-sm flex-grow">
              <h3 class="font-bold text-emerald-800 text-xs mb-1.5">✨ 理想の暮らし</h3>
              <ul class="space-y-1.5 text-xs text-gray-700 list-disc pl-4 leading-relaxed font-bold">
                ${data.ideals.filter(item => item.trim() !== "").map(item => `<li>${item}</li>`).join("")}
                ${data.ideals.filter(item => item.trim() !== "").length === 0 ? `<li class="list-none pl-0 text-gray-400">※理想未入力</li>` : ""}
              </ul>
            </div>
            <!-- ③ 設計コンセプト ＆ 提案方針 -->
            <div class="bg-[#0A192F] text-white p-3.5 rounded-xl shadow-md flex-grow">
              <h3 class="font-bold text-[#D9A05B] text-xs mb-1.5">💡 設計コンセプト ＆ 提案方針</h3>
              <p class="text-xs text-slate-100 leading-relaxed whitespace-pre-wrap font-bold">${data.concept || "（未入力）"}</p>
            </div>
          </div>

          <!-- 右半分：ご希望条件（上段）、MUST（中段）、WANT（下段）の縦3段構成 (col-span-7) -->
          <div class="col-span-7 flex flex-col justify-between space-y-3">
            <!-- 1段目：ご希望条件（テーブル） -->
            <div class="flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white flex-grow">
              <div class="bg-[#0A192F] text-[#D9A05B] px-3 py-1 text-[10px] font-bold text-center border-b border-gray-200">
                🏠 ご希望条件
              </div>
              <div class="p-3 space-y-1.5 text-xs text-gray-700 flex flex-col justify-center font-bold">
                <div class="flex justify-between border-b border-gray-100 pb-1">
                  <span class="text-gray-400">希望種別:</span>
                  <span class="text-[#0A192F]">${data.propertyType || "＿"}</span>
                </div>
                <div class="flex justify-between border-b border-gray-100 pb-1">
                  <span class="text-gray-400">希望エリア:</span>
                  <span class="text-[#0A192F]">${data.area || "＿"}</span>
                </div>
                <div class="flex justify-between border-b border-gray-100 pb-1">
                  <span class="text-gray-400">最寄駅・交通:</span>
                  <span class="text-[#0A192F]">${data.station || "＿"}</span>
                </div>
                <div class="flex justify-between border-b border-gray-100 pb-1">
                  <span class="text-gray-400">間取り・面積:</span>
                  <span class="text-[#0A192F]">${data.layout || "＿"}</span>
                </div>
                <div class="flex justify-between pb-0.5">
                  <span class="text-gray-400">希望築年数:</span>
                  <span class="text-[#0A192F]">${data.age || "＿"}</span>
                </div>
              </div>
            </div>

            <!-- 2段目：MUST -->
            <div class="flex flex-col border border-rose-200 rounded-xl overflow-hidden shadow-sm bg-white flex-grow">
              <div class="bg-rose-50 text-rose-800 px-3 py-1 text-[10px] font-bold text-center border-b border-rose-200">
                ✔️ MUST（必須）
              </div>
              <div class="p-2.5 min-h-[85px] overflow-y-auto">
                <ul class="space-y-1 text-xs text-gray-700 leading-relaxed font-bold">
                  ${data.mustConditions.filter(item => item.trim() !== "").map(item => `<li class="flex items-start gap-1"><span class="text-[#D9A05B]">✓</span><span class="break-all">${item}</span></li>`).join("")}
                  ${data.mustConditions.filter(item => item.trim() !== "").length === 0 ? `<li class="text-gray-400 list-none">※未入力</li>` : ""}
                </ul>
              </div>
            </div>

            <!-- 3段目：WANT -->
            <div class="flex flex-col border border-amber-200 rounded-xl overflow-hidden shadow-sm bg-white flex-grow">
              <div class="bg-amber-50 text-amber-800 px-3 py-1 text-[10px] font-bold text-center border-b border-amber-200">
                ⭐ WANT（希望）
              </div>
              <div class="p-2.5 min-h-[85px] overflow-y-auto">
                <ul class="space-y-1 text-xs text-gray-700 leading-relaxed font-bold">
                  ${data.wantConditions.filter(item => item.trim() !== "").map(item => `<li class="flex items-start gap-1"><span class="text-gray-400">▫️</span><span class="break-all">${item}</span></li>`).join("")}
                  ${data.wantConditions.filter(item => item.trim() !== "").length === 0 ? `<li class="text-gray-400 list-none">※未入力</li>` : ""}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3 mt-4">
        <p>お客様名: ${data.customerName}様</p>
        <p class="font-bold">Nagatomo Home</p>
      </div>
    </div>

    <!-- スライド3: 賃貸比較 ＆ 資金計画シミュレーション -->
    <div class="bg-white text-[#0A192F] p-12 rounded-3xl shadow-xl border border-gray-150 flex flex-col justify-between h-[500px] page-break relative overflow-hidden">
      <!-- 装飾用の左側カラーバー -->
      <div class="absolute left-0 top-0 bottom-0 w-3 bg-[#0A192F]"></div>

      <!-- ヘッダー -->
      <div class="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
        <div class="flex items-center gap-3">
          <span class="bg-[#0A192F] text-white rounded px-2.5 py-0.5 text-xs font-bold">02</span>
          <h2 class="text-base font-bold text-[#0A192F]">賃貸比較 ＆ 資金計画シミュレーション</h2>
        </div>
        <span class="text-xs text-gray-400 font-bold">Nagatomo Home</span>
      </div>

      <!-- メインエリア -->
      <div class="flex-grow flex flex-col justify-between h-[380px]">
        <div class="grid grid-cols-12 gap-6 items-stretch w-full flex-grow">
          <!-- 左カラム：賃貸 vs 購入比較 (col-span-5) -->
          <div class="col-span-5 flex flex-col justify-between space-y-4 h-full">
            <div>
              <h3 class="font-bold text-xs text-[#0A192F] mb-1.5 border-l-4 border-[#D9A05B] pl-2">
                生涯コスト比較 (${data.loanTerm}年シミュレーション)
              </h3>
              <p class="text-[10px] text-gray-500 leading-normal">
                家賃を支払い続ける「賃貸」と、諸費用を含め自己資金を考慮した「購入」的${data.loanTerm}年間での総支払額比較。
              </p>
            </div>

            <div class="flex-grow flex flex-col justify-between space-y-3.5">
              <!-- 賃貸 -->
              <div class="bg-slate-50 border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col justify-between flex-grow">
                <h4 class="font-bold text-gray-600 text-[11px]">🏠 賃貸に住み続けた場合</h4>
                <p class="text-xl font-black text-gray-700 leading-none my-1">
                  ${totalRent35Years.toLocaleString()} <span class="text-xs font-bold">円</span>
                </p>
                <span class="text-[9px] text-red-500 font-bold">※資産にならず、家賃・更新料を払い続けます</span>
              </div>

              <!-- 購入 -->
              <div class="bg-[#0A192F]/5 border border-[#D9A05B]/30 p-4 rounded-xl shadow-sm flex flex-col justify-between flex-grow">
                <div class="flex justify-between items-center">
                  <h4 class="font-bold text-[#0A192F] text-[11px]">🎁 資金計画先行で購入（本提案）</h4>
                  <span class="bg-[#D9A05B] text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">提案プラン</span>
                </div>
                <p class="text-xl font-black text-[#0A192F] leading-none my-1">
                  ${totalLoan35Years.toLocaleString()} <span class="text-xs font-bold">円</span>
                </p>
                <span class="text-[9px] text-emerald-600 font-bold">※完済後は自己資産となり、断熱リノベで光熱費も削減</span>
              </div>
            </div>
          </div>

          <!-- 右カラム：資金計画詳細 (col-span-7) -->
          <div class="col-span-7 pl-2 flex flex-col justify-between space-y-3.5 h-full">
            <!-- 資金内訳 -->
            <div class="bg-slate-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm flex-grow">
              <h4 class="font-bold text-gray-700 text-xs border-b border-gray-200 pb-1.5 mb-1.5 flex items-center gap-1.5">
                <span>💰</span> 資金内訳
              </h4>
              <div class="space-y-1 text-[10px] font-bold text-gray-700">
                <div class="flex justify-between">
                  <span class="text-gray-600">① 中古物件購入費用:</span>
                  <span class="font-black text-[#0A192F]">${data.propertyPrice.toLocaleString()} 万円</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">② 高性能フルリノベ費用:</span>
                  <span class="font-black text-[#0A192F]">${data.renovePrice.toLocaleString()} 万円</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">③ 購入諸費用（概算）:</span>
                  <span class="font-black text-[#0A192F]">${(data.otherExpense || 0).toLocaleString()} 万円</span>
                </div>
                <div class="flex justify-between text-green-600">
                  <span>④ 自己資金（頭金）:</span>
                  <span class="font-black">-${(data.selfFund || 0).toLocaleString()} 万円</span>
                </div>
                <div class="flex justify-between border-t-2 border-gray-200 pt-1 mt-1">
                  <span class="text-gray-700 font-black">想定借入総額 (①+②+③-④):</span>
                  <span class="font-black text-[#0A192F] text-xs">${totalLoanAmount.toLocaleString()} 万円</span>
                </div>
              </div>
            </div>

            <!-- 住宅ローンお借入プラン -->
            <div class="bg-slate-50 border border-gray-200 p-3 rounded-xl flex flex-col justify-between shadow-sm">
              <h4 class="font-bold text-gray-700 text-[11px] border-b border-gray-200 pb-1 mb-1 flex items-center gap-1.5">
                <span>🏦</span> ローンお借入プラン
              </h4>
              <div class="space-y-1 text-[10px] font-bold text-gray-700">
                <div class="flex justify-between">
                  <span class="text-gray-600">お借入総額:</span>
                  <span class="font-black text-[#0A192F]">${totalLoanAmount.toLocaleString()} 万円</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">想定金利:</span>
                  <span class="font-black text-[#0A192F]">${data.loanRate} %（元利均等）</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">返済期間:</span>
                  <span class="font-black text-[#0A192F]">${data.loanTerm} 年</span>
                </div>
                <div class="flex justify-between border-t-2 border-gray-200 pt-1 mt-1">
                  <span class="text-[#D9A05B] text-[11px] font-bold">毎月ローン返済額:</span>
                  <span class="font-black text-[#D9A05B] text-xs">${monthlyPayment.toLocaleString()} 円 / 月</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 下部余白：高断熱G2仕様想定光熱費削減メリット -->
        <div class="mt-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-[#D9A05B]/30 p-2.5 rounded-xl shadow-sm">
          <div class="flex items-center gap-2 mb-1">
            <span class="bg-[#D9A05B] text-white text-[7px] font-bold px-1.5 py-0.5 rounded shadow-sm">営業ポイント</span>
            <h4 class="font-bold text-[#0A192F] text-[10px]">🌡️ 高断熱G2仕様による「光熱費削減効果」</h4>
          </div>
          <p class="text-[9px] text-gray-700 leading-relaxed font-medium">
            都城市の厳しい寒暖差に対抗する「高断熱G2仕様（断熱等級6）」により、一般的な中古住宅と比べ<strong class="text-orange-600 font-bold">月々約1.2万円の光熱費削減</strong>が期待できます。これは35年間の総支払額に換算すると<strong class="text-orange-600 font-bold">約500万円もの実質負担軽減</strong>となり、ローン支払いの余力を生み出します。
          </p>
        </div>
      </div>

      <!-- フッター -->
      <div class="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-2.5 mt-3">
        <p>※概算シミュレーションです。宮崎銀行などの地方銀行の最新金利等により変動します。</p>
        <p class="font-bold">Nagatomo Home</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (data.customerName || "customer") + "_proposal.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* 共通ヘッダー */}
      <header className="bg-[#0A192F] text-white px-6 py-4 shadow-md flex justify-between items-center flex-shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="border border-[#D9A05B] rounded w-8 h-8 flex items-center justify-center font-black text-[#D9A05B]">N</div>
          <div>
            <span className="text-[#D9A05B] text-[10px] font-bold tracking-wider uppercase block">Nagatomo Home AI Strategy Office</span>
            <h1 className="text-base font-bold leading-tight">長友スマート提案ボード</h1>
            <span className="text-xs text-gray-300 block mt-0.5">（対話型お住まい探し計画書）</span>
          </div>
        </div>
        
        {/* 各種アクションボタン */}
        <div className="flex gap-2 items-center flex-wrap">
          <select
            onChange={(e) => handleLoadServer(e.target.value)}
            value={data.customerId || ""}
            className="bg-[#132A4A] text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#D9A05B] cursor-pointer mr-1 whitespace-nowrap"
          >
            <option value="">📂 保存データの読込み...</option>
            {savedCustomers.map((c) => (
              <option key={c.id} value={c.id} className="text-slate-900 bg-white">{c.name} ({c.id})</option>
            ))}
          </select>

          <button 
            onClick={handleSaveServer}
            className="bg-[#D9A05B] hover:bg-[#D9A05B]/90 text-[#0A192F] font-bold text-xs px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5 mr-1 whitespace-nowrap"
          >
            💾 サーバーに上書き保存
          </button>

          <button 
            onClick={handleShareData}
            className="bg-[#132A4A] hover:bg-[#1e3d6b] text-white font-bold text-xs px-3 py-2 rounded-xl border border-white/10 transition shadow flex items-center gap-1.5 mr-1 whitespace-nowrap"
          >
            🔗 資金計画にデータを共有
          </button>

          <button 
            onClick={handlePrint}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5 mr-1 whitespace-nowrap"
          >
            🖨️ PDFを保存
          </button>

          <button 
            onClick={handleFullscreen}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 mr-1 whitespace-nowrap"
          >
            🖥️ フルスクリーン表示
          </button>
        </div>
      </header>

      {/* メインレイアウトコンテナ */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* 左側：編集サイドメニュー（高級感のあるダークネイビー・ゴールド調） */}
        <div 
          className={`bg-[#0D1B2E] text-slate-100 border-r border-slate-800 transition-all duration-300 flex flex-col no-print ${
            isSidebarOpen ? "w-[380px] min-w-[380px] flex-shrink-0" : "w-0 overflow-hidden border-r-0"
          }`}
        >
          <div className="p-4 border-b border-slate-800 bg-[#0A192F] flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="text-[#D9A05B]">✍️</span> 提案データの直接編集
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setHearingStep(0);
                  setIsHearingModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition shadow flex items-center gap-1 whitespace-nowrap"
              >
                💬 対話で進める
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-xs text-slate-400 hover:text-[#D9A05B] font-bold transition flex items-center gap-1"
              >
                ◀ 閉じる
              </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-6 text-xs text-slate-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
            {/* 基本情報 */}
            <div className="space-y-3">
              <h3 
                onClick={() => toggleMenu("basic")}
                className="font-bold text-white border-l-4 border-[#D9A05B] pl-2 pb-0.5 text-xs bg-[#132A4A]/40 hover:bg-[#132A4A]/70 py-1 pr-2 rounded-r flex items-center justify-between cursor-pointer transition select-none"
              >
                <span className="flex items-center gap-1.5">
                  <span>👤</span> 基本情報
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{menuOpen.basic ? "▼" : "▶"}</span>
              </h3>
              {menuOpen.basic && (
                <div className="space-y-2.5 px-1">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">顧客ID（半角英数・保存用）</label>
                    <input 
                      type="text" 
                      placeholder="例: tateno"
                      value={data.customerId || ""}
                      onChange={(e) => handleInputChange("customerId", e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">お客様お名前（苗字のみ）</label>
                    <input 
                      type="text" 
                      value={data.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      placeholder="例: 立野"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">担当者名</label>
                    <input 
                      type="text" 
                      value={data.advisorName}
                      onChange={(e) => handleInputChange("advisorName", e.target.value)}
                      placeholder="例: 長友"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 現状のきっかけ・課題 */}
            <div className="space-y-3">
              <div 
                onClick={() => toggleMenu("issues")}
                className="flex justify-between items-center bg-[#132A4A]/40 hover:bg-[#132A4A]/70 border-l-4 border-[#D9A05B] pl-2 py-1 pr-2 rounded-r cursor-pointer transition select-none"
              >
                <h3 className="font-bold text-white text-xs flex items-center gap-1">
                  <span>⚠️</span> 現状のきっかけ・課題
                </h3>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleAddListItem("issues")}
                    className="border border-[#D9A05B]/60 text-[#D9A05B] hover:bg-[#D9A05B] hover:text-[#0A192F] font-bold text-[9px] px-2 py-0.5 rounded-lg transition"
                  >
                    + 追加
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">{menuOpen.issues ? "▼" : "▶"}</span>
                </div>
              </div>
              {menuOpen.issues && (
                <div className="space-y-2 px-1">
                  {data.issues.map((item, idx) => (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <textarea 
                        value={item}
                        onChange={(e) => handleListChange("issues", idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "issues")}
                        placeholder="例: 冬場の結露と厳しい底冷えがつらい / 細切れの間取りで家事動線が悪い"
                        data-field="issues"
                        rows={4}
                        className="flex-grow bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition resize-none"
                      />
                      <button 
                        onClick={() => handleRemoveListItem("issues", idx)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold transition flex-shrink-0 flex items-center justify-center text-xs mt-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 理想の暮らし */}
            <div className="space-y-3">
              <div 
                onClick={() => toggleMenu("ideals")}
                className="flex justify-between items-center bg-[#132A4A]/40 hover:bg-[#132A4A]/70 border-l-4 border-[#D9A05B] pl-2 py-1 pr-2 rounded-r cursor-pointer transition select-none"
              >
                <h3 className="font-bold text-white text-xs flex items-center gap-1">
                  <span>✨</span> 理想の暮らし
                </h3>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleAddListItem("ideals")}
                    className="border border-[#D9A05B]/60 text-[#D9A05B] hover:bg-[#D9A05B] hover:text-[#0A192F] font-bold text-[9px] px-2 py-0.5 rounded-lg transition"
                  >
                    + 追加
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">{menuOpen.ideals ? "▼" : "▶"}</span>
                </div>
              </div>
              {menuOpen.ideals && (
                <div className="space-y-2 px-1">
                  {data.ideals.map((item, idx) => (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <textarea 
                        value={item}
                        onChange={(e) => handleListChange("ideals", idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "ideals")}
                        placeholder="例: 冬あったかく過ごせるG2仕様の平屋 / 家事がラクになる回遊動線"
                        data-field="ideals"
                        rows={4}
                        className="flex-grow bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition resize-none"
                      />
                      <button 
                        onClick={() => handleRemoveListItem("ideals", idx)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold transition flex-shrink-0 flex items-center justify-center text-xs mt-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 希望条件 */}
            <div className="space-y-3">
              <h3 
                onClick={() => toggleMenu("conditions")}
                className="font-bold text-white border-l-4 border-[#D9A05B] pl-2 pb-0.5 text-xs bg-[#132A4A]/40 hover:bg-[#132A4A]/70 py-1 pr-2 rounded-r flex items-center justify-between cursor-pointer transition select-none"
              >
                <span className="flex items-center gap-1.5">
                  <span>🏠</span> ご希望条件の整理
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{menuOpen.conditions ? "▼" : "▶"}</span>
              </h3>
              {menuOpen.conditions && (
                <div className="grid grid-cols-2 gap-2 px-1">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">希望種別</label>
                    <input 
                      type="text" 
                      value={data.propertyType}
                      onChange={(e) => handleInputChange("propertyType", e.target.value)}
                      placeholder="例: 戸建てリノベーション"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">希望エリア</label>
                    <input 
                      type="text" 
                      value={data.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      placeholder="例: 都城市立野町"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">最寄駅・交通</label>
                    <input 
                      type="text" 
                      value={data.station}
                      onChange={(e) => handleInputChange("station", e.target.value)}
                      placeholder="例: 都城駅 車で10分"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">予算イメージ</label>
                    <input 
                      type="text" 
                      value={data.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                      placeholder="例: 2,500万円以内"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">間取り・面積</label>
                    <input 
                      type="text" 
                      value={data.layout}
                      onChange={(e) => handleInputChange("layout", e.target.value)}
                      placeholder="例: 3LDK・98.50㎡"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">希望築年数</label>
                    <input 
                      type="text" 
                      value={data.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="例: 築32年（リノベ向き木造平屋）"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* MUST/WANT */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div 
                  onClick={() => toggleMenu("must")}
                  className="flex justify-between items-center bg-[#132A4A]/40 hover:bg-[#132A4A]/70 border-l-4 border-[#D9A05B] pl-2 py-1 pr-2 rounded-r cursor-pointer transition select-none"
                >
                  <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="bg-[#D9A05B] text-[#0A192F] text-[8px] px-1 py-0.5 rounded font-black">MUST</span>
                    絶対に譲れない条件
                  </h3>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleAddListItem("mustConditions")}
                      className="border border-[#D9A05B]/60 text-[#D9A05B] hover:bg-[#D9A05B] hover:text-[#0A192F] font-bold text-[9px] px-2 py-0.5 rounded-lg transition"
                    >
                      + 追加
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">{menuOpen.must ? "▼" : "▶"}</span>
                  </div>
                </div>
                {menuOpen.must && (
                  <div className="space-y-2 px-1">
                    {data.mustConditions.map((item, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <textarea 
                          value={item}
                          onChange={(e) => handleListChange("mustConditions", idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, "mustConditions")}
                          placeholder="例: 耐震等級3・断熱等級6の確保 / 洗濯が1箇所で完結するサニタリー"
                          data-field="mustConditions"
                          rows={4}
                          className="flex-grow bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition resize-none"
                        />
                        <button 
                          onClick={() => handleRemoveListItem("mustConditions", idx)}
                          className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold transition flex-shrink-0 flex items-center justify-center text-xs mt-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div 
                  onClick={() => toggleMenu("want")}
                  className="flex justify-between items-center bg-[#132A4A]/40 hover:bg-[#132A4A]/70 border-l-4 border-[#D9A05B] pl-2 py-1 pr-2 rounded-r cursor-pointer transition select-none"
                >
                  <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="bg-slate-700 text-slate-100 text-[8px] px-1 py-0.5 rounded font-black">WANT</span>
                    できれば叶えたい条件
                  </h3>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleAddListItem("wantConditions")}
                      className="border border-[#D9A05B]/60 text-[#D9A05B] hover:bg-[#D9A05B] hover:text-[#0A192F] font-bold text-[9px] px-2 py-0.5 rounded-lg transition"
                    >
                      + 追加
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">{menuOpen.want ? "▼" : "▶"}</span>
                  </div>
                </div>
                {menuOpen.want && (
                  <div className="space-y-2 px-1">
                    {data.wantConditions.map((item, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <textarea 
                          value={item}
                          onChange={(e) => handleListChange("wantConditions", idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, "wantConditions")}
                          placeholder="例: 太陽光発電パッケージの導入 / 将来仕切れる可変子供部屋"
                          data-field="wantConditions"
                          rows={4}
                          className="flex-grow bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition resize-none"
                        />
                        <button 
                          onClick={() => handleRemoveListItem("wantConditions", idx)}
                          className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold transition flex-shrink-0 flex items-center justify-center text-xs mt-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 資金シミュレーション数値 */}
            <div className="space-y-3">
              <h3 
                onClick={() => toggleMenu("finance")}
                className="font-bold text-white border-l-4 border-[#D9A05B] pl-2 pb-0.5 text-xs bg-[#132A4A]/40 hover:bg-[#132A4A]/70 py-1 pr-2 rounded-r flex items-center justify-between cursor-pointer transition select-none"
              >
                <span className="flex items-center gap-1.5">
                  <span>💰</span> 資金・ローン前提
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{menuOpen.finance ? "▼" : "▶"}</span>
              </h3>
              {menuOpen.finance && (
                <div className="grid grid-cols-2 gap-2 px-1">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">現在の家賃（円）</label>
                    <input 
                      type="number" 
                      value={data.currentRent}
                      onChange={(e) => handleInputChange("currentRent", parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">物件本体価格（万円）</label>
                    <input 
                      type="number" 
                      value={data.propertyPrice}
                      onChange={(e) => handleInputChange("propertyPrice", parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">リノベ費用（万円）</label>
                    <input 
                      type="number" 
                      value={data.renovePrice}
                      onChange={(e) => handleInputChange("renovePrice", parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">自己資金/頭金（万円）</label>
                    <input 
                      type="number" 
                      value={data.selfFund ?? 0}
                      onChange={(e) => handleInputChange("selfFund", parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">諸費用/概算（万円）</label>
                    <input 
                      type="number" 
                      value={data.otherExpense ?? 150}
                      onChange={(e) => handleInputChange("otherExpense", parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">借入金利（％）</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={data.loanRate}
                      onChange={(e) => handleInputChange("loanRate", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">返済期間（年）</label>
                    <input 
                      type="number" 
                      value={data.loanTerm}
                      onChange={(e) => handleInputChange("loanTerm", parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 今後のロードマップ */}
            <div className="space-y-3">
              <h3 
                onClick={() => toggleMenu("strategy")}
                className="font-bold text-white border-l-4 border-[#D9A05B] pl-2 pb-0.5 text-xs bg-[#132A4A]/40 hover:bg-[#132A4A]/70 py-1 pr-2 rounded-r flex items-center justify-between cursor-pointer transition select-none"
              >
                <span className="flex items-center gap-1.5">
                  <span>🚀</span> 提案方針 ＆ 設計コンセプト
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{menuOpen.strategy ? "▼" : "▶"}</span>
              </h3>
              {menuOpen.strategy && (
                <div className="space-y-2.5 px-1">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">方針・戦略 (20字以内)</label>
                    <input 
                      type="text" 
                      maxLength={20}
                      value={data.strategy}
                      onChange={(e) => handleInputChange("strategy", e.target.value)}
                      placeholder="例: 資金計画先行型リノベ"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">スケジュール (20字以内)</label>
                    <input 
                      type="text" 
                      maxLength={20}
                      value={data.schedule}
                      onChange={(e) => handleInputChange("schedule", e.target.value)}
                      placeholder="例: 年内着工・春先お引渡し"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">資金概算 (20字以内)</label>
                    <input 
                      type="text" 
                      maxLength={20}
                      value={data.estimate}
                      onChange={(e) => handleInputChange("estimate", e.target.value)}
                      placeholder="例: 総額2,500万（月々6.9万）"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold text-[10px]">設計コンセプト ＆ 提案方針</label>
                    <textarea 
                      value={data.concept ?? ""}
                      onChange={(e) => handleInputChange("concept", e.target.value)}
                      placeholder="例: 資金計画先行型リノベに基づき、お施主様の理想の暮らしを実現するための最適設計を行います。"
                      rows={4}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#D9A05B] focus:ring-1 focus:ring-[#D9A05B]/30 transition resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* データの初期化・削除 */}
            <div className="space-y-3 pt-2">
              <h3 
                onClick={() => toggleMenu("output")}
                className="font-bold text-white border-l-4 border-[#D9A05B] pl-2 pb-0.5 text-xs bg-[#132A4A]/40 hover:bg-[#132A4A]/70 py-1 pr-2 rounded-r flex items-center justify-between cursor-pointer transition select-none"
              >
                <span className="flex items-center gap-1.5">
                  <span>⚙️</span> データの初期化・削除
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{menuOpen.output ? "▼" : "▶"}</span>
              </h3>
              {menuOpen.output && (
                <div className="flex flex-col gap-2 px-1">
                  <button 
                    onClick={handleClearAll}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs py-2.5 px-3 rounded-xl border border-red-500/20 transition shadow flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    🧹 全クリア
                  </button>
                  <button 
                    onClick={handleDeleteServer}
                    disabled={!data.customerId}
                    className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition shadow flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    🗑️ データ削除
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>

        {/* 右側：スライドプレビューエリア */}
        <div className="flex-grow min-w-0 p-8 overflow-y-auto flex flex-col items-center bg-slate-200 relative">
          
          {/* サイドバー折りたたみトグルボタン */}
          <div className={`w-full max-w-[1100px] mb-4 flex justify-between items-center no-print`}>
            <div>
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-[#0A192F] hover:bg-[#0A192F]/90 text-white border border-[#1E3A60] rounded-xl px-4 py-1.5 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  ▶ メニューを開く（直接編集）
                </button>
              )}
            </div>
            <span className="text-xs text-slate-500 font-bold">A3横サイズ（1.414:1比率）スライドプレビュー</span>
          </div>

          {/* ステータス・通知メッセージの表示 */}
          {shareStatus.type && (
            <div 
              className={`w-full max-w-[1100px] p-4 rounded-2xl mb-6 shadow-sm border text-xs font-bold transition-all duration-300 no-print flex justify-between items-center ${
                shareStatus.type === "success" 
                  ? "bg-green-50 border-green-200 text-green-700" 
                  : shareStatus.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <div className="whitespace-pre-line">{shareStatus.message}</div>
              <button 
                onClick={() => setShareStatus({ type: null, message: "" })}
                className="hover:bg-slate-200/50 rounded-full w-5 h-5 flex items-center justify-center font-black"
              >
                ×
              </button>
            </div>
          )}

          {/* スライド実体リスト（印刷時はこの部分がA3横単位で改ページされる） */}
          <div 
            id="slides-container" 
            className={`w-full transition-all duration-300 relative ${
              isFullscreen 
                ? "bg-[#0d1b2e] overflow-y-auto h-screen p-12 flex flex-col items-center [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0d1b2e] [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full" 
                : ""
            }`}
          >
            {/* フルスクリーン解除用フローティングボタン（フルスクリーン時のみ表示。フルスクリーン対象要素の内側に配置することで表示を維持） */}
            {isFullscreen && (
              <button
                onClick={() => {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  } else if ((document as any).webkitExitFullscreen) {
                    (document as any).webkitExitFullscreen();
                  } else if ((document as any).msExitFullscreen) {
                    (document as any).msExitFullscreen();
                  }
                }}
                className="fixed top-4 right-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-2xl z-50 transition no-print flex items-center gap-1.5 cursor-pointer"
              >
                ✕ フルスクリーン解除
              </button>
            )}

            <div className="space-y-8 print:space-y-0 print:p-0 w-full max-w-[1100px]">

            {/* スライド1: 概要 & 今後のロードマップ */}
            <div 
              style={{ aspectRatio: "1.414 / 1", paddingLeft: "96px", paddingRight: "48px", paddingTop: "56px", paddingBottom: "56px" }}
              className="bg-white text-[#0A192F] rounded-lg shadow-xl flex flex-col justify-between w-full border border-gray-150 print:rounded-none print:shadow-none print:m-0 print:border-none print-page overflow-hidden relative"
            >
              {/* 装飾用の左側カラーバー */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#0A192F] print:w-5" />
              
              <div className="flex-grow grid grid-cols-12 gap-10 items-center w-full">
                {/* 左半分：表紙エリア (col-span-5) */}
                <div className="col-span-5 flex flex-col justify-center h-full border-r border-gray-100 pr-10">
                  <span className="text-sm text-[#D9A05B] font-extrabold uppercase tracking-widest mb-3">Nagatomo Home</span>
                  <h1 className="text-5xl font-black text-[#0A192F] tracking-tight leading-tight mb-6">
                    お住まい探し<br />計画書
                  </h1>
                  <p className="text-base text-gray-600 font-semibold mb-14 leading-relaxed">
                    未来の暮らしを豊かにする<br />リノベーションのご提案
                  </p>
                  
                  <div className="space-y-4 pt-8 border-t-2 border-gray-100 text-sm">
                    <div className="flex justify-between border-b border-gray-50 pb-3">
                      <span className="text-gray-400 font-bold">ご相談者様</span>
                      <span className="font-black text-[#0A192F] text-lg">{data.customerName || "＿"} 様</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-3">
                      <span className="text-gray-400 font-bold">ご提案日</span>
                      <span className="font-bold text-[#0A192F]">{mounted ? new Date().toLocaleDateString("ja-JP") : ""}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-gray-400 font-bold">担当アドバイザー</span>
                      <span className="font-bold text-[#0A192F]">{data.advisorName || "＿"}</span>
                    </div>
                  </div>
                </div>

                {/* 右半分：今後のロードマップ (col-span-7) */}
                <div className="col-span-7 flex flex-col justify-between h-full py-4 pl-6">
                  <div>
                    <h2 className="text-xl font-black text-[#0A192F] border-b-2 border-[#D9A05B] pb-3 mb-8 flex items-center gap-2.5">
                      <span className="text-2xl">🧭</span> 提案方針と今後のロードマップ
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Step 01 */}
                      <div className="flex gap-5 items-start bg-slate-50 border border-slate-100 p-5 rounded-xl shadow-sm">
                        <span className="bg-[#0A192F] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mt-0.5 shadow-sm">Step 01</span>
                        <div>
                          <h3 className="font-black text-base text-[#0A192F]">戦略・進め方</h3>
                          <p className="text-sm text-gray-700 mt-1.5 font-bold leading-relaxed">{data.strategy || "（未入力）"}</p>
                        </div>
                      </div>

                      {/* Step 02 */}
                      <div className="flex gap-5 items-start bg-slate-50 border border-slate-100 p-5 rounded-xl shadow-sm">
                        <span className="bg-[#D9A05B] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mt-0.5 shadow-sm">Step 02</span>
                        <div>
                          <h3 className="font-black text-base text-[#0A192F]">スケジュール</h3>
                          <p className="text-sm text-gray-700 mt-1.5 font-bold leading-relaxed">{data.schedule || "（未入力）"}</p>
                        </div>
                      </div>

                      {/* Step 03 */}
                      <div className="flex gap-5 items-start bg-slate-50 border border-slate-100 p-5 rounded-xl shadow-sm">
                        <span className="bg-slate-300 text-gray-800 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mt-0.5 shadow-sm">Step 03</span>
                        <div>
                          <h3 className="font-black text-base text-[#0A192F]">資金計画概算</h3>
                          <p className="text-sm text-gray-700 mt-1.5 font-bold leading-relaxed">{data.estimate || "（未入力）"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-8 leading-relaxed font-bold border-l-2 border-gray-200 pl-3">
                    ※資金計画先行フローに基づき、まずは安定したお借入の上限を見極めてから最適な物件探しに進みます。
                  </p>
                </div>
              </div>
            </div>

            {/* スライド2: ヒアリング & ご希望条件・優先順位 */}
            <div 
              style={{ aspectRatio: "1.414 / 1", paddingLeft: "96px", paddingRight: "48px", paddingTop: "48px", paddingBottom: "48px" }}
              className="bg-white text-[#0A192F] rounded-lg shadow-xl flex flex-col justify-between w-full border border-gray-150 print:rounded-none print:shadow-none print:m-0 print:border-none print-page overflow-hidden relative"
            >
              {/* 装飾用の左側カラーバー */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#D9A05B] print:w-5" />

              {/* ヘッダー */}
              <div className="flex justify-between items-center border-b-2 border-gray-200 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-[#0A192F] text-white rounded px-3 py-1 text-sm font-black">01</span>
                  <h2 className="text-lg font-black text-[#0A192F] tracking-wide">ご要望の整理とご希望条件</h2>
                </div>
              </div>

              {/* メインエリア */}
              <div className="flex-grow flex items-stretch w-full my-auto overflow-hidden">
                <div className="grid grid-cols-12 gap-6 items-stretch w-full h-full">
                  {/* 左半分：現状の課題・理想の暮らし・設計コンセプトの3段 (col-span-5) */}
                  <div className="col-span-5 flex flex-col justify-between space-y-3 h-full">
                    {/* ① 課題 */}
                    <div className="bg-rose-50 border-l-4 border-rose-400 p-3.5 rounded-r-xl shadow-sm flex-grow flex flex-col justify-between">
                      <h3 className="font-black text-rose-800 text-xs mb-1.5 flex items-center gap-2">
                        <span className="text-sm">⚠️</span> 現状のきっかけ・課題
                      </h3>
                      <ul className="space-y-1 text-xs text-gray-800 list-disc pl-4 leading-relaxed font-bold flex-grow">
                        {data.issues.filter(item => item.trim() !== "").map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                        {data.issues.filter(item => item.trim() !== "").length === 0 && (
                          <li className="text-gray-400 list-none pl-0">※課題未入力</li>
                        )}
                      </ul>
                    </div>
                    {/* ② 理想 */}
                    <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3.5 rounded-r-xl shadow-sm flex-grow flex flex-col justify-between">
                      <h3 className="font-black text-emerald-800 text-xs mb-1.5 flex items-center gap-2">
                        <span className="text-sm">✨</span> 理想の暮らし
                      </h3>
                      <ul className="space-y-1 text-xs text-gray-800 list-disc pl-4 leading-relaxed font-bold flex-grow">
                        {data.ideals.filter(item => item.trim() !== "").map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                        {data.ideals.filter(item => item.trim() !== "").length === 0 && (
                          <li className="text-gray-400 list-none pl-0">※理想未入力</li>
                        )}
                      </ul>
                    </div>
                    {/* ③ 設計コンセプト ＆ 提案方針 */}
                    <div className="bg-[#0A192F] text-white p-3.5 rounded-xl shadow-md flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-[#D9A05B] text-xs mb-1.5 flex items-center gap-1.5">
                          <span>💡</span> 設計コンセプト ＆ 提案方針
                        </h3>
                        <p className="text-xs font-bold text-slate-100 leading-relaxed whitespace-pre-wrap">
                          {data.concept || "（未入力）"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 右半分：ご希望条件（上段）、MUST（中段）、WANT（下段）の縦3段構成 (col-span-7) */}
                  <div className="col-span-7 flex flex-col justify-between space-y-3 h-full">
                    {/* 1段目：ご希望条件（テーブル） */}
                    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white flex-grow h-[31%]">
                      <div className="bg-[#0A192F] text-[#D9A05B] px-4 py-1.5 text-xs font-black text-center border-b border-gray-200">
                        🏠 ご希望条件
                      </div>
                      <div className="flex-grow p-3 text-xs font-bold text-gray-700 flex flex-col justify-around">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span className="text-gray-400">希望種別:</span>
                          <span className="text-[#0A192F] font-black">{data.propertyType || "＿"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span className="text-gray-400">希望エリア:</span>
                          <span className="text-[#0A192F] font-black">{data.area || "＿"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span className="text-gray-400">最寄駅・交通:</span>
                          <span className="text-[#0A192F] font-black">{data.station || "＿"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span className="text-gray-400">間取り・面積:</span>
                          <span className="text-[#0A192F] font-black">{data.layout || "＿"}</span>
                        </div>
                        <div className="flex justify-between pb-0.5">
                          <span className="text-gray-400">希望築年数:</span>
                          <span className="text-[#0A192F] font-black">{data.age || "＿"}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2段目：MUST */}
                    <div className="flex flex-col border border-rose-200 rounded-xl overflow-hidden shadow-sm bg-white flex-grow h-[31%]">
                      <div className="bg-rose-50 text-rose-800 px-4 py-1.5 text-xs font-black text-center border-b border-rose-200">
                        ✔️ MUST（必須）
                      </div>
                      <div className="flex-grow p-3 overflow-y-auto">
                        <ul className="space-y-1 text-xs text-gray-800 font-bold leading-relaxed">
                          {data.mustConditions.filter(item => item.trim() !== "").map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-[#D9A05B] font-black">✓</span>
                              <span className="break-all">{item}</span>
                            </li>
                          ))}
                          {data.mustConditions.filter(item => item.trim() !== "").length === 0 && (
                            <li className="text-gray-400 list-none">※未入力</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* 3段目：WANT */}
                    <div className="flex flex-col border border-amber-200 rounded-xl overflow-hidden shadow-sm bg-white flex-grow h-[31%]">
                      <div className="bg-amber-50 text-amber-800 px-4 py-1.5 text-xs font-black text-center border-b border-amber-200">
                        ⭐ WANT（希望）
                      </div>
                      <div className="flex-grow p-3 overflow-y-auto">
                        <ul className="space-y-1 text-xs text-gray-800 font-bold leading-relaxed">
                          {data.wantConditions.filter(item => item.trim() !== "").map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-gray-400 font-black">▫️</span>
                              <span className="break-all">{item}</span>
                            </li>
                          ))}
                          {data.wantConditions.filter(item => item.trim() !== "").length === 0 && (
                            <li className="text-gray-400 list-none">※未入力</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* フッター */}
              <div className="flex justify-between items-center text-xs text-gray-400 border-t-2 border-gray-100 pt-2.5 mt-3">
                <p className="font-bold">ご相談者様: {data.customerName || "＿"} 様</p>
                <p className="font-bold tracking-wider">Nagatomo Home</p>
              </div>
            </div>

            {/* スライド3: 資金計画 & 比較シミュレーション */}
            <div 
              style={{ aspectRatio: "1.414 / 1", paddingLeft: "96px", paddingRight: "48px", paddingTop: "44px", paddingBottom: "44px" }}
              className="bg-white text-[#0A192F] rounded-lg shadow-xl flex flex-col justify-between w-full border border-gray-150 print:rounded-none print:shadow-none print:m-0 print:border-none print-page overflow-hidden relative"
            >
              {/* 装飾用の左側カラーバー */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#0A192F] print:w-5" />

              {/* ヘッダー */}
              <div className="flex justify-between items-center border-b-2 border-gray-200 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-[#0A192F] text-white rounded px-3 py-1 text-sm font-black">02</span>
                  <h2 className="text-lg font-black text-[#0A192F] tracking-wide">賃貸比較 ＆ 資金計画シミュレーション</h2>
                </div>
              </div>

              {/* メインエリア */}
              <div className="flex-grow flex flex-col justify-between h-[380px]">
                <div className="grid grid-cols-12 gap-6 items-stretch w-full flex-grow">
                  {/* 左カラム：賃貸 vs 購入比較 (col-span-5) */}
                  <div className="col-span-5 flex flex-col justify-between space-y-4 h-full">
                    <div>
                      <h3 className="font-black text-xs text-[#0A192F] mb-1.5 border-l-4 border-[#D9A05B] pl-2">
                        生涯コスト比較 ({data.loanTerm}年シミュレーション)
                      </h3>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        家賃を支払い続ける「賃貸」と、諸費用を含め自己資金を考慮した「購入」の{data.loanTerm}年間での総支払額比較。
                      </p>
                    </div>

                    <div className="flex-grow flex flex-col justify-between space-y-3.5">
                      {/* 賃貸 */}
                      <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col justify-between flex-grow">
                        <h4 className="font-black text-gray-600 text-[11px]">🏠 賃貸に住み続けた場合</h4>
                        <p className="text-xl font-black text-gray-700 leading-none my-1">
                          {totalRent35Years.toLocaleString()} <span className="text-xs font-bold">円</span>
                        </p>
                        <span className="text-[9px] text-red-500 font-bold">※資産にならず、家賃・更新料を払い続けます</span>
                      </div>

                      {/* 購入 */}
                      <div className="bg-[#0A192F]/5 border border-[#D9A05B]/30 p-4 rounded-xl shadow-sm flex flex-col justify-between flex-grow">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-[#0A192F] text-[11px]">🎁 資金計画先行で購入（本提案）</h4>
                          <span className="bg-[#D9A05B] text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">提案プラン</span>
                        </div>
                        <p className="text-xl font-black text-[#0A192F] leading-none my-1">
                          {totalLoan35Years.toLocaleString()} <span className="text-xs font-bold">円</span>
                        </p>
                        <span className="text-[9px] text-emerald-600 font-bold">※完済後は自己資産となり、断熱リノベで光熱費も削減</span>
                      </div>
                    </div>
                  </div>

                  {/* 右カラム：資金計画詳細 (col-span-7) */}
                  <div className="col-span-7 pl-2 flex flex-col justify-between space-y-3.5 h-full">
                    {/* 資金内訳 */}
                    <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm flex-grow">
                      <h4 className="font-black text-gray-700 text-xs border-b border-gray-200 pb-1.5 mb-1.5 flex items-center gap-1.5">
                        <span>💰</span> 資金内訳
                      </h4>
                      <div className="space-y-1.5 text-xs font-bold text-gray-700 flex-grow flex flex-col justify-around">
                        <div className="flex justify-between">
                          <span className="text-gray-600">① 中古物件購入費用:</span>
                          <span className="font-black text-[#0A192F]">${data.propertyPrice.toLocaleString()} 万円</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">② 高性能フルリノベ費用:</span>
                          <span className="font-black text-[#0A192F]">${data.renovePrice.toLocaleString()} 万円</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">③ 購入諸費用（概算）:</span>
                          <span className="font-black text-[#0A192F]">{(data.otherExpense || 0).toLocaleString()} 万円</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>④ 自己資金（頭金）:</span>
                          <span className="font-black">-{ (data.selfFund || 0).toLocaleString() } 万円</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-gray-200 pt-1.5 mt-1">
                          <span className="text-gray-700 font-black">想定借入総額 (①+②+③-④):</span>
                          <span className="font-black text-[#0A192F] text-sm">{totalLoanAmount.toLocaleString()} 万円</span>
                        </div>
                      </div>
                    </div>

                    {/* 住宅ローンお借入プラン */}
                    <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm flex-grow">
                      <h4 className="font-black text-gray-700 text-xs border-b border-gray-200 pb-1.5 mb-1.5 flex items-center gap-1.5">
                        <span>🏦</span> ローンお借入プラン
                      </h4>
                      <div className="space-y-1.5 text-xs font-bold text-gray-700 flex-grow flex flex-col justify-around">
                        <div className="flex justify-between">
                          <span className="text-gray-600">お借入総額:</span>
                          <span className="font-black text-[#0A192F]">{totalLoanAmount.toLocaleString()} 万円</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">想定金利:</span>
                          <span className="font-black text-[#0A192F]">{data.loanRate} %（元利均等）</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">返済期間:</span>
                          <span className="font-black text-[#0A192F]">{data.loanTerm} 年</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-gray-200 pt-1.5 mt-1">
                          <span className="text-[#D9A05B] text-xs font-black">毎月ローン返済額:</span>
                          <span className="font-black text-[#D9A05B] text-sm">{monthlyPayment.toLocaleString()} 円 / 月</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 下部余白に追加：高断熱G2仕様想定光熱費削減メリットプレート */}
                <div className="mt-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-[#D9A05B]/30 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#D9A05B] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">営業ポイント</span>
                    <h4 className="font-black text-[#0A192F] text-xs">🌡️ 高断熱G2仕様による「光熱費削減効果」</h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                    都城市の厳しい寒暖差に対抗する「高断熱G2仕様（断熱等級6）」により、一般的な中古住宅と比べ<strong className="text-orange-600 font-extrabold">月々約1.2万円の光熱費削減</strong>が期待できます。これは35年間の総支払額に換算すると<strong className="text-orange-600 font-bold">約500万円もの実質負担軽減</strong>となり、ローン支払いの余力を生み出します。
                  </p>
                </div>
              </div>

              {/* フッター */}
              <div className="flex justify-between items-center text-xs text-gray-400 border-t-2 border-gray-100 pt-2.5 mt-3">
                <p>※概算シミュレーションです。宮崎銀行などの地方銀行の最新金利等により変動します。</p>
                <p className="font-bold tracking-wider">Nagatomo Home</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>

      {/* 4. 対話ヒアリングウィザードモーダル */}
      {isHearingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* モーダルヘッダー */}
            <div className="bg-[#0A192F] text-white px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="font-bold text-base">対話ヒアリングモード</h3>
                  <p className="text-xs text-gray-300">営業用対話ヒアリングウィザード</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHearingModalOpen(false)}
                className="text-gray-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* ステップインジケータ */}
            <div className="px-6 py-3.5 bg-slate-50 border-b flex justify-between items-center text-xs text-gray-400 font-bold">
              <span>ステップ {hearingStep + 1} / 5</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <div 
                    key={s} 
                    className={`w-3.5 h-2 rounded-full transition-all duration-300 ${
                      s === hearingStep ? "bg-[#D9A05B] w-7" : s < hearingStep ? "bg-[#0A192F]" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* モーダルボディ（質問エリア） */}
            <div className="flex-grow p-6 overflow-y-auto space-y-5">
              
              {/* ステップ1: 基本情報 (お客様名・担当者名) */}
              {hearingStep === 0 && (
                <div className="space-y-4">
                  <h4 className="font-black text-base text-[#0A192F]">ステップ1: お客様名・担当者名</h4>
                  <p className="text-xs text-gray-500 font-bold">お客様のご家族名（苗字など）と、ご自身の担当者名をご記入ください。</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">お客様名（苗字など）</label>
                      <input 
                        type="text"
                        value={wizardFields.customerName}
                        onChange={(e) => setWizardFields({ ...wizardFields, customerName: e.target.value })}
                        placeholder="例: 田中"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">担当者名</label>
                      <input 
                        type="text"
                        value={wizardFields.advisorName}
                        onChange={(e) => setWizardFields({ ...wizardFields, advisorName: e.target.value })}
                        placeholder="例: 長友"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ステップ2: きっかけ・課題・理想 */}
              {hearingStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-black text-base text-[#0A192F]">ステップ2: きっかけ・課題と理想の暮らし</h4>
                  <p className="text-xs text-gray-500 font-bold">家探しを始められたきっかけや、現在お住まいの家での不満点、どのような暮らしをされたいかをご記入ください。</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">きっかけ・現状の課題</label>
                      <textarea 
                        value={wizardFields.issues}
                        onChange={(e) => setWizardFields({ ...wizardFields, issues: e.target.value })}
                        rows={5}
                        placeholder="例: 賃貸アパートで結露がすごく、冬場がとにかく寒い。子供が生まれたので手狭になった。"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">理想の暮らし</label>
                      <textarea 
                        value={wizardFields.ideals}
                        onChange={(e) => setWizardFields({ ...wizardFields, ideals: e.target.value })}
                        rows={5}
                        placeholder="例: 家事がラクで、冬あったかく過ごせる平屋が良い。夫婦共働きなので時短したい。"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ステップ3: 希望条件 */}
              {hearingStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-black text-base text-[#0A192F]">ステップ3: 希望条件（エリア/予算/広さ/築年等）</h4>
                  <p className="text-xs text-gray-500 font-bold">ご希望のエリア、ご予算イメージ、広さや間取り、築年数などの条件をご記入ください。</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">希望物件種別</label>
                      <input 
                        type="text"
                        value={wizardFields.propertyType}
                        onChange={(e) => setWizardFields({ ...wizardFields, propertyType: e.target.value })}
                        placeholder="例: 戸建てリノベーション"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">希望エリア</label>
                      <input 
                        type="text"
                        value={wizardFields.area}
                        onChange={(e) => setWizardFields({ ...wizardFields, area: e.target.value })}
                        placeholder="例: 都城市南鷹尾町周辺、小学校の近く"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">最寄駅・交通</label>
                      <input 
                        type="text"
                        value={wizardFields.station}
                        onChange={(e) => setWizardFields({ ...wizardFields, station: e.target.value })}
                        placeholder="例: 都城駅 車で10分"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">希望間取り・面積</label>
                      <input 
                        type="text"
                        value={wizardFields.layout}
                        onChange={(e) => setWizardFields({ ...wizardFields, layout: e.target.value })}
                        placeholder="例: 3LDK・98.50㎡"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">希望築年数・状態</label>
                      <input 
                        type="text"
                        value={wizardFields.age}
                        onChange={(e) => setWizardFields({ ...wizardFields, age: e.target.value })}
                        placeholder="例: 築30年以内、リノベ向き"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">総予算イメージ</label>
                      <input 
                        type="text"
                        value={wizardFields.budget}
                        onChange={(e) => setWizardFields({ ...wizardFields, budget: e.target.value })}
                        placeholder="例: 2,500万円以内"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ステップ4: MUST/WANT */}
              {hearingStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-black text-base text-[#0A192F]">ステップ4: MUST条件・WANT条件</h4>
                  <p className="text-xs text-gray-500 font-bold">絶対に妥協できない条件（MUST）と、できれば叶えたい条件（WANT）を整理してご記入ください。</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">MUST条件（絶対に譲れない条件）</label>
                      <textarea 
                        value={wizardFields.mustConditions}
                        onChange={(e) => setWizardFields({ ...wizardFields, mustConditions: e.target.value })}
                        rows={6}
                        placeholder="例:&#10;・とにかく暖かい家（高断熱）&#10;・耐震等級3の確保"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">WANT条件（できれば叶えたい条件）</label>
                      <textarea 
                        value={wizardFields.wantConditions}
                        onChange={(e) => setWizardFields({ ...wizardFields, wantConditions: e.target.value })}
                        rows={6}
                        placeholder="例:&#10;・将来部屋を仕切れる可変性&#10;・太陽光発電"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ステップ5: 資金計画 */}
              {hearingStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-black text-base text-[#0A192F]">ステップ5: 資金計画先行フローに基づくスケジュール・概算</h4>
                  <p className="text-xs text-gray-500 font-bold">現在の家賃や購入概算、借入条件、希望時期などを穴埋め形式でご入力ください。</p>
                  
                  {/* 穴埋めインプット群 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">想定物件購入価格（万円）</label>
                      <input 
                        type="number"
                        value={wizardFields.propertyPrice}
                        onChange={(e) => setWizardFields({ ...wizardFields, propertyPrice: e.target.value })}
                        placeholder="例: 1500"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">想定リノベ費用（万円）</label>
                      <input 
                        type="number"
                        value={wizardFields.renovePrice}
                        onChange={(e) => setWizardFields({ ...wizardFields, renovePrice: e.target.value })}
                        placeholder="例: 1000"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">現在の家賃（円）</label>
                      <input 
                        type="number"
                        value={wizardFields.currentRent}
                        onChange={(e) => setWizardFields({ ...wizardFields, currentRent: e.target.value })}
                        placeholder="例: 65000"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">想定借入金利（％）</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={wizardFields.loanRate}
                        onChange={(e) => setWizardFields({ ...wizardFields, loanRate: e.target.value })}
                        placeholder="例: 0.95"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">返済期間（年）</label>
                      <input 
                        type="number"
                        value={wizardFields.loanTerm}
                        onChange={(e) => setWizardFields({ ...wizardFields, loanTerm: e.target.value })}
                        placeholder="例: 35"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 font-bold mb-1.5">希望引渡し時期</label>
                      <input 
                        type="text"
                        value={wizardFields.schedule}
                        onChange={(e) => setWizardFields({ ...wizardFields, schedule: e.target.value })}
                        placeholder="例: 来年の春までに入居"
                        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                      />
                    </div>
                  </div>

                  {/* 備考記入欄 */}
                  <div>
                    <label className="block text-xs text-slate-600 font-bold mb-1.5">備考記入欄</label>
                    <textarea 
                      value={wizardFields.notes}
                      onChange={(e) => setWizardFields({ ...wizardFields, notes: e.target.value })}
                      rows={3}
                      placeholder="例: 宮崎銀行を想定。毎月の返済は今の家賃並みに抑えたい。"
                      className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A05B] font-semibold"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* モーダルフッター */}
            <div className="bg-slate-50 px-6 py-4 border-t flex justify-between">
              <button 
                onClick={() => setHearingStep(prev => Math.max(0, prev - 1))}
                disabled={hearingStep === 0 || isGenerating}
                className="bg-white hover:bg-slate-100 border text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-50 transition"
              >
                ◀ 前へ
              </button>

              {hearingStep < 4 ? (
                <button 
                  onClick={() => setHearingStep(prev => Math.min(4, prev + 1))}
                  className="bg-[#0A192F] hover:bg-[#0A192F]/90 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition"
                >
                  次へ ▶
                </button>
              ) : (
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="bg-[#D9A05B] hover:bg-[#D9A05B]/90 text-[#0A192F] font-bold text-sm px-7 py-2.5 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      AI提案スライド生成中...
                    </>
                  ) : (
                    "🚀 AI提案スライドを生成する"
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 印刷用CSSの注入 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A3 landscape;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            width: 420mm !important;
            height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

    </div>
  );
}
