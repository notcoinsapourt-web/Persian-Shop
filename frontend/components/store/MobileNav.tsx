"use client";

import { Headphones, House, ShoppingCart } from "lucide-react";
import { RivaIcon } from "./shared";

export default function MobileNav({ cartCount, isLoggedIn, onHome, onCatalog, onCart, onWallet, onSupport, onAccount }: {
  cartCount: number;
  isLoggedIn: boolean;
  onHome: () => void;
  onCatalog: () => void;
  onCart: () => void;
  onWallet: () => void;
  onSupport: () => void;
  onAccount: () => void;
}) {
  return (
    <nav className="mobile-nav" aria-label="ناوبری اصلی موبایل">
      {/* Home keeps the original classic house glyph; the brand logo is not used as a navigation icon. */}
      <button onClick={onHome} aria-label="خانه"><House size={22} strokeWidth={1.75}/><span>خانه</span></button>
      <button onClick={onCatalog} aria-label="دسته‌بندی"><RivaIcon name="grid" size={22}/><span>دسته‌بندی</span></button>
      <button className="mobile-cart-action" onClick={onCart} aria-label="سبد خرید"><span className="mobile-cart-orb"><ShoppingCart size={23} strokeWidth={1.75}/>{cartCount > 0 && <em>{cartCount}</em>}</span><span>سبد خرید</span></button>
      {isLoggedIn ? (
        <button onClick={onWallet} aria-label="کیف پول"><RivaIcon name="wallet" size={22}/><span>کیف پول</span></button>
      ) : (
        <button onClick={onSupport} aria-label="پشتیبانی"><Headphones size={22} strokeWidth={1.75}/><span>پشتیبانی</span></button>
      )}
      <button onClick={onAccount} aria-label="حساب من"><RivaIcon name="user" size={22}/><span>حساب من</span></button>
    </nav>
  );
}
