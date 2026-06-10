import { NextResponse } from 'next/server';
import { deleteProductFromSheet } from '@/lib/sheets';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "削除する製品のMKT-IDが指定されていません" }, { status: 400 });
    }

    // スプレッドシートから完全に削除
    await deleteProductFromSheet(id);

    // キャッシュを強制クリアして即時反映
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: error.message || "製品の削除に失敗しました" }, { status: 500 });
  }
}