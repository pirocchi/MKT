// src/app/page.tsx
import { getCompetitorData } from '../lib/sheets';
import DashboardClient from '../components/DashboardClient';

// 💥【究極リアルタイム化】60秒キャッシュを完全撤廃！！！
// ページを開く・リロードしたその瞬間に、必ず最新のスプレッドシートを0秒で直接召喚するSSRモードへ強制変更！！！
export const dynamic = 'force-dynamic'; 

export default async function Dashboard() {
  // サーバー側でスプレッドシートからデータを抽出
  const mktData = await getCompetitorData();

  if (mktData.length === 0) {
    return (
      <div className="min-h-screen bg-mkt-bg flex items-center justify-center p-8">
        <div className="text-mkt-makoto text-xl font-bold p-6 border border-mkt-makoto rounded bg-mkt-makoto/10">
          ⚠️ データの取得に失敗したか、スプレッドシートが空です。
        </div>
      </div>
    );
  }

  // 取得したデータをクライアントUIモジュールに投下！
  return <DashboardClient initialData={mktData} />;
}