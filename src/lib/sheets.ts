import { google } from "googleapis";

// 👑 共通の認証クライアント生成関数
function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getCompetitorData() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    
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
        range: "HUMINT_Notes!A2:E",
      }).catch(() => ({ data: { values: [] } }))
    ]);

    const dbRows = dbResponse.data.values;
    const revRows = revResponse.data.values || [];
    const humintRows = humintResponse.data.values || [];

    if (!dbRows || dbRows.length === 0) return [];

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
        rawHumint: productHumint.length > 0 ? JSON.stringify(productHumint) : "",
      };
    });
  } catch (error) {
    console.error("Google Sheets API 通信エラー:", error);
    return [];
  }
}

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

// 💥 ここが完全新規追加＆超絶強化されたデータベース同期メソッド！！！
export async function updateProductInSheet(productData: any) {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  // ==========================================
  // 1. MKT_DB（基本情報）の更新処理
  // ==========================================
  const idResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "MKT_DB!A:A",
  });
  const rows = idResponse.data.values;
  if (!rows) throw new Error("データベースが空です");

  const rowIndex = rows.findIndex(row => row[0] === productData.id);
  if (rowIndex === -1) throw new Error(`対象の製品(ID: ${productData.id})がデータベースに見つかりません`);

  const rowNumber = rowIndex + 1;

  const values = [
    [
      productData.id,
      productData.classification,
      productData.brand,
      productData.name,
      productData.price,
      productData.tech,
      productData.waterproof,
      productData.pins,
      productData.reviews,
      productData.claims?.target || "",
      productData.claims?.problem || "",
      productData.claims?.usp || "",
      productData.claims?.pain || "",
      productData.claims?.ease || "",
      productData.claims?.copy || "",
      productData.scrapedDate,
      productData.averageRating,
      productData.imageUrl,
      productData.amazonUrl,
      productData.rakutenUrl
    ]
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `MKT_DB!A${rowNumber}:T${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  // ==========================================
  // 2. HUMINT_Notes（極秘メモ）シートの完全同期処理（削除対応）
  // ==========================================
  if (productData.rawHumint !== undefined) {
    let updatedNotes: any[] = [];
    if (productData.rawHumint.trim() !== "") {
      try {
        updatedNotes = JSON.parse(productData.rawHumint);
      } catch (e) {
        console.error("メモのJSONパースエラー:", e);
      }
    }

    // シートから全メモを取得
    const humintResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "HUMINT_Notes!A:E",
    }).catch(() => null);

    const humintRows = humintResponse?.data?.values || [];
    const header = humintRows.length > 0 && humintRows[0][0] === "MKT-ID" 
      ? humintRows[0] 
      : ["MKT-ID", "投稿日時", "投稿者", "カテゴリ", "メモ内容"];

    // 他の製品のメモだけを残す（今回の製品の古いメモ＝消されたメモを含む履歴はすべて一旦リセット）
    const otherNotes = humintRows.filter((row, index) => {
      if (index === 0 && row[0] === "MKT-ID") return false; // ヘッダー除外
      return row[0] !== productData.id;
    });

    // 画面上で生き残っている「最新のメモ一覧」だけを再構築
    const newNotesRows = updatedNotes.map(n => [
      productData.id, 
      n.date, 
      n.author, 
      n.category, 
      n.note
    ]);

    const finalRows = [header, ...otherNotes, ...newNotesRows];

    // シートを一旦クリアして完全上書き！これでもうゾンビ復活は絶対に起きない！
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: "HUMINT_Notes!A:E",
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "HUMINT_Notes!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: finalRows },
    });
  }
}