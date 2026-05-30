module.exports = {
  apps: [
    {
      name: "mkt-console",                     // PM2のリストに表示される美しい大文字の名前
      script: "node_modules/next/dist/bin/next", // npmのバグを回避し、Next.jsを直接起動！
      args: "start -p 3003",           // ポート3003を強制指定
      cwd: "./",                       // 現在のディレクトリ（MKT）を基準にする
      instances: 1,                    // 起動インスタンス数
      autorestart: true,               // クラッシュ時の自動復旧（オン）
      watch: false,                    // 本番環境なのでファイル監視はオフ
      env: {
        NODE_ENV: "production"         // 本番モードを明示
      }
    }
  ]
};