import { GoogleGenerativeAI } from "@google/generative-ai";

// 👑 環境変数からAPIキーを取得
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeReviewSentiment(reviewsText: string) {
  // APIキーがない場合の安全装置（ローカルテスト用）
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEYが設定されていません。");
    return null;
  }

  try {
    // 👑 神速・正確無比なレスポンスを誇る最新モデルを指定！
    // ※JSON形式での強制出力をサポートしています。
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", // 👑 2026年最新鋭・神速モデルへ換装！
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 👑 AIへ突きつける、ファクト抽出のための絶対命令（プロンプト）
    const prompt = `
    あなたは競合製品のレビューを分析する最高峰のマーケティングアナリストです。
    以下の生のレビューデータを分析し、感情の割合と主要なインサイトを抽出し、指定されたJSONフォーマットのみを出力してください。

    【レビューデータ】
    ${reviewsText}

    【必須JSONフォーマット】
    {
      "sentiments": [
        { "name": "ポジティブ (絶賛)", "value": 0, "color": "#4FBAD3" },
        { "name": "ニュートラル (普通)", "value": 0, "color": "#94A3B8" },
        { "name": "ネガティブ (不満)", "value": 0, "color": "#CC0000" }
      ],
      "strengths": ["インサイト1", "インサイト2", "インサイト3"],
      "weaknesses": ["インサイト1", "インサイト2", "インサイト3"]
    }
    
    【ルール】
    1. sentimentsのvalue（パーセンテージ）の合計は必ず100になるように計算してください。
    2. strengths（強み）とweaknesses（弱み）は、レビューから読み取れる具体的な内容を簡潔に3つずつ挙げてください。
    3. 返却するデータはJSON文字列のみとし、マークダウン（\`\`\`json など）は絶対に含めないでください。
    `;

    // AIエンジン着火！
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // AIから返ってきたJSON文字列を、システムで使えるデータオブジェクトに変換
    return JSON.parse(responseText);
    
  } catch (error) {
    console.error("❌ Gemini API 感情分析エラー:", error);
    return null;
  }
}