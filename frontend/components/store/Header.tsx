"use client";

import { ChevronDown, Headphones, Menu, Search, ShoppingCart, UserRound, WalletCards, X } from "lucide-react";
import type { StoreCategory } from "../../lib/store-data";
import { BrandIcon } from "./shared";
import { shortCategory } from "./utils";

export default function Header({
  shopName,
  categories,
  query,
  cartCount,
  searchFocused,
  onQuery,
  onSearchFocus,
  onSearchSubmit,
  onOpenCategory,
  onOpenCatalog,
  onOpenAccount,
  onOpenCart,
  onOpenWallet,
  onSupport,
}: {
  shopName: string;
  categories: StoreCategory[];
  query: string;
  cartCount: number;
  searchFocused: boolean;
  onQuery: (value: string) => void;
  onSearchFocus: (focused: boolean) => void;
  onSearchSubmit: () => void;
  onOpenCategory: (id: string) => void;
  onOpenCatalog: () => void;
  onOpenAccount: () => void;
  onOpenCart: () => void;
  onOpenWallet: () => void;
  onSupport: () => void;
}) {
  return (
    <>
      <div className="announcement-bar">
        <div className="page-container announcement-inner">
          <span>خرید سرویس‌های دیجیتال با قیمت و اطلاعات شفاف</span>
          <button onClick={onOpenWallet}>افزایش موجودی کیف پول</button>
        </div>
      </div>

      <header className="site-header">
        <div className="page-container header-primary-row">
          <button className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Persian Shop">
            <span className="brand-logo-mark">P</span>
            <span className="brand-logo-copy"><b>{shopName}</b><small>Digital Marketplace</small></span>
          </button>

          <form className={`global-search ${searchFocused ? "is-focused" : ""}`} onSubmit={event => { event.preventDefault(); onSearchSubmit(); }}>
            <Search size={21}/>
            <input
              value={query}
              onChange={event => onQuery(event.target.value)}
              onFocus={() => onSearchFocus(true)}
              placeholder="جستجو در محصولات Persian Shop"
              aria-label="جستجوی محصولات"
            />
            {query && <button type="button" className="search-clear" onClick={() => onQuery("")} aria-label="پاک کردن جستجو"><X size={17}/></button>}
          </form>

          <div className="header-actions">
            <button className="header-account" onClick={onOpenAccount}><UserRound size={22}/><span>ورود | حساب من</span></button>
            <button className="header-icon-button" onClick={onOpenCart} aria-label="سبد خرید">
              <ShoppingCart size={24}/>
              {cartCount > 0 && <b className="count-badge">{cartCount}</b>}
            </button>
          </div>
        </div>

        <div className="page-container desktop-nav-row">
          <button className="categories-trigger" onClick={onOpenCatalog}><Menu size={18}/>دسته‌بندی محصولات<ChevronDown size={15}/></button>
          <nav className="desktop-categories" aria-label="دسته‌بندی‌های اصلی">
            {categories.slice(0, 6).map(category => <button key={category.id} onClick={() => onOpenCategory(category.id)}>{shortCategory(category.name)}</button>)}
          </nav>
          <span className="nav-spacer"/>
          <button className="nav-utility" onClick={onOpenWallet}><WalletCards size={17}/>کیف پول</button>
          <button className="nav-utility" onClick={onSupport}><Headphones size={17}/>پشتیبانی</button>
        </div>

        <div className="mobile-category-strip">
          <div className="page-container mobile-category-scroll">
            {categories.map(category => (
              <button key={category.id} onClick={() => onOpenCategory(category.id)}>
                <BrandIcon id={category.id} size={42}/>
                <span>{shortCategory(category.name)}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
