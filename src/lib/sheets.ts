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

    // 👑 変更箇所：マッピングにP列とQ列を追加！
    return rows.map((row) => ({
      id: row[0] || "-",
      classification: row[1] || "-",
      brand: row[2] || "-",
      name: row[3] || "-",
      price: Number(row[4]?.replace(/[^0-9]/g, "")) || 0,
      tech: row[5] || "-",
      waterproof: row[6] || "-",
      pins: row[7] || "-",
      reviews: Number(row[8]?.replace(/[^0-9]/g, "")) || 0,
      claims: {
        target: row[9] || "-",
        problem: row[10] || "-",
        usp: row[11] || "-",
        pain: row[12] || "-",
        ease: row[13] || "-",
        copy: row[14] || "-"
      },
      // 👑 新たに吸い上げるレーダー情報！
      scrapedDate: row[15] || "-",    // P列: データ取得日時
      averageRating: row[16] || "-",  // Q列: 平均星評価
      rawReviews: row[17] || "",      // R列: 生のレビューデータ(JSON)
    }));
  } catch (error) {
    console.error("Google Sheets API 通信エラー:", error);
    return [];
  }
}