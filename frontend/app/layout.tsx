import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./polish.css";
import "./account.css";
import "./riva-brand.css";

export const metadata: Metadata = {
  title: "Persian Shop | فروشگاه خدمات دیجیتال",
  description: "فروشگاه خدمات شبکه‌های اجتماعی، اشتراک‌های هوش مصنوعی و محصولات دیجیتال Persian Shop",
  icons: {
    icon: "/persian-shop-brand-v4.svg",
    apple: "/persian-shop-brand-v4.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preload" href="/api/brand/font/400" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/api/brand/font/700" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
