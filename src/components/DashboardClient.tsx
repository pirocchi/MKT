"use client";

import React, { useState } from 'react';
import { Activity, Eye, X, Loader2, Target, Crosshair, Quote, Image as ImageIcon, ShoppingCart, CheckSquare, Square, FileText, Zap, Brain, Cpu, MessageCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Competitor = {
  id: string; classification: string; brand: string; name: string; price: number; tech: string; waterproof: string; pins: string; reviews: number; rawReviews?: string; scrapedDate?: string; averageRating?: string; imageUrl?: string; amazonUrl?: string; rakutenUrl?: string;
  claims?: { target: string; problem: string; usp: string; pain: string; ease: string; copy: string; };
};
type GapAnalysis = { theme: string; claim: string; reality: string; assessment: string; opportunity: string; };
type SentimentData = { sentiments: { name: string; value: number; color: string }[]; gapAnalysis: GapAnalysis[]; };
type ProductPlan = { conceptName: string; targetPrice: string; coreFeatures: string[]; differentiation: string; mainCopy: string; };

export default function DashboardClient({ initialData }: { initialData: Competitor[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Competitor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<SentimentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedForPlan, setSelectedForPlan] = useState<Competitor[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planData, setPlanData] = useState<ProductPlan | null>(null);

  const [pendingProduct, setPendingProduct] = useState<Competitor | null>(null);
  const [pendingPlan, setPendingPlan] = useState<boolean>(false);

  // 顧客評価の表示件数を管理する状態
  const [visibleReviewCount, setVisibleReviewCount] = useState<number>(50);

  const executeAnalysis = async (modelType: string) => {
    if (pendingProduct) {
      const item = pendingProduct;
      setPendingProduct(null);
      setSelectedProduct(item); 
      setAnalyzedData(null); 
      setErrorMsg("");
      setVisibleReviewCount(50); // 新しい分析を開くたびに表示件数を50件にリセット
      
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reviewsText: item.rawReviews, 
            claims: item.claims || {}, 
            averageRating: item.averageRating || "-",
            model: modelType 
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "分析中に問題が発生しました");
        setAnalyzedData(data);
      } catch (err: any) { setErrorMsg(err.message); } finally { setIsAnalyzing(false); }
    } 
    else if (pendingPlan) {
      setPendingPlan(false);
      setPlanData(null); setIsGeneratingPlan(true);
      try {
        const res = await fetch('/api/plan', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: selectedForPlan, model: modelType })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "企画案の作成に失敗しました");
        setPlanData(data.productPlan);
      } catch (err: any) { alert(`処理に失敗しました: ${err.message}`); } finally { setIsGeneratingPlan(false); }
    }
  };

  const togglePlanSelection = (item: Competitor) => {
    if (selectedForPlan.find(p => p.id === item.id)) {
      setSelectedForPlan(selectedForPlan.filter(p => p.id !== item.id));
    } else { setSelectedForPlan([...selectedForPlan, item]); }
  };

  const getAssessmentStyle = (assessment: string) => {
    if (assessment.includes("大ハズシ") || assessment.includes("大きく乖離")) return "bg-mkt-makoto/10 text-mkt-makoto border-mkt-makoto/30";
    if (assessment.includes("大絶賛") || assessment.includes("期待通り")) return "bg-mkt-asagi/10 text-mkt-asagi border-mkt-asagi/30";
    return "bg-slate-100 text-slate-600 border-slate-300";
  };

  // 生のレビューデータをJSONとして安全に読み込む処理
  const rawReviewsList = React.useMemo(() => {
    if (!selectedProduct || !selectedProduct.rawReviews) return [];
    try {
      return JSON.parse(selectedProduct.rawReviews);
    } catch (e) {
      return [];
    }
  }, [selectedProduct]);

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
            onClick={() => {
              if (isGeneratingPlan) return;
              setPendingPlan(true);
            }}
            disabled={isGeneratingPlan}
            style={{ color: '#FFFFFF' }}
            className="bg-mkt-asagi hover:opacity-90 font-bold px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed border-4 border-mkt-makoto"
          >
            {isGeneratingPlan ? <Loader2 size={24} className="animate-spin text-white" /> : <FileText size={24} className="text-white" />}
            {isGeneratingPlan ? "新商品企画案を作成中..." : `選択した${selectedForPlan.length}製品から新商品企画案を作成`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialData.map((item, index) => {
          const isSelected = selectedForPlan.some(p => p.id === item.id);
          return (
            <div key={item.id || index} className={`bg-mkt-surface border-2 rounded-lg p-6 relative overflow-hidden group transition-all duration-300 flex flex-col shadow-sm ${isSelected ? 'border-mkt-makoto bg-mkt-makoto/5' : 'border-mkt-border hover:border-mkt-asagi'}`}>
              <button onClick={() => togglePlanSelection(item)} className="absolute top-4 right-4 z-10 transition-colors">
                {isSelected ? <CheckSquare size={28} className="text-mkt-makoto bg-white rounded" /> : <Square size={28} className="text-slate-300 hover:text-mkt-makoto bg-white rounded" />}
              </button>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mkt-makoto to-mkt-asagi opacity-75"></div>
              
              <div className="w-full h-48 mb-5 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center overflow-hidden relative mt-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center"><ImageIcon size={32} className="mb-2 opacity-50" /><span className="text-xs font-bold tracking-widest">画像なし</span></div>
                )}
              </div>

              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-white bg-mkt-asagi px-2 py-1 rounded">{item.classification}</span>
              </div>
              <h2 className="text-2xl font-bold mb-1 text-mkt-text-main">{item.brand}</h2>
              <h3 className="text-mkt-text-sub text-sm mb-5 h-10 font-medium line-clamp-2">{item.name}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] bg-mkt-asagi/10 text-mkt-asagi border border-mkt-asagi/30 px-2 py-1 rounded font-black tracking-wider">{item.tech}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded font-black tracking-wider">防水: {item.waterproof}</span>
              </div>

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
                  <span className="text-xs text-mkt-asagi font-black mb-1 block tracking-wider">公式広告文案:</span>
                  <p className="text-sm font-bold italic text-mkt-text-main truncate">"{item.claims?.copy || '未設定'}"</p>
                </div>
                <div className="flex justify-between items-end pt-3">
                  <span className="text-mkt-text-sub text-sm font-bold">顧客評価</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-black text-yellow-500 text-2xl drop-shadow-sm">★ {item.averageRating || "-"}</span>
                    <span className="font-black text-mkt-asagi text-2xl">{item.reviews.toLocaleString()} <span className="text-sm font-bold">件</span></span>
                  </div>
                </div>
              </div>

              <button onClick={() => {
                if (!item.rawReviews || item.rawReviews.trim() === "") {
                  alert("顧客評価データが登録されていません。"); return;
                }
                setPendingProduct(item);
              }} className="w-full bg-mkt-surface border-2 border-mkt-makoto text-mkt-makoto py-3 rounded hover:bg-mkt-makoto hover:text-white transition-colors font-black tracking-wider flex justify-center items-center gap-2 text-lg">
                <Target size={20} /> 個別製品の分析を実行
              </button>
            </div>
          );
        })}
      </div>

      {/* 分析モデル選択ダイアログ */}
      {(pendingProduct || pendingPlan) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl border border-mkt-border">
            <div className="bg-mkt-surface p-6 flex justify-between items-center text-mkt-text-main border-b-4 border-mkt-makoto">
              <h3 className="text-xl font-black flex items-center gap-3 tracking-widest">
                <span className="bg-mkt-asagi text-white p-2 rounded-md shadow-sm"><Brain size={20} /></span> 
                分析方法の選択
              </h3>
              <button onClick={() => { setPendingProduct(null); setPendingPlan(false); }} className="text-slate-400 hover:text-mkt-makoto bg-slate-100 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 bg-slate-50">
              <p className="text-slate-600 font-bold mb-6 text-center">目的に合わせてAIモデルを選択してください。</p>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => executeAnalysis('gemini-3.5-flash')} className="bg-white border-2 border-slate-200 p-5 rounded-lg hover:border-mkt-asagi hover:bg-blue-50/30 transition-all text-left group flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Zap size={24} /></div>
                  <div>
                    <h4 className="font-black text-lg text-slate-800 mb-1">速度優先モデル</h4>
                    <p className="text-sm text-slate-500 font-bold">素早く状況を確認したい場合。</p>
                  </div>
                </button>
                <button onClick={() => executeAnalysis('gemini-2.5-pro')} className="bg-white border-2 border-slate-200 p-5 rounded-lg hover:border-mkt-makoto hover:bg-red-50/30 transition-all text-left group flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors"><Target size={24} /></div>
                  <div>
                    <h4 className="font-black text-lg text-slate-800 mb-1">精度優先モデル</h4>
                    <p className="text-sm text-slate-500 font-bold">時間をかけてより正確な分析を行いたい場合。</p>
                  </div>
                </button>
                <button onClick={() => executeAnalysis('gemini-3.1-pro-preview')} className="bg-white border-2 border-slate-200 p-5 rounded-lg hover:border-purple-500 hover:bg-purple-50/30 transition-all text-left group flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Cpu size={24} /></div>
                  <div>
                    <h4 className="font-black text-lg text-slate-800 mb-1">推論優先モデル</h4>
                    <p className="text-sm text-slate-500 font-bold">複雑な論理展開や深い分析が必要な場合。</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新商品企画案 モーダル */}
      {planData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-slate-50 border-2 border-mkt-asagi/50 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col relative overflow-hidden shadow-2xl">
            <button onClick={() => setPlanData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-mkt-makoto bg-white hover:bg-red-50 p-2 rounded-full transition-colors z-20 shadow-md"><X size={28} /></button>
            
            <div className="bg-mkt-surface border-b-4 border-mkt-makoto p-8 pr-20 text-mkt-text-main">
              <span className="bg-mkt-asagi text-white text-xs font-bold px-3 py-1 rounded tracking-widest flex items-center gap-2 w-max mb-4 shadow-sm"><FileText size={14}/> 新商品企画案</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">{planData.conceptName}</h2>
              <p className="text-mkt-makoto font-bold text-lg">"{planData.mainCopy}"</p>
            </div>

            <div className="p-8 overflow-y-auto flex-grow flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs text-slate-500 font-bold tracking-widest mb-3 flex items-center gap-2"><Target size={16} className="text-mkt-asagi"/> 推奨販売価格</h4>
                  <p className="text-xl font-bold text-mkt-text-main leading-relaxed break-words">{planData.targetPrice}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs text-slate-500 font-bold tracking-widest mb-3 flex items-center gap-2"><Crosshair size={16} className="text-mkt-makoto"/> 競合優位性</h4>
                  <p className="text-base font-bold text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{planData.differentiation}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-mkt-border">
                <h4 className="text-sm text-mkt-text-main font-bold tracking-widest mb-4 border-b border-slate-200 pb-2">必須機能要件</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {planData.coreFeatures.map((feature, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                      <div className="bg-mkt-asagi text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">{i + 1}</div>
                      <p className="text-sm font-bold text-slate-700 break-words">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 個別製品分析 モーダル */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-mkt-surface border border-mkt-border rounded-xl w-full max-w-7xl h-[90vh] flex flex-col relative overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-mkt-text-sub hover:text-mkt-makoto transition-colors z-20 bg-slate-100 hover:bg-slate-200 p-2 rounded-full shadow-sm"><X size={28} /></button>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              <div className="p-8 lg:w-1/3 border-r border-mkt-border bg-slate-50 overflow-y-auto relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-white bg-mkt-asagi px-2 py-1 rounded shadow-sm">{selectedProduct.classification}</span>
                </div>

                {selectedProduct.imageUrl && (
                  <div className="w-full h-48 mb-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="object-contain w-full h-full p-4 mix-blend-multiply" />
                  </div>
                )}
                
                <h2 className="text-3xl font-bold mb-1 text-mkt-text-main">{selectedProduct.brand}</h2>
                <h3 className="text-mkt-text-sub font-bold text-lg mb-6">{selectedProduct.name}</h3>

                {(selectedProduct.amazonUrl || selectedProduct.rakutenUrl) && (
                  <div className="flex gap-3 mb-8">
                    {selectedProduct.amazonUrl && <a href={selectedProduct.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-slate-800 text-sm font-black px-4 py-3 rounded flex justify-center items-center gap-2 hover:bg-slate-700 transition shadow-md"><ShoppingCart size={16} /> Amazonで確認</a>}
                    {selectedProduct.rakutenUrl && <a href={selectedProduct.rakutenUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }} className="flex-1 bg-[#BF0000] text-sm font-black px-4 py-3 rounded flex justify-center items-center gap-2 hover:bg-[#990000] transition shadow-md"><ShoppingCart size={16} /> 楽天で確認</a>}
                  </div>
                )}
                
                <h4 className="text-sm font-black text-mkt-text-sub tracking-widest border-b border-mkt-border pb-2 mb-4 mt-8">ハードウェア仕様</h4>
                <div className="space-y-4 mb-8">
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">搭載テクノロジー</span><p className="text-sm font-bold text-mkt-text-main">{selectedProduct.tech}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">防水規格</span><p className="text-sm font-bold text-mkt-text-main">{selectedProduct.waterproof}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">ピン仕様</span><p className="text-sm font-bold text-mkt-text-main leading-relaxed">{selectedProduct.pins}</p></div>
                </div>

                <h4 className="text-sm font-bold text-mkt-text-sub tracking-widest border-b border-mkt-border pb-2 mb-4">公式設定の訴求内容</h4>
                <div className="space-y-5">
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">対象顧客</span><p className="text-sm font-bold text-mkt-text-main">{selectedProduct.claims?.target}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">訴求事項</span><p className="text-sm font-bold text-mkt-text-main">{selectedProduct.claims?.problem}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">最大の強み</span><p className="text-sm font-bold text-mkt-text-main">{selectedProduct.claims?.usp}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">痛みのなさの主張</span><p className="text-sm font-bold text-mkt-text-main">{selectedProduct.claims?.pain}</p></div>
                  <div><span className="text-xs text-slate-500 font-bold block mb-1">手軽さの主張</span><p className="text-sm font-bold text-mkt-text-main">{selectedProduct.claims?.ease}</p></div>
                </div>
                
                <div className="mb-8 mt-8 p-5 bg-white border-l-4 border-mkt-asagi border-y border-r border-slate-200 rounded-r shadow-sm">
                  <h4 className="text-xs text-mkt-asagi font-bold tracking-widest mb-2 flex items-center gap-2"><Quote size={14}/> 公式広告文案</h4>
                  <p className="text-lg font-serif italic text-mkt-text-main font-bold leading-relaxed">"{selectedProduct.claims?.copy}"</p>
                </div>
              </div>

              <div className="p-8 lg:w-2/3 flex flex-col bg-mkt-surface overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-mkt-border pb-4 pr-12">
                  <h4 className="font-bold tracking-widest text-mkt-text-main flex items-center gap-3 text-xl">
                    <Crosshair className="text-mkt-makoto" /> 比較分析結果
                  </h4>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-mkt-text-sub">平均評価:</span>
                    <span className="font-bold text-yellow-500 text-2xl">★ {selectedProduct.averageRating || "-"}</span>
                  </div>
                </div>
                
                {isAnalyzing ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-mkt-makoto">
                    <Loader2 className="animate-spin mb-6" size={64} />
                    <p className="tracking-widest font-bold text-lg animate-pulse">分析処理を実行中...</p>
                    <p className="text-xs font-bold text-mkt-text-sub mt-4">公式の訴求内容と実際の顧客評価を比較しています</p>
                  </div>
                ) : errorMsg ? (
                  <div className="flex-grow flex items-center justify-center text-mkt-makoto font-bold border border-mkt-makoto/50 p-4 rounded bg-mkt-makoto/5">{errorMsg}</div>
                ) : analyzedData ? (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-8">
                    
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
                        <h5 className="text-sm font-bold text-mkt-text-sub mb-4">顧客の感情分布（推計）</h5>
                        <div className="space-y-2">
                          {analyzedData.sentiments.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                              <span className="text-sm font-bold text-slate-600 w-24">{s.name}</span>
                              <span className="text-sm font-bold text-mkt-text-main">{s.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-bold text-mkt-text-sub tracking-widest mb-4 flex items-center gap-2">
                        分析結果と戦略上の機会
                      </h5>
                      <div className="space-y-4">
                        {analyzedData.gapAnalysis?.map((gap, i) => (
                          <div key={i} className="bg-white border border-mkt-border rounded-lg p-5 hover:border-mkt-asagi/50 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded text-xs font-bold tracking-wider">{gap.theme}</span>
                              <span className={`px-3 py-1 rounded text-xs font-bold border ${getAssessmentStyle(gap.assessment)}`}>
                                評価: {gap.assessment}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-50 p-4 rounded border-l-4 border-mkt-asagi border-y border-r border-slate-100">
                                <span className="text-[10px] text-mkt-asagi font-bold tracking-wider mb-2 block">公式の主張</span>
                                <p className="text-sm font-bold text-mkt-text-main leading-relaxed">{gap.claim}</p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded border-l-4 border-mkt-makoto border-y border-r border-slate-100">
                                <span className="text-[10px] text-mkt-makoto font-bold tracking-wider mb-2 block">実際の声</span>
                                <p className="text-sm font-bold text-mkt-text-main leading-relaxed">{gap.reality}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 bg-mkt-makoto/5 border border-mkt-makoto/20 p-4 rounded-md">
                              <span className="text-xs text-mkt-makoto font-bold tracking-widest mb-2 flex items-center gap-2">
                                <Target size={14} /> 当社の戦略的方針
                              </span>
                              <p className="text-sm text-mkt-text-main leading-relaxed font-bold">{gap.opportunity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center font-bold text-mkt-text-sub">分析データがありません</div>
                )}

                {/* 👑 追加：顧客評価一覧（生のレビューデータ） */}
                {!isAnalyzing && !errorMsg && rawReviewsList.length > 0 && (
                  <div className="mt-12 pt-8 border-t-4 border-slate-100">
                    <h4 className="font-bold tracking-widest text-mkt-text-main flex items-center gap-3 text-xl mb-6">
                      <MessageCircle className="text-mkt-asagi" /> 顧客評価一覧（生データ）
                    </h4>
                    
                    <div className="space-y-4">
                      {rawReviewsList.slice(0, visibleReviewCount).map((rev: any, idx: number) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-yellow-500 font-bold tracking-wider">{rev.rating}</span>
                              <span className="text-xs font-bold text-slate-500">{rev.date}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${rev.platform === 'Amazon' ? 'bg-slate-800 text-white' : 'bg-[#BF0000] text-white'}`}>
                              {rev.platform || "購入者"}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-800 mb-2">{rev.title}</h5>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{rev.body}</p>
                          {rev.attributes && rev.attributes !== "属性不明" && rev.attributes !== "属性なし" && (
                            <p className="text-[10px] text-slate-400 font-bold mt-4 pt-2 border-t border-slate-100">{rev.attributes}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 追加読み込みボタン */}
                    {rawReviewsList.length > visibleReviewCount && (
                      <button
                        onClick={() => setVisibleReviewCount(prev => prev + 50)}
                        className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded transition-colors border border-slate-200"
                      >
                        さらに読み込む（全 {rawReviewsList.length} 件中 {visibleReviewCount} 件を表示中）
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}