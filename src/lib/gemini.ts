import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeReviewSentiment(reviewsText: string, claims: any, averageRating: string, modelName: string = "gemini-3.6-flash") {
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEYが設定されていません。");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName, 
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, 
      },
    });

    const safeClaims = claims || {};

    // 💥 修正の核心：「電気バリブラシ市場への新規参入」という絶対コンテキストを固定！脱毛器の記憶を封印！
    const prompt = `
    あなたはエムロックグループ（Mrock / Arrow8）に所属する、プロのマーケター兼インサイトアナリストです。
    現在我々は、大ヒットブランド「ケノン」から【完全新規の電気バリブラシ（EMSリフトブラシ・頭皮/顔用美顔器）】をリリースする極秘プロジェクトを進めています。
    （※厳重注意：ケノンは脱毛器として有名ですが、本プロジェクトは脱毛器ではありません。「電気バリブラシ市場」の分析です。脱毛に関する言及や解釈は一切禁止します。）

    以下の【入力データ】はすべて「電気バリブラシ市場における競合他社製品」に関する情報（公式訴求、市場評価、顧客レビュー、現場入手メモ）です。
    絶対に、この情報を「自社（ケノン）」の状況として混同してはなりません。

    # 指令：競合インテリジェンス分析
    【分析の鉄則】
    1. 競合の弱点やトラブル（生産停止など）が、我々がこれからリリースする「ケノンブランドの新型電気バリブラシ」にとって、どのように有利に働くかを分析せよ。
    2. 競合のピンチや顧客の不満に乗じて、我々が新規参入時に取るべき「市場シェア奪取戦略（広告訴求、SNS展開、キャンペーンなど）」を提案せよ。
    3. 自社の対策ではなく、あくまで「競合の隙をどう突くか」にフォーカスすること。

    【入力データ：ブランド公式の訴求内容】
    ・ターゲット層: ${safeClaims.target || "未設定"}
    ・訴求している悩み: ${safeClaims.problem || "未設定"}
    ・最大の強み(USP): ${safeClaims.usp || "未設定"}
    ・痛みのなさの主張: ${safeClaims.pain || "未設定"}
    ・手軽さの主張: ${safeClaims.ease || "未設定"}
    ・広告メインコピー: ${safeClaims.copy || "未設定"}

    【入力データ：市場の客観的評価】
    ・現在の平均星評価: ${averageRating}
    
    【入力データ：顧客レビュー詳細 ＆ 現場入手情報(HUMINT)】
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
          "theme": "痛みのなさ等の評価テーマ、または極秘情報のテーマ",
          "claim": "ブランド側が主張している内容、または表面上の状況",
          "reality": "レビューや極秘情報から判明した実際の顧客の声や裏事情",
          "assessment": "大絶賛 / 期待通り / やや乖離 / 大きく乖離 (この4つのいずれか)",
          "opportunity": "【新規参入戦略】この競合の事実を踏まえ、我々の新型電気バリブラシが取るべき具体的なマーケティング・広告戦略"
        }
      ]
    }
    
    【ルール】
    1. gapAnalysis はテーマ別に最低3つ、最大5つ抽出すること。現場入手情報（HUMINTメモ）が含まれている場合は、それを最優先のテーマとして扱うこと。
    2. opportunity（新規参入戦略）は、競合の弱点や状況を踏まえた「攻め」のアクションを提示すること。
    3. 返却するデータはJSON文字列のみとし、マークダウン記法（\`\`\`json など）は絶対に含めないでください。
    `;

    console.log(`[System Log] ${modelName} を使用して個別ギャップ分析を実行中...`);

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "").trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    
  } catch (error) {
    console.error("❌ ギャップ分析エラー:", error);
    return null;
  }
}

export async function generateProductPlan(products: any[], modelName: string = "gemini-3.6-flash") {
  if (!apiKey) return null;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName, 
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5, 
      },
    });

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

    // 💥 企画案プロンプトも「電気バリブラシ」として徹底的に固定化！
    const prompt = `
    あなたはエムロックグループ（Mrock / Arrow8）のマーケティングおよび新商品企画の責任者です。
    現在我々は、大ヒットブランド「ケノン」から【完全新規の電気バリブラシ（EMSリフトブラシ・頭皮/顔用美顔器）】をリリースする極秘プロジェクトを進めています。
    （※厳重注意：ケノンは脱毛器として有名ですが、今回は「電気バリブラシ市場」への新規参入企画です。脱毛に関する要素は絶対に含めないでください。）

    以下の競合製品（電気バリブラシ）のデータを比較分析し、ケノンブランドの圧倒的な信頼と技術力を活かして市場の覇権を握るための「新商品企画案」を作成してください。

    【比較対象の製品群】
    ${productsInfo}

    【必須JSONフォーマット】
    {
      "productPlan": {
        "conceptName": "新型電気バリブラシの基本コンセプト（簡潔で魅力的な名称）",
        "targetPrice": "推奨する実売価格帯（例: 39,800円〜44,800円）とその戦略的理由",
        "coreFeatures": [
          "競合優位性を確保するための必須機能要件1",
          "競合優位性を確保するための必須機能要件2",
          "競合優位性を確保するための必須機能要件3"
        ],
        "differentiation": "比較対象の弱点を踏まえた、我々の製品の明確な差別化ポイント",
        "mainCopy": "ターゲット顧客に向けた魅力的な広告メインコピー"
      }
    }
    
    【ルール】
    返却するデータはJSON文字列のみとし、マークダウン記法（\`\`\`json など）は絶対に含めないでください。
    `;

    console.log(`[System Log] ${modelName} を使用して新商品企画案の作成を実行中...`);

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "").trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

  } catch (error) {
    console.error("❌ 新商品企画作成エラー:", error);
    return null;
  }
}