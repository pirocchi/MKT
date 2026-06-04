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

// 👑 MKT-Genesis（創世モジュール）用の新関数！複数商品をクロス分析して最強企画書を作る！
export async function generateProductGenesis(products: any[]) {
  if (!apiKey) return null;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5, // 👑 企画のアイデア出しなので、少しだけ創造性（温度）を上げる！
      },
    });

    // 選択された製品データをGeminiが食べやすい文字列に圧縮！
    const productsInfo = products.map((p, index) => `
      【競合${index + 1}】
      ■ブランド: ${p.brand}
      ■商品名: ${p.name}
      ■価格: ¥${p.price}
      ■機能: ${p.tech}
      ■防水: ${p.waterproof}
      ■ターゲット: ${p.claims?.target || "-"}
      ■最大のウリ: ${p.claims?.usp || "-"}
      ■コピー: ${p.claims?.copy || "-"}
      ■平均評価: ${p.averageRating}
    `).join('\n\n');

    const prompt = `
    あなたは世界最強のマーケティング戦略家であり、商品企画の天才です。
    以下の競合製品データをクロス分析し、それらの弱点をすべて克服して市場を完全に制圧する【最強の新製品の企画書（Blueprint）】を錬成してください。

    【比較・統合する競合製品群】
    ${productsInfo}

    【必須JSONフォーマット】
    {
      "genesisBlueprint": {
        "conceptName": "新製品のコアコンセプト（キャッチーな一言で）",
        "targetPrice": "推奨する実売価格帯（例: 39,800円〜44,800円）とその戦略的理由",
        "coreFeatures": [
          "競合を凌駕するための必須機能1",
          "競合を凌駕するための必須機能2",
          "競合を凌駕するための必須機能3"
        ],
        "differentiation": "選んだ競合製品群の『弱点・盲点』を我々がどう突くのか（クロス分析結果）",
        "mainCopy": "消費者の心を撃ち抜く最強の広告メインコピー"
      }
    }
    
    ルール: 返却データは純粋なJSON文字列のみ。マークダウンは不要です。
    `;

    console.log("[SGT-Brain] MKT-Genesis 起動！クロス分析を実行中...");

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "").trim();

    return JSON.parse(responseText);

  } catch (error) {
    console.error("❌ MKT-Genesis エラー:", error);
    return null;
  }
}