import React from 'react';
import { Shield, Activity, Droplets, Zap, Eye } from 'lucide-react';
import { getCompetitorData } from '../lib/sheets'; // 👑 抽出部隊をインポート！

// 👑 【神機能】60秒ごとにバックグラウンドでデータを自動再取得（ISR）！
export const revalidate = 60; 

export default async function Dashboard() {
  // 👑 サーバーサイドでAPI通信を発動！スプレッドシートから最新データを吸い上げる！
  const mktData = await getCompetitorData();

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
            <Activity size={16} /> 自動同期稼働中
          </button>
          <button className="bg-mkt-makoto text-white px-6 py-2 rounded font-bold hover:opacity-80 transition-colors shadow-[0_0_15px_rgba(204,0,0,0.5)]">
            フェーズ2 分析開始
          </button>
        </div>
      </header>

      {mktData.length === 0 && (
        <div className="text-mkt-makoto text-xl font-bold p-4 border border-mkt-makoto rounded bg-mkt-makoto/10">
          ⚠️ データの取得に失敗したか、スプレッドシートが空です。範囲指定や認証情報を確認してください。
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mktData.map((item, index) => (
          <div key={item.id || index} className="bg-mkt-surface border border-mkt-border rounded-lg p-6 relative overflow-hidden group hover:border-mkt-asagi transition-all duration-300">
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