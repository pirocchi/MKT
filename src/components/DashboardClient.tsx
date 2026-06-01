"use client";

import React, { useState } from 'react';
import { Shield, Activity, Droplets, Zap, Eye, BarChart2, X, MessageSquareWarning, Loader2, Target, AlertTriangle, Crosshair, Quote } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Competitor = {
  id: string;
  classification: string;
  brand: string;
  name: string;
  price: number;
  tech: string;
  waterproof: string;
  pins: string;
  reviews: number;
  rawReviews?: string;
  claims?: {
    target: string;
    problem: string;
    usp: string;
    pain: string;
    ease: string;
    copy: string;
  };
};

type GapAnalysis = {
  theme: string;
  claim: string;
  reality: string;
  assessment: string;
  opportunity: string;
};

type SentimentData = {
  sentiments: { name: string; value: number; color: string }[];
  gapAnalysis: GapAnalysis[];
};

export default function DashboardClient({ initialData }: { initialData: Competitor[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Competitor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<SentimentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 👑 神速AIへの解析命令（理想と現実の両方を放り込む！）
  const handleAnalyze = async (item: Competitor) => {
    setSelectedProduct(item);
    setAnalyzedData(null);
    setErrorMsg("");
    
    if (!item.rawReviews || item.rawReviews.trim() === "") {
      setErrorMsg("スプレッドシートにレビューテキストが登録されていません。");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reviewsText: item.rawReviews,
          claims: item.claims || {} // 公式の理想もGeminiに喰わせる！
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "解析エラー");
      
      setAnalyzedData(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 評価（乖離度）に応じたバッジの色を判定
  const getAssessmentStyle = (assessment: string) => {
    if (assessment.includes("大ハズシ") || assessment.includes("乖離")) {
      return "bg-mkt-makoto/20 text-mkt-makoto border-mkt-makoto";
    }
    if (assessment.includes("大絶賛") || assessment.includes("期待通り")) {
      return "bg-mkt-asagi/20 text-mkt-asagi border-mkt-asagi";
    }
    return "bg-gray-800 text-gray-300 border-gray-600";
  };

  return (
    <div className="min-h-screen bg-mkt-bg text-mkt-text-main p-8 font-sans relative">
      
      {/* ヘッダー */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-mkt-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-wider flex items-center gap-3">
            <span className="text-mkt-makoto">MKT</span>
            <span>Intelligence Unit</span>
          </h1>
          <p className="text-mkt-asagi text-sm mt-2 tracking-widest flex items-center gap-2">
            <Eye size={16} /> COMPETITOR GAP ANALYSIS RADAR
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-mkt-surface border border-mkt-border px-4 py-2 rounded flex items-center gap-2">
            <Activity size={16} className="text-green-500" /> SGT/AI 直結済
          </button>
        </div>
      </header>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialData.map((item, index) => (
          <div key={item.id || index} className="bg-mkt-surface border border-mkt-border rounded-lg p-6 relative overflow-hidden group hover:border-mkt-asagi transition-all duration-300 flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mkt-makoto to-mkt-asagi opacity-75"></div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-mkt-bg bg-mkt-asagi px-2 py-1 rounded">{item.classification}</span>
              <span className="text-mkt-text-sub text-sm">{item.id}</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-1 text-white">{item.brand}</h2>
            <h3 className="text-mkt-text-sub text-sm mb-4 h-10">{item.name}</h3>
            
            <div className="space-y-4 mb-6 flex-grow">
              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub">実売価格</span>
                <span className="font-bold text-xl">¥{item.price.toLocaleString()}</span>
              </div>
              <div className="bg-black/30 p-3 rounded mt-2">
                <span className="text-xs text-mkt-asagi font-bold mb-1 block">公式メインコピー:</span>
                <p className="text-sm italic text-gray-300 truncate">"{item.claims?.copy || '未設定'}"</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-mkt-text-sub text-sm">市場フィードバック</span>
                <span className="font-bold text-mkt-asagi">{item.reviews.toLocaleString()} <span className="text-xs font-normal">件</span></span>
              </div>
            </div>

            <button 
              onClick={() => handleAnalyze(item)}
              className="w-full bg-mkt-surface border border-mkt-makoto text-mkt-makoto py-3 rounded hover:bg-mkt-makoto hover:text-white transition-colors font-bold tracking-wider flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(204,0,0,0.2)] hover:shadow-[0_0_20px_rgba(204,0,0,0.6)]"
            >
              <Target size={18} /> ギャップ分析を実行
            </button>
          </div>
        ))}
      </div>

      {/* 👑 ギャップ分析モーダル（究極進化版） */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-mkt-border rounded-xl w-full max-w-7xl h-[90vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-mkt-text-sub hover:text-mkt-makoto transition-colors z-20 bg-black/50 p-1 rounded-full"><X size={28} /></button>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              
              {/* 左側：ブランドの理想（公式主張） */}
              <div className="p-8 lg:w-1/3 border-r border-mkt-border bg-[#181818] overflow-y-auto">
                <span className="text-xs font-bold text-mkt-bg bg-mkt-asagi px-2 py-1 rounded mb-4 inline-block">{selectedProduct.classification}</span>
                <h2 className="text-3xl font-bold mb-2 text-white">{selectedProduct.brand}</h2>
                <h3 className="text-mkt-text-sub text-lg mb-8">{selectedProduct.name}</h3>
                
                <div className="mb-8 p-5 bg-black/40 border-l-4 border-mkt-asagi rounded-r">
                  <h4 className="text-xs text-mkt-asagi font-bold tracking-widest mb-2 flex items-center gap-2"><Quote size={14}/> 公式メインコピー</h4>
                  <p className="text-lg font-serif italic text-white leading-relaxed">"{selectedProduct.claims?.copy}"</p>
                </div>

                <h4 className="text-sm font-bold text-mkt-text-sub tracking-widest border-b border-mkt-border pb-2 mb-4">BRAND CLAIMS (公式の理想)</h4>
                <div className="space-y-5">
                  <div><span className="text-xs text-gray-500 block mb-1">ターゲット</span><p className="text-sm text-gray-300">{selectedProduct.claims?.target}</p></div>
                  <div><span className="text-xs text-gray-500 block mb-1">煽っている悩み</span><p className="text-sm text-gray-300">{selectedProduct.claims?.problem}</p></div>
                  <div><span className="text-xs text-gray-500 block mb-1">最大のウリ(USP)</span><p className="text-sm text-gray-300">{selectedProduct.claims?.usp}</p></div>
                  <div><span className="text-xs text-gray-500 block mb-1">痛みのなさの主張</span><p className="text-sm text-gray-300">{selectedProduct.claims?.pain}</p></div>
                  <div><span className="text-xs text-gray-500 block mb-1">手軽さの主張</span><p className="text-sm text-gray-300">{selectedProduct.claims?.ease}</p></div>
                </div>
              </div>

              {/* 右側：残酷なファクトチェック（ギャップ分析） */}
              <div className="p-8 lg:w-2/3 flex flex-col bg-mkt-bg overflow-y-auto">
                <h4 className="font-bold tracking-widest text-white mb-6 flex items-center gap-3 text-xl">
                  <Crosshair className="text-mkt-makoto" /> AI GAP ANALYSIS REPORT
                </h4>
                
                {isAnalyzing ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-mkt-makoto">
                    <Loader2 className="animate-spin mb-6" size={64} />
                    <p className="tracking-widest font-bold text-lg animate-pulse">Gemini-3.5-Flash ファクトチェック実行中...</p>
                    <p className="text-xs text-mkt-text-sub mt-4">公式の理想と消費者の現実を激突させています</p>
                  </div>
                ) : errorMsg ? (
                  <div className="flex-grow flex items-center justify-center text-mkt-makoto font-bold border border-mkt-makoto p-4 rounded bg-mkt-makoto/10">{errorMsg}</div>
                ) : analyzedData ? (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-8">
                    
                    {/* 上部：感情分布グラフ */}
                    <div className="flex items-center gap-8 bg-[#181818] p-6 rounded-lg border border-mkt-border">
                      <div className="w-48 h-48 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analyzedData.sentiments} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                              {analyzedData.sentiments.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#334155', color: '#F8FAFC' }} itemStyle={{ color: '#F8FAFC' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-mkt-text-sub mb-4">市場の全体感情（推計値）</h5>
                        <div className="space-y-2">
                          {analyzedData.sentiments.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                              <span className="text-sm text-gray-300 w-24">{s.name}</span>
                              <span className="text-sm font-bold text-white">{s.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* 下部：ギャップ分析リスト（最大の目玉！） */}
                    <div>
                      <h5 className="text-sm font-bold text-mkt-text-sub tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-500"/> 発見された致命的ギャップと狙い目
                      </h5>
                      
                      <div className="space-y-4">
                        {analyzedData.gapAnalysis?.map((gap, i) => (
                          <div key={i} className="bg-[#181818] border border-mkt-border rounded-lg p-5 hover:border-mkt-makoto/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-xs font-bold tracking-wider">{gap.theme}</span>
                              <span className={`px-3 py-1 rounded text-xs font-bold border ${getAssessmentStyle(gap.assessment)}`}>
                                評価: {gap.assessment}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-black/30 p-3 rounded border-l-2 border-mkt-asagi">
                                <span className="text-[10px] text-mkt-asagi font-bold mb-1 block">公式の主張 (理想)</span>
                                <p className="text-sm text-gray-300 leading-relaxed">{gap.claim}</p>
                              </div>
                              <div className="bg-black/30 p-3 rounded border-l-2 border-mkt-makoto">
                                <span className="text-[10px] text-mkt-makoto font-bold mb-1 block">消費者の声 (現実)</span>
                                <p className="text-sm text-gray-300 leading-relaxed">{gap.reality}</p>
                              </div>
                            </div>
                            
                            {/* 👑 我々の狙い目（Opportunity） */}
                            <div className="mt-4 bg-mkt-makoto/10 border border-mkt-makoto/30 p-4 rounded">
                              <span className="text-xs text-mkt-makoto font-bold tracking-widest mb-2 flex items-center gap-2">
                                <Target size={14} /> SGT 狙い目 (戦略的機会)
                              </span>
                              <p className="text-sm text-white leading-relaxed font-bold">{gap.opportunity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-mkt-text-sub">データがありません</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}