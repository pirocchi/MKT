import { NextResponse } from 'next/server';
import { analyzeReviewSentiment } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { reviewsText } = await request.json();

    if (!reviewsText || reviewsText.trim() === "") {
      return NextResponse.json(
        { error: "レビューテキストがありません" },
        { status: 400 }
      );
    }

    // gemini.tsのエンジンを呼び出す！
    const result = await analyzeReviewSentiment(reviewsText);

    if (!result) {
      return NextResponse.json(
        { error: "AI解析に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route エラー:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}