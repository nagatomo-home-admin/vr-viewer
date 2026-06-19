import React, { useRef } from "react";

interface ImageReplacerProps {
  isEditMode: boolean;
  onReplace: (base64: string) => void;
  style?: React.CSSProperties;
}

export default function ImageReplacer({ isEditMode, onReplace, style }: ImageReplacerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEditMode) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onReplace(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0,
        transition: "opacity 0.2s",
        zIndex: 5,
        cursor: "pointer",
        ...style
      }}
      className="image-replacer-overlay"
      onClick={() => fileInputRef.current?.click()}
    >
      <style>{`
        .image-replacer-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
      <button 
        style={{
          background: "rgba(15, 23, 42, 0.85)",
          color: "#e2b83b",
          border: "1px solid #e2b83b",
          padding: "0.5rem 1.2rem",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
        }}
      >
        📁 画像を変更
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: "none" }} 
      />
    </div>
  );
}
