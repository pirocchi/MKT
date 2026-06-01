import { google } from "googleapis";

export async function getCompetitorData() {
  try {
    // 👑 秘密鍵の改行コード（\n）を正しく認識させるVercel対応の必須処理！
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // 👑 変更箇所1：シート名を「MKT_DB」に変更し、今後のデータ増を見越してR50まで範囲を拡大！
    const range = "MKT_DB!A2:R50"; 

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // 👑 変更箇所2：マッピングの完全刷新！
    return rows.map((row) => ({
      id: row[0] || "-",                   // A列: MKT-ID
      classification: row[1] || "-",       // B列: 製品カテゴリ
      brand: row[2] || "-",                // C列: ブランド名
      name: row[3] || "-",                 // D列: 商品名
      price: Number(row[4]?.replace(/[^0-9]/g, "")) || 0, // E列: 価格
      tech: row[5] || "-",                 // F列: 搭載テクノロジー
      waterproof: row[6] || "-",           // G列: 防水規格
      pins: row[7] || "-",                 // H列: ピン仕様
      reviews: Number(row[8]?.replace(/[^0-9]/g, "")) || 0, // I列: レビュー総数
      
      // 👑 ギャップ分析用データ（ブランド側の理想）を J列〜O列 から吸い上げ！
      claims: {
        target: row[9] || "-",      // J列: 公式設定ターゲット
        problem: row[10] || "-",    // K列: 公式が煽る『悩み』
        usp: row[11] || "-",        // L列: 公式の最大のウリ
        pain: row[12] || "-",       // M列: 公式が主張する『痛みのなさ』
        ease: row[13] || "-",       // N列: 公式が主張する『手軽さ』
        copy: row[14] || "-"        // O列: 広告上のメインコピー
      },
      
      // 👑 現実（Sniperが撃ち込んだ生レビュー）
      rawReviews: row[17] || "",    // R列: 生のレビューデータ(JSON)
    }));
  } catch (error) {
    console.error("Google Sheets API 通信エラー:", error);
    return [];
  }
}