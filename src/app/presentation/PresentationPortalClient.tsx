"use client";
const defaultDoorTypes = {
  venato: {
    modelName: "長友ホーム推奨：高断熱ドア・外部基本仕様",
    description: "雨と底冷えに強い長寿命な外装\n都城の激しい雨と厳しい寒暖差に対抗するため、外装材には「光セラ」と「高遮熱ガルバ」を推奨。サッシには高品質な樹脂サッシ「APW 330」に加え、世界トップクラスの断熱性を誇るトリプルガラスの「APW 430」も選択可能です。",
    specImage: "/catalog/ヴェナートD30/デザイン一覧.jpg",
    colorImage: "/catalog/ヴェナートD30/カラーバリエーション.jpg",
    materials: [
      { label: "玄関（開き戸）", val: "ヴェナート D30", gradient: "linear-gradient(135deg, #e7c393 0%, #c69b6b 100%)", type: "wood-light" },
      { label: "サッシ（窓）", val: "APW 330 / 430仕様", gradient: "linear-gradient(135deg, #bae6fd 0%, #38bdf8 100%)", type: "glass" },
      { label: "外壁", val: "光セラサイディング", gradient: "#f1f5f9", type: "mortar", border: "1.5px solid #cbd5e1" },
      { label: "屋根", val: "高遮熱ガルバリウム", gradient: "linear-gradient(135deg, #64748b 0%, #334155 100%)", type: "galva" }
    ]
  },
  concord: {
    modelName: "長友ホーム推奨：高断熱引戸・外部基本仕様",
    description: "スライド引戸によるバリアフリー外装\n玄関前にドアが飛び出さない「コンコード S30」はアプローチを広く使え安全です。樹脂サッシ「APW 330/430」による高い断熱性と、高遮熱屋根や高耐久アルミ樋を組み合わせることで、美しく実用的な外装を実現します。",
    specImage: "/catalog/コンコード S30/デザイン一覧.jpg",
    colorImage: "/catalog/コンコード S30/カラーバリエーション.jpg",
    materials: [
      { label: "玄関（引戸）", val: "コンコード S30", gradient: "linear-gradient(135deg, #a27b5c 0%, #5f422e 100%)", type: "wood-dark" },
      { label: "サッシ（窓）", val: "APW 330 / 430仕様", gradient: "linear-gradient(135deg, #bae6fd 0%, #38bdf8 100%)", type: "glass" },
      { label: "外壁", val: "光セラサイディング", gradient: "#f1f5f9", type: "mortar", border: "1.5px solid #cbd5e1" },
      { label: "屋根", val: "高遮熱ガルバリウム", gradient: "linear-gradient(135deg, #64748b 0%, #334155 100%)", type: "galva" }
    ]
  }
};

