import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// 👑 引数に averageRating を追加！
export async function analyzeReviewSentiment(reviewsText: string, claims: any, averageRating: string) {
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEYが設定されていません。");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", // 神速の最新鋭エンジン
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // 👑 追加：論理的でブレのない冷徹なファクト分析を強制！
      },
    });

    // 👑 空欄（undefined）によるシステムクラッシュを完全防御
    const safeClaims = claims || {};

    // 👑 ギャップ分析（残酷なファクトチェック）用の最強プロンプト
    const prompt = `
    あなたは世界最強のAmazonスポンサー広告・完全自律型統合運用システム「SAGITTARIUS（SGT）」の中枢推論エンジンです。
    以下の「ブランド公式の訴求（理想）」と、実際の「ユーザーレビュー（現実）」を比較分析してください。

    【ブランド公式の訴求（理想）】
    ・ターゲット: ${safeClaims.target || "未設定"}
    ・煽っている悩み: ${safeClaims.problem || "未設定"}
    ・最大のウリ: ${safeClaims.usp || "未設定"}
    ・痛みのなさの主張: ${safeClaims.pain || "未設定"}
    ・手軽さの主張: ${safeClaims.ease || "未設定"}
    ・メインコピー: ${safeClaims.copy || "未設定"}

    【市場の現実（レーダー情報）】
    ・現在の平均星評価: ${averageRating}  // 👑 AIに現実の星の数を叩きつける！
    
    【ユーザーレビュー詳細】
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
    3. opportunity（狙い目）は、競合の弱点をどう突くか、SGTの広告戦略として具体的かつ攻撃的なアクションを提示すること。
    4. 返却するデータはJSON文字列のみとし、マークダウン（\`\`\`json など）は絶対に含めないでください。
    `;

    console.log("[SGT-Brain] Gemini 3.5 Flash 起動！超解理解析を開始します...");

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // 💥【一撃必殺】万が一GeminiがMarkdownの装飾（```json）を付けてきても、物理的に粉砕して純粋なJSONにする安全装置！
    responseText = responseText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "").trim();

    return JSON.parse(responseText);
    
  } catch (error) {
    console.error("❌ Gemini API ギャップ分析エラー:", error);
    return null;
  }
}