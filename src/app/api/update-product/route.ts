import { NextResponse } from 'next/server';
import { updateProductInSheet } from '@/lib/sheets';

export async function POST(request: Request) {
  try {
    const productData = await request.json();

    if (!productData || !productData.id) {
      return NextResponse.json({ error: "製品情報またはMKT-IDが不足しています" }, { status: 400 });
    }

    // スプレッドシート側の行を特定して完全上書きする関数をコール
    await updateProductInSheet(productData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: error.message || "製品情報の更新に失敗しました" }, { status: 500 });
  }
}