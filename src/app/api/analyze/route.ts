import { NextResponse } from 'next/server';
import { analyzeReviewSentiment } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { reviewsText, claims, averageRating, model } = await request.json();

    if (!reviewsText || reviewsText.trim() === "") {
      return NextResponse.json({ error: "レビューテキストがありません" }, { status: 400 });
    }

    // モデル名を引数に追加してGeminiに渡す
    const result = await analyzeReviewSentiment(reviewsText, claims, averageRating, model);

    if (!result) {
      return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route エラー:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}