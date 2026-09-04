"use client";

import { Grid2X2, Home, ShoppingCart, UserRound, WalletCards } from "lucide-react";

export default function MobileNav({ cartCount, onHome, onCatalog, onCart, onWallet, onAccount }: {
  cartCount: number;
  onHome: () => void;
  onCatalog: () => void;
  onCart: () => void;
  onWallet: () => void;
  onAccount: () => void;
}) {
  return (
    <nav className="mobile-bottom-nav" aria-label="ناوبری اصلی موبایل">
      <button onClick={onHome}><Home size={22}/><span>خانه</span></button>
      <button onClick={onCatalog}><Grid2X2 size={22}/><span>دسته‌بندی</span></button>
      <button className="mobile-cart-button" onClick={onCart}><i><ShoppingCart size={24}/>{cartCount > 0 && <b>{cartCount}</b>}</i><span>سبد خرید</span></button>
      <button onClick={onWallet}><WalletCards size={22}/><span>کیف پول</span></button>
      <button onClick={onAccount}><UserRound size={22}/><span>حساب من</span></button>
    </nav>
  );
}
