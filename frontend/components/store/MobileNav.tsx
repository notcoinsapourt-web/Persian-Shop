"use client";

import { Headphones, ShoppingCart } from "lucide-react";
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
    <nav className="mobile-bottom-nav" aria-label="ناوبری اصلی موبایل">
      <button onClick={onHome}><RivaIcon name="home" size={22}/><span>خانه</span></button>
      <button onClick={onCatalog}><RivaIcon name="grid" size={22}/><span>دسته‌بندی</span></button>
      <button className="mobile-cart-button" onClick={onCart}><i><ShoppingCart size={24} strokeWidth={1.75}/>{cartCount > 0 && <b>{cartCount}</b>}</i><span>سبد خرید</span></button>
      {isLoggedIn ? <button onClick={onWallet}><RivaIcon name="wallet" size={22}/><span>کیف پول</span></button> : <button onClick={onSupport}><Headphones size={22} strokeWidth={1.75}/><span>پشتیبانی</span></button>}
      <button onClick={onAccount}><RivaIcon name="user" size={22}/><span>حساب من</span></button>
    </nav>
  );
}
