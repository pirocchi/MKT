"use client";

import React, { useState } from 'react';
import { Shield, Activity, Droplets, Zap, Eye, BarChart2, X, MessageSquareWarning, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
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
  rawReviews?: string; // 👑 新たに追加したレビューテキスト
};

type SentimentData = {
  sentiments: { name: string; value: number; color: string }[];
  strengths: string[];
  weaknesses: string[];
};

export default function DashboardClient({ initialData }: { initialData: Competitor[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Competitor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<SentimentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 👑 ボタンを押した時に発動する「神速AI解析メソッド」
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
        body: JSON.stringify({ reviewsText: item.rawReviews })
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

  return (
    <div className="min-h-screen bg-mkt-bg text-mkt-text-main p-8 font-sans relative">
      
      {/* ヘッダー部分 */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-mkt-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-wider flex items-center gap-3">
            <span className="text-mkt-makoto">MKT</span>
            <span>Intelligence Unit</span>
          </h1>
          <p className="text-mkt-asagi text-sm mt-2 tracking-widest flex items-center gap-2">
            <Eye size={16} /> ELECTRIC BRUSH COMPETITOR MONITORING
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-mkt-surface border border-mkt-border px-4 py-2 rounded hover:border-mkt-asagi transition-colors flex items-center gap-2">
            <Activity size={16} className="text-green-500" /> SGT/AI 接続済み
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
            <h3 className="text-mkt-text-sub text-sm mb-6 h-10">{item.name}</h3>
            
            <div className="space-y-4 mb-6 flex-grow">
              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>実売価格</span>
                <span className="font-bold text-xl">¥{item.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-3 rounded mt-2">
                <span className="text-mkt-text-sub">市場フィードバック</span>
                <span className="font-bold text-mkt-asagi text-lg">{item.reviews.toLocaleString()} <span className="text-sm font-normal">件</span></span>
              </div>
            </div>

            <button 
              onClick={() => handleAnalyze(item)}
              className="w-full bg-transparent border border-mkt-asagi text-mkt-asagi py-3 rounded hover:bg-mkt-asagi hover:text-mkt-bg transition-colors font-bold tracking-wider flex justify-center items-center gap-2"
            >
              <MessageSquareWarning size={18} /> インサイト詳細を解析
            </button>
          </div>
        ))}
      </div>

      {/* 👑 インサイト解析モーダル */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-mkt-surface border border-mkt-border rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-mkt-text-sub hover:text-mkt-makoto transition-colors z-10"><X size={24} /></button>

            {/* 左側：基本情報 */}
            <div className="p-8 md:w-2/5 border-r border-mkt-border bg-[#181818]">
              <span className="text-xs font-bold text-mkt-bg bg-mkt-asagi px-2 py-1 rounded mb-4 inline-block">{selectedProduct.classification}</span>
              <h2 className="text-3xl font-bold mb-2 text-white">{selectedProduct.brand}</h2>
              <h3 className="text-mkt-text-sub text-lg mb-8">{selectedProduct.name}</h3>
              <div className="space-y-6">
                <div><h4 className="text-mkt-asagi text-sm mb-2 flex items-center gap-2"><Zap size={16}/> 搭載テクノロジー</h4><p className="text-sm leading-relaxed">{selectedProduct.tech}</p></div>
                <div><h4 className="text-mkt-asagi text-sm mb-2 flex items-center gap-2"><Shield size={16}/> ヘッド仕様</h4><p className="text-sm leading-relaxed">{selectedProduct.pins}</p></div>
              </div>
            </div>

            {/* 右側：AI解析結果 */}
            <div className="p-8 md:w-3/5 flex flex-col">
              <h4 className="font-bold tracking-widest text-mkt-text-sub mb-6 flex items-center gap-2 border-b border-mkt-border pb-4">
                <BarChart2 className="text-mkt-makoto" /> AI REVIEW SENTIMENT ANALYSIS
              </h4>
              
              {isAnalyzing ? (
                <div className="flex-grow flex flex-col items-center justify-center text-mkt-asagi">
                  <Loader2 className="animate-spin mb-4" size={48} />
                  <p className="tracking-widest font-bold animate-pulse">Gemini-3.5-Flash 解析中...</p>
                </div>
              ) : errorMsg ? (
                <div className="flex-grow flex items-center justify-center text-mkt-makoto font-bold">{errorMsg}</div>
              ) : analyzedData ? (
                <div className="flex flex-col h-full animate-in fade-in zoom-in duration-500">
                  {/* 上部：グラフ */}
                  <div className="h-48 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analyzedData.sentiments} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {analyzedData.sentiments.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#334155', color: '#F8FAFC' }} itemStyle={{ color: '#F8FAFC' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* 下部：インサイト（強み・弱み） */}
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-mkt-asagi/10 p-4 rounded border border-mkt-asagi/30">
                      <h5 className="text-mkt-asagi text-sm font-bold mb-3 flex items-center gap-2"><ThumbsUp size={16}/> 抽出された強み</h5>
                      <ul className="text-xs space-y-2 list-disc list-inside">
                        {analyzedData.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-mkt-makoto/10 p-4 rounded border border-mkt-makoto/30">
                      <h5 className="text-mkt-makoto text-sm font-bold mb-3 flex items-center gap-2"><ThumbsDown size={16}/> 抽出された弱み</h5>
                      <ul className="text-xs space-y-2 list-disc list-inside">
                        {analyzedData.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center text-mkt-text-sub">データがありません</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}