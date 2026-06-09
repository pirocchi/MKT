// src/app/api/update-product/route.ts
import { NextResponse } from 'next/server';
import { updateProductInSheet } from '@/lib/sheets';
// 👑 追加：キャッシュを強制破棄する強力な兵器
import { revalidatePath } from 'next/cache'; 

export async function POST(request: Request) {
  try {
    const productData = await request.json();

    if (!productData || !productData.id) {
      return NextResponse.json({ error: "製品情報不足" }, { status: 400 });
    }

    // スプレッドシートを上書き
    await updateProductInSheet(productData);

    // 💥 必殺技：トップページ（/）のキャッシュを強制的に吹っ飛ばす！！！
    // これにより、次に画面をリロードした瞬間に「必ず最新のスプレッドシート」を読みに行くようになります！
    revalidatePath('/'); 

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("【デバッグ】エラー発生:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}