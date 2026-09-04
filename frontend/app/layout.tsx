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
    icon: "/persian-shop-logo.svg",
    apple: "/persian-shop-logo.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
