"use client";

import { ChevronDown, Headphones, Menu, ShoppingCart, X } from "lucide-react";
import type { StoreCategory } from "../../lib/store-data";
import { BrandIcon, RivaIcon } from "./shared";
import { shortCategory } from "./utils";

export default function Header({
  shopName,
  categories,
  query,
  cartCount,
  searchFocused,
  isLoggedIn,
  accountLabel,
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
  isLoggedIn: boolean;
  accountLabel: string;
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
          {isLoggedIn ? <button onClick={onOpenWallet}>افزایش موجودی</button> : <button onClick={onOpenAccount}>ورود یا ثبت‌نام</button>}
        </div>
      </div>

      <header className="site-header">
        <div className="page-container header-primary-row">
          <button className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Persian Shop">
            <span
              className="brand-logo-image"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                overflow: "hidden",
                flex: "0 0 48px",
                display: "grid",
                placeItems: "center",
                background: "transparent",
                boxShadow: "0 6px 18px rgba(207,157,0,.18)",
              }}
            >
              <img
                src="/api/brand/logo"
                alt={`${shopName} logo`}
                width={48}
                height={48}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </span>
            <span className="brand-logo-copy"><b>{shopName}</b><small>Digital Marketplace</small></span>
          </button>

          <form className={`global-search ${searchFocused ? "is-focused" : ""}`} onSubmit={event => { event.preventDefault(); onSearchSubmit(); }}>
            <RivaIcon name="search" size={21}/>
            <input value={query} onChange={event => onQuery(event.target.value)} onFocus={() => onSearchFocus(true)} placeholder="جستجو در محصولات Persian Shop" aria-label="جستجوی محصولات"/>
            {query && <button type="button" className="search-clear" onClick={() => onQuery("")} aria-label="پاک کردن جستجو"><X size={17}/></button>}
          </form>

          <div className="header-actions">
            <button className="header-account" onClick={onOpenAccount}><RivaIcon name="user" size={22}/><span>{accountLabel}</span></button>
            <button className="header-icon-button" onClick={onOpenCart} aria-label="سبد خرید"><ShoppingCart size={24} strokeWidth={1.75}/>{cartCount > 0 && <b className="count-badge">{cartCount}</b>}</button>
          </div>
        </div>

        <div className="page-container desktop-nav-row">
          <button className="categories-trigger" onClick={onOpenCatalog}><Menu size={18} strokeWidth={1.75}/>دسته‌بندی محصولات<ChevronDown size={15}/></button>
          <nav className="desktop-categories" aria-label="دسته‌بندی‌های اصلی">{categories.slice(0, 6).map(category => <button key={category.id} onClick={() => onOpenCategory(category.id)}>{shortCategory(category.name)}</button>)}</nav>
          <span className="nav-spacer"/>
          {isLoggedIn && <button className="nav-utility" onClick={onOpenWallet}><RivaIcon name="wallet" size={17}/>کیف پول</button>}
          <button className="nav-utility" onClick={onSupport}><Headphones size={17} strokeWidth={1.75}/>پشتیبانی</button>
        </div>

        <div className="mobile-category-strip"><div className="page-container mobile-category-scroll">{categories.map(category => <button key={category.id} onClick={() => onOpenCategory(category.id)}><BrandIcon id={category.id} size={42}/><span>{shortCategory(category.name)}</span></button>)}</div></div>
      </header>
    </>
  );
}
