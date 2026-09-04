"use client";

import { Headphones, House, ShoppingCart } from "lucide-react";
import { CategoryIcon, RivaAccountIcon, RivaWalletIcon } from "./shared";

export default function MobileNav({ active, cartCount, onHome, onCatalog, onCart, onWallet, onAccount }: {
  active: "home" | "catalog" | "cart" | "wallet" | "account";
  cartCount: number;
  onHome: () => void;
  onCatalog: () => void;
  onCart: () => void;
  onWallet: () => void;
  onAccount: () => void;
}) {
  return (
    <nav className="mobile-nav" aria-label="ناوبری اصلی موبایل">
      {/* Keep the original classic home glyph; the Persian Shop brand mark is reserved for branding surfaces. */}
      <button className={active === "home" ? "is-active" : ""} onClick={onHome} aria-label="خانه"><House size={22} strokeWidth={1.75}/><span>خانه</span></button>
      <button className={active === "catalog" ? "is-active" : ""} onClick={onCatalog} aria-label="دسته‌بندی"><CategoryIcon size={22}/><span>دسته‌بندی</span></button>
      <button className={`mobile-cart-action ${active === "cart" ? "is-active" : ""}`} onClick={onCart} aria-label="سبد خرید"><span className="mobile-cart-orb"><ShoppingCart size={23} strokeWidth={1.75}/>{cartCount > 0 && <em>{cartCount}</em>}</span><span>سبد خرید</span></button>
      <button className={active === "wallet" ? "is-active" : ""} onClick={onWallet} aria-label="کیف پول"><RivaWalletIcon size={22}/><span>کیف پول</span></button>
      <button className={active === "account" ? "is-active" : ""} onClick={onAccount} aria-label="حساب من"><RivaAccountIcon size={22}/><span>حساب من</span></button>
    </nav>
  );
}
