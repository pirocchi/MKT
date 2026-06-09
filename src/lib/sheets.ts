import { google } from "googleapis";

// 👑 共通の認証クライアント生成関数
function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    // 💥【超重要】書き込み権限を開放するために「readonly」を消去！！！
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getCompetitorData() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    
    // 💥【超進化】HUMINT_Notes（極秘メモ）シートも同時に取得！！！
    const [dbResponse, revResponse, humintResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "MKT_DB!A2:T50", 
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "MKT_Reviews!A2:G", 
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "HUMINT_Notes!A2:E", // A:MKT-ID, B:投稿日時, C:投稿者, D:カテゴリ, E:メモ内容
      }).catch(() => ({ data: { values: [] } })) // シートがない場合のクラッシュ回避
    ]);

    const dbRows = dbResponse.data.values;
    const revRows = revResponse.data.values || [];
    const humintRows = humintResponse.data.values || [];

    if (!dbRows || dbRows.length === 0) return [];

    // 👑 レビューの仕分け
    const reviewsMap: Record<string, any[]> = {};
    revRows.forEach((row) => {
      const mktId = row[0];
      if (!mktId) return;
      if (!reviewsMap[mktId]) reviewsMap[mktId] = [];
      
      reviewsMap[mktId].push({
        platform: row[1] || "",
        title: row[2] || "",
        rating: row[3] || "",
        date: row[4] || "",
        attributes: row[5] || "",
        body: row[6] || ""
      });
    });

    // 👑 HUMINT（極秘メモ）の仕分け
    const humintMap: Record<string, any[]> = {};
    humintRows.forEach((row) => {
      const mktId = row[0];
      if (!mktId) return;
      if (!humintMap[mktId]) humintMap[mktId] = [];
      
      humintMap[mktId].push({
        date: row[1] || "",
        author: row[2] || "",
        category: row[3] || "",
        note: row[4] || ""
      });
    });

    // 👑 データの結合と完全マッピング！
    return dbRows.map((row) => {
      const id = row[0] || "-";
      const productReviews = reviewsMap[id] || []; 
      const productHumint = humintMap[id] || []; 

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
        imageUrl: row[17] || "",     
        amazonUrl: row[18] || "",    
        rakutenUrl: row[19] || "",   
        rawReviews: productReviews.length > 0 ? JSON.stringify(productReviews) : "", 
        rawHumint: productHumint.length > 0 ? JSON.stringify(productHumint) : "", // 👑 新規追加：極秘情報をセット！
      };
    });
  } catch (error) {
    console.error("Google Sheets API 通信エラー:", error);
    return [];
  }
}

// 💥 新規追加：極秘メモ（HUMINT）をスプレッドシートに直接書き込む専用メソッド！！！
export async function appendNoteToSheet(mktId: string, { note, category, author, timestamp }: { note: string, category: string, author: string, timestamp: string }) {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "HUMINT_Notes!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [mktId, timestamp, author, category, note]
      ],
    },
  });
}