"use client";

import React, { useState } from 'react';
import { Activity, Eye, X, Loader2, Target, Crosshair, Quote, Image as ImageIcon, ShoppingCart, CheckSquare, Square, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Competitor = {
  id: string; classification: string; brand: string; name: string; price: number; tech: string; waterproof: string; pins: string; reviews: number; rawReviews?: string; scrapedDate?: string; averageRating?: string; imageUrl?: string; amazonUrl?: string; rakutenUrl?: string;
  claims?: { target: string; problem: string; usp: string; pain: string; ease: string; copy: string; };
};
type GapAnalysis = { theme: string; claim: string; reality: string; assessment: string; opportunity: string; };
type SentimentData = { sentiments: { name: string; value: number; color: string }[]; gapAnalysis: GapAnalysis[]; };

type ProductPlan = {
  conceptName: string; targetPrice: string; coreFeatures: string[]; differentiation: string; mainCopy: string;
};

export default function DashboardClient({ initialData }: { initialData: Competitor[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Competitor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<SentimentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedForPlan, setSelectedForPlan] = useState<Competitor[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planData, setPlanData] = useState<ProductPlan | null>(null);

  const handleAnalyze = async (item: Competitor) => {
    setSelectedProduct(item); setAnalyzedData(null); setErrorMsg("");
    if (!item.rawReviews || item.rawReviews.trim() === "") {
      setErrorMsg("顧客評価データが登録されていません。"); return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewsText: item.rawReviews, claims: item.claims || {}, averageRating: item.averageRating || "-" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分析中に問題が発生しました");
      setAnalyzedData(data);
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsAnalyzing(false); }
  };

  const togglePlanSelection = (item: Competitor) => {
    if (selectedForPlan.find(p => p.id === item.id)) {
      setSelectedForPlan(selectedForPlan.filter(p => p.id !== item.id));
    } else {
      setSelectedForPlan([...selectedForPlan, item]);
    }
  };

  const handleProductPlan = async () => {
    setPlanData(null); setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: selectedForPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "企画案の作成に失敗しました");
      setPlanData(data.productPlan);
    } catch (err: any) {
      alert(`処理に失敗しました: ${err.message}`);
    } finally {
      setIsGeneratingPlan(false);
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
            <span className="text-mkt-makoto">MKT</span><span>競合分析画面</span>
          </h1>
          <p className="text-mkt-asagi text-sm mt-2 tracking-widest flex items-center gap-2 font-bold">
            <Eye size={16} /> 競合製品の市場評価と方針の比較
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-mkt-surface border border-mkt-border px-4 py-2 rounded flex items-center gap-2 font-bold shadow-sm">
            <Activity size={16} className="text-green-500" /> 統合運用システム連携完了
          </div>
        </div>
      </header>

      {selectedForPlan.length >= 2 && (
        <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button 
            onClick={handleProductPlan}
            disabled={isGeneratingPlan}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-full shadow-lg flex items-center gap-3 transition-transform disabled:opacity-70 disabled:cursor-not-allowed border border-slate-600"
          >
            {isGeneratingPlan ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
            {isGeneratingPlan ? "新商品企画案を作成中..." : `選択した${selectedForPlan.length}製品から新商品企画案を作成`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialData.map((item, index) => {
          const isSelected = selectedForPlan.some(p => p.id === item.id);
          return (
            <div key={item.id || index} className={`bg-mkt-surface border-2 rounded-lg p-6 relative overflow-hidden transition-all duration-300 flex flex-col shadow-sm ${isSelected ? 'border-blue-600 bg-blue-50/10' : 'border-mkt-border'}`}>
              
              <button onClick={() => togglePlanSelection(item)} className="absolute top-4 right-4 z-10 transition-colors">
                {isSelected ? <CheckSquare size={28} className="text-blue-600 bg-white rounded" /> : <Square size={28} className="text-slate-300 bg-white rounded" />}
              </button>

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600 opacity-75"></div>
              
              <div className="w-full h-48 mb-5 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center overflow-hidden relative mt-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full p-2 mix-blend-multiply" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center"><ImageIcon size={32} className="mb-2 opacity-50" /><span className="text-xs font-bold">画像なし</span></div>
                )}
              </div>

              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-white bg-slate-600 px-2 py-1 rounded">{item.classification}</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-1 text-mkt-text-main">{item.brand}</h2>
              <h3 className="text-mkt-text-sub text-sm mb-5 h-10 font-medium line-clamp-2">{item.name}</h3>
              
              {(item.amazonUrl || item.rakutenUrl) && (
                <div className="flex gap-3 mb-6">
                  {item.amazonUrl && <a href={item.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-slate-800 text-sm font-bold py-3 rounded flex justify-center items-center gap-2 hover:bg-slate-700 transition"><ShoppingCart size={16} /> Amazon</a>}
                  {item.rakutenUrl && <a href={item.rakutenUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-[#BF0000] text-sm font-bold py-3 rounded flex justify-center items-center gap-2 hover:bg-[#990000] transition"><ShoppingCart size={16} /> 楽天市場</a>}
                </div>
              )}

              <div className="space-y-5 mb-6 flex-grow">
                <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                  <span className="text-mkt-text-sub font-bold">実売価格</span>
                  <span className="font-bold text-3xl text-mkt-text-main">¥{item.price.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded mt-2 border border-slate-200">
                  <span className="text-xs text-slate-600 font-bold mb-1 block">公式広告文案:</span>
                  <p className="text-sm font-bold text-mkt-text-main truncate">"{item.claims?.copy || '未設定'}"</p>
                </div>
                <div className="flex justify-between items-end pt-3">
                  <span className="text-mkt-text-sub text-sm font-bold">顧客評価</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-bold text-yellow-600 text-2xl">★ {item.averageRating || "-"}</span>
                    <span className="font-bold text-slate-700 text-2xl">{item.reviews.toLocaleString()} <span className="text-sm font-bold">件</span></span>
                  </div>
                </div>
              </div>

              <button onClick={() => handleAnalyze(item)} className="w-full bg-slate-100 border border-slate-300 text-slate-700 py-3 rounded hover:bg-slate-200 transition-colors font-bold flex justify-center items-center gap-2 text-base">
                <Target size={18} /> 個別製品の分析を実行
              </button>
            </div>
          );
        })}
      </div>

      {planData && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white border border-slate-300 rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col relative overflow-hidden shadow-xl">
            <button onClick={() => setPlanData(null)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-20 bg-slate-100 p-2 rounded-full"><X size={24} /></button>
            
            <div className="bg-slate-800 p-8 text-white">
              <span className="bg-slate-600 text-xs font-bold px-3 py-1 rounded flex items-center gap-2 w-max mb-4"><FileText size={14}/> 新商品企画案</span>
              <h2 className="text-3xl font-bold mb-3 leading-tight">{planData.conceptName}</h2>
              <p className="text-slate-300 font-bold text-lg">"{planData.mainCopy}"</p>
            </div>

            <div className="p-8 overflow-y-auto flex-grow flex flex-col gap-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h4 className="text-sm text-slate-600 font-bold mb-3 flex items-center gap-2"><Target size={16} /> 推奨販売価格</h4>
                  <p className="text-lg font-bold text-slate-800 leading-relaxed">{planData.targetPrice}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h4 className="text-sm text-slate-600 font-bold mb-3 flex items-center gap-2"><Crosshair size={16} /> 競合優位性</h4>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{planData.differentiation}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h4 className="text-sm text-slate-800 font-bold mb-4 border-b border-slate-200 pb-2">必須機能要件</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {planData.coreFeatures.map((feature, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded border border-slate-200 flex items-start gap-3">
                      <div className="bg-slate-600 text-white rounded w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">{i + 1}</div>
                      <p className="text-sm text-slate-700 font-bold">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col relative overflow-hidden shadow-xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-20 bg-slate-100 p-2 rounded-full"><X size={24} /></button>
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              <div className="p-8 lg:w-1/3 border-r border-slate-200 bg-slate-50 overflow-y-auto relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-white bg-slate-600 px-2 py-1 rounded">{selectedProduct.classification}</span>
                </div>
                {selectedProduct.imageUrl && (
                  <div className="w-full h-48 mb-6 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="object-contain w-full h-full p-4 mix-blend-multiply" />
                  </div>
                )}
                <h2 className="text-2xl font-bold mb-1 text-slate-800">{selectedProduct.brand}</h2>
                <h3 className="text-slate-600 font-bold text-base mb-6">{selectedProduct.name}</h3>
                {(selectedProduct.amazonUrl || selectedProduct.rakutenUrl) && (
                  <div className="flex gap-3 mb-8">
                    {selectedProduct.amazonUrl && <a href={selectedProduct.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-slate-800 text-sm font-bold px-4 py-3 rounded flex justify-center items-center gap-2 hover:bg-slate-700 transition"><ShoppingCart size={16} /> Amazonで確認</a>}
                    {selectedProduct.rakutenUrl && <a href={selectedProduct.rakutenUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-[#BF0000] text-sm font-bold px-4 py-3 rounded flex justify-center items-center gap-2 hover:bg-[#990000] transition"><ShoppingCart size={16} /> 楽天で確認</a>}
                  </div>
                )}
                <div className="mb-8 p-5 bg-white border border-slate-200 rounded">
                  <h4 className="text-xs text-slate-600 font-bold mb-2 flex items-center gap-2"><Quote size={14}/> 公式広告文案</h4>
                  <p className="text-base font-bold text-slate-800">"{selectedProduct.claims?.copy}"</p>
                </div>
                <h4 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2 mb-4">公式設定の訴求内容</h4>
                <div className="space-y-4">
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">対象顧客</span><p className="text-sm text-slate-800 font-bold">{selectedProduct.claims?.target}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">訴求事項</span><p className="text-sm text-slate-800 font-bold">{selectedProduct.claims?.problem}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">最大の強み</span><p className="text-sm text-slate-800 font-bold">{selectedProduct.claims?.usp}</p></div>
                </div>
              </div>

              <div className="p-8 lg:w-2/3 flex flex-col bg-white overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-3 text-lg"><Crosshair className="text-slate-600" /> 比較分析結果</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500">平均評価:</span>
                    <span className="font-bold text-yellow-600 text-xl">★ {selectedProduct.averageRating || "-"}</span>
                  </div>
                </div>
                
                {isAnalyzing ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-slate-600">
                    <Loader2 className="animate-spin mb-6" size={48} />
                    <p className="font-bold text-base">分析処理を実行中...</p>
                  </div>
                ) : errorMsg ? (
                  <div className="flex-grow flex items-center justify-center text-red-600 font-bold border border-red-200 p-4 rounded bg-red-50">{errorMsg}</div>
                ) : analyzedData ? (
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-8 bg-slate-50 p-6 rounded border border-slate-200">
                      <div className="w-48 h-48 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analyzedData.sentiments} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                              {analyzedData.sentiments.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ fontWeight: 'bold' }} itemStyle={{ fontWeight: 'bold' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-700 mb-4">顧客の感情分布（推計）</h5>
                        <div className="space-y-2">
                          {analyzedData.sentiments.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                              <span className="text-sm font-bold text-slate-600 w-24">{s.name}</span>
                              <span className="text-sm font-bold text-slate-800">{s.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">分析結果と戦略上の機会</h5>
                      <div className="space-y-4">
                        {analyzedData.gapAnalysis?.map((gap, i) => (
                          <div key={i} className="bg-white border border-slate-200 rounded p-5">
                            <div className="flex justify-between items-start mb-4">
                              <span className="bg-slate-100 text-slate-600 border border-slate-300 px-3 py-1 rounded text-xs font-bold">{gap.theme}</span>
                              <span className="px-3 py-1 rounded text-xs font-bold border bg-slate-100 text-slate-700 border-slate-300">評価: {gap.assessment}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold mb-2 block">公式の主張</span>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{gap.claim}</p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold mb-2 block">実際の声</span>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{gap.reality}</p>
                              </div>
                            </div>
                            <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded">
                              <span className="text-xs text-slate-700 font-bold mb-2 flex items-center gap-2"><Target size={14} /> 当社の戦略的方針</span>
                              <p className="text-sm text-slate-800 leading-relaxed font-bold">{gap.opportunity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center font-bold text-slate-500">データがありません</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}