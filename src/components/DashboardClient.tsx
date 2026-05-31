"use client";

import React, { useState } from 'react';
import { Shield, Activity, Droplets, Zap, Eye, BarChart2, X, MessageSquareWarning } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// スプレッドシートから受け取るデータの型定義
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
};

export default function DashboardClient({ initialData }: { initialData: Competitor[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Competitor | null>(null);

  // 👑 将来的にAIやシートから取得する「感情分析」のダミーデータ生成器
  const getMockSentiment = (id: string) => [
    { name: 'ポジティブ (絶賛)', value: Math.floor(Math.random() * 40) + 40, color: '#4FBAD3' }, // 浅葱ブルー
    { name: 'ニュートラル (普通)', value: Math.floor(Math.random() * 20) + 10, color: '#94A3B8' }, // サブテキスト色
    { name: 'ネガティブ (不満)', value: Math.floor(Math.random() * 20) + 5, color: '#CC0000' },   // 誠レッド
  ];

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
            <Activity size={16} /> Sheets 同期中
          </button>
          <button className="bg-mkt-makoto text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(204,0,0,0.5)] flex items-center gap-2">
            <BarChart2 size={18} /> インサイト分析稼働
          </button>
        </div>
      </header>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialData.map((item, index) => (
          <div key={item.id || index} className="bg-mkt-surface border border-mkt-border rounded-lg p-6 relative overflow-hidden group hover:border-mkt-asagi transition-all duration-300 flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mkt-makoto to-mkt-asagi opacity-75"></div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-mkt-bg bg-mkt-asagi px-2 py-1 rounded">
                {item.classification}
              </span>
              <span className="text-mkt-text-sub text-sm">{item.id}</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-1 text-white">{item.brand}</h2>
            <h3 className="text-mkt-text-sub text-sm mb-6 h-10">{item.name}</h3>
            
            <div className="space-y-4 mb-6 flex-grow">
              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>実売価格</span>
                <span className="font-bold text-xl">¥{item.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub flex items-center gap-2"><Droplets size={14} className="text-mkt-asagi" />防水性能</span>
                <span className="text-sm font-semibold">{item.waterproof}</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-3 rounded mt-2">
                <span className="text-mkt-text-sub">レビュー総数</span>
                <span className="font-bold text-mkt-asagi text-lg">{item.reviews.toLocaleString()} <span className="text-sm font-normal">件</span></span>
              </div>
            </div>

            {/* 👑 モーダル展開ボタン */}
            <button 
              onClick={() => setSelectedProduct(item)}
              className="w-full bg-transparent border border-mkt-asagi text-mkt-asagi py-3 rounded hover:bg-mkt-asagi hover:text-mkt-bg transition-colors font-bold tracking-wider flex justify-center items-center gap-2"
            >
              <MessageSquareWarning size={18} /> インサイト詳細を解析
            </button>
          </div>
        ))}
      </div>

      {/* 👑 インサイト解析モーダル（詳細画面） */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-mkt-surface border border-mkt-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-mkt-text-sub hover:text-mkt-makoto transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* 左側：基本スペック */}
            <div className="p-8 md:w-1/2 border-r border-mkt-border">
              <span className="text-xs font-bold text-mkt-bg bg-mkt-asagi px-2 py-1 rounded mb-4 inline-block">
                {selectedProduct.classification}
              </span>
              <h2 className="text-3xl font-bold mb-2 text-white">{selectedProduct.brand}</h2>
              <h3 className="text-mkt-text-sub text-lg mb-8">{selectedProduct.name}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-mkt-asagi text-sm mb-2 flex items-center gap-2"><Zap size={16}/> 搭載テクノロジー</h4>
                  <p className="text-sm leading-relaxed">{selectedProduct.tech}</p>
                </div>
                <div>
                  <h4 className="text-mkt-asagi text-sm mb-2 flex items-center gap-2"><Shield size={16}/> ヘッド仕様</h4>
                  <p className="text-sm leading-relaxed">{selectedProduct.pins}</p>
                </div>
              </div>
            </div>

            {/* 右側：感情分析チャート */}
            <div className="p-8 md:w-1/2 bg-black/20 flex flex-col justify-center">
              <h4 className="text-center font-bold tracking-widest text-mkt-text-sub mb-2">REVIEW SENTIMENT ANALYSIS</h4>
              <p className="text-center text-xs text-mkt-text-sub mb-6">市場の感情分布（推計値）</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getMockSentiment(selectedProduct.id)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {getMockSentiment(selectedProduct.id).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#334155', color: '#F8FAFC' }}
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-mkt-asagi"></span><span className="text-xs">絶賛</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#94A3B8]"></span><span className="text-xs">普通</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-mkt-makoto"></span><span className="text-xs">不満</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}