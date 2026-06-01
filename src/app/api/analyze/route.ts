import { NextResponse } from 'next/server';
import { analyzeReviewSentiment } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    // 👑 フロントから reviewsText と claims の両方を受け取る！
    const { reviewsText, claims, averageRating } = await request.json();

    if (!reviewsText || reviewsText.trim() === "") {
      return NextResponse.json({ error: "レビューテキストがありません" }, { status: 400 });
    }

    // 両方のデータをGeminiに放り込む！
    const result = await analyzeReviewSentiment(reviewsText, claims, averageRating);

    if (!result) {
      return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route エラー:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}