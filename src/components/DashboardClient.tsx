"use client";

import React, { useState } from 'react';
import { Activity, Eye, X, Loader2, Target, Crosshair, Quote, Image as ImageIcon, ShoppingCart, Zap, CheckSquare, Square, Rocket } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- 型定義（省略せずに記載） ---
type Competitor = {
  id: string; classification: string; brand: string; name: string; price: number; tech: string; waterproof: string; pins: string; reviews: number; rawReviews?: string; scrapedDate?: string; averageRating?: string; imageUrl?: string; amazonUrl?: string; rakutenUrl?: string;
  claims?: { target: string; problem: string; usp: string; pain: string; ease: string; copy: string; };
};
type GapAnalysis = { theme: string; claim: string; reality: string; assessment: string; opportunity: string; };
type SentimentData = { sentiments: { name: string; value: number; color: string }[]; gapAnalysis: GapAnalysis[]; };

type GenesisBlueprint = {
  conceptName: string; targetPrice: string; coreFeatures: string[]; differentiation: string; mainCopy: string;
};

export default function DashboardClient({ initialData }: { initialData: Competitor[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Competitor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<SentimentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 👑 新機能：MKT-Genesis（クロス分析）用の状態管理
  const [selectedForGenesis, setSelectedForGenesis] = useState<Competitor[]>([]);
  const [isGeneratingGenesis, setIsGeneratingGenesis] = useState(false);
  const [genesisData, setGenesisData] = useState<GenesisBlueprint | null>(null);

  // 通常の1対1ギャップ分析
  const handleAnalyze = async (item: Competitor) => {
    setSelectedProduct(item); setAnalyzedData(null); setErrorMsg("");
    if (!item.rawReviews || item.rawReviews.trim() === "") {
      setErrorMsg("スプレッドシートにレビューテキストが登録されていません。"); return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewsText: item.rawReviews, claims: item.claims || {}, averageRating: item.averageRating || "-" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "解析エラー");
      setAnalyzedData(data);
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsAnalyzing(false); }
  };

  // Genesis（チェックボックス）の切り替え
  const toggleGenesisSelection = (item: Competitor) => {
    if (selectedForGenesis.find(p => p.id === item.id)) {
      setSelectedForGenesis(selectedForGenesis.filter(p => p.id !== item.id));
    } else {
      setSelectedForGenesis([...selectedForGenesis, item]);
    }
  };

  // Genesisモジュールの起動
  const handleGenesis = async () => {
    setGenesisData(null); setIsGeneratingGenesis(true);
    try {
      const res = await fetch('/api/genesis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: selectedForGenesis })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "創世エラー");
      setGenesisData(data.genesisBlueprint);
    } catch (err: any) {
      alert(`Genesis起動エラー: ${err.message}`);
    } finally {
      setIsGeneratingGenesis(false);
    }
  };

  const getAssessmentStyle = (assessment: string) => {
    if (assessment.includes("大ハズシ") || assessment.includes("乖離")) return "bg-mkt-makoto/10 text-mkt-makoto border-mkt-makoto/30";
    if (assessment.includes("大絶賛") || assessment.includes("期待通り")) return "bg-mkt-asagi/10 text-mkt-asagi border-mkt-asagi/30";
    return "bg-slate-100 text-slate-600 border-slate-300";
  };

  return (
    <div className="min-h-screen bg-mkt-bg text-mkt-text-main p-8 font-sans relative">
      
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-mkt-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-wider flex items-center gap-3">
            <span className="text-mkt-makoto">MKT</span><span>競合分析ダッシュボード</span>
          </h1>
          <p className="text-mkt-asagi text-sm mt-2 tracking-widest flex items-center gap-2 font-bold">
            <Eye size={16} /> 競合製品のギャップ分析レーダー
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-mkt-surface border border-mkt-border px-4 py-2 rounded flex items-center gap-2 font-bold shadow-sm">
            <Activity size={16} className="text-green-500" /> AI 連携済
          </button>
        </div>
      </header>

      {/* 👑 Genesis起動フローティングボタン（2個以上選ぶと出現） */}
      {selectedForGenesis.length >= 2 && (
        <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button 
            onClick={handleGenesis}
            disabled={isGeneratingGenesis}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed border-2 border-white/20"
          >
            {isGeneratingGenesis ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} className="animate-pulse" />}
            {isGeneratingGenesis ? "創世モジュール実行中..." : `${selectedForGenesis.length}製品を合成して【MKT-Genesis】起動`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialData.map((item, index) => {
          const isSelected = selectedForGenesis.some(p => p.id === item.id);
          return (
            <div key={item.id || index} className={`bg-mkt-surface border-2 rounded-lg p-6 relative overflow-hidden group transition-all duration-300 flex flex-col shadow-sm ${isSelected ? 'border-indigo-500 bg-indigo-50/5' : 'border-mkt-border hover:border-mkt-asagi'}`}>
              
              {/* Genesis選択用チェックボックス */}
              <button onClick={() => toggleGenesisSelection(item)} className="absolute top-4 right-4 z-10 transition-colors">
                {isSelected ? <CheckSquare size={28} className="text-indigo-500 bg-white rounded" /> : <Square size={28} className="text-slate-300 hover:text-indigo-400 bg-white rounded" />}
              </button>

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mkt-makoto to-mkt-asagi opacity-75"></div>
              
              <div className="w-full h-48 mb-5 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center overflow-hidden relative mt-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center"><ImageIcon size={32} className="mb-2 opacity-50" /><span className="text-xs font-bold tracking-widest">NO IMAGE</span></div>
                )}
              </div>

              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-white bg-mkt-asagi px-2 py-1 rounded">{item.classification}</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-1 text-mkt-text-main">{item.brand}</h2>
              <h3 className="text-mkt-text-sub text-sm mb-5 h-10 font-medium line-clamp-2">{item.name}</h3>
              
              {(item.amazonUrl || item.rakutenUrl) && (
                <div className="flex gap-3 mb-6">
                  {item.amazonUrl && <a href={item.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-slate-800 text-sm font-black py-3 rounded flex justify-center items-center gap-2 hover:bg-slate-700 transition shadow-md"><ShoppingCart size={16} /> Amazon</a>}
                  {item.rakutenUrl && <a href={item.rakutenUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-[#BF0000] text-sm font-black py-3 rounded flex justify-center items-center gap-2 hover:bg-[#990000] transition shadow-md"><ShoppingCart size={16} /> 楽天市場</a>}
                </div>
              )}

              <div className="space-y-5 mb-6 flex-grow">
                <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                  <span className="text-mkt-text-sub font-bold">実売価格</span>
                  <span className="font-black text-3xl text-mkt-text-main tracking-tight">¥{item.price.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded mt-2 border border-slate-200">
                  <span className="text-xs text-mkt-asagi font-black mb-1 block tracking-wider">ブランド メインコピー:</span>
                  <p className="text-sm font-bold italic text-mkt-text-main truncate">"{item.claims?.copy || '未設定'}"</p>
                </div>
                <div className="flex justify-between items-end pt-3">
                  <span className="text-mkt-text-sub text-sm font-bold">市場フィードバック</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-black text-yellow-500 text-2xl drop-shadow-sm">★ {item.averageRating || "-"}</span>
                    <span className="font-black text-mkt-asagi text-2xl">{item.reviews.toLocaleString()} <span className="text-sm font-bold">件</span></span>
                  </div>
                </div>
              </div>

              <button onClick={() => handleAnalyze(item)} className="w-full bg-mkt-surface border-2 border-mkt-makoto text-mkt-makoto py-3 rounded hover:bg-mkt-makoto hover:text-white transition-colors font-black tracking-wider flex justify-center items-center gap-2 text-lg">
                <Target size={20} /> 個別ギャップ分析
              </button>
            </div>
          );
        })}
      </div>

      {/* 👑 MKT-Genesis（新商品企画）モーダル：【横ハラ絶対阻止・グリッド設計】 */}
      {genesisData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-slate-50 border-2 border-indigo-500/50 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">
            <button onClick={() => setGenesisData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition-colors z-20 bg-white p-2 rounded-full shadow-md"><X size={28} /></button>
            
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-8 text-white">
              <span className="bg-indigo-500 text-xs font-black px-3 py-1 rounded tracking-widest flex items-center gap-2 w-max mb-4"><Rocket size={14}/> SGT GENESIS BLUEPRINT</span>
              <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">{genesisData.conceptName}</h2>
              <p className="text-indigo-200 font-bold text-lg">"{genesisData.mainCopy}"</p>
            </div>

            <div className="p-8 overflow-y-auto flex-grow flex flex-col gap-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs text-slate-500 font-black tracking-widest mb-3 flex items-center gap-2"><Target size={16} className="text-indigo-500"/> 推奨価格と戦略</h4>
                  <p className="text-xl font-black text-slate-800 leading-relaxed break-words">{genesisData.targetPrice}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs text-slate-500 font-black tracking-widest mb-3 flex items-center gap-2"><Crosshair size={16} className="text-pink-500"/> 競合との差別化（弱点強襲）</h4>
                  <p className="text-base font-bold text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{genesisData.differentiation}</p>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                <h4 className="text-sm text-indigo-800 font-black tracking-widest mb-4 border-b border-indigo-200 pb-2">搭載すべきコア機能（CORE FEATURES）</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {genesisData.coreFeatures.map((feature, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm flex items-start gap-3">
                      <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">{i + 1}</div>
                      <p className="text-sm font-bold text-slate-700 break-words">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 個別ギャップ分析モーダル（既存のまま・省略） */}
      {/* ※コード文字数制限のため、ここから下は既存の {selectedProduct && (...)} のモーダルコードがそのまま入ります！ */}
    </div>
  );
}