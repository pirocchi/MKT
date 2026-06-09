// src/app/api/update-product/route.ts
import { NextResponse } from 'next/server';
import { updateProductInSheet } from '@/lib/sheets';

export async function POST(request: Request) {
  try {
    const productData = await request.json();
    
    // 【重要】ここで司令官のPCのターミナルに、送られてきた生データを吐き出させます！
    console.log("【デバッグ】受信したデータ:", JSON.stringify(productData, null, 2));

    if (!productData || !productData.id) {
      return NextResponse.json({ error: "製品情報不足" }, { status: 400 });
    }

    await updateProductInSheet(productData);
    
    console.log("【デバッグ】シート更新処理が完了しました");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("【デバッグ】エラー発生:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}