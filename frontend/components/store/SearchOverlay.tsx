"use client";

import { ArrowLeft, Clock3, Search, Sparkles, X } from "lucide-react";
import type { StoreCategory, StoreProduct } from "../../lib/store-data";
import { BrandIcon, EmptyState } from "./shared";
import { normalizeSearch } from "./catalog-state";
import { money, shortCategory } from "./utils";

export default function SearchOverlay({
  open,
  query,
  products,
  categories,
  recentSearches,
  onClose,
  onQuery,
  onProduct,
  onCategory,
  onRecent,
  onResults,
}: {
  open: boolean;
  query: string;
  products: StoreProduct[];
  categories: StoreCategory[];
  recentSearches: string[];
  onClose: () => void;
  onQuery: (value: string) => void;
  onProduct: (product: StoreProduct) => void;
  onCategory: (id: string) => void;
  onRecent: (value: string) => void;
  onResults: () => void;
}) {
  if (!open) return null;
  const normalized = normalizeSearch(query);
  const productMatches = normalized ? products.filter(product => normalizeSearch(`${product.name} ${product.en} ${product.description}`).includes(normalized)).slice(0, 6) : [];
  const categoryMatches = normalized ? categories.filter(category => normalizeSearch(`${category.name} ${category.en}`).includes(normalized)).slice(0, 4) : [];

  return (
    <div className="search-overlay-backdrop" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-label="جستجوی فروشگاه" className="search-overlay" onMouseDown={event => event.stopPropagation()}>
        <div className="search-overlay-mobile-input">
          <Search size={20}/>
          <input onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); onResults(); } }} aria-label="عبارت جستجو" autoFocus value={query} onChange={event => onQuery(event.target.value)} placeholder="جستجو در محصولات..."/>
          <button onClick={onClose} aria-label="بستن"><X size={20}/></button>
        </div>

        {!normalized ? (
          <div className="search-discovery-grid">
            <div className="search-discovery-section">
              <div className="search-overlay-title"><Clock3 size={18}/><b>جستجوهای اخیر</b></div>
              {recentSearches.length ? <div className="recent-searches">{recentSearches.map(item => <button key={item} onClick={() => onRecent(item)}>{item}<ArrowLeft size={14}/></button>)}</div> : <p className="search-muted">هنوز جستجویی ذخیره نشده است.</p>}
            </div>
            <div className="search-discovery-section">
              <div className="search-overlay-title"><Sparkles size={18}/><b>دسته‌بندی‌های محبوب</b></div>
              <div className="search-category-suggestions">{categories.slice(0, 6).map(category => <button key={category.id} onClick={() => onCategory(category.id)}><BrandIcon id={category.id} size={38}/><span>{shortCategory(category.name)}</span></button>)}</div>
            </div>
          </div>
        ) : productMatches.length || categoryMatches.length ? (
          <div className="search-results-layout">
            {!!categoryMatches.length && <div className="search-result-section"><div className="search-overlay-title"><b>دسته‌بندی‌ها</b></div><div className="search-category-results">{categoryMatches.map(category => <button key={category.id} onClick={() => onCategory(category.id)}><BrandIcon id={category.id} size={38}/><span><b>{category.name}</b><small>{category.count} محصول</small></span><ArrowLeft size={15}/></button>)}</div></div>}
            {!!productMatches.length && <div className="search-result-section"><div className="search-overlay-title"><b>محصولات پیشنهادی</b><small>{productMatches.length} نتیجه</small></div><div className="search-product-results">{productMatches.map(product => <button key={product.slug} onClick={() => onProduct(product)}><span className="search-result-thumb">{product.image ? <img src={product.image} alt=""/> : "P"}</span><span className="search-result-copy"><b>{product.name}</b><small>{money(product.price)}</small></span><ArrowLeft size={15}/></button>)}</div></div>}
          </div>
        ) : <EmptyState icon="search" title="نتیجه‌ای پیدا نشد" description="عبارت دیگری امتحان کن یا از دسته‌بندی‌ها وارد شو." action="مشاهده همه دسته‌ها" onAction={() => onCategory("all")}/>} 
        {!!normalized && !!productMatches.length && <button className="button button-light search-all-results" onClick={onResults}>مشاهده همه نتایج<ArrowLeft size={17}/></button>}
      </section>
    </div>
  );
}
