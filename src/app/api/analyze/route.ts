import { NextResponse } from 'next/server';
import { analyzeReviewSentiment } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { reviewsText, claims, averageRating, model, humintNotes } = await request.json();

    if ((!reviewsText || reviewsText.trim() === "") && (!humintNotes || humintNotes.trim() === "")) {
      return NextResponse.json({ error: "分析対象のデータ（レビューまたは機密情報）がありません" }, { status: 400 });
    }

    // 👑 レビューテキストと独自の極秘情報（HUMINT）をマージしてGeminiに投入する最強のコンテキストを生成！
    let augmentedReviewsText = reviewsText || "[]";
    if (humintNotes && humintNotes.trim() !== "") {
      augmentedReviewsText = `
【最重要・機密情報（HUMINTメモ）】
以下はユーザーが直接現場や商談で入手した、公にされていない製品の独自の重要情報です。ネット上の公開レビューデータよりも最優先・最重要視して分析に組み込んでください：
${humintNotes}

【一般顧客レビューデータ（生データ）】
${reviewsText || "[]"}
      `;
    }

    // 強化したコンテキストをGeminiへ投下！！！
    const result = await analyzeReviewSentiment(augmentedReviewsText, claims, averageRating, model);

    if (!result) {
      return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route エラー:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}