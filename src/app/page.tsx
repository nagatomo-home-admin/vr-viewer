"use client";

import React, { useState, useRef, useEffect } from "react";

// アノテーション（注釈）のデータ型定義（指し示すアンカーと、ピンのラベルの2点座標に拡張）
interface Annotation {
  id: string;
  title: string;
  descriptionClient: string; // お施主様向け説明
  descriptionBuilder: string; // 現場・設計向け説明
  coordinate: {
    x: number; // AIから返された初期のX座標
    y: number; // AIから返された初期のY座標
  };
  anchor: {
    x: number; // 指し示すポイントのX座標
    y: number; // 指し示すポイントのY座標
  };
  label: {
    x: number; // 番号ピン（ラベル）のX座標
    y: number; // 番号ピン（ラベル）のY座標
  };
  category: "floorplan" | "equipment" | "opening" | "storage" | "other";
}

// カテゴリの日本語マップ
const categoryMap = {
  floorplan: "間取り",
  equipment: "設備・水回り",
  opening: "窓・ドア",
  storage: "収納",
  other: "その他"
};

// ベジェ曲線の制御点を計算するヘルパー（アンカーから少し上に膨らむように）
const getControlPoint = (ax: number, ay: number, lx: number, ly: number) => {
  const mx = (ax + lx) / 2;
  const my = (ay + ly) / 2;
  
  // 2点間の距離を計算
  const dx = lx - ax;
  const dy = ly - ay;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // 距離に応じて膨らみ（オフセット）を調整。最大12%、最小5%
  const offset = Math.max(5, Math.min(12, dist * 0.18));
  
  // 常に上方向に膨らませる（yを減算）が、もしピンが極端に上にある場合は-offsetで引っ張る
  return {
    x: mx,
    y: my - offset
  };
};

// A3用紙全体に対する図面の配置パラメータ（％単位）を計算する
const getDiagramLayout = (
  paperW: number,
  paperH: number,
  imgW: number,
  imgH: number,
  scalePercent: number
) => {
  const paperRatio = paperW / paperH; // 1.4142
  const imgRatio = imgW / imgH;
  const S = scalePercent / 100;

  let drawWPercent = 100;
  let drawHPercent = 100;

  if (imgRatio > paperRatio) {
    // 横長：横幅いっぱいに合わせる
    drawWPercent = 100 * S;
    drawHPercent = (100 / imgRatio) * paperRatio * S;
  } else {
    // 縦長：縦幅いっぱいに合わせる
    drawWPercent = 100 * imgRatio * (1 / paperRatio) * S;
    drawHPercent = 100 * S;
  }

  const offsetX = (100 - drawWPercent) / 2;
  const offsetY = (100 - drawHPercent) / 2;

  return {
    w: drawWPercent,
    h: drawHPercent,
    x: offsetX,
    y: offsetY
  };
};

