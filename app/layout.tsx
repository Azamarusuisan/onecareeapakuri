import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShuPra - 難関企業志望者のための匿名面接練習",
  description:
    "コンサル・Big4志望者向けの匿名面接練習プラットフォーム。ケース面接・志望動機深掘り・最終面接の練習相手を見つけよう。",
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