const defaultPlans = {
  modern: {
    modelName: "Smayell（スマエル）アッシュ・プレーンホワイト仕様",
    description: "開放感溢れる洗練されたモダン空間\nシンプルモダンには、スマエルの「プレーンホワイト（ハイドア）」で縦ラインを強調。壁紙には高品質なサンゲツ・リリカラの防汚・抗菌クロスを標準採用し、コイズミ・オーデリックの温白色LEDが洗練された光のグラデーションを作ります。",
    perspectiveImage: "/interior_modern.png",
    specImage: "/catalog/Smayell/「Vカット木口仕上げ」の拡大写真.jpg",
    specImage2: "/catalog/Smayell/「簡易組み立て枠（固定片）」・「ソフトクローズ」の拡大写真.jpg",
    colorImage1: "/catalog/Smayell/スタンダードカラーバリエーション.jpg",
    colorImage2: "/catalog/Smayell/トレンドカラーバリエーション.jpg",
    features: [
      { label: "室内ドア仕様", val: "ハイドア", desc: "天井高2.4mまで届き、空間を広く見せる" },
      { label: "安全性", val: "ソフトクローズ", desc: "閉まる手前でブレーキがかり静かに閉扉" },
      { label: "高耐久シート", val: "耐傷・防汚", desc: "おもちゃの衝撃や落書きもサッと拭き取り" }
    ],
    materials: [
      { label: "床（居室）", val: "石目調大理石風シート", gradient: "#cbd5e1", type: "mortar" },
      { label: "床（水回り）", val: "CFシート（石目調ホワイト）", gradient: "#fdfdfd", type: "white", border: "1.5px dashed #cbd5e1" },
      { label: "ベース壁紙", val: "サンゲツ/リリカラ プレーンホワイト（標準）", gradient: "#fdfdfd", type: "white" },
      { label: "アクセントクロス", val: "サンゲツ/リリカラ TV背面：モルタル調", gradient: "#94a3b8", type: "tile-gray" },
      { label: "巾木（はばき）", val: "スリムタイプ（ホワイト）", gradient: "#fdfdfd", type: "white", borderBottom: "3px solid #64748b", borderRadius: "2px", height: "18px" },
      { label: "照明プラン", val: "コイズミ/オーデリック 温白色LED標準仕様", gradient: "#f0fdf4", type: "light-neutral", boxShadow: "0 0 6px #22c55e", borderColor: "#22c55e" }
    ]
  },
  natural: {
    modelName: "Smayell（スマエル）ライトチェリー・ナチュラルオーク仕様",
    description: "木の温もりに包まれる心地いい空間\nナチュラルオークには、スマエルの「ライトチェリー」ドアを採用。サンゲツ・リリカラの豊かな質感の織物調クロスをベースに、コイズミ・オーデリックの電球色LEDが家族の団らんを優しく包み込みます。",
    perspectiveImage: "/interior_natural.png",
    specImage: "/catalog/Smayell/「Vカット木口仕上げ」の拡大写真.jpg",
    specImage2: "/catalog/Smayell/「簡易組み立て枠（固定片）」・「ソフトクローズ」の拡大写真.jpg",
    colorImage1: "/catalog/Smayell/スタンダードカラーバリエーション.jpg",
    colorImage2: "/catalog/Smayell/トレンドカラーバリエーション.jpg",
    features: [
      { label: "木調仕上げ", val: "天然木質感", desc: "本物の無垢材のような美しい木目を表現" },
      { label: "静音構造", val: "消音ラッチ", desc: "ガチャガチャと音がせず、静かな開閉音" },
      { label: "豊富なデザイン", val: "スリット採光", desc: "リビングの光を廊下へ優しく通す採光ガラス" }
    ],
    materials: [
      { label: "床（居室）", val: "オーク突板フローリング", gradient: "linear-gradient(135deg, #e7c393 0%, #c69b6b 100%)", type: "wood-light" },
      { label: "床（水回り）", val: "CFシート（テラコッタ調）", gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", type: "terracotta" },
      { label: "ベース壁紙", val: "サンゲツ/リリカラ 織物調生成り（標準）", gradient: "#fafaf0", type: "white" },
      { label: "アクセントクロス", val: "サンゲツ/リリカラ キッチン背面：オリーブ", gradient: "#556b2f", type: "olive" },
      { label: "巾木（はばき）", val: "木調スリムタイプ（オーク）", gradient: "linear-gradient(135deg, #a27b5c 0%, #5f422e 100%)", type: "wood-dark", borderBottom: "3px solid #854d0e", borderRadius: "2px", height: "18px" },
      { label: "照明プラン", val: "コイズミ/オーデリック 電球色LED標準＋ペンダント", gradient: "#ffedd5", type: "light-warm", boxShadow: "0 0 6px #f97316", borderColor: "#f97316" }
    ]
  },
  luxury: {
    modelName: "Smayell（スマエル）シック・ラグジュアリー仕様",
    description: "深みのあるダークウォルナットと石目調のアクセントクロスが織りなす極上のリラックス空間。\nコイズミの調光LEDと間接照明が、夜の贅沢な時間を演出します。",
    perspectiveImage: "/luxury_interior.png",
    specImage: "/catalog/Smayell/「Vカット木口仕上げ」の拡大写真.jpg",
    specImage2: "/catalog/Smayell/「簡易組み立て枠（固定片）」・「ソフトクローズ」の拡大写真.jpg",
    colorImage1: "/catalog/Smayell/スタンダードカラーバリエーション.jpg",
    colorImage2: "/catalog/Smayell/トレンドカラーバリエーション.jpg",
    features: [
      { label: "室内ドア仕様", val: "ハイドア", desc: "天井高2.4mまで届き、空間を広く見せる" },
      { label: "安全性", val: "ソフトクローズ", desc: "閉まる手前でブレーキがかり静かに閉扉" },
      { label: "高耐久シート", val: "耐傷・防汚", desc: "おもちゃの衝撃や落書きもサッと拭き取り" }
    ],
    materials: [
      { label: "床（居室）", val: "ウォルナット突板（ダークオーク）", gradient: "linear-gradient(135deg, #a27b5c 0%, #5f422e 100%)", type: "wood-dark" },
      { label: "床（水回り）", val: "CFシート（ダークストーン調）", gradient: "#334155", type: "mortar", border: "1.5px dashed #cbd5e1" },
      { label: "ベース壁紙", val: "サンゲツ/リリカラ プレーンホワイト（標準）", gradient: "#fdfdfd", type: "white" },
      { label: "アクセントクロス", val: "サンゲツ/リリカラ TV背面：天然石目調", gradient: "#64748b", type: "tile-gray" },
      { label: "巾木（はばき）", val: "木調スリムタイプ（ウォルナット）", gradient: "linear-gradient(135deg, #5f422e 0%, #3f2b1e 100%)", type: "wood-dark", borderBottom: "3px solid #3f2b1e", borderRadius: "2px", height: "18px" },
      { label: "照明プラン", val: "コイズミ/オーデリック 電球色LED調光・間接照明仕様", gradient: "#ffedd5", type: "light-warm", boxShadow: "0 0 6px #f97316", borderColor: "#f97316" }
    ]
  }
};


import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PortalClientProps {
  initialList: Array<{ id: string; clientName: string; planName: string; updatedAt?: number; fullData?: any }>;
}

export default function PresentationPortalClient({ initialList }: PortalClientProps) {
  const router = useRouter();
  const [list, setList] = useState(initialList);
  const [sortKey, setSortKey] = useState<'index' | 'name' | 'id' | 'update'>('index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getFilteredAndSortedList = () => {
    const filtered = list.filter(client => 
      client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.planName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return [...filtered].sort((a, b) => {
      let valA: any;
      let valB: any;
      
      if (sortKey === 'index') {
        valA = initialList.indexOf(a);
        valB = initialList.indexOf(b);
      } else if (sortKey === 'name') {
        valA = a.clientName;
        valB = b.clientName;
        const res = valA.localeCompare(valB, 'ja');
        return sortOrder === 'asc' ? res : -res;
      } else if (sortKey === 'id') {
        valA = a.id;
        valB = b.id;
      } else if (sortKey === 'update') {
        valA = a.updatedAt || 0;
        valB = b.updatedAt || 0;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // 動的パターンのステート
  const [doorTypes, setDoorTypes] = useState<any>(defaultDoorTypes);
  const [plans, setPlans] = useState<any>(defaultPlans);

  // パターンの動的編集用ハンドラー
  const updateDoorType = (key: string, field: string, value: any) => {
    setDoorTypes((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const addDoorType = () => {
    const newKey = `custom_door_${Date.now()}`;
    setDoorTypes((prev: any) => ({
      ...prev,
      [newKey]: {
        modelName: "新規追加の玄関ドア仕様",
        description: "新しい玄関ドア・外部仕様の説明を記入します。",
        specImage: "/catalog/ヴェナートD30/デザイン一覧.jpg",
        colorImage: "/catalog/ヴェナートD30/カラーバリエーション.jpg",
        materials: [
          { label: "玄関ドア", val: "新規ドア仕様", gradient: "#e7c393", type: "wood-light" },
          { label: "サッシ（窓）", val: "APW 330/430仕様", gradient: "#bae6fd", type: "glass" },
          { label: "外壁", val: "光セラサイディング", gradient: "#f1f5f9", type: "mortar", border: "1.5px solid #cbd5e1" },
          { label: "屋根", val: "高遮熱ガルバリウム", gradient: "linear-gradient(135deg, #64748b 0%, #334155 100%)", type: "galva" }
        ]
      }
    }));
  };

  const removeDoorType = (key: string) => {
    if (Object.keys(doorTypes).length <= 1) {
      alert("これ以上削除できません。少なくとも1つの外装パターンが必要です。");
      return;
    }
    const updated = { ...doorTypes };
    delete updated[key];
    setDoorTypes(updated);
  };

  const updatePlan = (key: string, field: string, value: any) => {
    setPlans((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const addPlan = () => {
    const newKey = `custom_plan_${Date.now()}`;
    setPlans((prev: any) => ({
      ...prev,
      [newKey]: {
        modelName: "新規追加の内装コーディネート仕様",
        description: "新しい内装スタイルの説明を記入します。",
        perspectiveImage: "/interior_modern.png",
        specImage: "/catalog/Smayell/「Vカット木口仕上げ」の拡大写真.jpg",
        specImage2: "/catalog/Smayell/「簡易組み立て枠（固定片）」・「ソフトクローズ」の拡大写真.jpg",
        colorImage1: "/catalog/Smayell/スタンダードカラーバリエーション.jpg",
        colorImage2: "/catalog/Smayell/トレンドカラーバリエーション.jpg",
        features: [
          { label: "室内ドア仕様", val: "ハイドア", desc: "天井高2.4mまで届き、空間を広く見せる" },
          { label: "安全性", val: "ソフトクローズ", desc: "閉まる手前でブレーキがかり静かに閉扉" },
          { label: "高耐久シート", val: "耐傷・防汚", desc: "おもちゃの衝撃や落書きもサッと拭き取り" }
        ],
        materials: [
          { label: "床（居室）", val: "突板フローリング", gradient: "#e7c393", type: "wood-light" },
          { label: "床（水回り）", val: "CFシート", gradient: "#f97316", type: "terracotta" },
          { label: "ベース壁紙", val: "標準クロス", gradient: "#fdfdfd", type: "white" },
          { label: "アクセントクロス", val: "アクセント壁紙", gradient: "#94a3b8", type: "tile-gray" },
          { label: "巾木（はばき）", val: "スリム巾木", gradient: "#cbd5e1", type: "white", borderBottom: "3px solid #cbd5e1", borderRadius: "2px", height: "18px" },
          { label: "照明プラン", val: "LED照明仕様", gradient: "#f0fdf4", type: "light-neutral" }
        ]
      }
    }));
  };

  const removePlan = (key: string) => {
    if (Object.keys(plans).length <= 1) {
      alert("これ以上削除できません。少なくとも1つの内装パターンが必要です。");
      return;
    }
    const updated = { ...plans };
    delete updated[key];
    setPlans(updated);
  };

  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 編集・複製モード用の管理ステート
  const [isEditing, setIsEditing] = useState(false);
  const [originalCustomerId, setOriginalCustomerId] = useState("");

  // GitHub画像フォルダ自動連携用のステート (デフォルト値をnagatomo-home-admin/vr-viewer/customersに変更)
  const [githubOwner, setGithubOwner] = useState("nagatomo-home-admin");
  const [githubRepo, setGithubRepo] = useState("vr-viewer");
  const [githubParentPath, setGithubParentPath] = useState("customers");
  const [githubFolder, setGithubFolder] = useState("");
  const [githubImages, setGithubImages] = useState<Array<{ name: string; path: string; downloadUrl: string }>>([]);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubError, setGithubError] = useState("");

  // フォルダ一覧（お施主様タブ）用ステート
  const [githubFolders, setGithubFolders] = useState<Array<{ name: string; path: string }>>([]);
  const [isFetchingFolders, setIsFetchingFolders] = useState(false);
  const [showGithubSettings, setShowGithubSettings] = useState(false); // アコーディオンの開閉状態

  // --- 新規登録フォーム用のステート ---
  const [customerId, setCustomerId] = useState("");
  const [clientName, setClientName] = useState("");
  const [planName, setPlanName] = useState("リノベーションご提案プラン [平屋]");
  const [conceptTitle, setConceptTitle] = useState("共働き夫婦が、お互いの時間を尊重しながら\n自然に家事が半分になる平屋の住まい");
  const [conceptSubtitle, setConceptSubtitle] = useState("NAGATOMO HOME CONCEPT");
  const [vrImageA, setVrImageA] = useState("");
  const [vrImageB, setVrImageB] = useState("");
  const [vrFolder, setVrFolder] = useState("");
  
  const [story1Title, setStory1Title] = useState("「ただいま」から10秒でキッチンへ");
  const [story1Desc, setStory1Desc] = useState("玄関から土間クローゼットを通って、直接キッチン・パントリーへと抜けられる裏動線を設計。買い物後の重い荷物を最短で収納できます。");
  const [story2Title, setStory2Title] = useState("部屋干しもアイロンも一箇所で完了");
  const [story2Desc, setStory2Desc] = useState("脱衣所からファミリークローゼットへ最短でアクセス。洗濯、干す、畳む、しまう動作が歩数に換算してわずか「5歩」で完結します。");
  const [story3Title, setStory3Title] = useState("可変間仕切りで将来の子供部屋にも対応");
  const [story3Desc, setStory3Desc] = useState("子どもが小さい間は大きなプレイスペースとして使い、将来は壁（可変間仕切り）で2つの個室に分けられる成長に合わせた設計です。");

  // マテリアルカラー
  const [wallColor, setWallColor] = useState("#f1f5f9"); // 外壁色
  const [roofColor, setRoofColor] = useState("linear-gradient(135deg, #64748b 0%, #334155 100%)"); // 屋根（ガルバ調）
  const [floorLiving, setFloorLiving] = useState("オーク突板フローリング");
  const [floorLivingColor, setFloorLivingColor] = useState("linear-gradient(135deg, #e7c393 0%, #c69b6b 100%)");
  const [floorCF, setFloorCF] = useState("CFシート（テラコッタ調）");
  const [floorCFColor, setFloorCFColor] = useState("linear-gradient(135deg, #f97316 0%, #ea580c 100%)");

  const [exteriorImg, setExteriorImg] = useState("/luxury_exterior.png");
  const [beforeFloorplanImg, setBeforeFloorplanImg] = useState("");
  const [afterFloorplanImg, setAfterFloorplanImg] = useState("");
  const [elevationImg, setElevationImg] = useState("");
  const [interiorModernImg, setInteriorModernImg] = useState("/interior_modern.png");
  const [interiorNaturalImg, setInteriorNaturalImg] = useState("/interior_natural.png");
  const [imageBaseUrl, setImageBaseUrl] = useState("");

  // localStorageから設定をロードする効果
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      let savedOwner = localStorage.getItem("github_owner");
      let savedRepo = localStorage.getItem("github_repo");
      let savedParent = localStorage.getItem("github_parent_path");
      
      // 古い間違ったデフォルト設定が保存されている場合は、新しい正しいデフォルト設定に強制移行（マイグレーション）する
      if (savedOwner === "shogo-nagatomo" || savedRepo === "renovation-images" || !savedOwner) {
        savedOwner = "nagatomo-home-admin";
        savedRepo = "vr-viewer";
        savedParent = "customers";
        // localStorageを更新
        localStorage.setItem("github_owner", savedOwner);
        localStorage.setItem("github_repo", savedRepo);
        localStorage.setItem("github_parent_path", savedParent);
      }
      
      setGithubOwner(savedOwner || "nagatomo-home-admin");
      setGithubRepo(savedRepo || "vr-viewer");
      setGithubParentPath(savedParent || "customers");
    }
  }, []);

  // 所有者・リポジトリ名・親パスが変更されたときに自動的にフォルダ一覧を取得
  React.useEffect(() => {
    if (githubOwner.trim() && githubRepo.trim()) {
      handleFetchFolders();
    }
  }, [githubOwner, githubRepo, githubParentPath]);

  // フォルダ一覧を取得する処理
  const handleFetchFolders = async () => {
    setGithubError("");
    setIsFetchingFolders(true);
    try {
      const cleanParent = githubParentPath.trim();
      const url = `/api/presentation/github-contents?owner=${encodeURIComponent(githubOwner.trim())}&repo=${encodeURIComponent(githubRepo.trim())}&path=${encodeURIComponent(cleanParent)}&mode=dirs`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setGithubFolders(data.dirs || []);
        // スキャンに成功したら設定をlocalStorageに保存
        localStorage.setItem("github_owner", githubOwner.trim());
        localStorage.setItem("github_repo", githubRepo.trim());
        localStorage.setItem("github_parent_path", githubParentPath.trim());
      } else {
        setGithubError(data.error || "GitHubリポジトリ内のフォルダ一覧の取得に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      setGithubError("GitHubとの通信中にエラーが発生しました。");
    } finally {
      setIsFetchingFolders(false);
    }
  };

  // 画像URL結合ヘルパー
  const combineImageUrl = (base: string, path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
      return path;
    }
    if (!base) return path;
    const cleanBase = base.endsWith("/") ? base : base + "/";
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return cleanBase + cleanPath;
  };

  // GitHubのURLからリポジトリ情報とフォルダ名を解析するヘルパー
  const parseGithubUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/[^\/]+\/(.+)\/[^\/]+$/);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      const fullPath = match[3];
      const lastSlash = fullPath.lastIndexOf("/");
      let parent = "";
      let folder = fullPath;
      if (lastSlash !== -1) {
        parent = fullPath.substring(0, lastSlash);
        folder = fullPath.substring(lastSlash + 1);
      }
      return { owner, repo, parent, folder };
    }
    return null;
  };

  // GitHubからフォルダ内の画像一覧を取得する処理 (タブ連動用)
  const handleFetchGithubImages = async (targetFolder?: string) => {
    const folderToScan = targetFolder || githubFolder.trim();
    setGithubError("");
    setGithubImages([]);
    
    if (!githubOwner.trim() || !githubRepo.trim() || !folderToScan) {
      setGithubError("GitHub所有者名、リポジトリ名、対象フォルダ名は必須です。");
      return;
    }

    setIsFetchingGithub(true);

    const cleanParent = githubParentPath.trim();
    let fullPath = "";
    if (cleanParent) {
      fullPath = cleanParent.endsWith("/") ? cleanParent + folderToScan : cleanParent + "/" + folderToScan;
    } else {
      fullPath = folderToScan;
    }

    try {
      const url = `/api/presentation/github-contents?owner=${encodeURIComponent(githubOwner.trim())}&repo=${encodeURIComponent(githubRepo.trim())}&path=${encodeURIComponent(fullPath)}&mode=images`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setGithubImages(data.images || []);
        if (data.images.length === 0) {
          setGithubError("指定フォルダ内に画像ファイル（PNG/JPG/WEBP等）が見つかりませんでした。");
        }
      } else {
        setGithubError(data.error || "GitHubからのフォルダ取得に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      setGithubError("GitHubとの通信中にエラーが発生しました。");
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // タブ選択時にフォルダをセットし、画像を自動スキャンするハンドラ
  const handleSelectFolderTab = (folderName: string) => {
    setGithubFolder(folderName);
    setVrFolder(folderName); // パノラマVR用GitHubフォルダ名にも連動して自動セット
    handleFetchGithubImages(folderName);
  };

  // 指定の画像役割（アサイン先）にURLを自動セットする処理
  const handleAssignImage = (role: string, downloadUrl: string) => {
    const fileName = downloadUrl.substring(downloadUrl.lastIndexOf("/") + 1);
    switch (role) {
      case "exterior":
        setExteriorImg(downloadUrl);
        break;
      case "elevation":
        setElevationImg(downloadUrl);
        break;
      case "beforeFloorplan":
        setBeforeFloorplanImg(downloadUrl);
        break;
      case "afterFloorplan":
        setAfterFloorplanImg(downloadUrl);
        break;
      case "interiorModern":
        setInteriorModernImg(downloadUrl);
        break;
      case "interiorNatural":
        setInteriorNaturalImg(downloadUrl);
        break;
      case "vrImageA":
        setVrImageA(fileName); // VRパノラマ画像はファイル名のみをアサイン
        if (githubFolder) setVrFolder(githubFolder);
        break;
      case "vrImageB":
        setVrImageB(fileName); // VRパノラマ画像はファイル名のみをアサイン
        if (githubFolder) setVrFolder(githubFolder);
        break;
      default:
        break;
    }
  };

  // 画像が現在どの役割に割り当てられているかを検出するヘルパー（セレクトボックスの初期値用）
  const getAssignedRole = (downloadUrl: string) => {
    const fileName = downloadUrl.substring(downloadUrl.lastIndexOf("/") + 1);
    if (exteriorImg === downloadUrl) return "exterior";
    if (elevationImg === downloadUrl) return "elevation";
    if (beforeFloorplanImg === downloadUrl) return "beforeFloorplan";
    if (afterFloorplanImg === downloadUrl) return "afterFloorplan";
    if (interiorModernImg === downloadUrl) return "interiorModern";
    if (interiorNaturalImg === downloadUrl) return "interiorNatural";
    if (vrImageA === fileName || downloadUrl.endsWith("/" + vrImageA)) return "vrImageA";
    if (vrImageB === fileName || downloadUrl.endsWith("/" + vrImageB)) return "vrImageB";
    return "";
  };

  // フォームフィールドのリセット処理
  const resetFormFields = () => {
    setCustomerId("");
    setClientName("");
    setPlanName("リノベーションご提案プラン [平屋]");
    setConceptTitle("共働き夫婦が、お互いの時間を尊重しながら\n自然に家事が半分になる平屋の住まい");
    setConceptSubtitle("NAGATOMO HOME CONCEPT");
    setStory1Title("「ただいま」から10秒でキッチンへ");
    setStory1Desc("玄関から土間クローゼットを通って、直接キッチン・パントリーへと抜けられる裏動線を設計。買い物後の重い荷物を最短で収納できます。");
    setStory2Title("部屋干しもアイロンも一箇所で完了");
    setStory2Desc("脱衣所からファミリークローゼットへ最短でアクセス。洗濯、干す、畳む、しまう動作が歩数に換算してわずか「5歩」で完結します。");
    setStory3Title("可変間仕切りで将来の子供部屋にも対応");
    setStory3Desc("子どもが小さい間は大きなプレイスペースとして使い、将来は壁（可変間仕切り）で2つの個室に分けられる成長に合わせた設計です。");
    setWallColor("#f1f5f9");
    setRoofColor("linear-gradient(135deg, #64748b 0%, #334155 100%)");
    setFloorLiving("オーク突板フローリング");
    setFloorLivingColor("linear-gradient(135deg, #e7c393 0%, #c69b6b 100%)");
    setFloorCF("CFシート（テラコッタ調）");
    setFloorCFColor("linear-gradient(135deg, #f97316 0%, #ea580c 100%)");
    setExteriorImg("/luxury_exterior.png");
    setBeforeFloorplanImg("");
    setAfterFloorplanImg("");
    setElevationImg("");
    setInteriorModernImg("/interior_modern.png");
    setInteriorNaturalImg("/interior_natural.png");
    setImageBaseUrl("");
    setVrImageA("");
    setVrImageB("");
    setVrFolder("");
    setIsEditing(false);
    setOriginalCustomerId("");

    // GitHub関連リセット
    setGithubFolder("");
    setGithubImages([]);
    setGithubError("");
    setDoorTypes(defaultDoorTypes);
    setPlans(defaultPlans);
  };

  // 新規プラン作成ボタンのクリックハンドラ
  const handleNewPlanClick = () => {
    if (showForm && isEditing) {
      resetFormFields();
      setIsEditing(false);
      setShowForm(true);
    } else {
      setShowForm(!showForm);
      if (!showForm) {
        resetFormFields();
      }
    }
  };

  // 編集ボタンのクリックハンドラ
  const handleEditClick = (e: React.MouseEvent, client: any) => {
    e.preventDefault();
    e.stopPropagation();

    const data = client.fullData || {};
    setCustomerId(client.id);
    setOriginalCustomerId(client.id);
    setClientName(data.clientName || client.clientName || "");
    setPlanName(data.planName || client.planName || "");
    setConceptTitle(data.concept?.title || "");
    setConceptSubtitle(data.concept?.subtitle || "");
    
    setStory1Title(data.stories?.[0]?.title || "");
    setStory1Desc(data.stories?.[0]?.desc || "");
    setStory2Title(data.stories?.[1]?.title || "");
    setStory2Desc(data.stories?.[1]?.desc || "");
    setStory3Title(data.stories?.[2]?.title || "");
    setStory3Desc(data.stories?.[2]?.desc || "");

    const venatoMaterials = data.exteriorSpec?.doorTypes?.venato?.materials || [];
    const wallMat = venatoMaterials.find((m: any) => m.label.includes("外壁"));
    const roofMat = venatoMaterials.find((m: any) => m.label.includes("屋根"));
    setWallColor(wallMat?.gradient || "#f1f5f9");
    setRoofColor(roofMat?.gradient || "linear-gradient(135deg, #64748b 0%, #334155 100%)");

    const naturalMaterials = data.interiorSpec?.plans?.natural?.materials || [];
    const floorLivingMat = naturalMaterials.find((m: any) => m.label.includes("床（居室）"));
    const floorCFMat = naturalMaterials.find((m: any) => m.label.includes("床（水回り）"));
    setFloorLiving(floorLivingMat?.val || "オーク突板フローリング");
    setFloorLivingColor(floorLivingMat?.gradient || "linear-gradient(135deg, #e7c393 0%, #c69b6b 100%)");
    setFloorCF(floorCFMat?.val || "CFシート（テラコッタ調）");
    setFloorCFColor(floorCFMat?.gradient || "linear-gradient(135deg, #f97316 0%, #ea580c 100%)");

    setExteriorImg(data.assets?.exterior || "/luxury_exterior.png");
    setBeforeFloorplanImg(data.assets?.beforeFloorplan || "");
    setAfterFloorplanImg(data.assets?.afterFloorplan || "");
    setElevationImg(data.assets?.elevation || "");
    setInteriorModernImg(data.assets?.interiorModern || "/interior_modern.png");
    setInteriorNaturalImg(data.assets?.interiorNatural || "/interior_natural.png");
    setImageBaseUrl("");
    setVrImageA(data.vrImageA || "");
    setVrImageB(data.vrImageB || "");
    setVrFolder(data.vrFolder || "");
    setDoorTypes(data.exteriorSpec?.doorTypes || defaultDoorTypes);
    setPlans(data.interiorSpec?.plans || defaultPlans);

    // GitHub画像URLの自動解析とフォームへの反映
    const targetUrl = data.assets?.beforeFloorplan || data.assets?.afterFloorplan || data.assets?.elevation || data.assets?.exterior;
    if (targetUrl) {
      const parsedInfo = parseGithubUrl(targetUrl);
      if (parsedInfo) {
        setGithubOwner(parsedInfo.owner);
        setGithubRepo(parsedInfo.repo);
        setGithubParentPath(parsedInfo.parent);
        setGithubFolder(parsedInfo.folder);
      }
    }

    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 複製ボタンのクリックハンドラ
  const handleDuplicateClick = async (e: React.MouseEvent, client: any) => {
    e.preventDefault();
    e.stopPropagation();

    const newId = prompt(
      `『${client.clientName}様』のプランを複製します。\n複製先の新しい顧客IDを入力してください。\n（半角英数字、ハイフン、アンダースコアのみ）`,
      `${client.id}-copy`
    );

    if (!newId) return;

    const safeNewId = newId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (safeNewId !== newId || newId === "") {
      alert("IDの形式が正しくありません。");
      return;
    }

    if (list.some(c => c.id === safeNewId)) {
      alert("その顧客IDは既に存在しています。");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const duplicatedData = {
      ...client.fullData,
      clientName: `${client.fullData.clientName || client.clientName} (コピー)`
    };

    try {
      const res = await fetch("/api/presentation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: safeNewId,
          data: duplicatedData
        })
      });

      const resData = await res.json();
      if (res.ok) {
        const newClient = {
          id: safeNewId,
          clientName: duplicatedData.clientName.replace("様邸", "").replace("様", ""),
          planName: duplicatedData.planName || "提案プラン",
          fullData: duplicatedData
        };
        setList(prev => [...prev, newClient]);
        alert("複製が完了しました！");
      } else {
        alert(resData.error || "複製データの保存に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除ボタンのクリックハンドラ
  const handleDeleteClick = async (e: React.MouseEvent, customerId: string, clientName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`本当に『${clientName}様』のプラン（ID: ${customerId}）を削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/presentation/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId })
      });

      const resData = await res.json();
      if (res.ok) {
        setList(prev => prev.filter(c => c.id !== customerId));
        alert("削除が完了しました。");
      } else {
        alert(resData.error || "削除に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedId = customerId.trim();
    if (!trimmedId || !clientName.trim() || !planName.trim()) {
      setErrorMsg("ID、お施主様名、プラン名は必須です。");
      return;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedId)) {
      setErrorMsg("IDは半角英数字、ハイフン、アンダースコアのみで入力してください。");
      return;
    }

    // 編集モードでIDが変更された場合（名前を付けて保存/リネーム）
    let deleteOriginal = false;
    if (isEditing && trimmedId !== originalCustomerId) {
      const choice = confirm(
        `顧客IDが元のID（${originalCustomerId}）から変更されています。\n\n・「OK」を押すと、元のプランを削除して「名前を変更して保存（別名保存）」します。\n・「キャンセル」を押すと、元のプランを残して「新しくコピーを保存（複製）」します。`
      );
      if (choice) {
        deleteOriginal = true;
      }
    }

    setIsSubmitting(true);

    // デフォルトのテンプレート構成をベースにした送信データ
    const postData = {
      clientName,
      planName,
      vrImageA,
      vrImageB,
      vrFolder,
      selectedDoor: "venato",
      selectedInterior: "modern",
      selectedEquipment: "lixil",
      selectedEquipmentGrade: "standard",
      selectedSash: "apw330",
      concept: {
        subtitle: conceptSubtitle,
        title: conceptTitle
      },
      stories: [
        { num: 1, title: story1Title, desc: story1Desc },
        { num: 2, title: story2Title, desc: story2Desc },
        { num: 3, title: story3Title, desc: story3Desc }
      ],
      beforeFloorplan: {
        subtitle: "細切れで家事動線が分断された古い平屋",
        rooms: [
          { name: "DK", size: "8.0帖", col: "1 / 3", row: "1 / 2", bgClass: "before-room-dk" },
          { name: "洗面", size: "", col: "3 / 4", row: "1 / 2", bgClass: "before-room-wash" },
          { name: "玄関", size: "", col: "4 / 5", row: "1 / 2", bgClass: "before-room-entrance" },
          { name: "長い廊下（家事動線の分断）", size: "", col: "1 / 4", row: "2 / 3", bgClass: "before-room-corridor" },
          { name: "浴室", size: "", col: "4 / 5", row: "2 / 3", bgClass: "before-room-bath" },
          { name: "和室", size: "6.0帖", col: "1 / 3", row: "3 / 4", bgClass: "before-room-japanese1" },
          { name: "和室", size: "8.0帖", col: "3 / 5", row: "3 / 4", bgClass: "before-room-japanese2" }
        ]
      },
      afterFloorplan: {
        rooms: [
          { name: "LDK", size: "21.0帖", col: "1 / 4", row: "1 / 3", bgClass: "room-ldk" },
          { name: "和室", size: "6.0帖", col: "4 / 5", row: "1 / 2", bgClass: "room-tatami" },
          { name: "洗面・脱衣", size: "", col: "4 / 5", row: "2 / 3", bgClass: "room-wc" },
          { name: "玄関", size: "", col: "1 / 2", row: "3 / 4", bgClass: "room-entrance" },
          { name: "土間収納", size: "", col: "2 / 4", row: "3 / 4", bgClass: "room-doma" },
          { name: "浴室", size: "", col: "4 / 5", row: "3 / 4", bgClass: "room-bath" }
        ]
      },
      exteriorSpec: {
        title: "🏡 ご提案仕様：外部・断熱パッケージ",
        sashTypes: {
          apw330: {
            name: "APW 330 (樹脂ダブルガラス仕様)",
            ua: "0.46",
            level: "等級6 (アルミ樹脂複合比: 2倍暖)",
            description: "長友ホームの標準仕様である高品質オール樹脂サッシ。\n都城の寒暖差にしっかり対応し、冬の嫌な結露を防ぎます。",
            apwSpecImage: "/catalog/APW430/トリプルガラスの断面構造図.jpg"
          },
          apw430: {
            name: "APW 430 (極暖トリプルガラス仕様)",
            ua: "0.33",
            level: "等級7 (世界最高クラス断熱)",
            description: "世界トップクラスの断熱性能を誇るトリプルガラスサッシ。\n熱損失をほぼ完全にシャットアウトし、冬の底冷えを劇的に解消します。",
            apwSpecImage: "/catalog/APW430/トリプルガラスの断面構造図.jpg"
          },
          madoremo: {
            name: "かんたんマドリモ (リフォーム窓)",
            ua: "0.46",
            level: "等級6相当 (カバー工法・樹脂Low-E複層窓)",
            description: "今ある窓枠の上から新しい樹脂窓をかぶせるカバー工法。\n壁を壊さずスピーディに、住まいの断熱性能を劇的に向上させます。",
            apwSpecImage: "/catalog/マドリモ/マドリモ_上部.png"
          }
        },
        doorTypes: (() => {
          const updated = { ...doorTypes };
          // 既存の venato/concord などがあれば外壁と屋根をフォームの入力値でマージ
          Object.keys(updated).forEach((k: any) => {
            if (updated[k].materials) {
              updated[k].materials = updated[k].materials.map((m: any) => {
                if (m.label.includes("外壁")) return { ...m, gradient: wallColor };
                if (m.label.includes("屋根")) return { ...m, gradient: roofColor };
                return m;
              });
            }
          });
          return updated;
        })(),
        conditions: [
          { label: "敷地面積", val: "200.50 ㎡" },
          { label: "延床面積", val: "98.50 ㎡ (29.7坪)" },
          { label: "断熱等級", val: "等級6 (Ua値: 0.38)" },
          { label: "主要構造", val: "木造軸組工法（耐震等級3）" },
          { label: "基本サッシ", val: "APW 330 / 430 (樹脂ダブル/トリプル)" }
        ]
      },
      interiorSpec: {
        title: "🚪 長友ホーム標準建具：Smayell（スマエル）",
        floorTypes: {
          standard: {
            name: "ikuta 銘木フロアー\nラスティック ナラ樫",
            description: "天然木ならではの豊かな表情と温かみを持ち、\nラスティック塗装により傷や汚れに強い\n高品質な複合フローリング。",
            image: "/catalog/floor/ikuta_floor.jpg"
          },
          premium: {
            name: "チャネルオリジナル\nユニシリーズ オーク（カントリー）",
            description: "オーク無垢材ならではの豊かな節や\n経年変化が楽しめる、足ざわりが極めて\n心地よい本物の無垢フローリング。",
            image: "/catalog/floor/channel_floor.jpg"
          }
        },
        plans: (() => {
          const updated = { ...plans };
          // natural / luxury などのプランの床材・カラーチップをフォームの入力値でマージ
          Object.keys(updated).forEach((k: any) => {
            if (updated[k].materials) {
              updated[k].materials = updated[k].materials.map((m: any) => {
                if (m.label.includes("床（居室）")) return { ...m, val: floorLiving, gradient: floorLivingColor };
                if (m.label.includes("床（水回り）")) return { ...m, val: floorCF, gradient: floorCFColor };
                return m;
              });
            }
          });
          return updated;
        })()
      },
      equipmentSpec: {
        title: "🚿 ご提案仕様：水回り設備パッケージ",
        makers: {
          lixil: {
            badge: "LIXIL",
            grades: {
              standard: {
                name: "LIXIL（リクシル）スタンダードパッケージ",
                description: "デザイン性と使いやすさを両立した標準仕様。\nお手入れがしやすい「アレスタ」キッチンや、冷めにくいサーモバス付「アライズ」システムバスが毎日の家事を豊かに支えます。",
                features: [
                  { label: "キッチン", val: "アレスタ仕様", desc: "お手入れしやすい人造大理石カウンター" },
                  { label: "お風呂", val: "アライズ", desc: "サーモバスS＆キレイサーモフロアでいつも快適" },
                  { label: "洗面化粧台", val: "キレイアップ水栓", desc: "水栓まわりに水がたまらず衛生的で掃除が楽" },
                  { label: "トイレ", val: "ベーシア仕様", desc: "フチレス形状でお掃除が簡単なシャワートイレ" }
                ],
                specs: [
                  { label: "システムキッチン", val: "LIXIL アレスタ" },
                  { label: "加熱機器", val: "3口IHヒーター（無水両面焼）" },
                  { label: "システムバス", val: "LIXIL アライズ (1616)" },
                  { label: "洗面化粧台", val: "LIXIL ルミシス (スタンダード)" },
                  { label: "トイレ設備", val: "LIXIL ベーシア (シャワートイレ)" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              },
              premium: {
                name: "LIXIL（リクシル）プレミアムデラックスパッケージ",
                description: "セラミック天板と肩湯による圧倒的な高級感。\nLIXILの強みはデザイン性と先進の高級機能です。「リシェル」のセラミック天板は調理効率を高め、「スパージュ」の肩湯はお施主様の毎日の疲れを最高にリセットします。",
                features: [
                  { label: "キッチン", val: "セラミックトップ", desc: "熱や傷に極めて強く、直接包丁も使える高級天板「リシェル」" },
                  { label: "お風呂", val: "スパージュ（肩湯）", desc: "首から温かいお湯が流れる極上の温泉入浴体験" },
                  { label: "洗面化粧台", val: "キレイアップ水栓", desc: "上から吐水され、水栓まわりに水がたまらず衛生的" },
                  { label: "トイレ", val: "サティスG", desc: "アクアセラミック。汚れがつかずお掃除簡単な便器" }
                ],
                specs: [
                  { label: "システムキッチン", val: "LIXIL リシェル (セラミック)" },
                  { label: "加熱機器", val: "3口IHヒーター（無水両面焼）" },
                  { label: "システムバス", val: "LIXIL スパージュ (1616)" },
                  { label: "洗面化粧台", val: "LIXIL ルミシス (フロート)" },
                  { label: "トイレ設備", val: "LIXIL サティスG (タンクレス)" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              }
            }
          },
          toto: {
            badge: "TOTO",
            grades: {
              standard: {
                name: "TOTO（トートー）スタンダードパッケージ",
                description: "お掃除のしやすさと高い基本性能が魅力の標準仕様。\n「ミッテ」のすべり台シンクや、冬でも心地よい「サザナ」魔法びん浴槽が快適なバスライフを実現します。",
                features: [
                  { label: "キッチン", val: "ミッテ仕様", desc: "水もゴミもスイスイ流れる「すべり台シンク」" },
                  { label: "お風呂", val: "サザナ仕様", desc: "「ほっカラリ床」と「魔法びん浴槽」が標準搭載" },
                  { label: "洗面化粧台", val: "サクア仕様", desc: "ひろびろ陶器ボウル。作業がしやすくお掃除も楽" },
                  { label: "トイレ", val: "ZJ2仕様", desc: "クリーン便座。汚れをはじくはっ水素材の便座" }
                ],
                specs: [
                  { label: "システムキッチン", val: "TOTO ミッテ (人工大理石)" },
                  { label: "加熱機器", val: "3口IHヒーター（標準）" },
                  { label: "システムバス", val: "TOTO サザナ (1616)" },
                  { label: "洗面化粧台", val: "TOTO サクア" },
                  { label: "トイレ設備", val: "TOTO ZJ2 (一体型)" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              },
              premium: {
                name: "TOTO（トートー）プレミアムデラックスパッケージ",
                description: "『きれい除菌水』と『ほっカラリ床』による抜群の清掃性。\nTOTOは衛生技術と使いやすさで圧倒的な信頼性があります。除菌水による自動除菌と、冬でもヒヤッとしない柔らかい「ほっカラリ床」は、日々の家事ストレスを劇的に減らします。",
                features: [
                  { label: "キッチン", val: "クリスタル天板", desc: "ザ・クラッソ。光を美しく通す透明感と高い耐久性" },
                  { label: "お風呂", val: "ほっカラリ床", desc: "シンラ。畳のように柔らかく、冬でもヒヤッとしない床" },
                  { label: "洗面化粧台", val: "きれい除菌水", desc: "オクターブ。除菌水で排水口のヌメリと汚れを自動防止" },
                  { label: "トイレ", val: "ネオレスト", desc: "最高峰タンクレス。便器きれい・においきれいで清潔" }
                ],
                specs: [
                  { label: "システムキッチン", val: "TOTO ザ・クラッソ (クリスタル)" },
                  { label: "加熱機器", val: "3口ワイドIHヒーター" },
                  { label: "システムバス", val: "TOTO シンラ (ほっカラリ床)" },
                  { label: "洗面化粧台", val: "TOTO オクターブ (除菌水)" },
                  { label: "トイレ設備", val: "TOTO ネオレストLS (タンクレス)" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              }
            }
          },
          panasonic: {
            badge: "Panasonic",
            grades: {
              standard: {
                name: "Panasonic（パナソニック）スタンダードパッケージ",
                description: "使い勝手の良さと先進の家電系技術が融合した標準仕様。\nスゴピカ素材を採用したキッチンシンクや、暖かさが持続するシステムバスが快適です。",
                features: [
                  { label: "キッチン", val: "ラクシーナ仕様", desc: "スゴピカ素材（有機ガラス系）で水アカがつきにくい" },
                  { label: "お風呂", val: "オフローラ", desc: "保温浴槽。スゴピカ水栓やLED照明を標準装備" },
                  { label: "洗面化粧台", val: "シーライン", desc: "子育てしやすい「洗面マルチシングルレバー水栓」" },
                  { label: "トイレ", val: "アラウーノS160", desc: "激落ちバブル。泡でお掃除するスタンダードアラウーノ" }
                ],
                specs: [
                  { label: "システムキッチン", val: "Panasonic ラクシーナ" },
                  { label: "加熱機器", val: "3口IHヒーター（標準）" },
                  { label: "システムバス", val: "Panasonic オフローラ (1616)" },
                  { label: "洗面化粧台", val: "Panasonic シーライン" },
                  { label: "トイレ設備", val: "Panasonic アラウーノS160" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              },
              premium: {
                name: "Panasonic（パナソニック）プレミアムデラックスパッケージ",
                description: "トリプルワイドIHと有機ガラス浴槽による機能性。\nパナソニックは先進の家電技術と機能的デザインが特徴です。3口横並びの「トリプルワイドIH」は調理効率を劇的に高め、有機ガラス系の「スゴピカ浴槽」や泡で洗う「アラウーノ」で家事楽を実現します。",
                features: [
                  { label: "キッチン", val: "トリプルワイドIH", desc: "ラクシーナ。IHが3口横並び。2人並んで調理可能" },
                  { label: "お風呂", val: "スゴピカ浴槽", desc: "ビバス。有機ガラス系新素材で、汚れがつきにくくお掃除楽" },
                  { label: "洗面化粧台", val: "ツインラインLED", desc: "Lクラス。縦型のライトが顔全体を影なく明るく照らす" },
                  { label: "トイレ", val: "アラウーノ L150", desc: "流すたびに市販の中性洗剤の泡で自動お掃除するトイレ" }
                ],
                specs: [
                  { label: "システムキッチン", val: "Panasonic ラクシーナ" },
                  { label: "加熱機器", val: "トリプルワイドIH (3口横並び)" },
                  { label: "システムバス", val: "Panasonic ビバス (スゴピカ)" },
                  { label: "洗面化粧台", val: "Panasonic Lクラス (ツインLED)" },
                  { label: "トイレ設備", val: "Panasonic アラウーノL150" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              }
            }
          },
          takara: {
            badge: "タカラスタンダード",
            grades: {
              standard: {
                name: "タカラスタンダード スタンダードパッケージ",
                description: "高品位ホーローをふんだんに使用したお掃除しやすい標準仕様。\n湿気や傷に強いホーロー製パネルや、頑丈なキッチンドアポケットが便利です。",
                features: [
                  { label: "キッチン", val: "グランディア", desc: "キャビネットの底板まで丸ごと高品位ホーロー製" },
                  { label: "お風呂", val: "リラクシア仕様", desc: "ホーロークリーンパネルだからシャワーでサッとお掃除" },
                  { label: "洗面化粧台", val: "ファミーユ", desc: "ホーローボウル。汚れが染み込まず、衝撃にも極めて強い" },
                  { label: "トイレ", val: "ティモニB仕様", desc: "スクイーズ便器。汚れをしっかり防ぐタカラ標準便器" }
                ],
                specs: [
                  { label: "システムキッチン", val: "タカラ グランディア (ホーロー)" },
                  { label: "加熱機器", val: "3口IHヒーター（標準仕様）" },
                  { label: "システムバス", val: "タカラ リラクシア (1616)" },
                  { label: "洗面化粧台", val: "タカラ ファミーユ" },
                  { label: "トイレ設備", val: "タカラ ティモニB" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              },
              premium: {
                name: "タカラスタンダード プレミアムデラックスパッケージ",
                description: "『高品位ホーロー』による絶対的な耐久性と清掃性。\nタカラの代名詞「高品位ホーロー」は、鉄の強さとガラスの美しさを持ち、傷や熱に非常に強くお手入れも簡単です。キャビネット内部や壁面パネルまでホーロー製なので、マグネット収納も自在です。",
                features: [
                  { label: "キッチン", val: "家事らくシンク", desc: "レミュー。ホーロー天板と3層シンクで調理＆後片付けが劇的楽" },
                  { label: "お風呂", val: "鋳物ホーロー浴槽", desc: "プレデンシア。重厚な真珠のような光沢と抜群の保温力" },
                  { label: "洗面化粧台", val: "ホーロークリーン", desc: "エリーナ。水はねも汚れもサッと拭くだけ。マグネットもOK" },
                  { label: "トイレ", val: "ティモニ", desc: "ホーロークリーンパネルを壁面と床に貼り、飛び散り汚れを完全ガード" }
                ],
                specs: [
                  { label: "システムキッチン", val: "タカラ レミュー (ホーロー)" },
                  { label: "加熱機器", val: "3口IHヒーター（ハイパーガラス）" },
                  { label: "システムバス", val: "タカラ プレデンシア (鋳物ホーロー)" },
                  { label: "洗面化粧台", val: "タカラ エリーナ (ホーロー)" },
                  { label: "トイレ設備", val: "タカラ ティモニ (ホーローパネル付)" }
                ],
                assets: {
                  kitchen: "/interior_kitchen.png",
                  bathroom: "/interior_bathroom.png",
                  washroom: "/interior_washroom.png",
                  toilet: "/interior_toilet.png"
                }
              }
            }
          }
        }
      },
      assets: {
        exterior: exteriorImg,
        interiorModern: interiorModernImg,
        interiorNatural: interiorNaturalImg,
        beforeFloorplan: beforeFloorplanImg,
        afterFloorplan: afterFloorplanImg,
        elevation: elevationImg,
        kitchen: "/interior_kitchen.png",
        bathroom: "/interior_bathroom.png",
        washroom: "/interior_washroom.png",
        toilet: "/interior_toilet.png",
        apwSpecImage: "/catalog/APW430/トリプルガラスの断面構造図.jpg"
      }
    };

    try {
      const res = await fetch("/api/presentation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId.trim(),
          data: postData
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || "保存に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      // 元ファイルの削除処理 (リネーム選択時)
      if (deleteOriginal) {
        await fetch("/api/presentation/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: originalCustomerId })
        });
      }

      // ローカルのリストステートを更新して画面に即時反映
      const updatedClient = {
        id: trimmedId,
        clientName: clientName.replace("様邸", "").replace("様", ""),
        planName: planName,
        fullData: postData
      };

      if (isEditing) {
        if (deleteOriginal) {
          // 名前変更: 古いIDのデータを置き換える
          setList(prev => prev.map(c => c.id === originalCustomerId ? updatedClient : c));
        } else {
          if (trimmedId === originalCustomerId) {
            // 単なる上書き: 古いIDのデータを置き換える
            setList(prev => prev.map(c => c.id === originalCustomerId ? updatedClient : c));
          } else {
            // コピー保存: 新しいデータを追加
            setList(prev => [...prev.filter(c => c.id !== trimmedId), updatedClient]);
          }
        }
      } else {
        // 新規作成
        setList(prev => [...prev.filter(c => c.id !== trimmedId), updatedClient]);
      }

      setShowForm(false);
      resetFormFields();
      alert("保存が完了しました！");
      window.location.href = `/presentation/${trimmedId}`;
    } catch (e) {
      console.error(e);
      setErrorMsg("ネットワーク通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-container">
      <style>{`
        .portal-container {
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #f8fafc;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .portal-top-section {
          background: linear-gradient(135deg, #070a13 0%, #111827 100%);
          color: #f8fafc;
          padding: 3rem 2rem 2rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .portal-bottom-section {
          background: #f8fafc;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .portal-header {
          width: 100%;
          max-width: 1000px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1.5rem;
        }

        .portal-logo {
          font-weight: 800;
          font-size: 1.5rem;
          color: #e2b83b;
          border: 2px solid #e2b83b;
          padding: 0.2rem 0.8rem;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .portal-title-area h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .portal-title-area p {
          font-size: 0.9rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .btn-create-toggle {
          background: linear-gradient(135deg, #e2b83b 0%, #c69b6b 100%);
          color: #070a13;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(226, 184, 59, 0.2);
        }

        .btn-create-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(226, 184, 59, 0.3);
        }

        .portal-main {
          width: 100%;
          max-width: 1000px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        /* 顧客カードリスト */
        .client-list-section {
          width: 100%;
        }

        .client-list-section h2 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .client-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .client-card {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.25s ease;
          cursor: pointer;
          text-decoration: none;
          color: #f8fafc;
        }

        .client-card:hover {
          transform: translateY(-3px);
          border-color: #e2b83b;
          background: #1f2937;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }

        .card-meta {
          font-size: 0.75rem;
          color: #cbd5e1;
          font-weight: 600;
          text-transform: uppercase;
        }

        .card-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0.5rem 0;
        }

        .card-plan {
          font-size: 0.85rem;
          color: #e2e8f0;
          line-height: 1.4;
          flex: 1;
        }

        .card-arrow {
          align-self: flex-end;
          color: #e2b83b;
          font-weight: 800;
          margin-top: 1rem;
        }

        /* フォームのスタイル */
        .form-section {
          width: 100%;
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          box-sizing: border-box;
          animation: slide-down 0.3s ease-out;
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-section h2 {
          font-size: 1.3rem;
          font-weight: 800;
          color: #e2b83b;
          border-bottom: 2px solid rgba(226, 184, 59, 0.2);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group-full {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .form-group-full label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .form-input {
          background: rgba(7, 10, 19, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          color: #f8fafc;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: #e2b83b;
          outline: none;
          box-shadow: 0 0 0 3px rgba(226, 184, 59, 0.15);
        }

        .form-textarea {
          background: rgba(7, 10, 19, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          color: #f8fafc;
          font-size: 0.9rem;
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }

        .form-textarea:focus {
          border-color: #e2b83b;
          outline: none;
          box-shadow: 0 0 0 3px rgba(226, 184, 59, 0.15);
        }

        .form-actions {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-submit {
          background: linear-gradient(135deg, #e2b83b 0%, #c69b6b 100%);
          color: #070a13;
          border: none;
          padding: 0.7rem 2rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .btn-preset {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
        }

        .btn-preset:hover {
          background: rgba(226, 184, 59, 0.15);
          border-color: #e2b83b;
          color: #f8fafc;
        }

        .card-action-btn {
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .card-action-btn:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
      `}</style>

      <div className="portal-top-section">
        <header className="portal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              border: "1px solid #e2b83b",
              borderRadius: "4px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              color: "#e2b83b",
              flexShrink: 0
            }}>N</div>
            <div className="portal-title-area">
              <h1 style={{ color: "#f8fafc" }}>長友ホーム AI提案ボードポータル</h1>
              <p style={{ color: "#94a3b8" }}>お施主様別のデジタルプレゼンボード（A3印刷対応）を一元管理します</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button 
              className="btn-create-toggle"
              onClick={handleNewPlanClick}
              style={{
                background: "linear-gradient(135deg, #e2b83b 0%, #c69b6b 100%)",
                color: "#070a13",
                boxShadow: "0 4px 12px rgba(226, 184, 59, 0.2)"
              }}
            >
              {showForm ? "✖ 閉じる" : "➕ 新規プランを作成"}
            </button>
          </div>
        </header>

      <main className="portal-main">
        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        {showForm && (
          <form className="form-section" onSubmit={handleSubmit}>
            <h2>{isEditing ? `✏️ お施主様プランの編集 (元のID: ${originalCustomerId})` : "➕ 新規お施主様プランの追加"}</h2>
            
            <div className="form-grid">
              {/* 基本情報 */}
              <div className="form-group">
                <label>顧客ID (半角英数字。例: sato-home) {isEditing && <span style={{ color: "#e2b83b", fontSize: "0.75rem", fontWeight: "bold" }}>※変更して保存すると別名保存(複製)になります</span>}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="sato-home"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>お施主様名 (例: 佐藤様邸)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="佐藤様邸"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group-full">
                <label>プラン名 (下記のボタンから簡単に選択できます)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="プレミアム平屋リノベーションプラン"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  disabled={isSubmitting}
                />
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                  {[
                    { label: "🏡 新築 [平屋]", value: "新築ご提案プラン [平屋]" },
                    { label: "🏢 新築 [2階建て]", value: "新築ご提案プラン [2階建て]" },
                    { label: "🔨 リノベ [平屋]", value: "リノベーションご提案プラン [平屋]" },
                    { label: "🛠️ リノベ [2階建て]", value: "リノベーションご提案プラン [2階建て]" }
                  ].map((p) => {
                    const isActive = planName === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPlanName(p.value)}
                        style={{
                          background: isActive ? "linear-gradient(135deg, #e2b83b 0%, #c69b6b 100%)" : "rgba(255,255,255,0.06)",
                          color: isActive ? "#070a13" : "#cbd5e1",
                          border: isActive ? "1px solid #e2b83b" : "1px solid rgba(255,255,255,0.1)",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: isActive ? "700" : "500",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: isActive ? "0 2px 8px rgba(226, 184, 59, 0.25)" : "none"
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* コンセプト */}
              <div className="form-group-full">
                <label>コンセプト：メインタイトル (改行を入れることができます)</label>
                <textarea 
                  className="form-textarea" 
                  value={conceptTitle}
                  onChange={(e) => setConceptTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group-full">
                <label>コンセプト：サブタイトル (英語表記など)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={conceptSubtitle}
                  onChange={(e) => setConceptSubtitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* ストーリー1 */}
              <div className="form-group-full" style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <h3>🏡 設計ストーリー1</h3>
              </div>
              <div className="form-group">
                <label>ストーリー1: タイトル</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={story1Title}
                  onChange={(e) => setStory1Title(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>ストーリー1: 詳細説明</label>
                <textarea 
                  className="form-textarea" 
                  value={story1Desc}
                  onChange={(e) => setStory1Desc(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* ストーリー2 */}
              <div className="form-group-full" style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <h3>🏡 設計ストーリー2</h3>
              </div>
              <div className="form-group">
                <label>ストーリー2: タイトル</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={story2Title}
                  onChange={(e) => setStory2Title(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>ストーリー2: 詳細説明</label>
                <textarea 
                  className="form-textarea" 
                  value={story2Desc}
                  onChange={(e) => setStory2Desc(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* ストーリー3 */}
              <div className="form-group-full" style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <h3>🏡 設計ストーリー3</h3>
              </div>
              <div className="form-group">
                <label>ストーリー3: タイトル</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={story3Title}
                  onChange={(e) => setStory3Title(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>ストーリー3: 詳細説明</label>
                <textarea 
                  className="form-textarea" 
                  value={story3Desc}
                  onChange={(e) => setStory3Desc(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* マテリアルカラー調整 */}
              <div className="form-group-full" style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <h3>🎨 外部・内部マテリアルカラー設定</h3>
              </div>
              <div className="form-group">
                <label>外壁カラー (カラーコードまたはCSSグラデーション値)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={wallColor}
                    onChange={(e) => setWallColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <input 
                    type="color" 
                    style={{ width: "40px", height: "38px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", background: "none" }}
                    value={wallColor.startsWith("#") && wallColor.length === 7 ? wallColor : "#f1f5f9"}
                    onChange={(e) => setWallColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  <button type="button" className="btn-preset" onClick={() => setWallColor("#f1f5f9")}>⚪ 標準白</button>
                  <button type="button" className="btn-preset" onClick={() => setWallColor("#475569")}>🔘 グレー</button>
                  <button type="button" className="btn-preset" onClick={() => setWallColor("#0f172a")}>⚫ ブラック</button>
                  <button type="button" className="btn-preset" onClick={() => setWallColor("#cbd5e1")}>🪨 オフホワイト</button>
                </div>
              </div>
              <div className="form-group">
                <label>屋根カラー (カラーコードまたはCSSグラデーション値)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={roofColor}
                    onChange={(e) => setRoofColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <input 
                    type="color" 
                    style={{ width: "40px", height: "38px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", background: "none" }}
                    value={roofColor.startsWith("#") && roofColor.length === 7 ? roofColor : "#334155"}
                    onChange={(e) => setRoofColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  <button type="button" className="btn-preset" onClick={() => setRoofColor("linear-gradient(135deg, #64748b 0%, #334155 100%)")}>🩶 ガルバグレー</button>
                  <button type="button" className="btn-preset" onClick={() => setRoofColor("linear-gradient(135deg, #1e293b 0%, #0f172a 100%)")}>🖤 ガルバブラック</button>
                  <button type="button" className="btn-preset" onClick={() => setRoofColor("linear-gradient(135deg, #f97316 0%, #ea580c 100%)")}>🧡 テラコッタ赤</button>
                </div>
              </div>
              <div className="form-group">
                <label>床（居室）：仕様名</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={floorLiving}
                  onChange={(e) => setFloorLiving(e.target.value)}
                  disabled={isSubmitting}
                />
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  <button type="button" className="btn-preset" onClick={() => { setFloorLiving("オーク突板フローリング"); setFloorLivingColor("linear-gradient(135deg, #e7c393 0%, #c69b6b 100%)"); }}>🪵 ライトオーク</button>
                  <button type="button" className="btn-preset" onClick={() => { setFloorLiving("ウォルナット突板フローリング"); setFloorLivingColor("linear-gradient(135deg, #a27b5c 0%, #5f422e 100%)"); }}>🪵 ウォルナット</button>
                  <button type="button" className="btn-preset" onClick={() => { setFloorLiving("大理石調大理石風シート"); setFloorLivingColor("#cbd5e1"); }}>🪨 大理石風シート</button>
                </div>
              </div>
              <div className="form-group">
                <label>床（居室）：カラーチップ（CSS値/画像URL）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="linear-gradient(...) や画像URLも可"
                  value={floorLivingColor}
                  onChange={(e) => setFloorLivingColor(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>床（水回り）：仕様名</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={floorCF}
                  onChange={(e) => setFloorCF(e.target.value)}
                  disabled={isSubmitting}
                />
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  <button type="button" className="btn-preset" onClick={() => { setFloorCF("CFシート（テラコッタ調）"); setFloorCFColor("linear-gradient(135deg, #f97316 0%, #ea580c 100%)"); }}>🧱 テラコッタ調</button>
                  <button type="button" className="btn-preset" onClick={() => { setFloorCF("CFシート（石目調ホワイト）"); setFloorCFColor("#fdfdfd"); }}>⬜ 石目ホワイト</button>
                  <button type="button" className="btn-preset" onClick={() => { setFloorCF("CFシート（オリーブグリーン）"); setFloorCFColor("linear-gradient(135deg, #a3e635 0%, #84cc16 100%)"); }}>💚 オリーブCF</button>
                </div>
              </div>
              <div className="form-group">
                <label>床（水回り）：カラーチップ（CSS値/画像URL）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="linear-gradient(...) や画像URLも可"
                  value={floorCFColor}
                  onChange={(e) => setFloorCFColor(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => { setShowForm(false); resetFormFields(); }}
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "保存中..." : "💾 保存して提案ボードを作成"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>

    <div className="portal-bottom-section">
      <section className="client-list-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <h2>📁 登録されているお施主様プラン一覧</h2>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* 並び替えセレクトボックス */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>並び替え:</span>
              <select
                value={sortKey}
                onChange={(e: any) => setSortKey(e.target.value)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  padding: "0.5rem 1.75rem 0.5rem 0.75rem",
                  borderRadius: "6px",
                  color: "#0f172a",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="index">登録順</option>
                <option value="name">お名前順</option>
                <option value="id">顧客ID順</option>
                <option value="update">更新順</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  color: "#0f172a",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  transition: "all 0.2s"
                }}
              >
                {sortOrder === 'asc' ? '昇順 ⬆️' : '降順 ⬇️'}
              </button>
            </div>

            {/* 検索バー */}
            <div style={{ position: "relative", width: "250px" }}>
              <input 
                type="text" 
                placeholder="🔍 検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  padding: "0.5rem 1rem 0.5rem 2.2rem",
                  borderRadius: "30px",
                  color: "#0f172a",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "all 0.2s"
                }}
              />
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none", fontSize: "0.85rem" }}>
                🔍
              </span>
            </div>
          </div>
        </div>

        <div className="client-grid">
          {getFilteredAndSortedList().length > 0 ? (
            getFilteredAndSortedList().map((client) => (
              <a 
                href={`/presentation/${client.id}`}
                className="client-card" 
                key={client.id}
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", textDecoration: "none", color: "inherit" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                    <span className="card-meta">ID: {client.id}</span>
                    {/* 操作アクションボタン */}
                    <div style={{ display: "flex", gap: "0.35rem", zIndex: 10 }}>
                      <button 
                        title="編集" 
                        onClick={(e) => { e.preventDefault(); handleEditClick(e, client); }} 
                        className="card-action-btn"
                        style={{ background: "rgba(226, 184, 59, 0.15)", color: "#e2b83b" }}
                      >
                        ✏️
                      </button>
                      <button 
                        title="複製" 
                        onClick={(e) => { e.preventDefault(); handleDuplicateClick(e, client); }} 
                        className="card-action-btn"
                        style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}
                      >
                        🗂️
                      </button>
                      <button 
                        title="削除" 
                        onClick={(e) => { e.preventDefault(); handleDeleteClick(e, client.id, client.clientName); }} 
                        className="card-action-btn"
                        style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 className="card-name" style={{ marginTop: "0.5rem" }}>{client.clientName}様</h3>
                  <p className="card-plan">{client.planName}</p>
                </div>
                <div className="card-arrow">提案ボードを開く ➔</div>
              </a>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 2rem", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
              該当するお施主様プランが見つかりませんでした。
            </div>
          )}
        </div>
      </section>
    </div>
    </div>
  );
}
