import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// 👑 引数に「公式の理想（claims）」を追加！
export async function analyzeReviewSentiment(reviewsText: string, claims: any) {
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEYが設定されていません。");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", // 神速の最新鋭エンジン
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 👑 ギャップ分析（残酷なファクトチェック）用の最強プロンプト
    const prompt = `
    あなたは美容家電市場における最高峰のマーケティング戦略家です。
    以下の「ブランド公式の訴求（理想）」と、実際の「ユーザーレビュー（現実）」を比較分析し、
    指定されたJSONフォーマットのみを出力してください。

    【ブランド公式の訴求（理想）】
    ・ターゲット: ${claims.target}
    ・煽っている悩み: ${claims.problem}
    ・最大のウリ: ${claims.usp}
    ・痛みのなさの主張: ${claims.pain}
    ・手軽さの主張: ${claims.ease}
    ・メインコピー: ${claims.copy}

    【ユーザーレビュー（現実）】
    ${reviewsText}

    【必須JSONフォーマット】
    {
      "sentiments": [
        { "name": "ポジティブ (絶賛)", "value": 0, "color": "#4FBAD3" },
        { "name": "ニュートラル (普通)", "value": 0, "color": "#94A3B8" },
        { "name": "ネガティブ (不満)", "value": 0, "color": "#CC0000" }
      ],
      "gapAnalysis": [
        {
          "theme": "痛みのなさ",
          "claim": "ブランド側が主張している内容",
          "reality": "レビューから判明した残酷な現実",
          "assessment": "大絶賛 / 期待通り / やや乖離 / 大ハズシ (この4つのいずれか)",
          "opportunity": "このギャップを突いて、後発の我々がどう広告コピーや戦略で攻めるべきかの狙い目"
        }
      ]
    }
    
    【ルール】
    1. gapAnalysis は「痛みのなさ」「最大のウリ（効果）」「手軽さ」などのテーマ別に、最低3つ、最大5つ抽出すること。
    2. assessment（評価）は、理想と現実のズレが酷いほど「大ハズシ」とする。
    3. opportunity（狙い目）は、競合の弱点をどう突くか、戦略的かつ具体的なアクションを提示すること。
    4. 返却するデータはJSON文字列のみとし、マークダウン（\`\`\`json など）は絶対に含めないでください。
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
    
  } catch (error) {
    console.error("❌ Gemini API ギャップ分析エラー:", error);
    return null;
  }
}