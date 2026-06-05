import { NextResponse } from 'next/server';
import { generateProductPlan } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { products, model } = await request.json();

    if (!products || products.length < 2) {
      return NextResponse.json({ error: "比較分析を行うため、2つ以上の製品を選択してください" }, { status: 400 });
    }

    // モデル名を引数に追加してGeminiに渡す
    const result = await generateProductPlan(products, model);

    if (!result) {
      return NextResponse.json({ error: "人工知能による商品企画の作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("商品企画通信処理にて問題が発生しました:", error);
    return NextResponse.json({ error: "サーバー内部で問題が発生しました" }, { status: 500 });
  }
}