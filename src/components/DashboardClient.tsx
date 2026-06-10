"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Eye, X, Loader2, Target, Crosshair, Quote, Image as ImageIcon, ShoppingCart, CheckSquare, Square, FileText, Zap, Cpu, MessageCircle, BarChart3, Calendar, ArrowUpDown, Star, LayoutGrid, List, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Competitor = {
  id: string; classification: string; brand: string; name: string; price: number; tech: string; waterproof: string; pins: string; reviews: number; rawReviews?: string; scrapedDate?: string; averageRating?: string; imageUrl?: string; amazonUrl?: string; rakutenUrl?: string;
  claims?: { target: string; problem: string; usp: string; pain: string; ease: string; copy: string; };
  rawHumint?: string;
};
type GapAnalysis = { theme: string; claim: string; reality: string; assessment: string; opportunity: string; };
type SentimentData = { sentiments: { name: string; value: number; color: string }[]; gapAnalysis: GapAnalysis[]; };
type ProductPlan = { conceptName: string; targetPrice: string; coreFeatures: string[]; differentiation: string; mainCopy: string; };

export default function DashboardClient({ initialData }: { initialData: Competitor[] }) {
  const [products, setProducts] = useState<Competitor[]>(initialData);

  useEffect(() => {
    setProducts(initialData);
  }, [initialData]);

  const [selectedProduct, setSelectedProduct] = useState<Competitor | null>(null);
  const [editedProduct, setEditedProduct] = useState<Competitor | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<SentimentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedForPlan, setSelectedForPlan] = useState<Competitor[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planData, setPlanData] = useState<ProductPlan | null>(null);

  const [pendingProduct, setPendingProduct] = useState<Competitor | null>(null);
  const [pendingPlan, setPendingPlan] = useState<boolean>(false);

  const [visibleReviewCount, setVisibleReviewCount] = useState<number>(50);
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');
  const [filterPeriod, setFilterPeriod] = useState<string>('ALL');
  const [filterRating, setFilterRating] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<string>('DATE_DESC');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  useEffect(() => {
    const savedMode = localStorage.getItem('mkt-view-mode');
    if (savedMode === 'list' || savedMode === 'grid') {
      setViewMode(savedMode);
    }
  }, []);
  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('mkt-view-mode', mode);
  };

  const [localNotes, setLocalNotes] = useState<any[]>([]);
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteCategory, setNoteCategory] = useState("商談・メーカー情報");
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false); 

  // 👑 新設：新規製品追加モーダル用のステート群
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSubmittingNewProduct, setIsSubmittingNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Competitor>>({
    id: "", classification: "電気バリブラシ", brand: "", name: "", price: 0, tech: "", waterproof: "", pins: "", imageUrl: "", amazonUrl: "", rakutenUrl: "",
    claims: { target: "", problem: "", usp: "", pain: "", ease: "", copy: "" }
  });

  const inputClass = "w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm font-bold text-slate-800 focus:border-mkt-asagi outline-none transition-colors shadow-sm";
  const labelClass = "text-xs font-black text-slate-500 mb-1 block tracking-wider";

  const getNotesCount = (rawHumint?: string) => {
    if (!rawHumint) return 0;
    try { return JSON.parse(rawHumint).length; } catch { return 0; }
  };

  const handleOpenDetail = (item: Competitor) => {
    const currentProduct = products.find(p => p.id === item.id) || item;

    setSelectedProduct(currentProduct);
    setEditedProduct(JSON.parse(JSON.stringify(currentProduct))); 
    setAnalyzedData(null);
    setErrorMsg("");
    setVisibleReviewCount(50);
    setFilterPlatform('ALL');
    setFilterPeriod('ALL');
    setFilterRating('ALL');
    setSortOrder('DATE_DESC');
    setLocalNotes(currentProduct.rawHumint ? JSON.parse(currentProduct.rawHumint) : []);
    setNoteText("");
  };

  const executeAnalysis = async (modelType: string) => {
    if (pendingProduct) {
      const item = pendingProduct; 
      setPendingProduct(null);
      
      const humintNotesText = localNotes.map((n: any) => `[${n.date}][${n.author}][${n.category}] ${n.note}`).join('\n');
      
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reviewsText: item.rawReviews, 
            claims: item.claims || {}, 
            averageRating: item.averageRating || "-",
            model: modelType,
            humintNotes: humintNotesText
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

  const handleUpdateProduct = async () => {
    if (!editedProduct) return;
    setIsUpdatingProduct(true);
    try {
      const currentHumintStr = localNotes.length > 0 ? JSON.stringify(localNotes) : "";
      const payload = { ...editedProduct, rawHumint: currentHumintStr };

      const res = await fetch('/api/update-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新に失敗しました");
      
      setProducts(prev => prev.map(p => p.id === payload.id ? payload : p));
      setEditedProduct(payload); 
      
      alert("✅ データベースの製品情報を上書き更新しました。フロントエンドの同期には少し時間がかかる場合があります。");
    } catch (err: any) {
      alert(`⚠️ データベース更新失敗: ${err.message}`);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleSaveNote = async () => {
    if (!editedProduct || !noteText.trim()) return;
    setIsSavingNote(true);
    try {
      await fetch('/api/save-note', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mktId: editedProduct.id,
          note: noteText,
          category: noteCategory,
          author: noteAuthor || "匿名ユーザー"
        })
      });
      
      const newNote = {
        date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        author: noteAuthor || "匿名ユーザー",
        category: noteCategory,
        note: noteText
      };
      
      const updatedNotes = [...localNotes, newNote];
      setLocalNotes(updatedNotes);
      
      const updatedHumintStr = JSON.stringify(updatedNotes);
      const updatedProduct = { ...editedProduct, rawHumint: updatedHumintStr };
      
      setEditedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === editedProduct.id ? updatedProduct : p));
      
      await fetch('/api/update-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });

      setNoteText("");
      alert("✅ 追加情報・メモを保存しました！フロントエンドの同期には少し時間がかかる場合があります。");
    } catch (err: any) {
      alert(`⚠️ 書き込み失敗: ${err.message}`);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (indexToDelete: number) => {
    if (!editedProduct) return;
    if (!window.confirm("このメモを削除しますか？\n※削除後は元に戻せません。")) return;

    setIsDeletingNote(true);
    try {
      const updatedNotes = localNotes.filter((_, index) => index !== indexToDelete);
      const updatedHumintStr = updatedNotes.length > 0 ? JSON.stringify(updatedNotes) : "";
      
      setLocalNotes(updatedNotes);
      const updatedProduct = { ...editedProduct, rawHumint: updatedHumintStr };
      setEditedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === editedProduct.id ? updatedProduct : p));

      const res = await fetch('/api/update-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "削除の反映に失敗しました");

    } catch (err: any) {
      alert(`⚠️ メモ削除失敗: ${err.message}`);
    } finally {
      setIsDeletingNote(false);
    }
  };

  // 👑 新設：手動製品追加のSubmit処理
  const handleAddProductSubmit = async () => {
    if (!newProduct.id || !newProduct.brand || !newProduct.name) {
      alert("⚠️ MKT-ID、ブランド名、商品名は必須入力項目です。");
      return;
    }
    setIsSubmittingNewProduct(true);
    try {
      const res = await fetch('/api/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "製品の追加に失敗しました");

      // 大元のローカルステートに完全同期！
      const completeNewProduct: Competitor = {
        id: newProduct.id,
        classification: newProduct.classification || "電気バリブラシ",
        brand: newProduct.brand,
        name: newProduct.name,
        price: Number(newProduct.price) || 0,
        tech: newProduct.tech || "",
        waterproof: newProduct.waterproof || "",
        pins: newProduct.pins || "",
        reviews: 0,
        averageRating: "-",
        scrapedDate: new Date().toLocaleDateString('ja-JP'),
        imageUrl: newProduct.imageUrl || "",
        amazonUrl: newProduct.amazonUrl || "",
        rakutenUrl: newProduct.rakutenUrl || "",
        claims: newProduct.claims as any,
        rawReviews: "",
        rawHumint: ""
      };

      setProducts(prev => [...prev, completeNewProduct]);
      setIsAddingProduct(false);
      setNewProduct({
        id: "", classification: "電気バリブラシ", brand: "", name: "", price: 0, tech: "", waterproof: "", pins: "", imageUrl: "", amazonUrl: "", rakutenUrl: "",
        claims: { target: "", problem: "", usp: "", pain: "", ease: "", copy: "" }
      });
      alert("✅ 新しい製品をデータベースに追加し、画面と完全同期しました！");
    } catch (err: any) {
      alert(`⚠️ 追加失敗: ${err.message}`);
    } finally {
      setIsSubmittingNewProduct(false);
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

  const renderStars = (score: number) => {
    const filled = Math.max(0, Math.min(5, Math.floor(score)));
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  };

  const parseReviewDate = (dateStr: string) => {
    if (!dateStr) return null;
    let match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (match) return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    match = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (match) return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    return null;
  };

  const { baseReviews, reviewSummary } = React.useMemo(() => {
    if (!editedProduct || !editedProduct.rawReviews) return { baseReviews: [], reviewSummary: null };
    try {
      const parsed = JSON.parse(editedProduct.rawReviews);
      const summary = {
        Amazon: { count: 0, totalScore: 0, validCount: 0 },
        Rakuten: { count: 0, totalScore: 0, validCount: 0 }
      };

      const processed = parsed.map((rev: any) => {
        let p = rev.platform || "";
        if (p.toLowerCase().includes("amazon") || (rev.date && rev.date.includes("日本でレビュー済み"))) {
          p = "Amazon";
        } else if (p.includes("楽天") || p.toLowerCase().includes("rakuten")) {
          p = "楽天市場";
        } else {
          p = "Amazon";
        }

        const scoreMatch = String(rev.rating).match(/([0-9.]+)/);
        const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
        const parsedDate = parseReviewDate(rev.date);

        if (p === "Amazon") {
          summary.Amazon.count++;
          if (score > 0) { summary.Amazon.totalScore += score; summary.Amazon.validCount++; }
        } else if (p === "楽天市場") {
          summary.Rakuten.count++;
          if (score > 0) { summary.Rakuten.totalScore += score; summary.Rakuten.validCount++; }
        }

        return { ...rev, displayPlatform: p, score, parsedDate };
      });

      return { baseReviews: processed, reviewSummary: summary };
    } catch (e) {
      return { baseReviews: [], reviewSummary: null };
    }
  }, [editedProduct]);

  const filteredAndSortedReviews = React.useMemo(() => {
    let result = [...baseReviews];
    if (filterPlatform !== 'ALL') result = result.filter(r => r.displayPlatform === filterPlatform);
    if (filterRating !== 'ALL') result = result.filter(r => Math.floor(r.score) === parseInt(filterRating));
    if (filterPeriod !== 'ALL') {
      const cutoff = new Date(new Date().getTime() - (parseInt(filterPeriod) * 24 * 60 * 60 * 1000));
      result = result.filter(r => r.parsedDate && r.parsedDate >= cutoff);
    }
    result.sort((a, b) => {
      const timeA = a.parsedDate?.getTime() || 0; const timeB = b.parsedDate?.getTime() || 0;
      if (sortOrder === 'DATE_DESC') return timeB - timeA; if (sortOrder === 'DATE_ASC') return timeA - timeB;
      if (sortOrder === 'RATING_DESC') return b.score - a.score; if (sortOrder === 'RATING_ASC') return a.score - b.score;
      return 0;
    });
    return result;
  }, [baseReviews, filterPlatform, filterPeriod, filterRating, sortOrder]);


  return (
    <div className="min-h-screen bg-mkt-bg text-mkt-text-main p-4 md:p-8 font-sans relative">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-mkt-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider flex items-center gap-3">
            <span className="text-mkt-makoto">MKT</span><span>競合分析画面</span>
          </h1>
          <p className="text-mkt-asagi text-xs md:text-sm mt-2 tracking-widest flex items-center gap-2 font-bold">
            競合製品の市場評価 and 方針の比較
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {/* 👑 追加：新規競合製品を追加するための無駄のないボタン */}
          <button onClick={() => setIsAddingProduct(true)} className="bg-mkt-surface border-2 border-mkt-asagi text-mkt-asagi hover:bg-mkt-asagi hover:text-white font-black py-2 px-4 rounded shadow-sm flex items-center gap-2 text-sm transition-colors">
            競合製品を追加
          </button>
          <div className="flex bg-slate-200/50 p-1 rounded-lg">
            <button onClick={() => handleSetViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-mkt-makoto' : 'text-slate-500 hover:text-mkt-makoto'}`} title="カード表示"><LayoutGrid size={20} /></button>
            <button onClick={() => handleSetViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-mkt-makoto' : 'text-slate-500 hover:text-mkt-makoto'}`} title="リスト表示"><List size={20} /></button>
          </div>
          <div className="hidden md:flex bg-mkt-surface border border-mkt-border px-4 py-2 rounded items-center gap-2 font-bold shadow-sm">
            <Activity size={16} className="text-green-500" /> AI 連携完了
          </div>
        </div>
      </header>

      {selectedForPlan.length >= 2 && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button onClick={() => { if (isGeneratingPlan) return; setPendingPlan(true); }} disabled={isGeneratingPlan} style={{ color: '#FFFFFF' }} className="bg-mkt-asagi hover:opacity-90 font-bold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed border-4 border-mkt-makoto text-sm md:text-base">
            {isGeneratingPlan ? <Loader2 size={24} className="animate-spin text-white" /> : <FileText size={24} className="text-white" />}
            {isGeneratingPlan ? "作成中..." : `${selectedForPlan.length}製品で企画案を作成`}
          </button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((item, index) => {
            const isSelected = selectedForPlan.some(p => p.id === item.id);
            const noteCount = getNotesCount(item.rawHumint); 
            
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
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black bg-slate-200 text-slate-800 border border-slate-300 px-2 py-1 rounded tracking-widest shadow-sm">
                      {item.classification}
                    </span>
                    {noteCount > 0 && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-1 rounded font-black tracking-wider flex items-center gap-1">
                        📝 メモ {noteCount}件
                      </span>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-1 text-mkt-text-main">{item.brand}</h2>
                <h3 className="text-mkt-text-sub text-sm mb-5 h-10 font-medium line-clamp-2">{item.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] bg-mkt-asagi/10 text-mkt-asagi border border-mkt-asagi/30 px-2 py-1 rounded font-black tracking-wider">{item.tech}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded font-black tracking-wider">{item.waterproof}</span>
                </div>

                <div className="space-y-5 mb-6 flex-grow">
                  <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                    <span className="text-mkt-text-sub font-bold">実売価格</span>
                    <span className="font-black text-3xl text-mkt-text-main tracking-tight">¥{item.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-mkt-border pb-3">
                    <span className="text-mkt-text-sub font-bold text-xs">平均評価: <span className="text-yellow-500 text-sm">★ {item.averageRating || "-"}</span></span>
                    <span className="text-mkt-text-sub font-bold text-xs">レビュー: <span className="text-mkt-asagi text-sm">{item.reviews.toLocaleString()}</span> 件</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded mt-2 border border-slate-200">
                    <span className="text-xs text-mkt-asagi font-black mb-1 block tracking-wider">公式広告文案:</span>
                    <p className="text-sm font-bold italic text-mkt-text-main truncate">"{item.claims?.copy || '未設定'}"</p>
                  </div>
                </div>

                <button onClick={() => handleOpenDetail(item)} className="w-full bg-mkt-surface border-2 border-mkt-makoto text-mkt-makoto py-3 rounded hover:bg-mkt-makoto hover:text-white transition-colors font-black tracking-wider flex justify-center items-center gap-2 text-lg">
                  詳細確認 ＆ 分析
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-mkt-surface border border-mkt-border rounded-lg overflow-x-auto shadow-sm pb-4">
          <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-[1200px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b-2 border-slate-300 text-xs md:text-sm">
                <th className="p-2 md:p-4 font-black whitespace-nowrap text-center">選択</th>
                <th className="p-2 md:p-4 font-black whitespace-nowrap text-center">画像</th>
                <th className="p-2 md:p-4 font-black whitespace-nowrap">ブランド / 商品名</th>
                <th className="hidden lg:table-cell p-2 md:p-4 font-black whitespace-nowrap">公式広告文案</th>
                <th className="p-2 md:p-4 font-black whitespace-nowrap text-right">実売価格</th>
                <th className="p-2 md:p-4 font-black whitespace-nowrap text-center">平均評価</th>
                <th className="p-2 md:p-4 font-black whitespace-nowrap text-right">レビュー数</th>
                <th className="p-2 md:p-4 font-black whitespace-nowrap text-center">詳細 / 分析</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => {
                const isSelected = selectedForPlan.some(p => p.id === item.id);
                const noteCount = getNotesCount(item.rawHumint); 

                return (
                  <tr key={item.id || index} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-mkt-makoto/5' : ''}`}>
                    <td className="p-2 md:p-4 text-center align-middle">
                      <button onClick={() => togglePlanSelection(item)} className="transition-colors mt-1">
                        {isSelected ? <CheckSquare className="text-mkt-makoto bg-white rounded w-5 h-5" /> : <Square className="text-slate-300 hover:text-mkt-makoto bg-white rounded w-5 h-5" />}
                      </button>
                    </td>
                    <td className="p-2 md:p-4 align-middle">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden mx-auto">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full p-1 mix-blend-multiply" /> : <ImageIcon className="text-slate-300 w-5 h-5" />}
                      </div>
                    </td>
                    <td className="p-2 md:p-4 align-middle">
                      <div className="font-black text-mkt-text-main text-sm mb-1">{item.brand}</div>
                      <div className="text-xs font-bold text-mkt-text-sub line-clamp-2">{item.name}</div>
                      {noteCount > 0 && (
                        <div className="mt-1 inline-block">
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 border border-yellow-300 px-1.5 py-0.5 rounded font-black tracking-wider flex items-center gap-1">
                            📝 メモ {noteCount}件
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="hidden lg:table-cell p-2 md:p-4 align-middle">
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <p className="text-xs font-bold italic text-mkt-text-main line-clamp-2">"{item.claims?.copy || '未設定'}"</p>
                      </div>
                    </td>
                    <td className="p-2 md:p-4 text-right align-middle font-black text-lg text-mkt-text-main">
                      ¥{item.price.toLocaleString()}
                    </td>
                    <td className="p-2 md:p-4 text-center align-middle font-black text-yellow-500 text-lg">
                      ★ {item.averageRating || "-"}
                    </td>
                    <td className="p-2 md:p-4 text-right align-middle font-black text-mkt-asagi text-sm">
                      {item.reviews.toLocaleString()} <span className="text-[10px]">件</span>
                    </td>
                    <td className="p-2 md:p-4 text-center align-middle">
                      <button onClick={() => handleOpenDetail(item)} className="w-full bg-mkt-surface border-2 border-mkt-makoto text-mkt-makoto py-2 px-3 rounded hover:bg-mkt-makoto hover:text-white transition-colors font-black text-xs md:text-sm whitespace-nowrap shadow-sm">
                        詳細 ＆ 分析
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 分析モデル選択ダイアログ */}
      {(pendingProduct || pendingPlan) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl border border-mkt-border">
            <div className="bg-mkt-surface p-6 flex justify-between items-center text-mkt-text-main border-b-4 border-mkt-makoto">
              <h3 className="text-xl font-black flex items-center gap-3 tracking-widest">分析方法の選択</h3>
              <button onClick={() => { setPendingProduct(null); setPendingPlan(false); }} className="text-slate-400 hover:text-mkt-makoto bg-slate-100 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 bg-slate-50">
              <p className="text-slate-600 font-bold mb-6 text-center">目的に合わせてAIモデルを選択してください。</p>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => executeAnalysis('gemini-3.5-flash')} className="bg-white border-2 border-slate-200 p-5 rounded-lg hover:border-mkt-asagi hover:bg-blue-50/30 transition-all text-left group flex items-start gap-4"><div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Zap size={24} /></div><div><h4 className="font-black text-lg text-slate-800 mb-1">速度優先モデル</h4><p className="text-sm text-slate-500 font-bold">素早く状況を確認したい場合。</p></div></button>
                <button onClick={() => executeAnalysis('gemini-2.5-pro')} className="bg-white border-2 border-slate-200 p-5 rounded-lg hover:border-mkt-makoto hover:bg-red-50/30 transition-all text-left group flex items-start gap-4"><div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors"><Target size={24} /></div><div><h4 className="font-black text-lg text-slate-800 mb-1">精度優先モデル</h4><p className="text-sm text-slate-500 font-bold">時間をかけてより正確な分析を行いたい場合。</p></div></button>
                <button onClick={() => executeAnalysis('gemini-3.1-pro-preview')} className="bg-white border-2 border-slate-200 p-5 rounded-lg hover:border-purple-500 hover:bg-purple-50/30 transition-all text-left group flex items-start gap-4"><div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Cpu size={24} /></div><div><h4 className="font-black text-lg text-slate-800 mb-1">推論優先モデル</h4><p className="text-sm text-slate-500 font-bold">複雑な論理展開や深い分析が必要な場合。</p></div></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 個別製品の詳細編集 ＆ 分析モーダル */}
      {selectedProduct && editedProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-mkt-surface border border-mkt-border rounded-xl w-full max-w-[95vw] h-[95vh] flex flex-col relative overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-mkt-text-sub hover:text-mkt-makoto transition-colors z-20 bg-slate-100 hover:bg-slate-200 p-2 rounded-full shadow-sm"><X size={28} /></button>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              
              {/* 左ペイン：製品情報の完全編集 ＆ 追加情報メモ */}
              <div className="p-6 lg:w-1/2 border-r border-mkt-border bg-slate-50 overflow-y-auto relative flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-mkt-text-main flex items-center gap-2">
                    <FileText className="text-mkt-asagi" /> 製品データの確認・編集
                  </h3>
                  <button onClick={handleUpdateProduct} disabled={isUpdatingProduct} className="bg-mkt-surface border-2 border-mkt-asagi text-mkt-asagi hover:bg-mkt-asagi hover:text-white font-black py-2 px-4 rounded shadow-sm flex items-center gap-2 text-sm transition-colors disabled:opacity-50">
                    {isUpdatingProduct && <Loader2 size={16} className="animate-spin" />}
                    製品データを更新
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 mb-4">基本情報</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelClass}>ブランド名</label><input type="text" className={inputClass} value={editedProduct.brand} onChange={e => setEditedProduct({...editedProduct, brand: e.target.value})} /></div>
                      <div><label className={labelClass}>製品分類</label><input type="text" className={inputClass} value={editedProduct.classification} onChange={e => setEditedProduct({...editedProduct, classification: e.target.value})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>商品名</label><input type="text" className={inputClass} value={editedProduct.name} onChange={e => setEditedProduct({...editedProduct, name: e.target.value})} /></div>
                      <div><label className={labelClass}>実売価格 (円)</label><input type="number" className={inputClass} value={editedProduct.price} onChange={e => setEditedProduct({...editedProduct, price: Number(e.target.value)})} /></div>
                      <div><label className={labelClass}>画像URL</label><input type="text" className={inputClass} value={editedProduct.imageUrl} onChange={e => setEditedProduct({...editedProduct, imageUrl: e.target.value})} /></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 mb-4">ハードウェア仕様</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelClass}>搭載テクノロジー</label><input type="text" className={inputClass} value={editedProduct.tech} onChange={e => setEditedProduct({...editedProduct, tech: e.target.value})} /></div>
                      <div><label className={labelClass}>防水規格</label><input type="text" className={inputClass} value={editedProduct.waterproof} onChange={e => setEditedProduct({...editedProduct, waterproof: e.target.value})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>ピン仕様</label><textarea className={`${inputClass} resize-none`} rows={2} value={editedProduct.pins} onChange={e => setEditedProduct({...editedProduct, pins: e.target.value})} /></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 mb-4">公式の訴求内容</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><label className={labelClass}>対象顧客</label><input type="text" className={inputClass} value={editedProduct.claims?.target} onChange={e => setEditedProduct({...editedProduct, claims: {...editedProduct.claims!, target: e.target.value}})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>訴求事項</label><textarea className={`${inputClass} resize-none`} rows={3} value={editedProduct.claims?.problem} onChange={e => setEditedProduct({...editedProduct, claims: {...editedProduct.claims!, problem: e.target.value}})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>最大の強み</label><textarea className={`${inputClass} resize-none`} rows={3} value={editedProduct.claims?.usp} onChange={e => setEditedProduct({...editedProduct, claims: {...editedProduct.claims!, usp: e.target.value}})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>痛みのなさ</label><textarea className={`${inputClass} resize-none`} rows={3} value={editedProduct.claims?.pain} onChange={e => setEditedProduct({...editedProduct, claims: {...editedProduct.claims!, pain: e.target.value}})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>手軽さ</label><textarea className={`${inputClass} resize-none`} rows={3} value={editedProduct.claims?.ease} onChange={e => setEditedProduct({...editedProduct, claims: {...editedProduct.claims!, ease: e.target.value}})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>公式広告文案</label><textarea className={`${inputClass} resize-none`} rows={3} value={editedProduct.claims?.copy} onChange={e => setEditedProduct({...editedProduct, claims: {...editedProduct.claims!, copy: e.target.value}})} /></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 mb-4 p-5 bg-white border-l-4 border-mkt-makoto border-y border-r border-slate-200 rounded shadow-sm">
                  <h4 className="text-sm text-mkt-makoto font-black tracking-widest mb-3 flex items-center gap-2">
                    追加情報・メモ
                  </h4>
                  
                  {localNotes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic mb-4 font-bold">現在、この製品に関する追加情報は登録されていません。</p>
                  ) : (
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                      {localNotes.map((n, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs shadow-sm relative group">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-2 text-[10px] font-black text-slate-500 pr-8">
                            <span>{n.author} [{n.category}]</span>
                            <span>{n.date}</span>
                          </div>
                          <p className="font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">{n.note}</p>
                          <button 
                            onClick={() => handleDeleteNote(i)}
                            disabled={isDeletingNote}
                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                            title="このメモを削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-4 mt-2">
                    <span className="text-[10px] text-mkt-asagi font-black block mb-2 tracking-wider">新しい情報を追記する</span>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="投稿者 (例: 渡辺)" value={noteAuthor} onChange={(e) => setNoteAuthor(e.target.value)} className={inputClass} />
                      <select value={noteCategory} onChange={(e) => setNoteCategory(e.target.value)} className={`${inputClass} cursor-pointer`}>
                        <option value="商談・メーカー情報">商談・メーカー情報</option>
                        <option value="市場・競合調査">市場・競合調査</option>
                        <option value="製造・スペック裏話">製造・スペック裏話</option>
                        <option value="その他重要情報">その他重要情報</option>
                      </select>
                    </div>
                    <textarea placeholder="商談で得た裏話や未公開情報などを入力..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} className={`${inputClass} resize-none mb-3`} />
                    <button onClick={handleSaveNote} disabled={isSavingNote} className="w-full bg-mkt-surface border-2 border-mkt-makoto text-mkt-makoto hover:bg-mkt-makoto hover:text-white font-black py-2.5 rounded text-sm transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-50">
                      {isSavingNote ? <Loader2 size={16} className="animate-spin" /> : "追加情報・メモを保存"}
                    </button>
                  </div>
                </div>
              </div>

              {/* 右ペイン：AI統合分析 ＆ レビュー統計 */}
              <div className="p-6 lg:w-1/2 flex flex-col bg-mkt-surface overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-mkt-border pb-4 pr-12">
                  <h4 className="font-bold tracking-widest text-mkt-text-main flex items-center gap-3 text-xl">
                    <Crosshair className="text-mkt-makoto" /> AI統合分析 ＆ 顧客評価
                  </h4>
                  
                  {!isAnalyzing && !analyzedData && (
                    <button onClick={() => setPendingProduct(editedProduct)} className="bg-mkt-surface border-2 border-mkt-makoto text-mkt-makoto hover:bg-mkt-makoto hover:text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 text-sm transition-colors animate-pulse hover:animate-none">
                      AI分析を実行する
                    </button>
                  )}
                  {analyzedData && (
                    <button onClick={() => setPendingProduct(editedProduct)} className="bg-mkt-surface border-2 border-mkt-makoto text-mkt-makoto hover:bg-mkt-makoto hover:text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 text-xs transition-colors">
                      最新の情報で再分析
                    </button>
                  )}
                </div>
                
                {isAnalyzing ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-mkt-makoto border-2 border-dashed border-mkt-makoto/20 rounded-lg m-4">
                    <Loader2 className="animate-spin mb-6" size={64} />
                    <p className="tracking-widest font-bold text-lg animate-pulse">分析処理を実行中...</p>
                    <p className="text-xs font-bold text-mkt-text-sub mt-4">編集された製品情報と追加情報をコンテキストに統合しています</p>
                  </div>
                ) : errorMsg ? (
                  <div className="flex-grow flex items-center justify-center text-mkt-makoto font-bold border border-mkt-makoto/50 p-4 rounded bg-mkt-makoto/5 m-4">{errorMsg}</div>
                ) : !analyzedData ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-lg m-4 p-8 text-center">
                    <h3 className="text-lg font-black text-slate-600 mb-2">分析準備OK</h3>
                    <p className="text-sm font-bold leading-relaxed">左側のパネルで製品情報の確認・編集、および追加情報の入力を行ってください。<br/>準備が完了したら、右上の「AI分析を実行する']ボタンを押して分析を開始します。</p>
                  </div>
                ) : (
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
                )}

                {/* 顧客評価一覧 */}
                {!isAnalyzing && !errorMsg && reviewSummary && baseReviews.length > 0 && (
                  <div className="mt-12 pt-8 border-t-4 border-slate-100 animate-in fade-in duration-500">
                    <h4 className="font-bold tracking-widest text-mkt-text-main flex items-center gap-3 text-xl mb-6">
                      <BarChart3 className="text-mkt-asagi" /> プラットフォーム別 評価統計
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-800 p-5 rounded-lg flex justify-between items-center shadow-md border border-slate-700" style={{ color: '#FFFFFF' }}>
                        <div className="flex items-center gap-3">
                          <ShoppingCart size={24} style={{ color: '#CBD5E1' }} />
                          <span className="font-black tracking-widest text-lg" style={{ color: '#FFFFFF' }}>Amazon</span>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black mb-1" style={{ color: '#FFFFFF' }}>
                            {reviewSummary.Amazon.count.toLocaleString()} <span className="text-sm font-bold" style={{ color: '#CBD5E1' }}>件</span>
                          </div>
                          <div className="font-bold" style={{ color: '#FACC15' }}>
                            平均 ★ {reviewSummary.Amazon.validCount > 0 ? (reviewSummary.Amazon.totalScore / reviewSummary.Amazon.validCount).toFixed(1) : "-"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#BF0000] p-5 rounded-lg flex justify-between items-center shadow-md border border-[#990000]" style={{ color: '#FFFFFF' }}>
                        <div className="flex items-center gap-3">
                          <ShoppingCart size={24} style={{ color: '#FECACA' }} />
                          <span className="font-black tracking-widest text-lg" style={{ color: '#FFFFFF' }}>楽天市場</span>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black mb-1" style={{ color: '#FFFFFF' }}>
                            {reviewSummary.Rakuten.count.toLocaleString()} <span className="text-sm font-bold" style={{ color: '#FECACA' }}>件</span>
                          </div>
                          <div className="font-bold" style={{ color: '#FDE047' }}>
                            平均 ★ {reviewSummary.Rakuten.validCount > 0 ? (reviewSummary.Rakuten.totalScore / reviewSummary.Rakuten.validCount).toFixed(1) : "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-bold tracking-widest text-mkt-text-main flex items-center gap-3 text-xl mb-6">
                      <MessageCircle className="text-mkt-asagi" /> 顧客評価一覧（生データ）
                    </h4>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-6 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shadow-sm">
                      <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-md">
                        <button onClick={() => { setFilterPlatform('ALL'); setVisibleReviewCount(50); }} className={`px-4 py-1.5 rounded text-sm font-black transition-all ${filterPlatform === 'ALL' ? 'bg-white shadow border border-slate-300' : 'hover:bg-slate-300/50'}`} style={filterPlatform === 'ALL' ? { color: '#0F172A' } : { color: '#475569' }}>全体</button>
                        <button onClick={() => { setFilterPlatform('Amazon'); setVisibleReviewCount(50); }} className={`px-4 py-1.5 rounded text-sm font-black transition-all ${filterPlatform === 'Amazon' ? 'bg-slate-800 shadow' : 'hover:bg-slate-300/50'}`} style={filterPlatform === 'Amazon' ? { color: '#FFFFFF' } : { color: '#475569' }}>Amazon</button>
                        <button onClick={() => { setFilterPlatform('楽天市場'); setVisibleReviewCount(50); }} className={`px-4 py-1.5 rounded text-sm font-black transition-all ${filterPlatform === '楽天市場' ? 'bg-[#BF0000] shadow' : 'hover:bg-slate-300/50'}`} style={filterPlatform === '楽天市場' ? { color: '#FFFFFF' } : { color: '#475569' }}>楽天市場</button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="flex flex-1 xl:flex-none items-center gap-2 bg-white border border-slate-300 rounded-md px-3 py-2 shadow-sm focus-within:border-mkt-asagi transition-colors">
                          <Star size={16} className="text-slate-400 flex-shrink-0" />
                          <select value={filterRating} onChange={(e) => { setFilterRating(e.target.value); setVisibleReviewCount(50); }} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
                            <option value="ALL">すべての評価</option><option value="5">★★★★★ のみ</option><option value="4">★★★★☆ のみ</option><option value="3">★★★☆☆ のみ</option><option value="2">★★☆☆☆ のみ</option><option value="1">★☆☆☆☆ のみ</option>
                          </select>
                        </div>
                        <div className="flex flex-1 xl:flex-none items-center gap-2 bg-white border border-slate-300 rounded-md px-3 py-2 shadow-sm focus-within:border-mkt-asagi transition-colors">
                          <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                          <select value={filterPeriod} onChange={(e) => { setFilterPeriod(e.target.value); setVisibleReviewCount(50); }} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
                            <option value="ALL">全期間</option><option value="30">直近30日</option><option value="90">直近90日</option><option value="365">直近1年</option>
                          </select>
                        </div>
                        <div className="flex flex-1 xl:flex-none items-center gap-2 bg-white border border-slate-300 rounded-md px-3 py-2 shadow-sm focus-within:border-mkt-asagi transition-colors">
                          <ArrowUpDown size={16} className="text-slate-400 flex-shrink-0" />
                          <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setVisibleReviewCount(50); }} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
                            <option value="DATE_DESC">新着順</option><option value="DATE_ASC">古い順</option><option value="RATING_DESC">高評価順</option><option value="RATING_ASC">低評価順</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {filteredAndSortedReviews.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-10 text-center text-slate-500 font-bold">該当するレビューが見つかりません。</div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAndSortedReviews.slice(0, visibleReviewCount).map((rev: any, idx: number) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-mkt-asagi/30 transition-colors">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-4">
                                <span className={`text-xs font-black px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm ${rev.displayPlatform === 'Amazon' ? 'bg-slate-800' : rev.displayPlatform === '楽天市場' ? 'bg-[#BF0000]' : 'bg-slate-500'}`} style={{ color: '#FFFFFF' }}>
                                  <ShoppingCart size={14} />{rev.displayPlatform}
                                </span>
                                <span className="text-yellow-500 font-black tracking-widest text-lg">{renderStars(rev.score)}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-400">{rev.date}</span>
                            </div>
                            <h5 className="font-bold text-slate-800 mb-2 text-lg">{rev.title}</h5>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{rev.body}</p>
                            {rev.attributes && rev.attributes !== "属性不明" && rev.attributes !== "属性なし" && (
                              <p className="text-[10px] text-slate-400 font-bold mt-4 pt-2 border-t border-slate-50">{rev.attributes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredAndSortedReviews.length > visibleReviewCount && (
                      <button onClick={() => setVisibleReviewCount(prev => prev + 50)} className="w-full mt-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded transition-colors border border-slate-300 tracking-widest shadow-sm">
                        さらに読み込む（全 {filteredAndSortedReviews.length} 件中 {visibleReviewCount} 件を表示中）
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👑 新設：競合製品の手動登録モーダル（拡張フォーム版） */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-mkt-surface border border-mkt-border rounded-xl w-full max-w-[95vw] h-[95vh] flex flex-col relative overflow-hidden shadow-2xl">
            <button onClick={() => setIsAddingProduct(false)} className="absolute top-4 right-4 text-mkt-text-sub hover:text-mkt-makoto transition-colors z-20 bg-slate-100 hover:bg-slate-200 p-2 rounded-full shadow-sm"><X size={28} /></button>
            
            <div className="p-6 border-b border-mkt-border bg-white flex justify-between items-center">
              <h3 className="text-xl font-black text-mkt-text-main flex items-center gap-2">
                <FileText className="text-mkt-asagi" /> 新規競合製品の登録
              </h3>
              <button onClick={handleAddProductSubmit} disabled={isSubmittingNewProduct} className="bg-mkt-surface border-2 border-mkt-asagi text-mkt-asagi hover:bg-mkt-asagi hover:text-white font-black py-2 px-4 rounded shadow-sm flex items-center gap-2 text-sm transition-colors disabled:opacity-50">
                {isSubmittingNewProduct && <Loader2 size={16} className="animate-spin" />}
                データベースに追加
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 bg-slate-50 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 左側：基本仕様フォーム */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 mb-4">基本スペック</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelClass}>MKT-ID (必須 / 重複不可)</label><input type="text" placeholder="例: DBB-006" className={inputClass} value={newProduct.id} onChange={e => setNewProduct({...newProduct, id: e.target.value})} /></div>
                      <div><label className={labelClass}>製品分類</label><input type="text" className={inputClass} value={newProduct.classification} onChange={e => setNewProduct({...newProduct, classification: e.target.value})} /></div>
                      <div><label className={labelClass}>ブランド名 (必須)</label><input type="text" placeholder="例: A社" className={inputClass} value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} /></div>
                      <div><label className={labelClass}>実売価格 (円)</label><input type="number" className={inputClass} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>商品名 (必須)</label><input type="text" placeholder="製品の正式名称" className={inputClass} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>画像URL</label><input type="text" className={inputClass} value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} /></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 mb-4">ハードウェア仕様</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelClass}>搭載テクノロジー</label><input type="text" placeholder="例: EMS / LED" className={inputClass} value={newProduct.tech} onChange={e => setNewProduct({...newProduct, tech: e.target.value})} /></div>
                      <div><label className={labelClass}>防水規格</label><input type="text" placeholder="例: IPX5" className={inputClass} value={newProduct.waterproof} onChange={e => setNewProduct({...newProduct, waterproof: e.target.value})} /></div>
                      <div className="md:col-span-2"><label className={labelClass}>ピン仕様</label><textarea className={`${inputClass} resize-none`} rows={2} placeholder="ピン本数や材質、柔軟性など" value={newProduct.pins} onChange={e => setNewProduct({...newProduct, pins: e.target.value})} /></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 mb-4">ECリンク情報</h4>
                    <div className="space-y-4">
                      <div><label className={labelClass}>Amazon URL</label><input type="text" className={inputClass} value={newProduct.amazonUrl} onChange={e => setNewProduct({...newProduct, amazonUrl: e.target.value})} /></div>
                      <div><label className={labelClass}>楽天市場 URL</label><input type="text" className={inputClass} value={newProduct.rakutenUrl} onChange={e => setNewProduct({...newProduct, rakutenUrl: e.target.value})} /></div>
                    </div>
                  </div>
                </div>

                {/* 右側：公式の訴求内容（拡張テキストエリア） */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 mb-4">公式の訴求内容</h4>
                    <div className="space-y-4">
                      <div><label className={labelClass}>対象顧客</label><input type="text" placeholder="例: 頭皮の硬さや顔のたるみが気になる30〜50代" className={inputClass} value={newProduct.claims?.target} onChange={e => setNewProduct({...newProduct, claims: {...newProduct.claims!, target: e.target.value}})} /></div>
                      <div><label className={labelClass}>訴求事項</label><textarea className={`${inputClass} resize-none`} rows={3} placeholder="どんな悩みを解決すると主張しているか" value={newProduct.claims?.problem} onChange={e => setNewProduct({...newProduct, claims: {...newProduct.claims!, problem: e.target.value}})} /></div>
                      <div><label className={labelClass}>最大の強み(USP)</label><textarea className={`${inputClass} resize-none`} rows={3} placeholder="他社に対する圧倒的優位点" value={newProduct.claims?.usp} onChange={e => setNewProduct({...newProduct, claims: {...newProduct.claims!, usp: e.target.value}})} /></div>
                      <div><label className={labelClass}>痛みのなさ</label><textarea className={`${inputClass} resize-none`} rows={3} placeholder="刺激レベルや痛みの少なさに関する訴求" value={newProduct.claims?.pain} onChange={e => setNewProduct({...newProduct, claims: {...newProduct.claims!, pain: e.target.value}})} /></div>
                      <div><label className={labelClass}>手軽さ</label><textarea className={`${inputClass} resize-none`} rows={3} placeholder="お風呂での使用、コードレス、操作性など" value={newProduct.claims?.ease} onChange={e => setNewProduct({...newProduct, claims: {...newProduct.claims!, ease: e.target.value}})} /></div>
                      <div><label className={labelClass}>公式広告文案</label><textarea className={`${inputClass} resize-none`} rows={3} placeholder="実際のLPや広告で使われているメインのコピー文案" value={newProduct.claims?.copy} onChange={e => setNewProduct({...newProduct, claims: {...newProduct.claims!, copy: e.target.value}})} /></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}