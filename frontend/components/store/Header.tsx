"use client";

import { Heart, Search, ShoppingCart, UserRound, X } from "lucide-react";

export default function Header({ shopName, query, cartCount, searchFocused, accountLabel, onQuery, onSearchFocus, onSearchSubmit, onHome, onOpenAccount, onOpenCart, onFavorites }: {
  shopName: string; query: string; cartCount: number; searchFocused: boolean; accountLabel: string;
  onQuery: (value: string) => void; onSearchFocus: (focused: boolean) => void; onSearchSubmit: () => void;
  onHome: () => void; onOpenAccount: () => void; onOpenCart: () => void; onFavorites: () => void;
}) {
  return <header className="shop-header">
    <button className="shop-brand" onClick={onHome} aria-label="خانه پرشین شاپ">
      <img src="/api/brand/logo?brand=exact-user-v4" width={42} height={42} alt=""/>
      <span><b>{shopName}</b><small>فروشگاه خدمات دیجیتال</small></span>
    </button>
    <form role="search" className={`shop-search ${searchFocused ? "is-focused" : ""}`} onSubmit={event => { event.preventDefault(); onSearchSubmit(); }}>
      <input value={query} onChange={event => { onQuery(event.target.value); onSearchFocus(true); }} onClick={() => onSearchFocus(true)} placeholder="دنبال چه سرویسی می‌گردی؟" aria-label="جستجوی محصولات" autoComplete="off"/>
      {query && <button type="button" className="shop-search-clear" onClick={() => onQuery("")} aria-label="پاک کردن جستجو"><X size={17}/></button>}
      <button type="submit" className="shop-search-submit" aria-label="جستجو"><Search size={20}/></button>
    </form>
    <div className="shop-header-actions">
      <button aria-label="علاقه‌مندی‌ها" className="shop-favorites" onClick={onFavorites}><Heart size={21}/><span>علاقه‌مندی‌ها</span></button>
      <button onClick={onOpenCart}><span className="shop-cart-icon"><ShoppingCart size={21}/>{cartCount > 0 && <b>{cartCount.toLocaleString("fa-IR")}</b>}</span><span>سبد خرید</span></button>
      <button onClick={onOpenAccount}><UserRound size={21}/><span>{accountLabel}</span></button>
    </div>
  </header>;
}
