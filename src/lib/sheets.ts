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
    
    // 💥【超進化】MKT_DB と MKT_Reviews の「2つのシート」を同時並行で引っこ抜く！
    const [dbResponse, revResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "MKT_DB!A2:Q50", // 👑 R列は廃止されたのでQ列まで読めばOK！
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "MKT_Reviews!A2:G", // 👑 無限蓄積されている全レビューを底まで取得！
      })
    ]);

    const dbRows = dbResponse.data.values;
    const revRows = revResponse.data.values || []; // レビューが0件の場合の安全装置

    if (!dbRows || dbRows.length === 0) return [];

    // 👑 取得した数千件の全レビューを、「MKT-ID」ごとに瞬時に仕分けるハッシュマップを錬成！
    const reviewsMap: Record<string, any[]> = {};
    revRows.forEach((row) => {
      const mktId = row[0];
      if (!mktId) return;

      if (!reviewsMap[mktId]) {
        reviewsMap[mktId] = [];
      }

      // Geminiに読ませるための美しいオブジェクトに整形して格納
      reviewsMap[mktId].push({
        platform: row[1] || "",
        title: row[2] || "",
        rating: row[3] || "",
        date: row[4] || "",
        attributes: row[5] || "",
        body: row[6] || ""
      });
    });

    // 👑 DBデータと、仕分けたレビューデータを合体させてフロントエンドへ送る！
    return dbRows.map((row) => {
      const id = row[0] || "-";
      const productReviews = reviewsMap[id] || []; // そのIDに紐づくレビュー群を取り出す

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
        // 💥 フロントエンドのUIは一切変更不要！
        // オブジェクト配列をJSON文字列に変換して、今まで通り rawReviews に突っ込む！
        rawReviews: productReviews.length > 0 ? JSON.stringify(productReviews) : "", 
      };
    });
  } catch (error) {
    console.error("Google Sheets API 通信エラー:", error);
    return [];
  }
}