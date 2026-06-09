// src/app/api/save-note/route.ts
import { NextResponse } from 'next/server';
import { appendNoteToSheet } from '@/lib/sheets';
// 👑 追加
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { mktId, note, category, author } = await request.json();

    if (!mktId || !note) {
      return NextResponse.json({ error: "MKT-IDとメモ内容は必須です" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    await appendNoteToSheet(mktId, {
      note,
      category: category || "一般メモ",
      author: author || "匿名",
      timestamp
    });

    // 💥 キャッシュ強制破棄！
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save Note Error:", error);
    return NextResponse.json({ error: error.message || "メモの保存に失敗しました" }, { status: 500 });
  }
}