import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShuPra - 匿名就活練習アプリ",
  description:
    "高難度企業を目指す就活生のための匿名面接練習プラットフォーム。ケース面接・志望動機・最終面接の練習相手を見つけよう。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-surface">{children}</body>
    </html>
  );
}