export default function ComparePage() {
  // --- ステート定義 ---
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [beforeFileName, setBeforeFileName] = useState<string>("");
  const [afterFileName, setAfterFileName] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // 表示ターゲットの切り替え ("client": お施主様向け, "builder": 現場向け)
  const [viewTarget, setViewTarget] = useState<"client" | "builder">("client");
  const [isAddingPin, setIsAddingPin] = useState<boolean>(false);

  // Before図面の拡大ポップアップ（モーダル）表示ステート
  const [isBeforeModalOpen, setIsBeforeModalOpen] = useState<boolean>(false);

  // ドラッグ＆ドロップエリアのアクティブ（重なり）状態ステート
  const [isDragActiveBefore, setIsDragActiveBefore] = useState<boolean>(false);
  const [isDragActiveAfter, setIsDragActiveAfter] = useState<boolean>(false);

  // After図面の実際の表示幅を監視するステート（WYSIWYG用）
  const [imageWidth, setImageWidth] = useState<number>(0);

  // A3用紙内でのAfter図面の表示倍率（50%〜120%）
  const [diagramScale, setDiagramScale] = useState<number>(100);

  // After図面の実際の解像度（naturalサイズ）を保持するステート
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNaturalSize({
      w: img.naturalWidth,
      h: img.naturalHeight
    });
  };

  // ドラッグ操作用の参照（アンカーまたはラベルピンのドラッグに対応）
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragAnnotationId = useRef<string | null>(null);
  const dragTargetType = useRef<"anchor" | "label" | null>(null); // "anchor" または "label"

  // --- PDFから画像（PNG Base64）への変換処理 ---
  const convertPdfToImage = async (file: File): Promise<string> => {
    setLoadingStatus("PDFファイルを画像に変換しています...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      // クライアントサイドでのみ実行されるように pdfjs を動的ロード
      const pdfjs = await import("pdfjs-dist");
      // 先ほどpublicにコピーしたWorkerスクリプトを設定
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
      
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // 1ページ目を解析

      // 高画質（デバイスピクセル比を考慮したスケール2.0）でレンダリング
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvasコンテキストの作成に失敗しました。");
      }

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas // 最新版pdfjs-distの型定義準拠のため必須
      }).promise;

      return canvas.toDataURL("image/png");
    } catch (err: any) {
      console.error("PDF Conversion Error:", err);
      throw new Error(`PDFの変換に失敗しました: ${err.message || String(err)}`);
    }
  };

  // --- ファイル読み込み共通処理 ---
  const processUploadedFile = async (file: File, type: "before" | "after") => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let dataUrl = "";
      if (file.type === "application/pdf") {
        dataUrl = await convertPdfToImage(file);
      } else if (file.type.startsWith("image/")) {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      } else {
        throw new Error("PDFまたは画像ファイル（PNG/JPG）をアップロードしてください。");
      }

      if (type === "before") {
        setBeforeImage(dataUrl);
        setBeforeFileName(file.name);
      } else {
        setAfterImage(dataUrl);
        setAfterFileName(file.name);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "ファイルの読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  // --- ファイルアップロードハンドラ (クリック選択用) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file, type);
  };

  // --- ドラッグ＆ドロップ用イベントハンドラ ---
  const handleDragEnter = (e: React.DragEvent, type: "before" | "after") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "before") setIsDragActiveBefore(true);
    else setIsDragActiveAfter(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: "before" | "after") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "before") setIsDragActiveBefore(false);
    else setIsDragActiveAfter(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent, type: "before" | "after") => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === "before") setIsDragActiveBefore(false);
    else setIsDragActiveAfter(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUploadedFile(file, type);
  };

  // --- AI比較処理 ---
  const handleRunAICompare = async () => {
    if (!beforeImage || !afterImage) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus("AIがリノベーション前後の図面を比較しています...");

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          before: beforeImage,
          after: afterImage
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || "AI比較リクエストが失敗しました。");
      }

      if (result.changes && Array.isArray(result.changes)) {
        // AIから返された座標を、初期値として anchor(指示点) と label(ピン位置) に分解して代入
        // 初期状態では引き出し線が見えるように、ピンの位置を少し上にずらす(Y座標から6%引く)
        const initialAnns: Annotation[] = result.changes.map((ann: any) => {
          const x = ann.coordinate.x;
          const y = ann.coordinate.y;
          return {
            ...ann,
            anchor: { x, y },
            label: { x, y: Math.max(0, y - 6) } // ピンを少し上部に初期配置
          };
        });
        
        setAnnotations(initialAnns);
        if (initialAnns.length > 0) {
          setActiveId(initialAnns[0].id);
        }
      } else {
        throw new Error("AIから有効な比較データが返されませんでした。");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "AI比較中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  // --- 2点ドラッグ＆ドロップ制御 ---
  const handleStartDrag = (e: React.MouseEvent, id: string, type: "anchor" | "label") => {
    e.stopPropagation();
    e.preventDefault();
    
    dragAnnotationId.current = id;
    dragTargetType.current = type;
    setActiveId(id);
    
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragAnnotationId.current || !dragTargetType.current || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    
    // マウスの現在位置から、画像内の相対位置（%）を計算
    const clientX = e.clientX;
    const clientY = e.clientY;

    let xPercent = ((clientX - rect.left) / rect.width) * 100;
    let yPercent = ((clientY - rect.top) / rect.height) * 100;

    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    setAnnotations(prev =>
      prev.map(ann => {
        if (ann.id === dragAnnotationId.current) {
          if (dragTargetType.current === "anchor") {
            // A3用紙全体に対する％座標から、図面内の％座標へ逆マッピングして保存
            const imgW = imgNaturalSize?.w || 1200;
            const imgH = imgNaturalSize?.h || 800;
            const ly = getDiagramLayout(1.4142, 1, imgW, imgH, diagramScale);
            
            let imgX = ((xPercent - ly.x) / ly.w) * 100;
            let imgY = ((yPercent - ly.y) / ly.h) * 100;
            imgX = Math.max(0, Math.min(100, imgX));
            imgY = Math.max(0, Math.min(100, imgY));

            return {
              ...ann,
              anchor: {
                x: parseFloat(imgX.toFixed(2)),
                y: parseFloat(imgY.toFixed(2))
              }
            };
          } else {
            // ラベルピン・吹き出しは用紙全体に対する％で保存
            return {
              ...ann,
              label: {
                x: parseFloat(xPercent.toFixed(2)),
                y: parseFloat(yPercent.toFixed(2))
              }
            };
          }
        }
        return ann;
      })
    );
  };

  const handleMouseUp = () => {
    dragAnnotationId.current = null;
    dragTargetType.current = null;
    dragStartPos.current = null;
  };

  // タッチデバイス向けのドラッグ制御（アンカーとラベル両対応）
  const handleStartDragTouch = (e: React.TouchEvent, id: string, type: "anchor" | "label") => {
    e.stopPropagation();
    
    dragAnnotationId.current = id;
    dragTargetType.current = type;
    setActiveId(id);
    
    const touch = e.touches[0];
    dragStartPos.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragAnnotationId.current || !dragTargetType.current || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    let xPercent = ((touch.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((touch.clientY - rect.top) / rect.height) * 100;

    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    setAnnotations(prev =>
      prev.map(ann => {
        if (ann.id === dragAnnotationId.current) {
          if (dragTargetType.current === "anchor") {
            // タッチ操作時の用紙全体％座標から、図面内の％座標へ逆マッピング
            const imgW = imgNaturalSize?.w || 1200;
            const imgH = imgNaturalSize?.h || 800;
            const ly = getDiagramLayout(1.4142, 1, imgW, imgH, diagramScale);
            
            let imgX = ((xPercent - ly.x) / ly.w) * 100;
            let imgY = ((yPercent - ly.y) / ly.h) * 100;
            imgX = Math.max(0, Math.min(100, imgX));
            imgY = Math.max(0, Math.min(100, imgY));

            return {
              ...ann,
              anchor: {
                x: parseFloat(imgX.toFixed(2)),
                y: parseFloat(imgY.toFixed(2))
              }
            };
          } else {
            return {
              ...ann,
              label: {
                x: parseFloat(xPercent.toFixed(2)),
                y: parseFloat(yPercent.toFixed(2))
              }
            };
          }
        }
        return ann;
      })
    );
  };

  // --- アノテーションの追加・編集・削除 ---
  const handleImageClick = (e: React.MouseEvent) => {
    // ピン追加モードの場合のみ動作
    if (!isAddingPin || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const newId = `new-${Date.now()}`;
    const xVal = parseFloat(xPercent.toFixed(2));
    const yVal = parseFloat(yPercent.toFixed(2));
    
    // 新規注釈追加時、アンカーをドロップ位置とし、ラベルピンを少し上にずらして配置
    const newAnn: Annotation = {
      id: newId,
      title: "新規変更点",
      descriptionClient: "ここにお施主様向けの説明を入力してください。",
      descriptionBuilder: "ここに設計・現場向けの施工指示を入力してください。",
      coordinate: { x: xVal, y: yVal },
      anchor: { x: xVal, y: yVal },
      label: { x: xVal, y: Math.max(0, yVal - 6) },
      category: "other"
    };

    setAnnotations(prev => [...prev, newAnn]);
    setActiveId(newId);
    setIsAddingPin(false);
  };

  const handleUpdateAnnotation = (field: keyof Annotation | "ax" | "ay" | "lx" | "ly", value: any) => {
    if (!activeId) return;

    setAnnotations(prev =>
      prev.map(ann => {
        if (ann.id === activeId) {
          if (field === "ax" || field === "ay") {
            const subField = field === "ax" ? "x" : "y";
            return {
              ...ann,
              anchor: {
                ...ann.anchor,
                [subField]: parseFloat(value) || 0
              }
            };
          }
          if (field === "lx" || field === "ly") {
            const subField = field === "lx" ? "x" : "y";
            return {
              ...ann,
              label: {
                ...ann.label,
                [subField]: parseFloat(value) || 0
              }
            };
          }
          return { ...ann, [field]: value };
        }
        return ann;
      })
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  const handleExportImage = () => {
    if (!afterImage) return;

    setIsLoading(true);
    setLoadingStatus("アノテーション付き画像を合成・書き出ししています...");

    const img = new Image();
    img.src = afterImage;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvasのコンテキスト作成に失敗しました。");

        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        // キャンバスサイズをA3横の標準印刷解像度(300dpi相当)に固定
        const canvasWidth = 3508;
        const canvasHeight = 2480;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 1. 白いA3背景（用紙）の描画
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 2. After図面をアスペクト比維持で中央に配置 (contain描画)
        const layout = getDiagramLayout(canvasWidth, canvasHeight, originalWidth, originalHeight, diagramScale);
        
        const finalW = (layout.w / 100) * canvasWidth;
        const finalH = (layout.h / 100) * canvasHeight;
        const finalX = (layout.x / 100) * canvasWidth;
        const finalY = (layout.y / 100) * canvasHeight;

        ctx.drawImage(img, finalX, finalY, finalW, finalH);

        // 基準サイズに応じたスケーリング係数を計算（A3横幅 3508px に対し、1200px基準の比率）
        const scale = canvasWidth / 1200;
        
        const pinRadius = 16 * scale;
        const boxWidth = 240 * scale;
        const padding = 10 * scale;
        const titleFontSize = Math.max(12, Math.round(14 * scale));
        const descFontSize = Math.max(10, Math.round(11 * scale));
        const lineGap = 4 * scale;
        const gapBetweenPinAndBox = 8 * scale;

        // テキストをボックス幅に合わせて改行位置で分割するヘルパー関数
        const wrapText = (text: string, fontSize: number, isBold: boolean, maxWidth: number) => {
          ctx.font = `${isBold ? "bold " : ""}${fontSize}px sans-serif`;
          const words = text.split("");
          const lines: string[] = [];
          let currentLine = "";
          
          for (let i = 0; i < words.length; i++) {
            const char = words[i];
            if (char === "\n") {
              lines.push(currentLine);
              currentLine = "";
              continue;
            }
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
              lines.push(currentLine);
              currentLine = char;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }
          return lines;
        };

        // 角丸長方形を描画するヘルパー
        const drawRoundRect = (x: number, y: number, w: number, h: number, r: number, fillColor: string, strokeColor: string, strokeWidth: number) => {
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === "function") {
            (ctx as any).roundRect(x, y, w, h, r);
          } else {
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
          }
          ctx.fillStyle = fillColor;
          ctx.fill();
          if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
          }
        };

        // 3. 引き出し線（ベジェ曲線）とドット・吹き出しの描画
        annotations.forEach((ann, index) => {
          // アンカー（指示点）：図面内％座標からA3キャンバスの絶対ピクセル座標にマッピング変換
          const anchorX = finalX + (ann.anchor.x / 100) * finalW;
          const anchorY = finalY + (ann.anchor.y / 100) * finalH;
          
          // ラベル（番号ピン）：A3用紙全体の％座標からA3キャンバスの絶対ピクセル座標へ
          const labelX = (ann.label.x / 100) * canvasWidth;
          const labelY = (ann.label.y / 100) * canvasHeight;

          // A. 引き出し線の描画 (赤い点線の二次ベジェ曲線)
          // 制御点を計算するために、アンカーも用紙全体の％座標へ一時的に変換
          const anchorPaperXPercent = (anchorX / canvasWidth) * 100;
          const anchorPaperYPercent = (anchorY / canvasHeight) * 100;
          
          const cp = getControlPoint(anchorPaperXPercent, anchorPaperYPercent, ann.label.x, ann.label.y);
          const cpX = (cp.x / 100) * canvasWidth;
          const cpY = (cp.y / 100) * canvasHeight;

          ctx.beginPath();
          ctx.moveTo(anchorX, anchorY);
          ctx.quadraticCurveTo(cpX, cpY, labelX, labelY);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3 * scale;
          ctx.setLineDash([8 * scale, 8 * scale]);
          ctx.stroke();
          ctx.setLineDash([]); // 点線解除

          // B. アンカードットの描画 (ゴールド丸と白い枠線)
          ctx.beginPath();
          ctx.arc(anchorX, anchorY, 6 * scale, 0, 2 * Math.PI);
          ctx.fillStyle = "#eab308";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          // C. 吹き出し（アノテーションボックス）のサイズ計算と描画
          const description = viewTarget === "client" ? ann.descriptionClient : ann.descriptionBuilder;
          const bubbleTitleText = `${index + 1}. ${ann.title}`;
          
          // ボックス内有効幅
          const innerWidth = boxWidth - padding * 2;
          const titleLines = wrapText(bubbleTitleText, titleFontSize, true, innerWidth);
          const descLines = wrapText(description, descFontSize, false, innerWidth);

          const titleHeight = titleLines.length * (titleFontSize + lineGap);
          const descHeight = descLines.length * (descFontSize + lineGap);
          
          // 吹き出しの総高さ
          const boxHeight = padding * 2 + titleHeight + (titleLines.length > 0 && descLines.length > 0 ? 6 * scale : 0) + descHeight;

          // 吹き出しの位置をピン（丸）の右隣に配置
          const boxX = labelX + pinRadius + gapBetweenPinAndBox;
          const boxY = labelY - boxHeight / 2; // ピンの高さの中心に合わせる

          // 吹き出しが右端からはみ出すのを防ぐ簡易ガード
          let finalBoxX = boxX;
          let arrowDir: "left" | "right" = "left";
          
          if (finalBoxX + boxWidth > canvasWidth) {
            // 右側にはみ出す場合は、ピンの左側に吹き出しを配置する
            finalBoxX = labelX - pinRadius - gapBetweenPinAndBox - boxWidth;
            arrowDir = "right";
          }

          // 吹き出しの角丸四角形背景と枠線を描画（半透明ダークブルー background, 赤枠線）
          drawRoundRect(
            finalBoxX,
            boxY,
            boxWidth,
            boxHeight,
            8 * scale,
            "rgba(15, 23, 42, 0.9)", // 吹き出し背景色
            "#ef4444",               // 枠線は赤
            1.5 * scale
          );

          // 吹き出しの左端アクセント線
          const accentX = arrowDir === "left" ? finalBoxX : finalBoxX + boxWidth - 3 * scale;
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(accentX, boxY + 8 * scale, 3 * scale, boxHeight - 16 * scale);

          // 吹き出しの矢印（三角形）を描画
          ctx.beginPath();
          if (arrowDir === "left") {
            // 左向きの矢印（ピンと接続）
            const arrowX1 = finalBoxX;
            const arrowY1 = labelY - 6 * scale;
            const arrowX2 = finalBoxX;
            const arrowY2 = labelY + 6 * scale;
            const arrowX3 = finalBoxX - 8 * scale;
            const arrowY3 = labelY;
            ctx.moveTo(arrowX1, arrowY1);
            ctx.lineTo(arrowX2, arrowY2);
            ctx.lineTo(arrowX3, arrowY3);
          } else {
            // 右向きの矢印（ピンと接続）
            const arrowX1 = finalBoxX + boxWidth;
            const arrowY1 = labelY - 6 * scale;
            const arrowX2 = finalBoxX + boxWidth;
            const arrowY2 = labelY + 6 * scale;
            const arrowX3 = finalBoxX + boxWidth + 8 * scale;
            const arrowY3 = labelY;
            ctx.moveTo(arrowX1, arrowY1);
            ctx.lineTo(arrowX2, arrowY2);
            ctx.lineTo(arrowX3, arrowY3);
          }
          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.fill();
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          // 吹き出し内のテキストを描画
          let currentY = boxY + padding;
          
          // タイトル
          ctx.fillStyle = "#e2b83b"; // ゴールド
          ctx.font = `bold ${titleFontSize}px sans-serif`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          titleLines.forEach(line => {
            ctx.fillText(line, finalBoxX + padding + (arrowDir === "left" ? 4 * scale : 0), currentY);
            currentY += titleFontSize + lineGap;
          });

          if (titleLines.length > 0 && descLines.length > 0) {
            currentY += 4 * scale; // 隙間
          }

          // 説明文
          ctx.fillStyle = "#ffffff";
          ctx.font = `${descFontSize}px sans-serif`;
          descLines.forEach(line => {
            ctx.fillText(line, finalBoxX + padding + (arrowDir === "left" ? 4 * scale : 0), currentY);
            currentY += descFontSize + lineGap;
          });

          // D. 番号ピンの円の描画 (コーラルレッド、吹き出しの背後に重ねないよう最後に描く)
          ctx.beginPath();
          ctx.arc(labelX, labelY, pinRadius, 0, 2 * Math.PI);
          ctx.fillStyle = "#ef4444";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2 * scale;
          ctx.stroke();

          // E. 番号ピンの文字 (白)
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText((index + 1).toString(), labelX, labelY);
        });

        // 4. 画像のダウンロード
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `リノベ注釈_${viewTarget === "client" ? "施主向け" : "現場向け"}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

      } catch (err: any) {
        console.error("Export Error:", err);
        alert("画像の書き出し中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
        setLoadingStatus("");
      }
    };
  };

  // --- AI提案ボードへの同期処理 ---
  const handleSyncToPresentation = async () => {
    if (!beforeImage || !afterImage) return;

    const customerId = prompt(
      "同期先の『お施主様ID（顧客ID）』を入力してください。\n（半角英数字、ハイフン、アンダースコアのみ。例: sato-home）\n\n※既存のお施主様データがある場合は、1面目のBefore/After図面と設計ストーリーのみが上書き更新されます。無い場合は新規作成されます。"
    );

    if (!customerId) return;

    const safeCustomerId = customerId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (safeCustomerId !== customerId || customerId === "") {
      alert("IDの形式が正しくありません。半角英数字、ハイフン、アンダースコアのみで入力してください。");
      return;
    }

    setIsLoading(true);
    setLoadingStatus("図面と注釈データを『AI提案ボード』に同期しています...");

    try {
      const response = await fetch("/api/presentation/import-comparer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: safeCustomerId,
          beforeImage,
          afterImage,
          annotations
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "同期に失敗しました。");
      }

      if (confirm("同期が完了しました！\nこのままお施主様の『AI提案ボード（プレゼン画面）』を開きますか？")) {
        window.open(`/presentation/${safeCustomerId}`, "_blank");
      }
    } catch (err: any) {
      console.error(err);
      alert(`同期中にエラーが発生しました:\n${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  // After図面の表示サイズ（表示ピクセル幅）を動的に監視（WYSIWYG用）
  useEffect(() => {
    if (!imageWrapperRef.current) return;
    
    const updateSize = () => {
      if (imageWrapperRef.current) {
        setImageWidth(imageWrapperRef.current.offsetWidth);
      }
    };

    updateSize();
    
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(imageWrapperRef.current);
    
    const imgEl = imageWrapperRef.current.querySelector("img");
    if (imgEl) {
      imgEl.addEventListener("load", updateSize);
    }

    return () => {
      resizeObserver.disconnect();
      if (imgEl) {
        imgEl.removeEventListener("load", updateSize);
      }
    };
  }, [afterImage]);

  // --- ドラッグ離脱・キャンセルの保護処理 ---
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      dragAnnotationId.current = null;
      dragTargetType.current = null;
      dragStartPos.current = null;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  const activeAnnotation = annotations.find(ann => ann.id === activeId);

  return (
    <>
      {/* アプリケーションヘッダー（右上に読込と保存ボタンをスマートに配置） */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">N</div>
          <div className="brand-title-group">
            <h1 className="brand-title">ナガトモホーム AI戦略本部</h1>
            <span className="brand-subtitle">Renovation Plan Comparer</span>
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "0.75rem" }}>
          {beforeImage && afterImage && (
            <button 
              className="btn btn-primary"
              onClick={handleRunAICompare}
              disabled={isLoading}
            >
              📥 AI比較を実行 (読込)
            </button>
          )}
          {annotations.length > 0 && (
            <>
              <button 
                className="btn btn-success" 
                onClick={handleExportImage}
                disabled={isLoading}
              >
                💾 注釈付き画像を保存 (保存)
              </button>
              <button 
                className="btn" 
                onClick={handleSyncToPresentation}
                disabled={isLoading}
                style={{
                  background: "linear-gradient(135deg, #e2b83b 0%, #c69b6b 100%)",
                  color: "#070a13",
                  fontWeight: "bold",
                  border: "none",
                  boxShadow: "0 4px 10px rgba(226, 184, 59, 0.25)"
                }}
              >
                🏢 AI提案ボードへ同期
              </button>
            </>
          )}
        </div>
      </header>

      {/* メインエリア */}
      <main className="main-content">
        
        {/* エラーメッセージ表示 */}
        {errorMessage && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            padding: "1rem",
            borderRadius: "12px",
            fontSize: "0.9rem"
          }}>
            ⚠️ <strong>エラーが発生しました:</strong> {errorMessage}
          </div>
        )}

        {/* コントロールバー */}
        {(beforeImage || afterImage || annotations.length > 0) && (
          <div className="control-bar">
            <div className="switch-container">
              <span className="switch-label">説明文のトーン切替:</span>
              <div className="toggle-group">
                <button 
                  className={`toggle-btn ${viewTarget === "client" ? "active" : ""}`}
                  onClick={() => setViewTarget("client")}
                >
                  🌸 お施主様向け
                </button>
                <button 
                  className={`toggle-btn ${viewTarget === "builder" ? "active" : ""}`}
                  onClick={() => setViewTarget("builder")}
                >
                  🛠️ 施工・現場向け
                </button>
              </div>
            </div>

            <div className="action-group" style={{ display: "flex", gap: "0.5rem" }}>
              {afterImage && (
                <button
                  className={`btn ${isAddingPin ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setIsAddingPin(!isAddingPin)}
                >
                  📍 注釈ピンを手動追加 {isAddingPin ? "中 (図面をクリック)" : ""}
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- ワークスペース（新2カラムレイアウト） --- */}
        {annotations.length > 0 ? (
          <div className="workspace-layout" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            
            {/* 【左サイドバー】: Before図面(ミニ) ＋ ツール類(注釈リスト＆詳細) */}
            <div className="left-sidebar">
              
              {/* ミニBeforeビューアー */}
              <div className="mini-before-viewer">
                <div className="panel-header" style={{ paddingBottom: "0.25rem", borderBottom: "none" }}>
                  <h4 className="panel-title" style={{ fontSize: "0.85rem" }}>Before (改装前図面)</h4>
                </div>
                <div className="mini-viewer-card" onClick={() => setIsBeforeModalOpen(true)}>
                  {beforeImage ? (
                    <img src={beforeImage} className="mini-viewer-image" alt="改装前" />
                  ) : (
                    <div className="empty-state" style={{ fontSize: "0.75rem", padding: "1rem" }}>図面なし</div>
                  )}
                </div>
              </div>

              {/* A3用紙内の図面サイズ調整スライダー */}
              <div className="scale-control-panel" style={{ marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>A3用紙内の図面サイズ:</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-gold)" }}>{diagramScale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={diagramScale}
                  onChange={(e) => setDiagramScale(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-gold)", cursor: "pointer" }}
                />
              </div>

              {/* ツールパネル */}
              <div className="tool-panel">
                <div className="panel-header" style={{ paddingBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <h3 className="panel-title" style={{ fontSize: "1rem" }}>注釈リスト</h3>
                  {afterImage && (
                    <button
                      className={`btn ${isAddingPin ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px" }}
                      onClick={() => setIsAddingPin(!isAddingPin)}
                    >
                      {isAddingPin ? "📍 追加中..." : "➕ 📍ピン追加"}
                    </button>
                  )}
                </div>

                {/* 注釈一覧 */}
                <div className="annotation-list">
                  {annotations.map((ann, index) => (
                    <div
                      key={ann.id}
                      className={`annotation-item ${activeId === ann.id ? "active" : ""}`}
                      onClick={() => setActiveId(ann.id)}
                    >
                      <div className="item-badge">{index + 1}</div>
                      <div className="item-body">
                        <div className="item-title">{ann.title}</div>
                        <div className="item-text">
                          {viewTarget === "client" ? ann.descriptionClient : ann.descriptionBuilder}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 選択中の注釈詳細編集フォーム */}
                {activeAnnotation && (
                  <div className="editor-form" style={{ marginTop: "0.5rem" }}>
                    <div className="form-group">
                      <label>タイトル</label>
                      <input
                        type="text"
                        className="form-input"
                        value={activeAnnotation.title}
                        onChange={(e) => handleUpdateAnnotation("title", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>カテゴリ</label>
                      <select
                        className="form-select"
                        value={activeAnnotation.category}
                        onChange={(e) => handleUpdateAnnotation("category", e.target.value)}
                      >
                        <option value="floorplan">間取り変更</option>
                        <option value="equipment">設備・水回り</option>
                        <option value="opening">ドア・窓・建具</option>
                        <option value="storage">収納スペース</option>
                        <option value="other">その他</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        {viewTarget === "client" ? "お施主様向け説明" : "施工・現場向け指示"}
                      </label>
                      <textarea
                        className="form-textarea"
                        value={viewTarget === "client" ? activeAnnotation.descriptionClient : activeAnnotation.descriptionBuilder}
                        onChange={(e) => handleUpdateAnnotation(
                          viewTarget === "client" ? "descriptionClient" : "descriptionBuilder",
                          e.target.value
                        )}
                      />
                    </div>

                    {/* 指示ドット(アンカー)とピン位置(ラベル)の座標微調整 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>指示点 X (%)</label>
                          <input
                            type="number"
                            className="form-input"
                            step="0.1"
                            value={activeAnnotation.anchor.x}
                            onChange={(e) => handleUpdateAnnotation("ax", e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>指示点 Y (%)</label>
                          <input
                            type="number"
                            className="form-input"
                            step="0.1"
                            value={activeAnnotation.anchor.y}
                            onChange={(e) => handleUpdateAnnotation("ay", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>ピン X (%)</label>
                          <input
                            type="number"
                            className="form-input"
                            step="0.1"
                            value={activeAnnotation.label.x}
                            onChange={(e) => handleUpdateAnnotation("lx", e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>ピン Y (%)</label>
                          <input
                            type="number"
                            className="form-input"
                            step="0.1"
                            value={activeAnnotation.label.y}
                            onChange={(e) => handleUpdateAnnotation("ly", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        className="btn btn-danger"
                        style={{ width: "100%" }}
                        onClick={() => handleDeleteAnnotation(activeAnnotation.id)}
                      >
                        🗑️ この注釈を削除
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 【右側特大メイン画面】: 注釈＆引き出し線付きAfter図面の調整 */}
            <div className="main-after-viewer">
              <div className="panel-header">
                <h3 className="panel-title">After (改装後・注釈レイアウト調整)</h3>
                <span className="panel-subtitle">「金色の指示ドット」と「赤い番号ピン」をそれぞれドラッグできます</span>
              </div>
              
              <div className="viewer-card" style={{ cursor: isAddingPin ? "crosshair" : "default" }}>
                <div className="interactive-container" onClick={handleImageClick}>
                  <div className="interactive-wrapper" ref={imageWrapperRef}>
                    {(() => {
                      const imgW = imgNaturalSize?.w || 1200;
                      const imgH = imgNaturalSize?.h || 800;
                      const ly = getDiagramLayout(1.4142, 1, imgW, imgH, diagramScale);
                      return (
                        <img 
                          src={afterImage || ""} 
                          className="viewer-image" 
                          style={{
                            position: "absolute",
                            left: `${ly.x}%`,
                            top: `${ly.y}%`,
                            width: `${ly.w}%`,
                            height: `${ly.h}%`,
                            objectFit: "fill"
                          }}
                          onLoad={handleImgLoad}
                          alt="改装後" 
                          draggable={false}
                        />
                      );
                    })()}

                    {/* SVG引き出し線レイヤー (アンカーからピンへ繋ぐ赤い点線のベジェ曲線) */}
                    <svg 
                      viewBox="0 0 100 100" 
                      preserveAspectRatio="none"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: 40
                      }}
                    >
                      {annotations.map((ann) => {
                        const imgW = imgNaturalSize?.w || 1200;
                        const imgH = imgNaturalSize?.h || 800;
                        const ly = getDiagramLayout(1.4142, 1, imgW, imgH, diagramScale);
                        
                        // アンカー（指示点）：図面内％座標からA3用紙全体に対する％座標にマッピング変換
                        const paperAnchorX = ly.x + (ann.anchor.x / 100) * ly.w;
                        const paperAnchorY = ly.y + (ann.anchor.y / 100) * ly.h;

                        const cp = getControlPoint(paperAnchorX, paperAnchorY, ann.label.x, ann.label.y);
                        return (
                          <g key={ann.id}>
                            <path
                              d={`M ${paperAnchorX} ${paperAnchorY} Q ${cp.x} ${cp.y} ${ann.label.x} ${ann.label.y}`}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="0.6"
                              strokeDasharray="1.5,1.5"
                            />
                          </g>
                        );
                      })}
                    </svg>
                    
                    {/* A. 指し示すためのゴールドドット (アンカー) の描画 */}
                    {annotations.map((ann) => {
                      const imgW = imgNaturalSize?.w || 1200;
                      const imgH = imgNaturalSize?.h || 800;
                      const ly = getDiagramLayout(1.4142, 1, imgW, imgH, diagramScale);
                      
                      // アンカーの用紙全体％へのマッピング
                      const paperAnchorX = ly.x + (ann.anchor.x / 100) * ly.w;
                      const paperAnchorY = ly.y + (ann.anchor.y / 100) * ly.h;

                      return (
                        <div
                          key={`anchor-${ann.id}`}
                          className={`anchor-dot ${activeId === ann.id ? "active" : ""}`}
                          style={{
                            left: `${paperAnchorX}%`,
                            top: `${paperAnchorY}%`
                          }}
                          onMouseDown={(e) => handleStartDrag(e, ann.id, "anchor")}
                          onTouchStart={(e) => handleStartDragTouch(e, ann.id, "anchor")}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleMouseUp}
                          title="ドラッグして指示位置を変更"
                        />
                      );
                    })}

                    {/* B. 吹き出し付き番号ピン (アノテーションボックス) の描画 (WYSIWYG比率一致・反転制御付き) */}
                    {annotations.map((ann, index) => {
                      const description = viewTarget === "client" ? ann.descriptionClient : ann.descriptionBuilder;
                      const viewScale = imageWidth ? imageWidth / 1200 : 0.6;
                      
                      // 保存画像と同じ反転閾値 (264px は幅240px + 半径16px + 隙間8px)
                      const isLeftLayout = ann.label.x + (264 / 1200) * 100 > 100;
                      
                      return (
                        <div
                          key={`container-${ann.id}`}
                          className={`annotation-container ${activeId === ann.id ? "active" : ""} ${isLeftLayout ? "layout-left" : "layout-right"}`}
                          style={{
                            left: `${ann.label.x}%`,
                            top: `${ann.label.y}%`,
                            transform: `translate(-${16 * viewScale}px, -${16 * viewScale}px)`,
                            flexDirection: isLeftLayout ? "row-reverse" : "row"
                          }}
                        >
                          {/* ピンの丸ボタン（ここを掴んでドラッグ、クリックで選択） */}
                          <div
                            className="annotation-pin-circle"
                            style={{
                              width: `${32 * viewScale}px`,
                              height: `${32 * viewScale}px`,
                              fontSize: `${14 * viewScale}px`,
                              borderWidth: `${2 * viewScale}px`
                            }}
                            onMouseDown={(e) => handleStartDrag(e, ann.id, "label")}
                            onTouchStart={(e) => handleStartDragTouch(e, ann.id, "label")}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveId(ann.id);
                            }}
                            title="ドラッグして配置調整 / クリックで選択"
                          >
                            {index + 1}
                          </div>

                          {/* 吹き出しテキストボックス (表示幅比率に完全連動) */}
                          <div
                            className="annotation-bubble"
                            style={{
                              width: `${240 * viewScale}px`,
                              padding: `${10 * viewScale}px`,
                              marginLeft: isLeftLayout ? "0" : `${8 * viewScale}px`,
                              marginRight: isLeftLayout ? `${8 * viewScale}px` : "0",
                              borderRadius: `${8 * viewScale}px`,
                              borderWidth: `${1.5 * viewScale}px`,
                              borderLeftWidth: isLeftLayout ? `${1.5 * viewScale}px` : `${4 * viewScale}px`,
                              borderRightWidth: isLeftLayout ? `${4 * viewScale}px` : `${1.5 * viewScale}px`,
                              gap: `${4 * viewScale}px`
                            }}
                            onMouseDown={(e) => handleStartDrag(e, ann.id, "label")}
                            onTouchStart={(e) => handleStartDragTouch(e, ann.id, "label")}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveId(ann.id);
                            }}
                          >
                            <div 
                              className="bubble-title"
                              style={{
                                fontSize: `${14 * viewScale}px`
                              }}
                            >
                              {index + 1}. {ann.title}
                            </div>
                            <div 
                              className="bubble-desc"
                              style={{
                                fontSize: `${11 * viewScale}px`
                              }}
                            >
                              {description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          // 初期状態のファイルアップロード画面
          <div className="upload-section">
            <div className="upload-grid">
              
              {/* Beforeファイルのアップロードカード */}
              <label 
                className={`upload-card ${isDragActiveBefore ? "drag-active" : ""}`}
                onDragEnter={(e) => handleDragEnter(e, "before")}
                onDragOver={handleDragOver}
                onDragLeave={(e) => handleDragLeave(e, "before")}
                onDrop={(e) => handleDrop(e, "before")}
              >
                {beforeImage ? (
                  <div className="preview-container">
                    <img src={beforeImage} className="preview-image" alt="改装前" />
                    <button 
                      className="remove-file-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setBeforeImage(null);
                        setBeforeFileName("");
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📂</div>
                    <h3 className="upload-title">改装前 (Before) 図面をドラッグ＆ドロップ</h3>
                    <p className="upload-subtitle">またはクリックしてファイルを選択 (PDF / PNG / JPG)</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="file-input" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "before")}
                  disabled={isLoading}
                />
              </label>

              {/* Afterファイルのアップロードカード */}
              <label 
                className={`upload-card ${isDragActiveAfter ? "drag-active" : ""}`}
                onDragEnter={(e) => handleDragEnter(e, "after")}
                onDragOver={handleDragOver}
                onDragLeave={(e) => handleDragLeave(e, "after")}
                onDrop={(e) => handleDrop(e, "after")}
              >
                {afterImage ? (
                  <div className="preview-container">
                    <img src={afterImage} className="preview-image" alt="改装後" />
                    <button 
                      className="remove-file-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAfterImage(null);
                        setAfterFileName("");
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📂</div>
                    <h3 className="upload-title">改装後 (After) 図面をドラッグ＆ドロップ</h3>
                    <p className="upload-subtitle">またはクリックしてファイルを選択 (PDF / PNG / JPG)</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="file-input" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "after")}
                  disabled={isLoading}
                />
              </label>

            </div>

            {/* 両方の画像があるが、まだ比較していない場合 */}
            {beforeImage && afterImage && !annotations.length && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: "1rem 2.5rem", fontSize: "1rem" }}
                  onClick={handleRunAICompare}
                  disabled={isLoading}
                >
                  🚀 AI比較を実行して注釈を自動生成
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- Before図面の拡大表示モーダル --- */}
      {isBeforeModalOpen && beforeImage && (
        <div className="modal-overlay" onClick={() => setIsBeforeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsBeforeModalOpen(false)}>
              &times;
            </button>
            <img src={beforeImage} className="modal-image" alt="改装前 (拡大)" />
            <h3 className="modal-title">改装前 (Before) 図面 - 拡大表示</h3>
          </div>
        </div>
      )}

      {/* アプリケーションフッター */}
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} 株式会社長友ホーム AI戦略本部 - Renovation Document Annotation System</p>
      </footer>

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p className="loading-text">{loadingStatus || "ロード中..."}</p>
          <p className="loading-subtext">※PDF図面の場合はレンダリング処理が走ります。しばらくお待ちください。</p>
        </div>
      )}
    </>
  );
}
