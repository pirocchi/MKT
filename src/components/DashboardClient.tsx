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
  scrapedDate?: string; 
  averageRating?: string; 
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
          claims: item.claims || {},
          averageRating: item.averageRating || "-" 
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

  const getAssessmentStyle = (assessment: string) => {
    if (assessment.includes("大ハズシ") || assessment.includes("乖離")) {
      return "bg-mkt-makoto/10 text-mkt-makoto border-mkt-makoto/30";
    }
    if (assessment.includes("大絶賛") || assessment.includes("期待通り")) {
      return "bg-mkt-asagi/10 text-mkt-asagi border-mkt-asagi/30";
    }
    return "bg-slate-100 text-slate-600 border-slate-300";
  };

  return (
    <div className="min-h-screen bg-mkt-bg text-mkt-text-main p-8 font-sans relative">
      
      {/* ヘッダー */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-mkt-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-wider flex items-center gap-3">
            <span className="text-mkt-makoto">MKT</span>
            <span>競合分析ダッシュボード</span>
          </h1>
          <p className="text-mkt-asagi text-sm mt-2 tracking-widest flex items-center gap-2 font-bold">
            <Eye size={16} /> 競合製品のギャップ分析レーダー
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-mkt-surface border border-mkt-border px-4 py-2 rounded flex items-center gap-2 font-bold shadow-sm">
            <Activity size={16} className="text-green-500" /> SGT / AI 連携済
          </button>
        </div>
      </header>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialData.map((item, index) => (
          <div key={item.id || index} className="bg-mkt-surface border border-mkt-border rounded-lg p-6 relative overflow-hidden group hover:border-mkt-asagi transition-all duration-300 flex flex-col shadow-sm hover:shadow-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mkt-makoto to-mkt-asagi opacity-75"></div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-white bg-mkt-asagi px-2 py-1 rounded">{item.classification}</span>
              <span className="text-mkt-text-sub text-sm font-bold">{item.id}</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-1 text-mkt-text-main">{item.brand}</h2>
            <h3 className="text-mkt-text-sub text-sm mb-4 h-10 font-medium">{item.name}</h3>
            
            <div className="space-y-4 mb-6 flex-grow">
              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub font-bold">実売価格</span>
                <span className="font-black text-xl text-mkt-text-main">¥{item.price.toLocaleString()}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded mt-2 border border-slate-200">
                <span className="text-xs text-mkt-asagi font-black mb-1 block tracking-wider">公式メインコピー:</span>
                <p className="text-sm font-bold italic text-mkt-text-main truncate">"{item.claims?.copy || '未設定'}"</p>
              </div>
              
              <div className="flex justify-between items-end pt-2">
                <span className="text-mkt-text-sub text-sm font-bold">市場フィードバック</span>
                <div className="text-right">
                  <span className="font-black text-yellow-500 mr-3 text-lg">
                    ★ {item.averageRating || "-"}
                  </span>
                  <span className="font-black text-mkt-asagi">
                    {item.reviews.toLocaleString()} <span className="text-xs font-bold">件</span>
                  </span>
                </div>
              </div>
              
              <div className="text-right text-[10px] text-mkt-text-sub mt-1 font-bold">
                データ取得日時: {item.scrapedDate || "未取得"}
              </div>
            </div>

            <button 
              onClick={() => handleAnalyze(item)}
              className="w-full bg-mkt-surface border border-mkt-makoto text-mkt-makoto py-3 rounded hover:bg-mkt-makoto hover:text-white transition-colors font-black tracking-wider flex justify-center items-center gap-2"
            >
              <Target size={18} /> ギャップ分析を実行
            </button>
          </div>
        ))}
      </div>

      {/* 👑 ギャップ分析モーダル */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-mkt-surface border border-mkt-border rounded-xl w-full max-w-7xl h-[90vh] flex flex-col relative overflow-hidden shadow-2xl">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-mkt-text-sub hover:text-mkt-makoto transition-colors z-20 bg-slate-100 hover:bg-slate-200 p-1 rounded-full"><X size={28} /></button>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              
              {/* 左側：ブランドの理想（公式主張） */}
              <div className="p-8 lg:w-1/3 border-r border-mkt-border bg-slate-50 overflow-y-auto">
                <span className="text-xs font-bold text-white bg-mkt-asagi px-2 py-1 rounded mb-4 inline-block">{selectedProduct.classification}</span>
                <h2 className="text-3xl font-black mb-2 text-mkt-text-main">{selectedProduct.brand}</h2>
                <h3 className="text-mkt-text-sub font-bold text-lg mb-8">{selectedProduct.name}</h3>
                
                <div className="mb-8 p-5 bg-white border-l-4 border-mkt-asagi border-y border-r border-slate-200 rounded-r shadow-sm">
                  <h4 className="text-xs text-mkt-asagi font-black tracking-widest mb-2 flex items-center gap-2"><Quote size={14}/> 公式メインコピー</h4>
                  <p className="text-lg font-serif italic text-mkt-text-main font-bold leading-relaxed">"{selectedProduct.claims?.copy}"</p>
                </div>

                <h4 className="text-sm font-black text-mkt-text-sub tracking-widest border-b border-mkt-border pb-2 mb-4">BRAND CLAIMS (ブランドの主張)</h4>
                <div className="space-y-5">
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">ターゲット層</span><p className="text-sm font-medium text-mkt-text-main">{selectedProduct.claims?.target}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">訴求している悩み</span><p className="text-sm font-medium text-mkt-text-main">{selectedProduct.claims?.problem}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">最大の強み (USP)</span><p className="text-sm font-medium text-mkt-text-main">{selectedProduct.claims?.usp}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">痛みのなさの主張</span><p className="text-sm font-medium text-mkt-text-main">{selectedProduct.claims?.pain}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">手軽さの主張</span><p className="text-sm font-medium text-mkt-text-main">{selectedProduct.claims?.ease}</p></div>
                </div>
              </div>

              {/* 右側：残酷なファクトチェック（ギャップ分析） */}
              <div className="p-8 lg:w-2/3 flex flex-col bg-mkt-surface overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-mkt-border pb-4">
                  <h4 className="font-black tracking-widest text-mkt-text-main flex items-center gap-3 text-xl">
                    <Crosshair className="text-mkt-makoto" /> AI ギャップ分析レポート
                  </h4>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-mkt-text-sub">分析対象:</span>
                    <span className="font-black text-yellow-500 text-xl">★ {selectedProduct.averageRating || "-"}</span>
                  </div>
                </div>
                
                {isAnalyzing ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-mkt-makoto">
                    <Loader2 className="animate-spin mb-6" size={64} />
                    <p className="tracking-widest font-black text-lg animate-pulse">AIによるファクトチェックを実行中...</p>
                    <p className="text-xs font-bold text-mkt-text-sub mt-4">公式の訴求内容と実際のユーザーレビューを比較・分析しています</p>
                  </div>
                ) : errorMsg ? (
                  <div className="flex-grow flex items-center justify-center text-mkt-makoto font-bold border border-mkt-makoto/50 p-4 rounded bg-mkt-makoto/5">{errorMsg}</div>
                ) : analyzedData ? (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-8">
                    
                    {/* 上部：感情分布グラフ */}
                    <div className="flex items-center gap-8 bg-white p-6 rounded-lg border border-mkt-border shadow-sm">
                      <div className="w-48 h-48 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analyzedData.sentiments} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                              {analyzedData.sentiments.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontWeight: 'bold' }} itemStyle={{ color: '#0F172A', fontWeight: 'bold' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-mkt-text-sub mb-4">ユーザーの感情分布（推計値）</h5>
                        <div className="space-y-2">
                          {analyzedData.sentiments.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                              <span className="text-sm font-bold text-slate-600 w-24">{s.name}</span>
                              <span className="text-sm font-black text-mkt-text-main">{s.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* 下部：ギャップ分析リスト */}
                    <div>
                      <h5 className="text-sm font-black text-mkt-text-sub tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-500"/> 発見されたギャップと戦略的機会
                      </h5>
                      
                      <div className="space-y-4">
                        {analyzedData.gapAnalysis?.map((gap, i) => (
                          <div key={i} className="bg-white border border-mkt-border rounded-lg p-5 hover:border-mkt-asagi/50 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded text-xs font-black tracking-wider">{gap.theme}</span>
                              <span className={`px-3 py-1 rounded text-xs font-black border ${getAssessmentStyle(gap.assessment)}`}>
                                評価: {gap.assessment}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-50 p-4 rounded border-l-4 border-mkt-asagi border-y border-r border-slate-100">
                                <span className="text-[10px] text-mkt-asagi font-black tracking-wider mb-2 block">公式の主張 (理想)</span>
                                <p className="text-sm font-bold text-mkt-text-main leading-relaxed">{gap.claim}</p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded border-l-4 border-mkt-makoto border-y border-r border-slate-100">
                                <span className="text-[10px] text-mkt-makoto font-black tracking-wider mb-2 block">消費者の声 (現実)</span>
                                <p className="text-sm font-bold text-mkt-text-main leading-relaxed">{gap.reality}</p>
                              </div>
                            </div>
                            
                            {/* 👑 我々の狙い目（Opportunity） */}
                            <div className="mt-4 bg-mkt-makoto/5 border border-mkt-makoto/20 p-4 rounded-md">
                              <span className="text-xs text-mkt-makoto font-black tracking-widest mb-2 flex items-center gap-2">
                                <Target size={14} /> SGT 戦略的機会 (狙い目)
                              </span>
                              <p className="text-sm text-mkt-text-main leading-relaxed font-black">{gap.opportunity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center font-bold text-mkt-text-sub">データがありません</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}