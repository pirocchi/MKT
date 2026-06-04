import { NextResponse } from 'next/server';
import { generateProductGenesis } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!products || products.length < 2) {
      return NextResponse.json({ error: "比較するには2つ以上の製品を選択してください" }, { status: 400 });
    }

    const result = await generateProductGenesis(products);

    if (!result) {
      return NextResponse.json({ error: "AIによる商品企画の生成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Genesis API Route エラー:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}