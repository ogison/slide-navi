import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const APP_NAME = "スライドおしゃべりナビ";
const APP_DESCRIPTION =
  "スライドおしゃべりナビは、PDFスライドの台本作成から自動再生・音声読み上げまで一括でサポートするプレゼンテーション支援アプリです。";

const createMetadataBase = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (explicitUrl) {
    try {
      return new URL(explicitUrl);
    } catch {
      // ignore invalid explicit URL
    }
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    try {
      const normalized = vercelUrl.startsWith("http")
        ? vercelUrl
        : `https://${vercelUrl}`;
      return new URL(normalized);
    } catch {
      // ignore invalid Vercel URL
    }
  }

  return new URL("http://localhost:3000");
};

const metadataBase = createMetadataBase();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase,
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} | プレゼン資料ナビゲーター`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "Slide Navi",
    "プレゼン練習",
    "スライド台本",
    "音声読み上げ",
    "自動再生",
    "PDFアップロード",
  ],
  authors: [{ name: "Slide Navi Team" }],
  creator: "Slide Navi Team",
  publisher: "Slide Navi Team",
  openGraph: {
    title: `${APP_NAME} | プレゼン資料ナビゲーター`,
    description: APP_DESCRIPTION,
    url: metadataBase,
    siteName: APP_NAME,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | プレゼン資料ナビゲーター`,
    description: APP_DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
