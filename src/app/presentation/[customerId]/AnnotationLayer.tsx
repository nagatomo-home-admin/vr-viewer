import React, { useRef, useEffect } from "react";

interface Annotation {
  id: string;
  title: string;
  descriptionClient: string;
  descriptionBuilder: string;
  coordinate: { x: number; y: number };
  anchor: { x: number; y: number };
  label: { x: number; y: number };
  category: "floorplan" | "equipment" | "opening" | "storage" | "other";
}

interface AnnotationLayerProps {
  annotations: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  isEditMode: boolean;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  imageWidth: number;
  diagramScale: number;
  imgNaturalSize: { w: number; h: number } | null;
  afterImage: string | null;
  handleImgLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  imageWrapperRef: React.RefObject<HTMLDivElement | null>;
}

const getControlPoint = (ax: number, ay: number, lx: number, ly: number) => {
  const mx = (ax + lx) / 2;
  const my = (ay + ly) / 2;
  const dx = lx - ax;
  const dy = ly - ay;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.max(5, Math.min(12, dist * 0.18));
  return { x: mx, y: my - offset };
};

const getDiagramLayout = (
  paperW: number,
  paperH: number,
  imgW: number,
  imgH: number,
  scalePercent: number
) => {
  const paperRatio = paperW / paperH;
  const imgRatio = imgW / imgH;
  const S = scalePercent / 100;

  let drawWPercent = 100;
  let drawHPercent = 100;

  if (imgRatio > paperRatio) {
    drawWPercent = 100 * S;
    drawHPercent = (100 / imgRatio) * paperRatio * S;
  } else {
    drawWPercent = 100 * imgRatio * (1 / paperRatio) * S;
    drawHPercent = 100 * S;
  }

  return {
    w: drawWPercent,
    h: drawHPercent,
    x: (100 - drawWPercent) / 2,
    y: (100 - drawHPercent) / 2
  };
};

