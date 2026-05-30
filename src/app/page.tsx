import React from 'react';
import { Shield, Activity, Droplets, Zap, Eye } from 'lucide-react';

const mktData = [
  {
    id: "DBB-001",
    classification: "ハイエンド・絶対王者",
    brand: "エレクトロン",
    name: "デンキバリブラシ(R) 2.0 +ボディ",
    price: 217800,
    tech: "特許取得の『針』技術 / FRF Technology(R)",
    waterproof: "非防水",
    reviews: 149,
    pins: "シリコン製"
  },
  {
    id: "MYSE-001",
    classification: "ミドル・王道",
    brand: "ミーゼ",
    name: "スカルプリフト アクティブ プラス",
    price: 35640,
    tech: "低中周波EMS / マイクロカレント / LED",
    waterproof: "IPX5（防滴）",
    reviews: 2834,
    pins: "電極ピン"
  },
  {
    id: "SAL-001",
    classification: "エントリー・コスパ",
    brand: "サロニア",
    name: "EMSリフトブラシ",
    price: 27500,
    tech: "ブレンド波形(多周波数)EMS / 温感 / LED",
    waterproof: "IPX5相当",
    reviews: 1109,
    pins: "3Dフィットピン"
  },
  {
    id: "MYT-001",
    classification: "ミドルハイ・高機能",
    brand: "マイトレックス",
    name: "プルーヴ",
    price: 69960,
    tech: "スキンリフトパルス(低周波) / ディープEMS(高周波)",
    waterproof: "IPX5（アタッチメントのみ）",
    reviews: 585,
    pins: "専用アタッチメント"
  },
  {
    id: "PAN-001",
    classification: "ミドル・総合家電",
    brand: "パナソニック",
    name: "バイタルリフトブラシ",
    price: 39600,
    tech: "EMS / イオンケア / LED(赤) / 温感",
    waterproof: "IPX5（お風呂使用可）",
    reviews: 122,
    pins: "クッションヘッド"
  },
  {
    id: "ADE-001",
    classification: "ニッチ・毛髪特化",
    brand: "アデランス",
    name: "ヘアリプロ ドゥライズ",
    price: 46200,
    tech: "RF / EMS / EP(類似) / LED / VR",
    waterproof: "記載なし",
    reviews: 3,
    pins: "スプリング式(チタンコーティング)"
  }
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-mkt-bg text-mkt-text-main p-8">
      
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
            <Activity size={16} /> Vercel 同期
          </button>
          <button className="bg-mkt-makoto text-white px-6 py-2 rounded font-bold hover:opacity-80 transition-colors shadow-[0_0_15px_rgba(204,0,0,0.5)]">
            フェーズ2 分析開始
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mktData.map((item) => (
          <div key={item.id} className="bg-mkt-surface border border-mkt-border rounded-lg p-6 relative overflow-hidden group hover:border-mkt-asagi transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mkt-makoto to-mkt-asagi opacity-75"></div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-mkt-bg bg-mkt-asagi px-2 py-1 rounded">
                {item.classification}
              </span>
              <span className="text-mkt-text-sub text-sm">{item.id}</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-1 text-white">{item.brand}</h2>
            <h3 className="text-mkt-text-sub text-sm mb-6 h-10">{item.name}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>実売価格</span>
                <span className="font-bold text-xl">¥{item.price.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-start border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub flex items-center gap-2 whitespace-nowrap"><Zap size={14} className="text-mkt-makoto" />技術</span>
                <span className="text-sm text-right leading-tight pl-4">{item.tech}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub flex items-center gap-2"><Droplets size={14} className="text-mkt-asagi" />防水性能</span>
                <span className="text-sm font-semibold">{item.waterproof}</span>
              </div>

              <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                <span className="text-mkt-text-sub flex items-center gap-2"><Shield size={14} className="text-gray-400" />ヘッド仕様</span>
                <span className="text-sm">{item.pins}</span>
              </div>
              
              <div className="flex justify-between items-center bg-black/30 p-3 rounded">
                <span className="text-mkt-text-sub">市場フィードバック</span>
                <span className="font-bold text-mkt-asagi text-lg">{item.reviews.toLocaleString()} <span className="text-sm text-mkt-text-sub font-normal">件</span></span>
              </div>
            </div>

            <button className="w-full bg-transparent border border-mkt-asagi text-mkt-asagi py-3 rounded hover:bg-mkt-asagi hover:text-mkt-bg transition-colors font-bold tracking-wider">
              インサイト詳細を表示
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}