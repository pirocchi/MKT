import { NextResponse } from 'next/server';
import { appendProductToSheet } from '@/lib/sheets';
import { revalidatePath } from 'next/cache'; 

export async function POST(request: Request) {
  try {
    const productData = await request.json();

    if (!productData || !productData.id) {
      return NextResponse.json({ error: "MKT-IDは必須項目です。" }, { status: 400 });
    }

    // スプレッドシートに新規行を追加
    await appendProductToSheet(productData);

    // リアルタイム反映のためにトップページのキャッシュを強制クリア
    revalidatePath('/'); 

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Add Product Error:", error);
    return NextResponse.json({ error: error.message || "製品の追加に失敗しました" }, { status: 500 });
  }
}