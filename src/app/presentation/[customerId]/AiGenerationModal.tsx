import React, { useState } from "react";

interface AiGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  planName: string;
  selectedSpecs: {
    sash: string;
    door: string;
    interior: string;
    equipment: string;
    equipmentGrade: string;
  };
  generateType: "concept" | "story" | "exterior_advice" | "interior_advice";
  onApply: (generatedData: any) => void;
}

export default function AiGenerationModal({
  isOpen,
  onClose,
  clientName,
  planName,
  selectedSpecs,
  generateType,
  onApply
}: AiGenerationModalProps) {
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 生成された複数案（3案）を管理するステート
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setProposals([]);
    try {
      const res = await fetch("/api/presentation/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          planName,
          requestKeywords: keywords,
          selectedSpecs,
          generateType
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "AIテキストの自動生成に失敗しました。");
      }

      const result = await res.json();
      if (result && result.proposals && result.proposals.length > 0) {
        setProposals(result.proposals);
        setSelectedIdx(0);
      } else {
        throw new Error("提案テキストの複数案生成に失敗しました。");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "通信中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySelected = () => {
    if (proposals.length === 0) return;
    const selectedProposal = proposals[selectedIdx];
    onApply(selectedProposal);
    onClose();
  };

  const getTitleText = () => {
    if (generateType === "concept") return "コンセプト";
    if (generateType === "story") return "設計ストーリー";
    if (generateType === "exterior_advice") return "外部設計アドバイス";
    return "インテリア提案";
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(7, 10, 19, 0.75)",
      backdropFilter: "blur(6px)",
      zIndex: 10000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "#1e293b",
        border: "1px solid rgba(226, 184, 59, 0.3)",
        borderRadius: "16px",
        padding: "2rem",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "90vh",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        boxSizing: "border-box",
        overflowY: "auto"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          borderBottom: "1px solid rgba(255,255,255,0.1)", 
          paddingBottom: "0.75rem" 
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#e2b83b", margin: 0 }}>
            🤖 AI提案文の自動生成 ({generateType === "concept" ? "コンセプト" : generateType === "story" ? "設計ストーリー" : generateType === "exterior_advice" ? "外部設計アドバイス" : "インテリア提案"})
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "#94a3b8", 
              fontSize: "1.2rem", 
              cursor: "pointer" 
            }}
          >
            ✖
          </button>
        </div>

        <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.45" }}>
          {generateType === "exterior_advice" || generateType === "interior_advice" ? 
            "お施主様へのご提案用のアドバイス文を作成します。特定の要望（例: 「防犯性を重視したい」「木のぬくもりを強調」など）があれば入力してください。" :
            "お施主様の要望やキーワード（例: 「対面キッチンで子供を見守りたい」「冬でも暖かい広々リビング」など）を入力してください。"}
          仕様データと矛盾のない文章を【3つのアプローチ案】でAIが同時作成します。
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>要望・キーワード</label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="お施主様のキーワードやご要望を入力..."
            rows={3}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#ffffff",
              fontSize: "0.9rem",
              resize: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {error && (
          <div style={{ 
            color: "#f87171", 
            fontSize: "0.8rem", 
            background: "rgba(248,113,113,0.1)", 
            padding: "0.6rem", 
            borderRadius: "6px", 
            border: "1px solid rgba(248,113,113,0.2)" 
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #e2b83b 0%, #b48a1b 100%)",
              color: "#070a13",
              border: "none",
              padding: "0.5rem 1.2rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              width: "100%"
            }}
          >
            {loading ? "🔄 複数提案を同時作成中..." : "🤖 提案文を3案同時作成（Gemini）"}
          </button>
        </div>

        {/* 提案された複数案の選択UI */}
        {proposals.length > 0 && (
          <div style={{ 
            borderTop: "1px solid rgba(255,255,255,0.1)", 
            paddingTop: "1rem", 
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem" 
          }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#e2b83b" }}>💡 AIからの提案（いずれか1つを選択してください）</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {proposals.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    flex: 1,
                    background: selectedIdx === idx ? "#e2b83b" : "rgba(255,255,255,0.05)",
                    color: selectedIdx === idx ? "#070a13" : "#ffffff",
                    border: selectedIdx === idx ? "none" : "1px solid rgba(255,255,255,0.1)",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  提案 {idx + 1}
                </button>
              ))}
            </div>

            {/* 各案のプレビュー表示 */}
            <div style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "0.85rem",
              lineHeight: "1.5"
            }}>
              {generateType === "concept" ? (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#e2b83b", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    サブタイトル (英語):
                  </div>
                  <div style={{ color: "#ffffff", fontWeight: "bold", marginBottom: "0.75rem" }}>
                    {proposals[selectedIdx].subtitle}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#e2b83b", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    メインタイトル (日本語):
                  </div>
                  <div style={{ color: "#ffffff", fontWeight: "bold", whiteSpace: "pre-line" }}>
                    {proposals[selectedIdx].title}
                  </div>
                </div>
              ) : generateType === "story" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {proposals[selectedIdx].stories?.map((story: any, sIdx: number) => (
                    <div key={sIdx} style={{ borderBottom: sIdx < 2 ? "1px dashed rgba(255,255,255,0.1)" : "none", paddingBottom: sIdx < 2 ? "0.5rem" : 0 }}>
                      <div style={{ fontWeight: "bold", color: "#e2b83b", fontSize: "0.8rem" }}>
                        {story.num || (sIdx + 1)}. {story.title}
                      </div>
                      <div style={{ color: "#cbd5e1", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        {story.desc}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#e2b83b", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    ご提案アドバイス文章 (見切れ防止・最大2行):
                  </div>
                  <div style={{ color: "#ffffff", whiteSpace: "pre-line", fontSize: "0.8rem" }}>
                    {proposals[selectedIdx].advice}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleApplySelected}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                選択した提案を反映する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
