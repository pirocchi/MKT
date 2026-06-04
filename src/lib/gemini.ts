import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// 👑 個別製品のギャップ分析機能
export async function analyzeReviewSentiment(reviewsText: string, claims: any, averageRating: string) {
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEYが設定されていません。");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", // 👑 ヒロム様ご指定の神速エンジンで完全固定！
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // 客観的で論理的な分析を強制
      },
    });

    const safeClaims = claims || {};

    const prompt = `
    あなたはAmazonスポンサー広告の統合運用システム「SAGITTARIUS（SGT）」のデータ分析モジュールです。
    以下の「ブランド公式の訴求内容」と、実際の「顧客のレビュー（評価）」を比較分析してください。

    【ブランド公式の訴求内容】
    ・ターゲット層: ${safeClaims.target || "未設定"}
    ・訴求している悩み: ${safeClaims.problem || "未設定"}
    ・最大の強み(USP): ${safeClaims.usp || "未設定"}
    ・痛みのなさの主張: ${safeClaims.pain || "未設定"}
    ・手軽さの主張: ${safeClaims.ease || "未設定"}
    ・広告メインコピー: ${safeClaims.copy || "未設定"}

    【市場の客観的評価】
    ・現在の平均星評価: ${averageRating}
    
    【顧客レビュー詳細】
    ${reviewsText}

    【必須JSONフォーマット】
    {
      "sentiments": [
        { "name": "ポジティブ (高評価)", "value": 0, "color": "#4FBAD3" },
        { "name": "ニュートラル (中立)", "value": 0, "color": "#94A3B8" },
        { "name": "ネガティブ (低評価)", "value": 0, "color": "#CC0000" }
      ],
      "gapAnalysis": [
        {
          "theme": "痛みのなさ等の評価テーマ",
          "claim": "ブランド側が主張している内容",
          "reality": "レビューから判明した実際の顧客の声",
          "assessment": "大絶賛 / 期待通り / やや乖離 / 大きく乖離 (この4つのいずれか)",
          "opportunity": "このギャップを踏まえ、自社が取るべき具体的な戦略や広告訴求の方向性"
        }
      ]
    }
    
    【ルール】
    1. gapAnalysis は「痛みのなさ」「最大の強み（効果）」「手軽さ」などのテーマ別に、最低3つ、最大5つ抽出すること。
    2. opportunity（戦略的機会）は、競合の弱点を踏まえた具体的かつ実務的なアクションを提示すること。
    3. 返却するデータはJSON文字列のみとし、マークダウン記法（\`\`\`json など）は絶対に含めないでください。
    `;

    console.log("[SGT-Brain] 個別ギャップ分析を実行中...");

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // 💥 万が一のマークダウン装飾を除去し、確実にJSON部分のみを抽出する安全処理
    responseText = responseText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "").trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    
  } catch (error) {
    console.error("❌ ギャップ分析エラー:", error);
    return null;
  }
}

// 👑 複数製品を比較分析し、新商品の企画案を作成する機能（旧：創世モジュール）
export async function generateProductPlan(products: any[]) {
  if (!apiKey) return null;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash", // 👑 こちらも指定モデルで完全固定！
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5, // 企画のアイデア出しのため、適度な創造性を持たせる
      },
    });

    // 選択された製品データを文字列に変換
    const productsInfo = products.map((p, index) => `
      【比較対象${index + 1}】
      ■ブランド: ${p.brand}
      ■商品名: ${p.name}
      ■実売価格: ¥${p.price}
      ■搭載機能: ${p.tech}
      ■防水仕様: ${p.waterproof}
      ■ターゲット層: ${p.claims?.target || "-"}
      ■最大の強み(USP): ${p.claims?.usp || "-"}
      ■広告コピー: ${p.claims?.copy || "-"}
      ■平均評価: ${p.averageRating}
    `).join('\n\n');

    const prompt = `
    あなたは企業のマーケティングおよび商品企画の専門家です。
    以下の競合製品のデータを比較分析し、市場での優位性を確立するための新商品企画案を作成してください。

    【比較対象の製品群】
    ${productsInfo}

    【必須JSONフォーマット】
    {
      "productPlan": {
        "conceptName": "新商品の基本コンセプト（簡潔で魅力的な名称）",
        "targetPrice": "推奨する実売価格帯（例: 39,800円〜44,800円）とその戦略的理由",
        "coreFeatures": [
          "競合優位性を確保するための必須機能要件1",
          "競合優位性を確保するための必須機能要件2",
          "競合優位性を確保するための必須機能要件3"
        ],
        "differentiation": "比較対象の弱点を踏まえた、自社製品の明確な差別化ポイント",
        "mainCopy": "ターゲット顧客に向けた魅力的な広告メインコピー"
      }
    }
    
    【ルール】
    返却するデータはJSON文字列のみとし、マークダウン記法（\`\`\`json など）は絶対に含めないでください。
    `;

    console.log("[SGT-Brain] 新商品企画案の作成を実行中...");

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // 💥 万が一のマークダウン装飾を除去し、確実にJSON部分のみを抽出する安全処理
    responseText = responseText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "").trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

  } catch (error) {
    console.error("❌ 新商品企画作成エラー:", error);
    return null;
  }
}