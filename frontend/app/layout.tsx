import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Persian Shop | Premium Digital Marketplace",
  description: "فروشگاه خدمات دیجیتال، شبکه‌های اجتماعی، اشتراک‌های هوش مصنوعی و محصولات پرمیوم Persian Shop",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
