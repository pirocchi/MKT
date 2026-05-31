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
    
    // 👑 読み込むシート名と範囲を指定（※実際のシート名に合わせて変更してください！）
    // 例：シート名が「競合」の場合。A2からR12までの範囲を取得します。
    const range = "競合!A2:R12"; // 👑 シート名を「競合」、範囲を「R列」まで拡張！

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // 👑 スプレッドシートの行を、ダッシュボード用のデータ構造にマッピング！
    // ※列の順番（0=A列, 1=B列...）は、実際のシートの列構成に合わせて数字を調整してください。
    return rows.map((row) => ({
      id: row[0] || "-",                   // A列: ID (例: DBB-001)
      classification: row[1] || "-",       // B列: クラス
      brand: row[2] || "-",                // C列: ブランド名
      name: row[3] || "-",                 // D列: 商品名
      price: Number(row[4]?.replace(/[^0-9]/g, "")) || 0, // E列: 価格（カンマや円を自動除去！）
      tech: row[5] || "-",                 // F列: 技術
      waterproof: row[6] || "-",           // G列: 防水性能
      pins: row[7] || "-",                 // H列: ヘッド仕様
      reviews: Number(row[8]?.replace(/[^0-9]/g, "")) || 0, // I列
      rawReviews: row[17] || "",
    }));
  } catch (error) {
    console.error("Google Sheets API 通信エラー:", error);
    return [];
  }
}