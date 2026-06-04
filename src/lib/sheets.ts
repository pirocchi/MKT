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
    
    // 💥【超進化】取得範囲を T列（20列目：楽天URL）まで完全開放！！！
    const [dbResponse, revResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "MKT_DB!A2:T50", 
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "MKT_Reviews!A2:G", 
      })
    ]);

    const dbRows = dbResponse.data.values;
    const revRows = revResponse.data.values || [];

    if (!dbRows || dbRows.length === 0) return [];

    // 👑 レビューの仕分け
    const reviewsMap: Record<string, any[]> = {};
    revRows.forEach((row) => {
      const mktId = row[0];
      if (!mktId) return;

      if (!reviewsMap[mktId]) {
        reviewsMap[mktId] = [];
      }

      reviewsMap[mktId].push({
        platform: row[1] || "",
        title: row[2] || "",
        rating: row[3] || "",
        date: row[4] || "",
        attributes: row[5] || "",
        body: row[6] || ""
      });
    });

    // 👑 データの結合とT列までの完全マッピング！
    return dbRows.map((row) => {
      const id = row[0] || "-";
      const productReviews = reviewsMap[id] || []; 

      return {
        id: id,
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
        scrapedDate: row[15] || "-",    
        averageRating: row[16] || "-",  
        imageUrl: row[17] || "",     // R列: 画像URL
        amazonUrl: row[18] || "",    // 👑 S列: Amazon商品ページURL
        rakutenUrl: row[19] || "",   // 👑 T列: 楽天商品ページURL
        rawReviews: productReviews.length > 0 ? JSON.stringify(productReviews) : "", 
      };
    });
  } catch (error) {
    console.error("Google Sheets API 通信エラー:", error);
    return [];
  }
}