export default function AnnotationLayer({
  annotations,
  setAnnotations,
  isEditMode,
  activeId,
  setActiveId,
  imageWidth,
  diagramScale,
  imgNaturalSize,
  afterImage,
  handleImgLoad,
  imageWrapperRef
}: AnnotationLayerProps) {
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragAnnotationId = useRef<string | null>(null);
  const dragTargetType = useRef<"anchor" | "label" | null>(null);

  const handleStartDrag = (e: React.MouseEvent, id: string, type: "anchor" | "label") => {
    if (!isEditMode) return;
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
    if (!isEditMode || !dragAnnotationId.current || !dragTargetType.current || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    setAnnotations((prev) =>
      prev.map((ann) => {
        if (ann.id === dragAnnotationId.current) {
          if (dragTargetType.current === "anchor") {
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

  const handleMouseUp = () => {
    dragAnnotationId.current = null;
    dragTargetType.current = null;
    dragStartPos.current = null;
  };

  const handleStartDragTouch = (e: React.TouchEvent, id: string, type: "anchor" | "label") => {
    if (!isEditMode) return;
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
    if (!isEditMode || !dragAnnotationId.current || !dragTargetType.current || !imageWrapperRef.current) return;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    let xPercent = ((touch.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((touch.clientY - rect.top) / rect.height) * 100;

    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    setAnnotations((prev) =>
      prev.map((ann) => {
        if (ann.id === dragAnnotationId.current) {
          if (dragTargetType.current === "anchor") {
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

  const imgW = imgNaturalSize?.w || 1200;
  const imgH = imgNaturalSize?.h || 800;
  const ly = getDiagramLayout(1.4142, 1, imgW, imgH, diagramScale);

  return (
    <div 
      className="interactive-wrapper" 
      ref={imageWrapperRef as any}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "180px",
        overflow: "hidden"
      }}
    >
      {afterImage && (
        <img 
          src={afterImage} 
          className="viewer-image" 
          style={{
            position: "absolute",
            left: `${ly.x}%`,
            top: `${ly.y}%`,
            width: `${ly.w}%`,
            height: `${ly.h}%`,
            objectFit: "fill",
            zIndex: 10
          }}
          onLoad={handleImgLoad}
          alt="改装後平面図" 
          draggable={false}
        />
      )}

      {/* SVG引き出し線レイヤー */}
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
          const paperAnchorX = ly.x + (ann.anchor.x / 100) * ly.w;
          const paperAnchorY = ly.y + (ann.anchor.y / 100) * ly.h;
          const cp = getControlPoint(paperAnchorX, paperAnchorY, ann.label.x, ann.label.y);
          return (
            <path
              key={`line-${ann.id}`}
              d={`M ${paperAnchorX} ${paperAnchorY} Q ${cp.x} ${cp.y} ${ann.label.x} ${ann.label.y}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="0.6"
              strokeDasharray="1.5,1.5"
            />
          );
        })}
      </svg>
      
      {/* アンカードット */}
      {isEditMode && annotations.map((ann) => {
        const paperAnchorX = ly.x + (ann.anchor.x / 100) * ly.w;
        const paperAnchorY = ly.y + (ann.anchor.y / 100) * ly.h;
        return (
          <div
            key={`anchor-${ann.id}`}
            className={`anchor-dot ${activeId === ann.id ? "active" : ""}`}
            style={{
              position: "absolute",
              left: `${paperAnchorX}%`,
              top: `${paperAnchorY}%`,
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: activeId === ann.id ? "#ef4444" : "#eab308",
              border: "2px solid #ffffff",
              transform: "translate(-6px, -6px)",
              zIndex: 45,
              cursor: "move",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
            }}
            onMouseDown={(e) => handleStartDrag(e, ann.id, "anchor")}
            onTouchStart={(e) => handleStartDragTouch(e, ann.id, "anchor")}
            title="ドラッグして指示位置を変更"
          />
        );
      })}

      {/* 番号ピン ＆ 吹き出しテキスト */}
      {annotations.map((ann, index) => {
        const viewScale = imageWidth ? imageWidth / 1200 : 0.6;
        const isLeftLayout = ann.label.x + (264 / 1200) * 100 > 100;
        
        return (
          <div
            key={`container-${ann.id}`}
            className={`annotation-container ${activeId === ann.id ? "active" : ""}`}
            style={{
              position: "absolute",
              left: `${ann.label.x}%`,
              top: `${ann.label.y}%`,
              transform: `translate(-${16 * viewScale}px, -${16 * viewScale}px)`,
              display: "flex",
              alignItems: "center",
              flexDirection: isLeftLayout ? "row-reverse" : "row",
              zIndex: activeId === ann.id ? 50 : 42,
              pointerEvents: "auto"
            }}
          >
            {/* ピンボタン */}
            <div
              className="annotation-pin-circle"
              style={{
                width: `${32 * viewScale}px`,
                height: `${32 * viewScale}px`,
                borderRadius: "50%",
                background: activeId === ann.id ? "#ef4444" : "#0f172a",
                color: activeId === ann.id ? "#ffffff" : "#e2b83b",
                border: `${2 * viewScale}px solid ${activeId === ann.id ? "#ffffff" : "#e2b83b"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: `${14 * viewScale}px`,
                cursor: isEditMode ? "move" : "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
              onMouseDown={(e) => handleStartDrag(e, ann.id, "label")}
              onTouchStart={(e) => handleStartDragTouch(e, ann.id, "label")}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(ann.id);
              }}
              title={isEditMode ? "ドラッグしてピン位置を調整 / クリックで選択" : "クリックで選択"}
            >
              {index + 1}
            </div>

            {/* 吹き出しテキストボックス */}
            <div
              className="annotation-bubble"
              style={{
                width: `${240 * viewScale}px`,
                padding: `${10 * viewScale}px`,
                marginLeft: isLeftLayout ? "0" : `${8 * viewScale}px`,
                marginRight: isLeftLayout ? `${8 * viewScale}px` : "0",
                borderRadius: `${8 * viewScale}px`,
                background: "rgba(15, 23, 42, 0.92)",
                color: "#ffffff",
                border: `${1.5 * viewScale}px solid #e2b83b`,
                borderLeft: isLeftLayout ? `${1.5 * viewScale}px solid #e2b83b` : `${4 * viewScale}px solid #e2b83b`,
                borderRight: isLeftLayout ? `${4 * viewScale}px solid #e2b83b` : `${1.5 * viewScale}px solid #e2b83b`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                gap: `${4 * viewScale}px`,
                textAlign: "left",
                cursor: isEditMode ? "move" : "default"
              }}
              onMouseDown={(e) => handleStartDrag(e, ann.id, "label")}
              onTouchStart={(e) => handleStartDragTouch(e, ann.id, "label")}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(ann.id);
              }}
            >
              <div style={{ fontSize: `${13 * viewScale}px`, fontWeight: "bold", color: "#e2b83b" }}>
                {index + 1}. {ann.title}
              </div>
              <div style={{ fontSize: `${10 * viewScale}px`, color: "#cbd5e1", whiteSpace: "pre-wrap", lineHeight: 1.35 }}>
                {ann.descriptionClient || ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
