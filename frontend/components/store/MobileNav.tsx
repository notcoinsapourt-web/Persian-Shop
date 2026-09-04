"use client";

import { Grid2X2, Headphones, Home, ShoppingCart, UserRound, WalletCards } from "lucide-react";

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
      <button onClick={onHome}><Home size={22}/><span>خانه</span></button>
      <button onClick={onCatalog}><Grid2X2 size={22}/><span>دسته‌بندی</span></button>
      <button className="mobile-cart-button" onClick={onCart}><i><ShoppingCart size={24}/>{cartCount > 0 && <b>{cartCount}</b>}</i><span>سبد خرید</span></button>
      {isLoggedIn ? <button onClick={onWallet}><WalletCards size={22}/><span>کیف پول</span></button> : <button onClick={onSupport}><Headphones size={22}/><span>پشتیبانی</span></button>}
      <button onClick={onAccount}><UserRound size={22}/><span>حساب من</span></button>
    </nav>
  );
}
