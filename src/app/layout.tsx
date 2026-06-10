import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 👑 デフォルトの美しいフォント設定を維持
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 👑 メタデータを「MKT」仕様に書き換え！
export const metadata: Metadata = {
  title: "MKT | 競合分析ツール",
  description: "Competitive Analysis Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja" // 👑 英語(en)から日本語(ja)に修正してブラウザの翻訳誤作動を防止！
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} // 👑 アンチエイリアス等の滑らか設定を維持
    >
      <body className="min-h-full flex flex-col m-0 p-0 bg-mkt-bg text-mkt-text-main">
        {children}
      </body>
    </html>
  );
}