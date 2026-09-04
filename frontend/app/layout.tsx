import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./polish.css";
import "./account.css";

export const metadata: Metadata = {
  title: "Persian Shop | فروشگاه خدمات دیجیتال",
  description: "فروشگاه خدمات شبکه‌های اجتماعی، اشتراک‌های هوش مصنوعی و محصولات دیجیتال Persian Shop",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
