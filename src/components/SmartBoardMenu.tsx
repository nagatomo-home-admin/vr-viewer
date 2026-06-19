'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * 長友スマート提案ボード ツール間相互移動メニュー（アコーディオン式）
 * 画面右下に追従し、資金計画、お住まい探し計画、プレゼンボード、図面比較をスムーズに行き来できます。
 * 右上の操作ボタン群と被らないように画面右下に配置され、メニューは上方向に展開されます。
 * 印刷時（A3印刷プレビュー）にはno-printにより自動で完全に非表示になります。
 */
export default function SmartBoardMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外部クリックで閉じる処理
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tools = [
    {
      name: 'マイホーム資金計画',
      path: '/finance',
      icon: '📊',
      desc: '資金シミュレーター・A3計画書印刷',
    },
    {
      name: 'お住まい探し計画書',
      path: '/hearing',
      icon: '📝',
      desc: '対話型の顧客要望ヒアリング・整理',
    },
    {
      name: 'AI提案プレゼンボード',
      path: '/presentation',
      icon: '📋',
      desc: '仕様決め・Before/Afterパース比較',
    },
    {
      name: '図面比較・変更点AI抽出',
      path: '/',
      icon: '🔍',
      desc: '図面 Before/After 差分アノテーション',
    },
  ];

  // 現在のページがどのツールに属しているかを判定
  const isCurrentPath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50 no-print">
      {/* アコーディオン（展開されるドロップダウンカード・上方向に展開） */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-3 w-80 bg-slate-900/95 backdrop-blur-md border border-[#C89D7C]/30 rounded-2xl shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <div className="border-b border-slate-800 pb-2 mb-3">
            <span className="text-[10px] font-bold text-[#C89D7C] tracking-widest uppercase block">
              Nagatomo Home DX Tool
            </span>
            <span className="text-xs font-bold text-slate-350">
              長友スマート提案ボード ツール切替
            </span>
          </div>

          <div className="space-y-1.5">
            {tools.map(tool => {
              const active = isCurrentPath(tool.path);
              return (
                <Link
                  key={tool.path}
                  href={tool.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                    active
                      ? 'bg-[#C89D7C]/20 border border-[#C89D7C]/50 text-[#C89D7C]'
                      : 'hover:bg-slate-800/80 border border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{tool.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      {tool.name}
                      {active && (
                        <span className="text-[8px] bg-[#C89D7C] text-[#0A1D37] px-1.5 rounded-sm ml-1 flex-shrink-0">
                          表示中
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-1">
                      {tool.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[9px] text-center text-slate-600 font-medium">
            © Nagatomo Home AI Strategy Office
          </div>
        </div>
      )}

      {/* メニュー開閉ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1D37] hover:bg-[#C89D7C] text-[#C89D7C] hover:text-[#0A1D37] border border-[#C89D7C] rounded-full shadow-lg transition-all duration-300 font-bold text-[11px] cursor-pointer"
        aria-expanded={isOpen}
      >
        <span>🛠️ メニュー</span>
        <span className={`text-[9px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
    </div>
  );
}
