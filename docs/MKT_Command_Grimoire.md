# MKT コマンド

統合運用・保守・デプロイに関する全コマンドを編纂した公式チートシートです。

---

## 🌐 アクセス・ポータル

### MKT
* ☁️ **クラウド本番:** [https://mkt.mkg-core.com/](https://mkt.mkg-core.com/)
* 💻 **ローカル環境:** [http://localhost:3003/](http://localhost:3003/) *(or `http://10.1.255.235:3003/`)*

---

## 🎌 MKT（MAKOTO）運用コマンド

### 1. サーバー起動・エコシステム
```powershell
# 【推奨】フロントエンドを起動（ecosystem.config.js使用）
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; pm2 start ecosystem.config.js ; pm2 save

# フロントエンド単独起動
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; npm run build ; pm2 start npm --name "mkt-console" -- start

# フロントエンド単独起動（改）
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; npm run build ; pm2 start ecosystem.config.js --only mkt-console
```

### 2. ビルド・更新・デプロイ
```powershell
# 【推奨】ビルド・デプロイを一括実行
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; npm run build ; pm2 restart mkt-console ; git add . ; git commit -m "update" ; git push

# ページ更新後のビルド＆再起動（連撃コンボ）
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; npm run build ; pm2 restart mkt-console

# ローカルテスト起動（開発モード）
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; npm run dev ; pm2 restart mkt-console

# クラウド環境へのデプロイ
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; git add . ; git commit -m "update" ; git push
```

### 3. 個別停止・キャッシュ削除（パージ）
```powershell
# フロントエンドの停止 ＆ キャッシュ削除
pm2 stop mkt-console ; pm2 delete mkt-console
```

---

## 🚀 PM2 統制コマンド

システム全体のプロセスを管理するためのコマンド群です。

```powershell
# PM2の稼働状況をリスト表示
pm2 list

# リアルタイムのログストリームを確認
pm2 logs

# 現在のPM2の稼働状態をセーブ（保存）
pm2 save

# セーブした状態から一発で全プロセスを復活
pm2 resurrect

# 全プロセスの停止 / 再起動
pm2 stop all
pm2 restart all

# Windows起動時のPM2自動起動化（save後に実行）
pm2 startup
```

---

## 💡 特製：保守・デバッグ用アドバンスド・コマンド

```powershell
# 1. 視覚的ダッシュボード（リソース監視）
pm2 monit
# 💡 CPUやメモリの使用量、リアルタイムログがスタイリッシュに分割表示されます。

# 2. ログファイルの完全浄化（フラッシュ）
pm2 flush
# 💡 肥大化したPM2の過去ログ（~/.pm2/logs）を瞬時にパージし、ディスク容量を解放します。

# 3. Next.js のハード・リセット（原因不明のキャッシュエラー時）
cd C:\Users\Watanabe_2025\Desktop\script\py\MKT ; Remove-Item -Recurse -Force .next ; npm run build
# 💡 Next.jsのキャッシュ（.nextフォルダ）を物理的に消去してから再ビルドする最強の浄化コマンドです。

# 4. ディレクトリ構造のツリー出力
tree /f C:\Users\Watanabe_2025\Desktop\script\py\MKT
```