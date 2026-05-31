// check-models.js
async function listModels() {
  // 👑 実行時のコマンドから .env.local の鍵を自動で受け取ります！
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY が見つかりません！.env.local を正しく読み込めているか確認してください。");
    return;
  }

  console.log("📡 Gemini司令部へ通信網を構築中...\n");

  try {
    // 👑 Node.js 22 の標準fetchを使ってREST APIへ直接アクセス！
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ エラーが発生しました:", data);
      return;
    }

    console.log("👑 === ヒロム様のAPIキーで利用可能なGeminiモデル一覧 === 👑\n");
    
    data.models.forEach(model => {
      // 司令官が必要とする「テキスト生成（generateContent）」に対応したモデルのみを抽出！
      if (model.supportedGenerationMethods.includes("generateContent")) {
        // 'models/' という接頭辞を削って、コードにコピペしやすいIDだけを表示します
        const cleanId = model.name.replace('models/', '');
        
        console.log(`📌 モデルID : ${cleanId}`);
        console.log(`   表示名   : ${model.displayName}`);
        console.log(`   詳細     : ${model.description}`);
        console.log("--------------------------------------------------");
      }
    });
    
    console.log("\n✅ 偵察完了！上記の中から最強の『モデルID』を選定してください！");
    
  } catch (error) {
    console.error("❌ 通信エラー:", error);
  }
}

listModels();