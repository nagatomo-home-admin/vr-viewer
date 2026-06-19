"use client";

import React, { useState } from "react";
import Link from "next/link";
import AiGenerationModal from "./AiGenerationModal";
import ImageReplacer from "./ImageReplacer";

interface PresentationClientPageProps {
  initialData: any;
  customerId: string;
}

// Reactの再レンダリング時におけるスタイル競合を防ぐクリーンアップ関数
const cleanStyle = (styleObj: any) => {
  if (!styleObj) return {};
  const clean: Record<string, any> = {};
  Object.keys(styleObj).forEach(key => {
    if (styleObj[key] !== undefined && styleObj[key] !== null) {
      clean[key] = styleObj[key];
    }
  });
  return clean;
};

// マテリアルカラーが画像パスや外部URLの場合に背景画像として切り抜いて描画するヘルパー関数
const getMaterialStyle = (gradient: string, extraStyle: any = {}) => {
  if (!gradient) return {};
  const isImage = gradient.startsWith("http://") || 
                  gradient.startsWith("https://") || 
                  gradient.startsWith("/") || 
                  /\.(jpg|jpeg|png|webp|gif|svg)/i.test(gradient);
                  
  if (isImage) {
    return {
      backgroundImage: `url(${gradient})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      ...extraStyle
    };
  }
  return {
    background: gradient,
    ...extraStyle
  };
};

export default function PresentationClientPage({ initialData, customerId }: PresentationClientPageProps) {
  // --- インタラクティブ・ステート ---
  const [activeDoor, setActiveDoor] = useState<string>(initialData.selectedDoor || "venato");
  const [activeInterior, setActiveInterior] = useState<string>(initialData.selectedInterior || "modern");
  const [activeKitchen, setActiveKitchen] = useState<string>(initialData.selectedKitchen || initialData.selectedEquipment || "lixil");
  const [activeBathroom, setActiveBathroom] = useState<string>(initialData.selectedBathroom || initialData.selectedEquipment || "lixil");
  const [activeWashroom, setActiveWashroom] = useState<string>(initialData.selectedWashroom || initialData.selectedEquipment || "lixil");
  const [activeToilet, setActiveToilet] = useState<string>(initialData.selectedToilet || initialData.selectedEquipment || "lixil");
  const [activeSash, setActiveSash] = useState<string>(initialData.selectedSash || "apw330");

  // --- 断熱等級ステート（サッシとは独立して選択可能） ---
  const [activeInsulationGrade, setActiveInsulationGrade] = useState<string>(initialData.selectedInsulationGrade || "grade6");
  
  // --- ストーリーポップアップ編集用ステート ---
  const [editingStoryIndex, setEditingStoryIndex] = useState<number | null>(null);
  const [editStoryTitle, setEditStoryTitle] = useState("");
  const [editStoryDesc, setEditStoryDesc] = useState("");
  const [activeEquipmentGrade, setActiveEquipmentGrade] = useState<string>(initialData.selectedEquipmentGrade || "standard");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- 提案ボード ビジュアル編集ステート ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [clientName, setClientName] = useState<string>(initialData.clientName || "");
  const [planName, setPlanName] = useState<string>(initialData.planName || "");
  const [conceptSubtitle, setConceptSubtitle] = useState<string>(initialData.concept?.subtitle || "");
  const [conceptTitle, setConceptTitle] = useState<string>(initialData.concept?.title || "");
  const [stories, setStories] = useState<any[]>(initialData.stories || []);
  const [assetsState, setAssetsState] = useState<any>(initialData.assets || {});
  const [beforeFloorplanTitle, setBeforeFloorplanTitle] = useState<string>(initialData.beforeFloorplan?.subtitle || "改修前平面図");
  const [afterFloorplanTitle, setAfterFloorplanTitle] = useState<string>(initialData.afterFloorplan?.subtitle || "提案間取り図（動線プラン）");

  // --- 2面・4面の追加編集ステート ---
  const [doorMaterials, setDoorMaterials] = useState<any[]>([]);
  const [doorDescription, setDoorDescription] = useState<string>("");
  const [conditions, setConditions] = useState<any[]>(initialData.exteriorSpec?.conditions || []);
  const [interiorSpecTitle, setInteriorSpecTitle] = useState<string>(initialData.interiorSpec?.title || "");
  const [interiorFeatures, setInteriorFeatures] = useState<any[]>([]);
  const [interiorDescription, setInteriorDescription] = useState<string>("");
  const [interiorMaterials, setInteriorMaterials] = useState<any[]>([]);

  // 玄関ドア切り替え時にステートを同期
  React.useEffect(() => {
    if (initialData.exteriorSpec?.doorTypes?.[activeDoor]) {
      const door = initialData.exteriorSpec.doorTypes[activeDoor];
      setDoorMaterials(door.materials || []);
      setDoorDescription(door.description || "");
    }
  }, [activeDoor, initialData]);

  // インテリアプラン切り替え時にステートを同期
  React.useEffect(() => {
    if (initialData.interiorSpec?.plans?.[activeInterior]) {
      const plan = initialData.interiorSpec.plans[activeInterior];
      setInteriorFeatures(plan.features || []);
      setInteriorDescription(plan.description || "");
      setInteriorMaterials(plan.materials || []);
    }
  }, [activeInterior, initialData]);

  // --- AI提案文自動生成ステート ---
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGenerateType, setAiGenerateType] = useState<"concept" | "story" | "exterior_advice" | "interior_advice">("concept");

  // フルスクリーン状態の外部変更（Escキー押下など）を監視する
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("フルスクリーン切り替えエラー:", err);
    }
  };

  // 選択中の各種仕様データを動的に抽出
  const exteriorData = initialData.exteriorSpec.doorTypes[activeDoor] || {};
  const sashData = initialData.exteriorSpec.sashTypes?.[activeSash] || initialData.exteriorSpec.sashTypes?.["apw330"] || {};
  const interiorData = initialData.interiorSpec.plans[activeInterior] || {};

  // プランキー（modern / natural / luxury）に基づいて画像パスを優先順位通りに解決するヘルパー関数
  const getInteriorImagePath = (planKey: string) => {
    // 1. 画面上で直接手動差し替えされた画像データを最優先
    if (planKey === activeInterior && assetsState.interiorActive) {
      return assetsState.interiorActive;
    }
    if (planKey !== activeInterior && assetsState.interiorAlternative) {
      return assetsState.interiorAlternative;
    }
    
    // 2. ポータル画面から登録された外部URLパスを次に優先
    if (planKey === "modern" && assetsState.interiorModern) {
      return assetsState.interiorModern;
    }
    if (planKey === "natural" && assetsState.interiorNatural) {
      return assetsState.interiorNatural;
    }
    if (planKey === "luxury" && assetsState.interiorLuxury) {
      return assetsState.interiorLuxury;
    }
    
    // 3. なければデフォルトの画像パス
    const plan = initialData.interiorSpec.plans[planKey] || {};
    return plan.perspectiveImage || "/interior_modern.png";
  };

  // 水回り設備データは、個別メーカーのグレードデータからロード
  const getFeatureForEquipment = (makerKey: string, labelName: string) => {
    const maker = initialData.equipmentSpec.makers[makerKey] || {};
    const gradeData = maker.grades?.[activeEquipmentGrade] || maker.grades?.["standard"] || maker || {};
    return gradeData.features?.find((f: any) => f.label.includes(labelName)) || {};
  };

  const combinedFeatures = [
    { ...getFeatureForEquipment(activeKitchen, "キッチン"), label: "キッチン" },
    { ...getFeatureForEquipment(activeBathroom, "お風呂"), label: "お風呂" },
    { ...getFeatureForEquipment(activeWashroom, "洗面"), label: "洗面" },
    { ...getFeatureForEquipment(activeToilet, "トイレ"), label: "トイレ" },
  ];

  const getSpecForEquipment = (makerKey: string, labelName: string) => {
    const maker = initialData.equipmentSpec.makers[makerKey] || {};
    const gradeData = maker.grades?.[activeEquipmentGrade] || maker.grades?.["standard"] || maker || {};
    return gradeData.specs?.find((s: any) => s.label.includes(labelName)) || {};
  };

  const combinedSpecs = [
    { ...getSpecForEquipment(activeKitchen, "キッチン"), label: "システムキッチン" },
    { ...getSpecForEquipment(activeKitchen, "加熱"), label: "加熱機器" },
    { ...getSpecForEquipment(activeBathroom, "バス"), label: "システムバス" },
    { ...getSpecForEquipment(activeWashroom, "洗面"), label: "洗面化粧台" },
    { ...getSpecForEquipment(activeToilet, "トイレ"), label: "トイレ設備" },
  ];

  const getMakerName = (key: string) => {
    if (key === "lixil") return "LIXIL";
    if (key === "toto") return "TOTO";
    if (key === "panasonic") return "Panasonic";
    if (key === "takara") return "タカラスタンダード";
    return key.toUpperCase();
  };

  // 6面目のメーカー統一判定およびパッケージタイトルの動的決定
  const isAllSameMaker = activeKitchen === activeBathroom && activeBathroom === activeWashroom && activeWashroom === activeToilet;
  const equipmentPackageTitle = isAllSameMaker 
    ? `${getMakerName(activeKitchen)} 水回り設備パッケージ` 
    : "個別カスタムセレクトパッケージ";

  const combinedDescription = `【${equipmentPackageTitle}】\nお施主様のご要望に合わせ、${isAllSameMaker ? `${getMakerName(activeKitchen)}の先進的な設備で統一した快適仕様` : "各メーカーの強みを組み合わせた特別仕様"}です。\n・システムキッチン: ${getMakerName(activeKitchen)}（${getFeatureForEquipment(activeKitchen, "キッチン").val || "標準仕様"}）\n・システムバス: ${getMakerName(activeBathroom)}（${getFeatureForEquipment(activeBathroom, "お風呂").val || "標準仕様"}）\n・洗面化粧台: ${getMakerName(activeWashroom)}（${getFeatureForEquipment(activeWashroom, "洗面").val || "標準仕様"}）\n・トイレ設備: ${getMakerName(activeToilet)}（${getFeatureForEquipment(activeToilet, "トイレ").val || "標準仕様"}）`;

  // 断熱等級ステートに基づいてUa値やサッシの表示を決定するヘルパー
  const getInsulationInfo = (gradeKey: string) => {
    if (gradeKey === "grade7") return { name: "等級7 (極暖・樹脂トリプル)", ua: "0.33" };
    if (gradeKey === "grade6") return { name: "等級6 (高断熱・樹脂複層)", ua: "0.46" };
    return { name: "等級5 (ZEH基準・アルミ樹脂複合)", ua: "0.60" };
  };

  const currentInsulation = getInsulationInfo(activeInsulationGrade);

  // 計画条件の「サッシ」と「断熱等級」の値をステートと動的に連動
  const displayConditions = conditions.map((cond: any) => {
    if (cond.label.includes("断熱") || cond.label.includes("Ua")) {
      return { ...cond, val: `等級${activeInsulationGrade === "grade7" ? "7" : activeInsulationGrade === "grade6" ? "6" : "5"} (Ua値: ${currentInsulation.ua})` };
    }
    if (cond.label.includes("サッシ") || cond.label.includes("窓")) {
      return { ...cond, val: activeSash === "apw430" ? "APW 430 (樹脂トリプル)" : activeSash === "apw330" ? "APW 330 (樹脂複層)" : "アルミ樹脂複合サッシ等" };
    }
    return cond;
  });

  // ドア仕様のマテリアル一覧もサッシトグルに連動
  const displayMaterials = doorMaterials.map((mat: any) => {
    if (mat.label.includes("サッシ") || mat.label.includes("窓")) {
      return { ...mat, val: activeSash === "apw330" ? "APW 330仕様" : "APW 430仕様" };
    }
    return mat;
  });

  // 水回り設備のアセットパス
  const kitchenImg = (initialData.equipmentSpec.makers[activeKitchen]?.grades?.[activeEquipmentGrade] || initialData.equipmentSpec.makers[activeKitchen]?.grades?.["standard"] || {}).assets?.kitchen || assetsState.kitchen || "/interior_kitchen.png";
  const bathroomImg = (initialData.equipmentSpec.makers[activeBathroom]?.grades?.[activeEquipmentGrade] || initialData.equipmentSpec.makers[activeBathroom]?.grades?.["standard"] || {}).assets?.bathroom || assetsState.bathroom || "/interior_bathroom.png";
  const washroomImg = (initialData.equipmentSpec.makers[activeWashroom]?.grades?.[activeEquipmentGrade] || initialData.equipmentSpec.makers[activeWashroom]?.grades?.["standard"] || {}).assets?.washroom || assetsState.washroom || "/interior_washroom.png";
  const toiletImg = (initialData.equipmentSpec.makers[activeToilet]?.grades?.[activeEquipmentGrade] || initialData.equipmentSpec.makers[activeToilet]?.grades?.["standard"] || {}).assets?.toilet || assetsState.toilet || "/interior_toilet.png";

  // AI自動生成されたテキストの適用
  const handleApplyAiText = (generatedData: any) => {
    if (aiGenerateType === "concept") {
      setConceptTitle(generatedData.title);
      setConceptSubtitle(generatedData.subtitle);
    } else if (aiGenerateType === "story") {
      setStories(generatedData.stories);
    } else if (aiGenerateType === "exterior_advice") {
      setDoorDescription(generatedData.advice);
    } else if (aiGenerateType === "interior_advice") {
      setInteriorDescription(generatedData.advice);
    }
  };

  // 決定仕様・編集データの保存処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedExteriorSpec = { ...initialData.exteriorSpec };
      updatedExteriorSpec.conditions = conditions;
      
      if (updatedExteriorSpec.doorTypes && updatedExteriorSpec.doorTypes[activeDoor]) {
        updatedExteriorSpec.doorTypes[activeDoor] = {
          ...updatedExteriorSpec.doorTypes[activeDoor],
          materials: doorMaterials,
          description: doorDescription
        };
      }

      const updatedInteriorSpec = { ...initialData.interiorSpec };
      updatedInteriorSpec.title = interiorSpecTitle;
      if (updatedInteriorSpec.plans && updatedInteriorSpec.plans[activeInterior]) {
        updatedInteriorSpec.plans[activeInterior] = {
          ...updatedInteriorSpec.plans[activeInterior],
          features: interiorFeatures,
          description: interiorDescription,
          materials: interiorMaterials
        };
      }

      const saveData = {
        ...initialData,
        clientName,
        planName,
        concept: {
          subtitle: conceptSubtitle,
          title: conceptTitle
        },
        stories,
        assets: assetsState,
        beforeFloorplan: {
          ...initialData.beforeFloorplan,
          subtitle: beforeFloorplanTitle
        },
        afterFloorplan: {
          ...initialData.afterFloorplan,
          subtitle: afterFloorplanTitle
        },
        // 設計ピンの表示自体は不要になりましたが、データ定義の完全性維持のため
        // 既存の annotations 構造は引き継ぐか、空配列としてクリアします
        annotations: initialData.annotations || [],
        renovationDesign: {
          beforeDiagramUrl: assetsState.beforeFloorplan || "",
          afterDiagramUrl: assetsState.afterFloorplan || "",
          annotations: initialData.annotations || []
        },
        selectedDoor: activeDoor,
        selectedInterior: activeInterior,
        selectedKitchen: activeKitchen,
        selectedBathroom: activeBathroom,
        selectedWashroom: activeWashroom,
        selectedToilet: activeToilet,
        selectedEquipmentGrade: activeEquipmentGrade,
        selectedSash: activeSash,
        selectedInsulationGrade: activeInsulationGrade,
        exteriorSpec: updatedExteriorSpec,
        interiorSpec: updatedInteriorSpec
      };

      const res = await fetch("/api/presentation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId,
          data: saveData
        })
      });

      if (res.ok) {
        alert("変更内容と仕様選択状態を「決定プラン仕様」として正常に保存して適用しました。");
      } else {
        const errData = await res.json();
        alert(`保存に失敗しました: ${errData.error || "不明なエラー"}`);
      }
    } catch (error) {
      console.error(error);
      alert("保存中にエラーが発生しました。接続を確認してください。");
    } finally {
      setIsSaving(false);
    }
  };

  // AI自動生成用パラメータの決定仕様テキスト
  const selectedSpecsForAi = {
    sash: activeInsulationGrade === "grade7" ? "APW 430 (樹脂トリプル)" : activeInsulationGrade === "grade6" ? "APW 330 (樹脂複層)" : "APW 310相当 (等級5)",
    door: activeDoor === "venato" ? "ヴェナート D30" : "コンコード S30",
    interior: activeInterior === "modern" ? "モダン" : activeInterior === "natural" ? "ナチュラル" : "和モダン",
    equipment: `キッチン:${getMakerName(activeKitchen)} / お風呂:${getMakerName(activeBathroom)} / 洗面:${getMakerName(activeWashroom)} / トイレ:${getMakerName(activeToilet)}`,
    equipmentGrade: activeEquipmentGrade === "standard" ? "標準仕様" : "プレミアムDX仕様"
  };

  return (
    <div className="presen-container">
      {/* 埋め込みCSSスタイル (Vanilla CSS & 6面印刷対応) */}
      <style>{`
        /* プレミアム・デザインシステム定義 */
        .presen-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #070a13 0%, #111827 100%);
          color: #f8fafc;
          font-family: 'Inter', "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-x: hidden;
        }

        /* ヘッダーエリア */
        .presen-header {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .header-title-group h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title-group h1 span {
          color: #e2b83b;
          border: 1px solid #e2b83b;
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .header-title-group p {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .btn-back {
          background: rgba(255, 255, 255, 0.05);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn-back:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        /* フローティング仕様切替コントローラー */
        .floating-control-trigger {
          position: fixed;
          right: 2rem;
          bottom: 2rem;
          z-index: 1000;
          background: linear-gradient(135deg, #e2b83b 0%, #b48a1b 100%);
          color: #070a13;
          border: none;
          padding: 0.8rem 1.6rem;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          box-shadow: 0 10px 25px rgba(226, 184, 59, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .floating-control-trigger:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 15px 30px rgba(226, 184, 59, 0.5);
          background: linear-gradient(135deg, #ffde6a 0%, #e2b83b 100%);
        }

        .floating-control-panel {
          position: fixed;
          right: 2rem;
          bottom: 5.5rem;
          z-index: 999;
          width: 380px;
          max-height: calc(100vh - 6rem);
          background: rgba(7, 10, 19, 0.92);
          border: 1px solid rgba(226, 184, 59, 0.25);
          border-left: 4px solid #e2b83b;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(16px);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          overflow-y: auto;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform-origin: right bottom;
          opacity: 0;
          transform: scale(0.9) translateY(20px);
          pointer-events: none;
        }

        .floating-control-panel.show {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .panel-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #e2b83b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .panel-close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .panel-close-btn:hover {
          color: #ef4444;
        }

        .fullscreen-btn {
          width: 100%;
          background: rgba(226, 184, 59, 0.12);
          border: 1px solid rgba(226, 184, 59, 0.3);
          color: #e2b83b;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .fullscreen-btn:hover {
          background: #e2b83b;
          color: #070a13;
          box-shadow: 0 4px 12px rgba(226, 184, 59, 0.25);
        }

        /* 縦並びのコンパクトなコントロールグループ */
        .floating-control-panel .control-group {
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.8rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: none;
        }

        .floating-control-panel .control-label {
          font-size: 0.8rem;
          color: #e2b83b;
          font-weight: 700;
          padding: 0;
          margin-bottom: 0.25rem;
        }

        .floating-control-panel .control-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .floating-control-panel .control-buttons-2x2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
        }

        .floating-control-panel .control-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.45rem 1rem;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
          flex-grow: 1;
          text-align: center;
        }

        .floating-control-panel .control-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
        }

        .floating-control-panel .control-btn.active {
          background: #e2b83b;
          color: #070a13;
          border-color: #e2b83b;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(226, 184, 59, 0.25);
        }

        /* 印刷時のフローティングUIおよび編集UIを非表示 */
        @media print {
          .floating-control-trigger,
          .floating-control-panel,
          .ai-btn,
          .image-replacer-overlay {
            display: none !important;
          }
          .story-item-edit {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          .story-item-edit input,
          .story-item-edit textarea {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            resize: none !important;
            color: #000000 !important;
          }
        }

        /* A3プレゼンボード縦並びラッパー */
        .a3-board-wrapper {
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        /* 共通の用紙スタイル (A3横縦比維持) */
        .paper-sheet {
          background: #ffffff;
          color: #0f172a;
          width: 100%;
          aspect-ratio: 1.4142 / 1;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border-radius: 12px;
          padding: 1.5rem 2.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 1024px) {
          .paper-sheet {
            aspect-ratio: auto;
            min-height: auto;
            padding: 2rem;
          }
        }

        /* 用紙共通ヘッダー */
        .sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 0.8rem;
          margin-bottom: 1.25rem;
        }

        .sheet-logo {
          font-family: sans-serif;
          font-weight: 800;
          font-size: 1.3rem;
          border: 2px solid #0f172a;
          padding: 0.15rem 0.6rem;
          border-radius: 5px;
        }

        .sheet-title-area {
          text-align: right;
        }

        .sheet-category-badge {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e2b83b;
          background: #0f172a;
          padding: 0.2rem 0.75rem;
          border-radius: 4px;
        }

        .sheet-project-name {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        /* === 1面目: コンセプト ＆ 間取り === */
        /* 1面目タイトルレイアウト微調整 */
        .concept-title-box {
          margin-bottom: 0.75rem;
        }

        .concept-subtitle {
          font-size: 0.85rem;
          font-weight: 700;
          color: #e2b83b;
          letter-spacing: 0.05em;
          margin-bottom: 0.3rem;
        }

        .concept-main-title {
          font-size: 1.3rem;
          font-weight: 800;
          line-height: 1.3;
          color: #0f172a;
          border-left: 5px solid #0f172a;
          padding-left: 0.75rem;
          white-space: pre-line;
        }

        .sheet-content-split {
          display: grid;
          grid-template-columns: 44% 52%;
          gap: 3%;
          flex: 1;
        }

        @media (max-width: 768px) {
          .sheet-content-split {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* ストーリー解説 */
        .story-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .story-section h3 {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px dashed #cbd5e1;
          padding-bottom: 0.4rem;
          margin-bottom: 0.25rem;
        }

        .story-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .story-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .story-number {
          background: #0f172a;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.75rem;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .story-text h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
        }

        .story-text p {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 0.15rem;
          line-height: 1.45;
        }

        /* 間取り図 */
        .floorplan-card {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }

        .floorplan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .floorplan-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
        }

        .floorplan-legend {
          display: flex;
          gap: 0.5rem;
          font-size: 0.7rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #64748b;
        }

        .legend-color {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }

        /* 改修前（Before）間取りカードスタイル */
        .before-floorplan-card {
          border: 1.5px dashed #cbd5e1;
          border-radius: 8px;
          background: #f1f5f9;
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: 0.35rem;
          box-sizing: border-box;
        }

        .before-floorplan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .before-floorplan-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
        }

        /* === 共通コンテンツ設計 === */
        .sheet-content-full {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .perspective-showcase {
          width: 100%;
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }

        /* パース画像用 */
        .perspective-showcase.aspect-16-9 {
          aspect-ratio: 16 / 9;
          height: 200px;
        }

        /* サッシ・スマエル・水回り用 */
        .perspective-showcase.aspect-1-1 {
          aspect-ratio: 1.1 / 1;
          height: 125px;
        }

        .perspective-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .perspective-showcase:hover .perspective-image {
          transform: scale(1.02);
        }

        .perspective-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          color: #e2b83b;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 5px;
          border: 1px solid rgba(226, 184, 59, 0.4);
          z-index: 2;
        }

        /* 複数パース並列表示 */
        .perspective-showcase-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          width: 100%;
          flex: 1;
        }

        .perspective-showcase-split .perspective-showcase {
          height: 100%;
        }

        /* 仕様カードの2列グリッド */
        .spec-grid {
          display: grid;
          grid-template-columns: 58% 39%;
          gap: 3%;
        }

        @media (max-width: 768px) {
          .spec-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .spec-showcase-card {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          padding: 0.7rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .spec-card-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px solid #e2b83b;
          padding-bottom: 0.4rem;
        }

        .door-details {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          animation: fade-in 0.3s ease;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .door-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .door-model-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .door-maker-badge {
          font-size: 0.7rem;
          background: #0f172a;
          color: #e2b83b;
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
          font-weight: 600;
        }

        .door-points-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.35rem;
        }

        .door-point-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .door-point-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: #e2b83b;
          background: #0f172a;
          padding: 0.1rem 0;
          border-radius: 3px;
        }

        .door-point-value {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 0.15rem;
        }

        .door-point-desc {
          font-size: 0.6rem;
          color: #64748b;
          line-height: 1.35;
        }

        .door-description-text {
          font-size: 0.74rem;
          color: #334155;
          line-height: 1.4;
          background: #ffffff;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          white-space: pre-line;
        }

        /* 計画条件カード */
        .building-conditions-card {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          padding: 0.7rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .conditions-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: #475569;
          border-bottom: 2px solid #cbd5e1;
          padding-bottom: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .conditions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .conditions-table tr {
          border-bottom: 1px solid #f1f5f9;
        }

        .conditions-table tr:last-child {
          border-bottom: none;
        }

        .conditions-table td {
          padding: 0.35rem 0;
          font-size: 0.75rem;
        }

        .cond-label {
          color: #64748b;
          font-weight: 600;
        }

        .cond-value {
          color: #0f172a;
          font-weight: 700;
          text-align: right;
        }

        /* 用紙共通フッター */
        .sheet-footer {
          margin-top: 1rem;
          border-top: 1.5px solid #e2e8f0;
          padding-top: 0.8rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .sheet-footer-author {
          font-weight: 600;
          color: #475569;
        }

        /* マテリアルカラーチップのスタイル */
        .material-chip-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
          margin-bottom: 0.25rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          text-align: left;
        }

        .material-chip {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
          position: relative;
        }

        .material-chip-info {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .material-chip-label {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 600;
        }

        .material-chip-val {
          font-size: 0.75rem;
          color: #0f172a;
          font-weight: 700;
        }

        /* カタログ画像用スタイル */
        .apw-spec-image-container {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          box-sizing: border-box;
          flex: 1;
        }

        .spec-image-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: rgba(15, 23, 42, 0.85);
          color: #e2b83b;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          z-index: 1;
        }

        .spec-image-img {
          width: 100%;
          height: 200px;
          object-fit: contain;
          border-radius: 4px;
        }

        .door-spec-image-container {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          overflow: hidden;
          height: 220px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 0.4rem;
        }

        .door-spec-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 4px;
        }

        /* スマエル技術解説専用の拡大写真2点横並び */
        .interior-specs-images {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          align-items: start;
          flex: 1;
        }

        .interior-spec-img-box {
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          padding: 0.6rem;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          min-height: 160px;
          height: auto;
        }

        .interior-spec-img-box img {
          width: 45%;
          height: 140px;
          object-fit: contain;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .interior-spec-text-container {
          width: 55%;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: left;
        }

        .interior-spec-img-label {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(15, 23, 42, 0.85);
          color: #e2b83b;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          z-index: 1;
        }

        /* 拡大表示可能画像用ホバーエフェクト */
        .zoomable-image {
          cursor: zoom-in !important;
          transition: filter 0.2s ease, transform 0.2s ease !important;
        }

        .zoomable-image:hover {
          filter: brightness(1.05) !important;
        }

        /* ライトボックス */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(7, 10, 19, 0.85);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fade-in 0.2s ease-out;
          cursor: zoom-out;
        }

        .lightbox-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: scale-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .lightbox-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 0.4rem 1.2rem;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .lightbox-close:hover {
          background: #e2b83b;
          color: #070a13;
          transform: translateY(-1px);
        }

        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* 比較テーブルのスタイル（サッシ性能比較用） */
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
          font-size: 0.72rem;
        }

        .comparison-table th {
          background: #0f172a;
          color: #ffffff;
          font-weight: 700;
          padding: 0.4rem;
          text-align: center;
          border: 1px solid #cbd5e1;
        }

        .comparison-table td {
          padding: 0.4rem;
          border: 1px solid #cbd5e1;
          text-align: center;
        }

        .comparison-table tr.highlight {
          background: #fef8e8;
          font-weight: 700;
        }

        /* ==================== 印刷用CSS定義 (A3横 6面印刷完全対応) ==================== */
        @media print {
          .lightbox-overlay {
            display: none !important;
          }
          @page {
            size: A3 landscape;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .presen-container {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 420mm !important;
          }
          .presen-header, .global-controls {
            display: none !important;
          }
          .a3-board-wrapper {
            gap: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 420mm !important;
          }
          .paper-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 6mm 10mm !important; /* 上下左右の用紙余白を最小化してコンテンツ領域を拡張 */
            width: 420mm !important;
            height: 297mm !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .sheet-content-split {
            display: grid !important;
            grid-template-columns: 44% 52% !important;
            gap: 4% !important;
          }
          .spec-grid {
            display: grid !important;
            grid-template-columns: 58% 39% !important;
            gap: 3% !important;
          }
          .perspective-showcase-split {
            display: grid !important;
            gap: 1.25rem !important;
          }
          .interior-specs-images {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.25rem !important;
            align-items: start !important;
            flex: none !important;
          }
          
          /* 印刷時の自動縦伸び(flex)を完全に解除して、ブラウザ版の比率を維持する */
          .sheet-content-full,
          .sheet-content-split,
          .perspective-showcase-split,
          .spec-grid {
            flex: none !important;
            height: auto !important;
          }

          /* 1面目 Before図面 ＆ After図面の印刷サイズ調整 */
          .before-floorplan-card {
            padding: 0.35rem 0.6rem !important;
            gap: 0.2rem !important;
          }
          .before-floorplan-image-container {
            height: 380px !important; /* 精確にBefore画像コンテナのみを縦に拡大 */
          }
          .after-floorplan-image-container {
            height: 520px !important; /* 右側のAfter図面を大きく表示 */
          }
          
          /* 2面目・4面目 外観・内観パース画像サイズを最大化（用紙上下余白を埋める） */
          .perspective-showcase-split .perspective-showcase.aspect-16-9 {
            aspect-ratio: 16 / 9 !important;
            height: auto !important;
            max-height: 450px !important; /* 420pxからさらに450pxに拡大し余白を吸収 */
          }
          
          /* 3面目 YKK AP 断面構造画像 ＆ 窓枠カラー画像 ＆ 玄関ドア */
          .zoomable-image-container {
            height: 360px !important; /* サッシ断面・カラー画像の高さを360pxに拡大 */
          }
          .door-design-color-container {
            height: 360px !important; /* 玄関ドアデザイン・カラー画像を360pxに大幅拡大（赤枠部分を完全に消滅） */
          }
          .sash-importance-card {
            padding: 0.35rem 0.5rem !important;
            margin-top: 0.25rem !important;
            line-height: 1.3 !important;
          }
          .sash-desc-card {
            padding: 0.5rem !important;
          }
          
          /* --- A3印刷時の詰め出し・レイアウト確認の調整 --- */
          .sheet-header {
            margin-bottom: 0.35rem !important;
            padding-bottom: 0.3rem !important;
          }
          .sheet-footer {
            margin-top: 0.15rem !important;
            padding-top: 0.2rem !important;
          }
          
          /* 2面目・4面目・6面目の詳細仕様カード：最小高さを設定して底面まで引き延ばし、余白をなくす */
          .floorplan-card, .spec-showcase-card, .building-conditions-card {
            padding: 0.85rem !important;
            min-height: 380px !important; /* 縦幅を380pxに固定して余白を完全に埋める */
            box-sizing: border-box !important;
          }
          
          /* 5面目 室内ドア Smayell のディテール画像とカラー一覧 */
          .interior-spec-img-box {
            height: 240px !important; /* ディテールカード高さを240pxに引き上げ */
            padding: 0.4rem !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 0.5rem !important;
          }
          .interior-spec-img-box img {
            width: 45% !important;
            height: 200px !important; /* ディテール画像を200pxに拡大 */
            object-fit: contain !important;
          }
          .interior-spec-text-container {
            width: 55% !important;
          }
          .interior-spec-img-box h4 {
            font-size: 0.75rem !important;
          }
          .interior-spec-img-box p {
            font-size: 0.58rem !important;
            line-height: 1.25 !important;
          }
          .smayell-color-container {
            height: 380px !important; /* 下部のSmayellカラー画像を380pxに大幅拡大（赤枠部分を完全に消滅） */
          }
          
          /* 6面目 水回り住設画像 ＆ カードの調整 */
          .perspective-showcase.aspect-1-1 {
            aspect-ratio: 1 / 1 !important;
            height: auto !important;
            max-height: 320px !important; /* 水回り4つの住設画像を320pxに拡大 */
          }
          .perspective-showcase.aspect-1-1 img {
            height: 100% !important;
            object-fit: cover !important;
          }
          
          /* テーブル行間とフォントの拡張（カードの引き延ばしに伴う文字の間延び防止） */
          .conditions-table td {
            padding: 0.45rem 0 !important; /* テーブル行間を広げてカードの底まで自然に埋める */
            font-size: 0.78rem !important;
          }
          .door-point-box {
            padding: 0.35rem !important;
          }
          .door-point-value {
            font-size: 0.82rem !important;
          }
          .door-point-desc {
            font-size: 0.58rem !important;
          }
          .door-description-text {
            font-size: 0.74rem !important;
            padding: 0.4rem 0.6rem !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>

      {/* ヘッダー (画面のみ) */}
      <header className="presen-header">
        <div className="header-title-group">
          <h1>長友ホーム AI戦略室 <span>提案ボード</span></h1>
          {isEditMode ? (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <input 
                type="text" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  background: "#1e293b",
                  border: "1px solid #e2b83b",
                  color: "#ffffff",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  width: "150px"
                }}
              />
              <input 
                type="text" 
                value={planName} 
                onChange={(e) => setPlanName(e.target.value)}
                style={{
                  background: "#1e293b",
                  border: "1px solid #cbd5e1",
                  color: "#ffffff",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  width: "250px"
                }}
              />
            </div>
          ) : (
            <p>{clientName}様向けフルパッケージ・デジタルプレゼンボード（A3印刷・PDF対応）</p>
          )}
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* 決定仕様の保存ボタン */}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.6rem 1.4rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: isSaving ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? "💾 保存中..." : isEditMode ? "💾 編集内容と仕様を保存" : "💾 決定プランを保存"}
          </button>
          <button 
            onClick={() => window.print()} 
            style={{
              background: "linear-gradient(135deg, #e2b83b 0%, #c69b6b 100%)",
              color: "#070a13",
              border: "none",
              padding: "0.6rem 1.4rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(226, 184, 59, 0.2)"
            }}
          >
            🖨️ A3印刷 / PDF保存
          </button>
          <Link href="/presentation" className="btn-back" style={{ background: "rgba(226, 184, 59, 0.15)", borderColor: "#e2b83b" }}>
            👈 一覧に戻る
          </Link>
          <Link href="/" className="btn-back">
            🏠 図面比較ツールに戻る
          </Link>
        </div>
      </header>

      {/* A3プレゼンボード縦並びラッパー */}
      <div className="a3-board-wrapper">

        {/* ==================== 1面目: コンセプト & 間取りプラン ==================== */}
        <article className="paper-sheet">
          <div className="sheet-header">
            <div className="sheet-logo">N</div>
            <div className="sheet-title-area">
              <span className="sheet-category-badge">Concept & Plan</span>
              <div className="sheet-project-name">{clientName} {planName}</div>
            </div>
          </div>

          <div className="concept-title-box">
            {isEditMode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", textAlign: "left", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <input 
                    type="text" 
                    value={conceptSubtitle} 
                    onChange={(e) => setConceptSubtitle(e.target.value)} 
                    placeholder="コンセプトの英語サブタイトルを入力..."
                    style={{
                      width: "70%",
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.8rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background: "#f8fafc",
                      color: "#0f172a"
                    }}
                  />
                  <button 
                    className="ai-btn"
                    onClick={() => {
                      setAiGenerateType("concept");
                      setAiModalOpen(true);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #e2b83b 0%, #b48a1b 100%)",
                      color: "#070a13",
                      border: "none",
                      padding: "0.4rem 1rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    ✨ AIでコンセプト生成
                  </button>
                </div>
                <textarea 
                  value={conceptTitle} 
                  onChange={(e) => setConceptTitle(e.target.value)} 
                  placeholder="コンセプトの日本語メインタイトルを入力 (改行を入れることができます)..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem",
                    fontSize: "1.2rem",
                    fontWeight: "800",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    background: "#f8fafc",
                    color: "#0f172a",
                    resize: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            ) : (
              <>
                <div className="concept-subtitle">{conceptSubtitle}</div>
                <h2 className="concept-main-title">{conceptTitle}</h2>
              </>
            )}
          </div>

          <div className="sheet-content-split">
            <div className="story-section">
              <h3>🏡 暮らしを豊かにする設計動線</h3>
              
              {isEditMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "bold" }}>設計ストーリー(最大3点)</span>
                    <button 
                      className="ai-btn"
                      onClick={() => {
                        setAiGenerateType("story");
                        setAiModalOpen(true);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #e2b83b 0%, #b48a1b 100%)",
                        color: "#070a13",
                        border: "none",
                        padding: "0.4rem 1rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      ✨ AIでストーリー生成
                    </button>
                  </div>
                  {stories.map((story: any, sIdx: number) => (
                    <div 
                      key={story.num || sIdx} 
                      className="story-item-edit"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "0.6rem",
                        borderRadius: "8px"
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flex: 1 }}>
                          <div className="story-number" style={{ margin: 0 }}>{story.num}</div>
                          <input 
                            type="text" 
                            value={story.title} 
                            onChange={(e) => {
                              const updated = [...stories];
                              updated[sIdx].title = e.target.value;
                              setStories(updated);
                            }} 
                            style={{
                              flex: 1,
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px"
                            }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            setEditingStoryIndex(sIdx);
                            setEditStoryTitle(story.title);
                            setEditStoryDesc(story.desc);
                          }}
                          style={{
                            background: "#0f172a",
                            color: "#e2b83b",
                            border: "1px solid #e2b83b",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            fontWeight: "bold"
                          }}
                        >
                          🔍 編集
                        </button>
                      </div>
                      <textarea 
                        value={story.desc} 
                        onChange={(e) => {
                          const updated = [...stories];
                          updated[sIdx].desc = e.target.value;
                          setStories(updated);
                        }} 
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          resize: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="story-list">
                  {stories.map((story: any) => (
                    <div className="story-item" key={story.num}>
                      <div className="story-number">{story.num}</div>
                      <div className="story-text">
                        <h4>{story.title}</h4>
                        <p>{story.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 改修前（Before）の間取りプラン */}
              <div className="before-floorplan-card" style={{ position: "relative" }}>
                <div className="before-floorplan-header">
                  {isEditMode ? (
                    <input 
                      type="text" 
                      value={beforeFloorplanTitle} 
                      onChange={(e) => setBeforeFloorplanTitle(e.target.value)}
                      style={{ fontSize: "0.8rem", fontWeight: "bold", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "1px 4px", width: "80%" }}
                    />
                  ) : (
                    <span className="before-floorplan-title">🏡 {beforeFloorplanTitle}</span>
                  )}
                </div>
                {assetsState.beforeFloorplan ? (
                  <div className="before-floorplan-image-container" style={{ width: "100%", height: "270px", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1", display: "flex", justifyContent: "center", alignItems: "center", background: "#f1f5f9", position: "relative" }}>
                    <img src={assetsState.beforeFloorplan} alt="改修前間取り" style={{ width: "100%", height: "100%", objectFit: "contain" }} className="zoomable-image" onClick={() => setModalImage(assetsState.beforeFloorplan)} />
                    <ImageReplacer 
                      isEditMode={isEditMode}
                      onReplace={(base64) => {
                        setAssetsState({ ...assetsState, beforeFloorplan: base64 });
                      }}
                    />
                  </div>
                ) : (
                  <div className="before-floorplan-grid">
                    {initialData.beforeFloorplan.rooms.map((room: any, idx: number) => (
                      <div 
                        className={`before-room ${room.bgClass}`} 
                        style={{ gridColumn: room.col, gridRow: room.row }}
                        key={idx}
                      >
                        {room.name}{room.size && <span>{room.size}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 1階層 After間取り (画像表示は画像表示と交換のみ) */}
            <div className="floorplan-card" style={{ position: "relative" }}>
              <div className="floorplan-header">
                {isEditMode ? (
                  <input 
                    type="text" 
                    value={afterFloorplanTitle} 
                    onChange={(e) => setAfterFloorplanTitle(e.target.value)}
                    style={{ fontSize: "0.85rem", fontWeight: "bold", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "1px 4px", width: "80%" }}
                  />
                ) : (
                  <span className="floorplan-title">🏡 {afterFloorplanTitle}</span>
                )}
                {!isEditMode && !assetsState.afterFloorplan && (
                  <div className="floorplan-legend">
                    <div className="legend-item"><span className="legend-color" style={{ background: "#fef08a" }}></span>LDK</div>
                    <div className="legend-item"><span className="legend-color" style={{ background: "#ffedd5" }}></span>収納</div>
                    <div className="legend-item"><span className="legend-color" style={{ background: "#f1f5f9" }}></span>水回り</div>
                  </div>
                )}
              </div>

              {assetsState.afterFloorplan ? (
                <div className="after-floorplan-image-container" style={{ width: "100%", height: "100%", minHeight: "180px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc", position: "relative" }}>
                  <img src={assetsState.afterFloorplan} alt="改装後間取り" style={{ width: "100%", height: "100%", objectFit: "contain" }} className="zoomable-image" onClick={() => setModalImage(assetsState.afterFloorplan)} />
                  <ImageReplacer 
                    isEditMode={isEditMode}
                    onReplace={(base64) => {
                      setAssetsState({ ...assetsState, afterFloorplan: base64 });
                    }}
                  />
                </div>
              ) : (
                <div className="floorplan-grid">
                  {initialData.afterFloorplan.rooms.map((room: any, idx: number) => (
                    <div 
                      className={`room ${room.bgClass}`} 
                      style={{ gridColumn: room.col, gridRow: room.row }}
                      key={idx}
                    >
                      {room.name}{room.size && <span>{room.size}</span>}
                    </div>
                  ))}
                  <div className="arrow-line arrow-doma-ldk"></div>
                </div>
              )}
            </div>
          </div>

          <div className="sheet-footer">
            <div>※本プランは確定間取りではなく、提案にお使い頂くイメージ画像です。</div>
            <div className="sheet-footer-author">Nagatomo Home</div>
          </div>
        </article>

        {/* ==================== 2面目: 外観 & 外部仕様プラン (断熱トグル連動) ==================== */}
        <article className="paper-sheet">
          <div className="sheet-header">
            <div className="sheet-logo">N</div>
            <div className="sheet-title-area">
              <span className="sheet-category-badge">Elevation & Exterior Spec</span>
              <div className="sheet-project-name">{clientName} {planName}</div>
            </div>
          </div>

          <div className="sheet-content-full">
            <div className="perspective-showcase-split">
              <div className="perspective-showcase aspect-16-9" style={{ position: "relative" }}>
                <span className="perspective-badge">✨ ご提案外観イメージ</span>
                <img 
                  src={assetsState.exterior} 
                  alt="ご提案外観パースイメージ"
                  className="perspective-image zoomable-image"
                  onClick={() => setModalImage(assetsState.exterior)}
                />
                <ImageReplacer 
                  isEditMode={isEditMode}
                  onReplace={(base64) => {
                    setAssetsState({ ...assetsState, exterior: base64 });
                  }}
                />
              </div>
              <div className="perspective-showcase aspect-16-9" style={{ background: "#f8fafc", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px", boxSizing: "border-box", position: "relative" }}>
                <span className="perspective-badge" style={{ background: "rgba(15, 23, 42, 0.85)" }}>🏡 ご提案南立面図（CADイメージ）</span>
                {assetsState.elevation ? (
                  <img src={assetsState.elevation} alt="ご提案南立面図" className="perspective-image zoomable-image" style={{ objectFit: "contain" }} onClick={() => setModalImage(assetsState.elevation)} />
                ) : (
                  <svg viewBox="0 0 300 150" width="100%" height="100%">
                    {activeDoor === "venato" ? (
                      <g>
                        <rect x="155" y="82" width="35" height="40" fill="#fef08a" stroke="#b45309" strokeWidth="1.5" />
                        <line x1="183" y1="82" x2="183" y2="122" stroke="#b45309" strokeWidth="1" />
                        <circle cx="160" cy="102" r="1.5" fill="#000" />
                      </g>
                    ) : (
                      <g>
                        <rect x="150" y="82" width="45" height="40" fill="#fef08a" opacity="0.9" stroke="#b45309" strokeWidth="1.5" />
                        <line x1="172.5" y1="82" x2="172.5" y2="122" stroke="#b45309" strokeWidth="1.2" />
                        <rect x="180" y="92" width="2" height="20" fill="#000" />
                      </g>
                    )}
                    <line x1="15" y1="58" x2="285" y2="73" stroke="#94a3b8" strokeWidth="2.5" />
                    <line x1="280" y1="73" x2="280" y2="122" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="280" y1="122" x2="285" y2="130" stroke="#94a3b8" strokeWidth="1.5" />
                  </svg>
                )}
                <ImageReplacer 
                  isEditMode={isEditMode}
                  onReplace={(base64) => {
                    setAssetsState({ ...assetsState, elevation: base64 });
                  }}
                />
              </div>
            </div>

            <div className="spec-grid">
              <div className="spec-showcase-card">
                <div className="spec-card-title">{initialData.exteriorSpec.title}</div>
                <div className="door-details">
                  <div className="door-header-info">
                    <span className="door-model-name">{exteriorData.modelName}</span>
                    <span className="door-maker-badge">標準パッケージ</span>
                  </div>
                  <div className="door-points-container" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {displayMaterials.map((mat: any, idx: number) => (
                      <div className="material-chip-container" style={{ margin: 0 }} key={idx}>
                        <div className={`material-chip`} style={cleanStyle(getMaterialStyle(mat.gradient, { border: mat.border }))}></div>
                        <div className="material-chip-info">
                          {isEditMode ? (
                            <>
                              <input 
                                type="text" 
                                value={mat.label} 
                                onChange={(e) => {
                                  const updated = [...doorMaterials];
                                  updated[idx].label = e.target.value;
                                  setDoorMaterials(updated);
                                }}
                                style={{ fontSize: "0.65rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%" }}
                              />
                              <input 
                                type="text" 
                                value={mat.val} 
                                onChange={(e) => {
                                  const updated = [...doorMaterials];
                                  updated[idx].val = e.target.value;
                                  setDoorMaterials(updated);
                                }}
                                style={{ fontSize: "0.75rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%", marginTop: "2px" }}
                              />
                              <input 
                                type="text" 
                                value={mat.code || ""} 
                                onChange={(e) => {
                                  const updated = [...doorMaterials];
                                  updated[idx].code = e.target.value;
                                  setDoorMaterials(updated);
                                }}
                                placeholder="品番 (例: SG-1234)"
                                style={{ fontSize: "0.65rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%", marginTop: "2px" }}
                              />
                            </>
                          ) : (
                            <>
                              <span className="material-chip-label">{mat.label}</span>
                              <span className="material-chip-val">
                                {mat.val}
                                {mat.code && <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block", fontWeight: "normal" }}>品番: {mat.code}</span>}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="door-description-text">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <strong>【外部設計アドバイス】</strong>
                      {isEditMode && (
                        <button 
                          className="ai-btn"
                          onClick={() => {
                            setAiGenerateType("exterior_advice");
                            setAiModalOpen(true);
                          }}
                          style={{
                            background: "linear-gradient(135deg, #e2b83b 0%, #b48a1b 100%)",
                            color: "#070a13",
                            border: "none",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          ✨ AI生成
                        </button>
                      )}
                    </div>
                    {isEditMode ? (
                      <textarea
                        value={doorDescription}
                        onChange={(e) => setDoorDescription(e.target.value)}
                        rows={4}
                        style={{
                          width: "100%",
                          fontSize: "0.74rem",
                          border: "1px solid #cbd5e1",
                          padding: "4px",
                          resize: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    ) : (
                      doorDescription
                    )}
                  </div>
                </div>
              </div>

              <div className="building-conditions-card">
                <div>
                  <div className="conditions-title">🏡 計画・標準仕様前提</div>
                  <table className="conditions-table">
                    <tbody>
                      {displayConditions.map((cond: any, idx: number) => (
                        <tr key={idx}>
                          <td className="cond-label">
                            {isEditMode ? (
                              <input 
                                type="text" 
                                value={cond.label} 
                                onChange={(e) => {
                                  const updated = [...conditions];
                                  updated[idx].label = e.target.value;
                                  setConditions(updated);
                                }}
                                style={{ fontSize: "0.75rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%" }}
                              />
                            ) : (
                              cond.label
                            )}
                          </td>
                          <td className="cond-value">
                            {isEditMode ? (
                              <input 
                                type="text" 
                                value={cond.val} 
                                onChange={(e) => {
                                  const updated = [...conditions];
                                  updated[idx].val = e.target.value;
                                  setConditions(updated);
                                }}
                                style={{ fontSize: "0.75rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%", textAlign: "right" }}
                              />
                            ) : (
                              cond.val
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: "1rem", fontSize: "0.74rem", lineHeight: "1.45", color: "#475569", background: "#ffffff", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <strong>【サッシ・断熱プランのご案内】</strong><br />
                  現在は、断熱性能として<strong>等級{activeInsulationGrade === "grade7" ? "7" : activeInsulationGrade === "grade6" ? "6" : "5"}（UA値: {currentInsulation.ua}）</strong>、サッシには<strong>{activeSash === "apw430" ? "樹脂トリプル窓 APW 430" : activeSash === "apw330" ? "樹脂複層窓 APW 330" : "アルミ樹脂複合窓"}</strong>を選択しています。都城市の地域区分に合わせ、最適な仕様に設定されています。
                </div>
              </div>
            </div>
          </div>

          <div className="sheet-footer">
            <div>※外観デザインやサッシの選択状態は、お打合せにより最終確定します。</div>
            <div className="sheet-footer-author">Nagatomo Home</div>
          </div>
        </article>

        {/* ==================== 3面目: 【新規】YKK AP 樹脂サッシ技術解説面 ==================== */}
        <article className="paper-sheet">
          <div className="sheet-header">
            <div className="sheet-logo">N</div>
            <div className="sheet-title-area">
              <span className="sheet-category-badge">Sash Technology</span>
              <div className="sheet-project-name">{clientName} {planName}</div>
            </div>
          </div>

          <div className="sheet-content-full">
            <div className="sheet-content-split" style={{ gridTemplateColumns: "48% 48%", gap: "4%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, borderBottom: "2px solid #cbd5e1", paddingBottom: "0.4rem", color: "#0f172a" }}>
                  📐 樹脂フレーム＆ガラスの断面構造
                </h3>
                <div className="apw-spec-image-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "transparent", padding: 0 }}>
                  <div className="zoomable-image-container" style={{ position: "relative", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", height: "260px", background: "#ffffff" }}>
                    <span className="spec-image-badge" style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "3px", zIndex: 1 }}>
                      断面構造
                    </span>
                    <img 
                      src={activeSash === "apw430" ? "/catalog/APW430/APW430 上部.jpg" : "/catalog/APW430/APW330 上部.jpg"} 
                      alt="樹脂サッシの断面" 
                      className="zoomable-image" 
                      style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                      onClick={() => setModalImage(activeSash === "apw430" ? "APW430-double" : "APW330-double")} 
                    />
                  </div>
                  <div className="zoomable-image-container" style={{ position: "relative", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", height: "260px", background: "#ffffff" }}>
                    <span className="spec-image-badge" style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "3px", zIndex: 1 }}>
                      窓枠カラー
                    </span>
                    <img 
                      src={activeSash === "apw430" ? "/catalog/APW430/APW430 下部.jpg" : "/catalog/APW430/APW330 下部.jpg"} 
                      alt="サッシ窓枠カラー" 
                      className="zoomable-image" 
                      style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                      onClick={() => setModalImage(activeSash === "apw430" ? "APW430-double" : "APW330-double")} 
                    />
                  </div>
                </div>
                <div className="sash-importance-card" style={{ fontSize: "0.74rem", lineHeight: "1.4", color: "#475569", background: "#f8fafc", padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <strong>【樹脂フレームの重要性】</strong><br />
                  アルミ製フレームに比べ、樹脂製フレームは熱の伝わりやすさが<strong>約1000分の1</strong>。外気温の影響をシャットアウトし、結露を根本的に防ぎます。
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, borderBottom: "2px solid #cbd5e1", paddingBottom: "0.4rem", color: "#0f172a" }}>
                  📊 サッシ断熱仕様の性能比較
                </h3>
                <div className="door-description-text sash-desc-card" style={{ background: "#f8fafc", padding: "0.8rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#eab308", marginBottom: "0.25rem" }}>{sashData.name}</h4>
                  <p style={{ fontSize: "0.74rem", lineHeight: "1.45" }}>{sashData.description}</p>
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.3rem" }}>性能スペック比較テーブル</h4>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>サッシグレード</th>
                        <th>Ua値 (目標)</th>
                        <th>断熱等級</th>
                        <th>ガラス枚数</th>
                        <th>フレーム特性</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={activeSash !== "apw330" && activeSash !== "apw430" ? "highlight" : ""}>
                        <td>アルミ樹脂複合サッシ等 (一般)</td>
                        <td>0.60</td>
                        <td>等級5相当</td>
                        <td>複層ガラス</td>
                        <td>アルミ樹脂複合</td>
                      </tr>
                      <tr className={activeSash === "apw330" ? "highlight" : ""}>
                        <td>樹脂サッシ APW 330 (標準仕様)</td>
                        <td>0.46</td>
                        <td>等級6相当</td>
                        <td>Low-E複層ガラス</td>
                        <td>高品質樹脂フレーム (アルゴンガス)</td>
                      </tr>
                      <tr className={activeSash === "apw430" ? "highlight" : ""}>
                        <td>樹脂サッシ APW 430 (極暖仕様)</td>
                        <td>0.33</td>
                        <td>等級7相当</td>
                        <td>Low-Eトリプルガラス</td>
                        <td>高性能樹脂フレーム (アルゴン/クリプトン)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ fontSize: "0.7rem", lineHeight: "1.4", color: "#64748b", marginTop: "0.5rem" }}>
                  ※Ua値が低いほど断熱性能が高く、冷暖房費の節約やヒートショック防止に直結します。
                </div>
              </div>
            </div>

            {/* 提案玄関ドア デザイン ＆ カラーバリエーション */}
            <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", padding: "0.8rem", marginTop: "1rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", borderBottom: "1px solid #cbd5e1", paddingBottom: "0.25rem" }}>
                ■ 提案玄関ドア デザイン ＆ カラーバリエーション ({activeDoor === "venato" ? "ヴェナート D30" : "コンコード S30"})
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div className="door-design-color-container" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", padding: "0.4rem", height: "170px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <span style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "3px", zIndex: 1 }}>
                    デザイン一覧
                  </span>
                  <img 
                    src={exteriorData.specImage || (activeDoor === "venato" ? "/catalog/ヴェナートD30/デザイン一覧.jpg" : "/catalog/コンコード S30/デザイン一覧.jpg")} 
                    alt="デザイン一覧" 
                    className="zoomable-image" 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                    onClick={() => setModalImage(exteriorData.specImage || (activeDoor === "venato" ? "/catalog/ヴェナートD30/デザイン一覧.jpg" : "/catalog/コンコード S30/デザイン一覧.jpg"))} 
                  />
                </div>
                <div className="door-design-color-container" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", padding: "0.4rem", height: "170px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <span style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "3px", zIndex: 1 }}>
                    カラーバリエーション
                  </span>
                  <img 
                    src={exteriorData.colorImage || (activeDoor === "venato" ? "/catalog/ヴェナートD30/カラーバリエーション.jpg" : "/catalog/コンコード S30/カラーバリエーション.jpg")} 
                    alt="カラーバリエーション" 
                    className="zoomable-image" 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                    onClick={() => setModalImage(exteriorData.colorImage || (activeDoor === "venato" ? "/catalog/ヴェナートD30/カラーバリエーション.jpg" : "/catalog/コンコード S30/カラーバリエーション.jpg"))} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sheet-footer">
            <div>※YKK AP製品高品質樹脂サッシを標準採用しています。</div>
            <div className="sheet-footer-author">Nagatomo Home</div>
          </div>
        </article>

        {/* ==================== 4面目: 室内ドア Smayell & インテリアプラン ==================== */}
        <article className="paper-sheet">
          <div className="sheet-header">
            <div className="sheet-logo">N</div>
            <div className="sheet-title-area">
              <span className="sheet-category-badge">Interior & Fitting</span>
              <div className="sheet-project-name">{clientName} {planName}</div>
            </div>
          </div>

          <div className="sheet-content-full">
            <div className="perspective-showcase-split">
              <div className="perspective-showcase aspect-16-9" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: "8px" }}>
                <span className="perspective-badge">✨ ご提案内観イメージ (選択中)</span>
                <img 
                  src={getInteriorImagePath(activeInterior)} 
                  alt={interiorData.modelName} 
                  className="perspective-image zoomable-image" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onClick={() => setModalImage(getInteriorImagePath(activeInterior))} 
                />
                <ImageReplacer 
                  isEditMode={isEditMode}
                  onReplace={(base64) => {
                    setAssetsState({ ...assetsState, interiorActive: base64 });
                  }}
                />
              </div>
              {(() => {
                const otherKeys = Object.keys(initialData.interiorSpec.plans).filter(k => k !== activeInterior);
                const otherKey = otherKeys[0] || activeInterior;
                const otherData = initialData.interiorSpec.plans[otherKey];
                return (
                  <div className="perspective-showcase aspect-16-9" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: "8px" }}>
                    <span className="perspective-badge">✨ 別内観イメージ</span>
                    <img 
                      src={getInteriorImagePath(otherKey)} 
                      alt={otherData.modelName} 
                      className="perspective-image zoomable-image" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onClick={() => setModalImage(getInteriorImagePath(otherKey))} 
                    />
                    <ImageReplacer 
                      isEditMode={isEditMode}
                      onReplace={(base64) => {
                        setAssetsState({ ...assetsState, interiorAlternative: base64 });
                      }}
                    />
                  </div>
                );
              })()}
            </div>

            <div className="spec-grid">
              <div className="spec-showcase-card">
                <div className="spec-card-title">
                  {isEditMode ? (
                    <input 
                      type="text" 
                      value={interiorSpecTitle} 
                      onChange={(e) => setInteriorSpecTitle(e.target.value)} 
                      style={{ fontSize: "1rem", fontWeight: "bold", border: "1px solid #cbd5e1", width: "100%", padding: "2px 4px" }}
                    />
                  ) : (
                    interiorSpecTitle
                  )}
                </div>
                <div className="door-details">
                  <div className="door-header-info">
                    <span className="door-model-name">{interiorData.modelName}</span>
                    <span className="door-maker-badge">YKK AP</span>
                  </div>
                  <div className="door-points-container">
                    {interiorFeatures.map((feat: any, idx: number) => (
                      <div className="door-point-box" key={idx}>
                        {isEditMode ? (
                          <>
                            <input 
                              type="text" 
                              value={feat.label} 
                              onChange={(e) => {
                                const updated = [...interiorFeatures];
                                updated[idx].label = e.target.value;
                                setInteriorFeatures(updated);
                              }}
                              style={{ fontSize: "0.65rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%", margin: "0 auto" }}
                            />
                            <input 
                              type="text" 
                              value={feat.val} 
                              onChange={(e) => {
                                const updated = [...interiorFeatures];
                                updated[idx].val = e.target.value;
                                setInteriorFeatures(updated);
                              }}
                              style={{ fontSize: "0.85rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%", margin: "2px auto 0" }}
                            />
                            <textarea 
                              value={feat.desc} 
                              onChange={(e) => {
                                const updated = [...interiorFeatures];
                                updated[idx].desc = e.target.value;
                                setInteriorFeatures(updated);
                              }}
                              rows={2}
                              style={{ fontSize: "0.65rem", padding: "1px 3px", border: "1px solid #cbd5e1", width: "90%", margin: "2px auto 0", resize: "none" }}
                            />
                          </>
                        ) : (
                          <>
                            <span className="door-point-label">{feat.label}</span>
                            <span className="door-point-value">{feat.val}</span>
                            <span className="door-point-desc">{feat.desc}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="door-description-text">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <strong>【インテリア提案】</strong>
                      {isEditMode && (
                        <button 
                          className="ai-btn"
                          onClick={() => {
                            setAiGenerateType("interior_advice");
                            setAiModalOpen(true);
                          }}
                          style={{
                            background: "linear-gradient(135deg, #e2b83b 0%, #b48a1b 100%)",
                            color: "#070a13",
                            border: "none",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          ✨ AI生成
                        </button>
                      )}
                    </div>
                    {isEditMode ? (
                      <textarea
                        value={interiorDescription}
                        onChange={(e) => setInteriorDescription(e.target.value)}
                        rows={4}
                        style={{
                          width: "100%",
                          fontSize: "0.74rem",
                          border: "1px solid #cbd5e1",
                          padding: "4px",
                          resize: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    ) : (
                      interiorDescription
                    )}
                  </div>
                </div>
              </div>

              <div className="building-conditions-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "flex-start" }}>
                <div className="conditions-title" style={{ marginBottom: "0.25rem" }}>🏡 床材・壁紙・照明プラン</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
                  {interiorMaterials.map((mat: any, idx: number) => (
                    <div className="material-chip-container" style={{ margin: 0, padding: "0.3rem 0.5rem" }} key={idx}>
                      <div 
                        className={`material-chip`} 
                        style={cleanStyle(getMaterialStyle(mat.gradient, { 
                          border: mat.border, 
                          borderBottom: mat.borderBottom, 
                          borderRadius: mat.borderRadius, 
                          height: mat.height,
                          boxShadow: mat.boxShadow,
                          borderColor: mat.borderColor
                        }))}
                      ></div>
                      <div className="material-chip-info">
                        {isEditMode ? (
                          <>
                            <input 
                              type="text" 
                              value={mat.label} 
                              onChange={(e) => {
                                const updated = [...interiorMaterials];
                                updated[idx].label = e.target.value;
                                setInteriorMaterials(updated);
                              }}
                              style={{ fontSize: "0.65rem", padding: "1px 3px", border: "1px solid #cbd5e1" }}
                            />
                            <input 
                              type="text" 
                              value={mat.val} 
                              onChange={(e) => {
                                const updated = [...interiorMaterials];
                                updated[idx].val = e.target.value;
                                setInteriorMaterials(updated);
                              }}
                              style={{ fontSize: "0.75rem", padding: "1px 3px", border: "1px solid #cbd5e1", marginTop: "2px" }}
                            />
                            <input 
                              type="text" 
                              value={mat.code || ""} 
                              onChange={(e) => {
                                const updated = [...interiorMaterials];
                                updated[idx].code = e.target.value;
                                setInteriorMaterials(updated);
                              }}
                              placeholder="品番 (例: SP-9501)"
                              style={{ fontSize: "0.65rem", padding: "1px 3px", border: "1px solid #cbd5e1", marginTop: "2px", width: "90%" }}
                            />
                          </>
                        ) : (
                          <>
                            <span className="material-chip-label">{mat.label}</span>
                            <span className="material-chip-val">
                              {mat.val}
                              {mat.code && <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block", fontWeight: "normal" }}>品番: {mat.code}</span>}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sheet-footer">
            <div>※コーディネートや仕様は、実際のインテリアサンプルを見ながらお打合せを重ねて決定します。</div>
            <div className="sheet-footer-author">Nagatomo Home</div>
          </div>
        </article>

        {/* ==================== 5面目: 標準室内建具 Smayell ディテール解説 ==================== */}
        <article className="paper-sheet">
          <div className="sheet-header">
            <div className="sheet-logo">N</div>
            <div className="sheet-title-area">
              <span className="sheet-category-badge">Smayell Detail</span>
              <div className="sheet-project-name">{clientName} {planName}</div>
            </div>
          </div>

          <div className="sheet-content-full">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, borderBottom: "2px solid #cbd5e1", paddingBottom: "0.4rem", color: "#0f172a", marginBottom: "0.75rem" }}>
              🚪 標準室内建具 Smayell（スマエル）機能性とディテール解説
            </h3>

            <div className="interior-specs-images">
              {interiorData.specImage && (
                <div className="interior-spec-img-box">
                  <span className="interior-spec-img-label">Vカット木口仕上げ</span>
                  <img src={interiorData.specImage} alt="Vカット木口仕上げ" className="zoomable-image" onClick={() => setModalImage(interiorData.specImage)} />
                  <div className="interior-spec-text-container">
                    <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>美しい木目を実現する特殊仕上げ</h4>
                    <p style={{ fontSize: "0.65rem", color: "#475569", lineHeight: "1.35", marginTop: "0.15rem" }}>
                      ドアの角（木口面）の継ぎ目をV字カットできれいに巻き込むことで、長年使ってもシートの剥がれやガタつきが起きにくい極上の意匠性と高耐久性を両立しました。
                    </p>
                  </div>
                </div>
              )}
              {interiorData.specImage2 && (
                <div className="interior-spec-img-box">
                  <span className="interior-spec-img-label">簡易組み立て枠 ＆ ソフトクローズ</span>
                  <img src={interiorData.specImage2} alt="簡易組み立て枠・ソフトクローズ" className="zoomable-image" onClick={() => setModalImage(interiorData.specImage2)} />
                  <div className="interior-spec-text-container">
                    <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>静かで安全な開閉機構と強固な枠構造</h4>
                    <p style={{ fontSize: "0.65rem", color: "#475569", lineHeight: "1.35", marginTop: "0.15rem" }}>
                      閉まる手前で自動的にブレーキがかかる「ソフトクローズ」を標準装備し、バタン音を防ぎ指を挟む事故を防止。さらに施工精度の高い固定枠構造枠が建具の狂いを長期的に防ぎます。
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontSize: "0.74rem", lineHeight: "1.45", color: "#334155", background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "0.75rem" }}>
              <strong>【長友ホームのこだわり室内ドア】</strong><br />
              室内ドアは毎日の生活で何十回と開閉する、最も負荷のかかる建築パーツの一つです。<br />
              長友ホームでは、YKK APと連携した高品質建具「Smayell（スマエル）」を標準採用し、ハイドア（高さ2.4m）ならではの圧倒的な開放感と、経年劣化に極めて強い特殊仕上げをお施主様にお約束いたします。
            </div>

            <div style={{ marginTop: "1rem", borderTop: "1.5px solid #e2e8f0", paddingTop: "0.75rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem" }}>
                🚪 室内ドア Smayell（スマエル） カラーバリエーション一覧
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div className="smayell-color-container" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", padding: "0.4rem", height: "200px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <span style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "3px", zIndex: 1 }}>
                    スタンダードカラー
                  </span>
                  <img 
                    src={interiorData.colorImage1 || "/catalog/Smayell/スタンダードカラーバリエーション.jpg"} 
                    alt="スタンダードカラー" 
                    className="zoomable-image" 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                    onClick={() => setModalImage(interiorData.colorImage1 || "/catalog/Smayell/スタンダードカラーバリエーション.jpg")} 
                  />
                </div>
                <div className="smayell-color-container" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", padding: "0.4rem", height: "200px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <span style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "3px", zIndex: 1 }}>
                    トレンドカラー
                  </span>
                  <img 
                    src={interiorData.colorImage2 || "/catalog/Smayell/トレンドカラーバリエーション.jpg"} 
                    alt="トレンドカラー" 
                    className="zoomable-image" 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                    onClick={() => setModalImage(interiorData.colorImage2 || "/catalog/Smayell/トレンドカラーバリエーション.jpg")} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sheet-footer">
            <div>※ドアデザインやスリット、カラーバリエーションはカタログより自由にお選びいただけます。</div>
            <div className="sheet-footer-author">Nagatomo Home</div>
          </div>
        </article>

        {/* ==================== 6面目: 水回り設備パッケージ (グレードトグル連動) ==================== */}
        <article className="paper-sheet">
          <div className="sheet-header">
            <div className="sheet-logo">N</div>
            <div className="sheet-title-area">
              <span className="sheet-category-badge">Housing Equipment</span>
              <div className="sheet-project-name">{clientName} {planName}</div>
            </div>
          </div>

          <div className="sheet-content-full">
            <div className="perspective-showcase-split" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              <div className="perspective-showcase aspect-1-1">
                <span className="perspective-badge">🍳 システムキッチン</span>
                <img src={kitchenImg} alt="システムキッチン" className="perspective-image zoomable-image" onClick={() => setModalImage(kitchenImg)} />
              </div>
              <div className="perspective-showcase aspect-1-1">
                <span className="perspective-badge">🛁 システムバス</span>
                <img src={bathroomImg} alt="システムバス" className="perspective-image zoomable-image" onClick={() => setModalImage(bathroomImg)} />
              </div>
              <div className="perspective-showcase aspect-1-1">
                <span className="perspective-badge">🧼 洗面化粧台</span>
                <img src={washroomImg} alt="洗面化粧台" className="perspective-image zoomable-image" onClick={() => setModalImage(washroomImg)} />
              </div>
              <div className="perspective-showcase aspect-1-1">
                <span className="perspective-badge">🚽 トイレ設備</span>
                <img src={toiletImg} alt="トイレ設備" className="perspective-image zoomable-image" onClick={() => setModalImage(toiletImg)} />
              </div>
            </div>

            <div className="spec-grid">
              <div className="spec-showcase-card">
                <div className="spec-card-title">
                  {isAllSameMaker
                    ? `${getMakerName(activeKitchen)} 推奨特別パッケージ`
                    : "個別カスタムセレクトパッケージ"}
                </div>
                <div className="door-details">
                  <div className="door-header-info">
                    <span className="door-model-name">
                      {isAllSameMaker
                        ? "推奨特別パッケージ"
                        : "カスタムセレクト仕様"}
                    </span>
                    <span className="door-maker-badge" style={{ background: "#e2b83b", color: "#070a13" }}>
                      カスタムセレクト - {activeEquipmentGrade === "standard" ? "標準仕様" : "プレミアムDX仕様"}
                    </span>
                  </div>
                  <div className="door-points-container" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {combinedFeatures.map((feat: any, idx: number) => (
                      <div className="door-point-box" key={idx}>
                        <span className="door-point-label" style={{ background: "#e2b83b", color: "#070a13" }}>{feat.label}</span>
                        <span className="door-point-value" style={{ fontSize: "0.8rem" }}>{feat.val || "標準仕様"}</span>
                        <span className="door-point-desc">{feat.desc || `${getMakerName(feat.label === "キッチン" ? activeKitchen : feat.label === "お風呂" ? activeBathroom : feat.label === "洗面" ? activeWashroom : activeToilet)}の推奨モデル`}</span>
                      </div>
                    ))}
                  </div>
                  <div className="door-description-text">
                    <strong>【メーカー・グレード評価】</strong><br />
                    {combinedDescription}
                  </div>
                </div>
              </div>

              <div className="building-conditions-card">
                <div className="conditions-title">🏡 住宅設備詳細スペック</div>
                <table className="conditions-table">
                  <tbody>
                    {combinedSpecs.map((spec: any, idx: number) => (
                      <tr key={idx}>
                        <td className="cond-label">{spec.label}</td>
                        <td className="cond-value">{spec.val || "標準仕様"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="sheet-footer">
            <div>※設備メーカーのショールームにて実物を体験いただき、オプション等の仕様を最終選定します。</div>
            <div className="sheet-footer-author">Nagatomo Home</div>
          </div>
        </article>

      </div>

      {/* ⚙️ 右下追従のフローティング仕様切替 UI */}
      <button 
        className="floating-control-trigger"
        onClick={() => setShowControls(!showControls)}
      >
        ⚙️ 仕様切替
      </button>

      <div className={`floating-control-panel ${showControls ? "show" : ""}`}>
        <div className="panel-header">
          <span className="panel-title">⚙️ プレゼン仕様変更</span>
          <button className="panel-close-btn" onClick={() => setShowControls(false)}>✕</button>
        </div>

        {/* 📺 フルスクリーン表示切替ボタン */}
        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? "📺 フルスクリーン解除" : "📺 フルスクリーンでプレゼン"}
        </button>

        {/* ✏️ ビジュアル編集モード切替ボタン */}
        <button 
          className="fullscreen-btn" 
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            background: isEditMode ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" : "rgba(226, 184, 59, 0.12)",
            color: isEditMode ? "#ffffff" : "#e2b83b",
            borderColor: isEditMode ? "#ef4444" : "rgba(226, 184, 59, 0.3)",
            marginTop: "0.5rem"
          }}
        >
          {isEditMode ? "✏️ 編集モードを終了" : "✏️ 提案モードを編集"}
        </button>

        {/* 玄関ドア仕様 (2面目) */}
        <div className="control-group">
          <span className="control-label">🚪 玄関ドア仕様 (2面目)</span>
          <div className="control-buttons">
            {Object.keys(initialData.exteriorSpec.doorTypes || {}).map((doorKey) => {
              const door = initialData.exteriorSpec.doorTypes[doorKey];
              return (
                <button 
                  key={doorKey}
                  className={`control-btn ${activeDoor === doorKey ? "active" : ""}`}
                  onClick={() => setActiveDoor(doorKey)}
                >
                  {door.modelName.replace("長友ホーム推奨：", "").replace("・外部基本仕様", "")}
                </button>
              );
            })}
          </div>
        </div>

        {/* 断熱性能仕様切替 (2, 3面目) */}
        <div className="control-group">
          <span className="control-label">🌡️ 断熱等級</span>
          <div className="control-buttons">
            <button 
              className={`control-btn ${activeInsulationGrade === "grade5" ? "active" : ""}`}
              onClick={() => {
                setActiveInsulationGrade("grade5");
              }}
            >
              等級5
            </button>
            <button 
              className={`control-btn ${activeInsulationGrade === "grade6" ? "active" : ""}`}
              onClick={() => {
                setActiveInsulationGrade("grade6");
              }}
            >
              等級6 (標準)
            </button>
            <button 
              className={`control-btn ${activeInsulationGrade === "grade7" ? "active" : ""}`}
              onClick={() => {
                setActiveInsulationGrade("grade7");
              }}
            >
              等級7 (極暖)
            </button>
          </div>
        </div>

        {/* サッシ断熱仕様切替 (2, 3面目) */}
        <div className="control-group">
          <span className="control-label">🪟 サッシフレーム</span>
          <div className="control-buttons">
            {Object.keys(initialData.exteriorSpec.sashTypes || {}).map((sashKey) => {
              const sash = initialData.exteriorSpec.sashTypes[sashKey];
              return (
                <button 
                  key={sashKey}
                  className={`control-btn ${activeSash === sashKey ? "active" : ""}`}
                  onClick={() => {
                    setActiveSash(sashKey);
                  }}
                >
                  {sash.name.split(" (")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* インテリアプラン切り替え (4面目) */}
        <div className="control-group">
          <span className="control-label">🛋️ 室内インテリア (4面目)</span>
          <div className="control-buttons">
            {Object.keys(initialData.interiorSpec.plans || {}).map((intKey) => {
              const plan = initialData.interiorSpec.plans[intKey];
              return (
                <button 
                  key={intKey}
                  className={`control-btn ${activeInterior === intKey ? "active" : ""}`}
                  onClick={() => setActiveInterior(intKey)}
                >
                  {plan.modelName.replace("Smayell（スマエル）", "").split("・")[0].split("仕様")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 水回り設備個別メーカー切り替え (6面目) */}
        <div className="control-group">
          <span className="control-label">🍳 キッチンメーカー</span>
          <div className="control-buttons-2x2">
            <button 
              className={`control-btn ${activeKitchen === "lixil" ? "active" : ""}`}
              onClick={() => setActiveKitchen("lixil")}
            >
              LIXIL
            </button>
            <button 
              className={`control-btn ${activeKitchen === "toto" ? "active" : ""}`}
              onClick={() => setActiveKitchen("toto")}
            >
              TOTO
            </button>
            <button 
              className={`control-btn ${activeKitchen === "panasonic" ? "active" : ""}`}
              onClick={() => setActiveKitchen("panasonic")}
            >
              Panasonic
            </button>
            <button 
              className={`control-btn ${activeKitchen === "takara" ? "active" : ""}`}
              onClick={() => setActiveKitchen("takara")}
            >
              タカラ
            </button>
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">🛁 お風呂メーカー</span>
          <div className="control-buttons-2x2">
            <button 
              className={`control-btn ${activeBathroom === "lixil" ? "active" : ""}`}
              onClick={() => setActiveBathroom("lixil")}
            >
              LIXIL
            </button>
            <button 
              className={`control-btn ${activeBathroom === "toto" ? "active" : ""}`}
              onClick={() => setActiveBathroom("toto")}
            >
              TOTO
            </button>
            <button 
              className={`control-btn ${activeBathroom === "panasonic" ? "active" : ""}`}
              onClick={() => setActiveBathroom("panasonic")}
            >
              Panasonic
            </button>
            <button 
              className={`control-btn ${activeBathroom === "takara" ? "active" : ""}`}
              onClick={() => setActiveBathroom("takara")}
            >
              タカラ
            </button>
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">🧼 洗面化粧台メーカー</span>
          <div className="control-buttons-2x2">
            <button 
              className={`control-btn ${activeWashroom === "lixil" ? "active" : ""}`}
              onClick={() => setActiveWashroom("lixil")}
            >
              LIXIL
            </button>
            <button 
              className={`control-btn ${activeWashroom === "toto" ? "active" : ""}`}
              onClick={() => setActiveWashroom("toto")}
            >
              TOTO
            </button>
            <button 
              className={`control-btn ${activeWashroom === "panasonic" ? "active" : ""}`}
              onClick={() => setActiveWashroom("panasonic")}
            >
              Panasonic
            </button>
            <button 
              className={`control-btn ${activeWashroom === "takara" ? "active" : ""}`}
              onClick={() => setActiveWashroom("takara")}
            >
              タカラ
            </button>
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">🚽 トイレメーカー</span>
          <div className="control-buttons-2x2">
            <button 
              className={`control-btn ${activeToilet === "lixil" ? "active" : ""}`}
              onClick={() => setActiveToilet("lixil")}
            >
              LIXIL
            </button>
            <button 
              className={`control-btn ${activeToilet === "toto" ? "active" : ""}`}
              onClick={() => setActiveToilet("toto")}
            >
              TOTO
            </button>
            <button 
              className={`control-btn ${activeToilet === "panasonic" ? "active" : ""}`}
              onClick={() => setActiveToilet("panasonic")}
            >
              Panasonic
            </button>
            <button 
              className={`control-btn ${activeToilet === "takara" ? "active" : ""}`}
              onClick={() => setActiveToilet("takara")}
            >
              タカラ
            </button>
          </div>
        </div>

        {/* 水回り設備グレード切り替え (6面目) */}
        <div className="control-group">
          <span className="control-label">💧 水回り設備グレード</span>
          <div className="control-buttons">
            <button 
              className={`control-btn ${activeEquipmentGrade === "standard" ? "active" : ""}`}
              onClick={() => setActiveEquipmentGrade("standard")}
            >
              標準
            </button>
            <button 
              className={`control-btn ${activeEquipmentGrade === "premium" ? "active" : ""}`}
              onClick={() => setActiveEquipmentGrade("premium")}
            >
              プレミアム
            </button>
          </div>
        </div>
      </div>

      {modalImage && (
        <div className="lightbox-overlay" onClick={() => setModalImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {modalImage === "APW330-double" || modalImage === "APW430-double" ? (
              (() => {
                const sashPrefix = modalImage === "APW430-double" ? "APW430" : "APW330";
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "95vw", maxWidth: "1200px", background: "#ffffff", padding: "1.2rem", borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", height: "650px", position: "relative", background: "#ffffff" }}>
                      <span style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "4px", zIndex: 1 }}>
                        断面構造
                      </span>
                      <img src={`/catalog/APW430/${sashPrefix} 上部.jpg`} alt="断面構造" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", height: "650px", position: "relative", background: "#ffffff" }}>
                      <span style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(15, 23, 42, 0.85)", color: "#e2b83b", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "4px", zIndex: 1 }}>
                        窓枠カラー
                      </span>
                      <img src={`/catalog/APW430/${sashPrefix} 下部.jpg`} alt="窓枠カラー" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                  </div>
                );
              })()
            ) : (
              <img src={modalImage} alt="拡大表示" className="lightbox-img" />
            )}
            <button className="lightbox-close" onClick={() => setModalImage(null)}>✕ 閉じる</button>
          </div>
        </div>
      )}

      {/* AI自動生成モーダル */}
      <AiGenerationModal 
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        clientName={clientName}
        planName={planName}
        selectedSpecs={selectedSpecsForAi}
        generateType={aiGenerateType}
        onApply={handleApplyAiText}
      />

      {/* ストーリーポップアップ編集モーダル */}
      {editingStoryIndex !== null && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(7, 10, 19, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 10001,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            background: "#1e293b",
            border: "1px solid #e2b83b",
            borderRadius: "12px",
            padding: "1.5rem",
            width: "90%",
            maxWidth: "600px",
            color: "#ffffff"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#e2b83b" }}>✏️ 設計ストーリー {editingStoryIndex + 1} 編集</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "0.25rem" }}>ストーリー見出し</label>
                <input 
                  type="text" 
                  value={editStoryTitle} 
                  onChange={(e) => setEditStoryTitle(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#0f172a", color: "#ffffff", fontSize: "0.95rem" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "0.25rem" }}>ストーリー説明文（暮らしのメリット）</label>
                <textarea 
                  value={editStoryDesc} 
                  onChange={(e) => setEditStoryDesc(e.target.value)}
                  rows={6}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#0f172a", color: "#ffffff", fontSize: "0.9rem", resize: "none" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button 
                onClick={() => setEditingStoryIndex(null)}
                style={{ background: "rgba(255, 255, 255, 0.1)", color: "#ffffff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
              >
                キャンセル
              </button>
              <button 
                onClick={() => {
                  const updated = [...stories];
                  updated[editingStoryIndex].title = editStoryTitle;
                  updated[editingStoryIndex].desc = editStoryDesc;
                  setStories(updated);
                  setEditingStoryIndex(null);
                }}
                style={{ background: "#e2b83b", color: "#070a13", border: "none", padding: "0.5rem 1.2rem", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                保存して適用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
