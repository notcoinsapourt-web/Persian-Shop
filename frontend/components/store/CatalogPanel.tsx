"use client";

import { ArrowDownUp, Grid2X2, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import type { StoreCategory, StoreProduct } from "../../lib/store-data";
import ProductCard from "./ProductCard";
import { BrandIcon, EmptyState } from "./shared";
import { normalizeSearch } from "./catalog-state";
import { shortCategory } from "./utils";

export default function CatalogPanel({
  open,
  categories,
  products,
  category,
  query,
  sort,
  favorites,
  onClose,
  onCategory,
  onQuery,
  onSort,
  onFavorite,
  onProduct,
}: {
  open: boolean;
  categories: StoreCategory[];
  products: StoreProduct[];
  category: string;
  query: string;
  sort: "popular" | "low" | "high";
  favorites: string[];
  onClose: () => void;
  onCategory: (id: string) => void;
  onQuery: (value: string) => void;
  onSort: (value: "popular" | "low" | "high") => void;
  onFavorite: (slug: string) => void;
  onProduct: (product: StoreProduct) => void;
}) {
  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    let list = products.filter(product => (category === "favorites" ? favorites.includes(product.slug) : category === "all" || product.category === category) && (!needle || normalizeSearch(`${product.name} ${product.en} ${product.description}`).includes(needle)));
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, category, query, sort, favorites]);

  if (!open) return null;
  const selectedCategory = categories.find(item => item.id === category);

  return (
    <div className="catalog-layer" role="dialog" aria-modal="true" aria-label="دسته‌بندی محصولات">
      <header className="catalog-topbar">
        <div className="page-container catalog-topbar-inner">
          <button className="round-icon-button" onClick={onClose} aria-label="بستن دسته‌بندی"><X size={22}/></button>
          <div className="catalog-topbar-title"><b>دسته‌بندی محصولات</b><small>{products.length} محصول فعال</small></div>
          <span/>
        </div>
      </header>

      <div className="page-container catalog-search-row">
        <label className="catalog-search"><Search size={20}/><input aria-label="جستجو در فهرست محصولات" value={query} onChange={event => onQuery(event.target.value)} placeholder="جستجو در محصولات..."/>{query && <button onClick={() => onQuery("")} aria-label="پاک کردن"><X size={16}/></button>}</label>
      </div>

      <div className="catalog-mobile-categories">
        <button className={category === "all" ? "is-active" : ""} onClick={() => onCategory("all")}><span className="catalog-all-icon"><Grid2X2 size={21}/></span><b>همه</b></button>
        {categories.map(item => <button key={item.id} className={category === item.id ? "is-active" : ""} onClick={() => onCategory(item.id)}><BrandIcon id={item.id} size={38}/><b>{shortCategory(item.name)}</b></button>)}
      </div>

      <div className="page-container catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar-title">دسته‌بندی‌ها</div>
          <button className={category === "all" ? "is-active" : ""} onClick={() => onCategory("all")}><span className="catalog-all-icon"><Grid2X2 size={20}/></span><span><b>همه محصولات</b><small>{products.length} محصول</small></span></button>
          {categories.map(item => <button key={item.id} className={category === item.id ? "is-active" : ""} onClick={() => onCategory(item.id)}><BrandIcon id={item.id} size={39}/><span><b>{shortCategory(item.name)}</b><small>{item.count} محصول</small></span></button>)}
        </aside>

        <main className="catalog-content">
          <div className="catalog-content-header">
            <div><h1>{category === "favorites" ? "علاقه‌مندی‌های من" : selectedCategory?.name || "همه محصولات"}</h1><p>{filtered.length} محصول برای نمایش</p></div>
            <label className="sort-control"><ArrowDownUp size={17}/><span>مرتب‌سازی</span><select value={sort} onChange={event => onSort(event.target.value as "popular" | "low" | "high")}><option value="popular">پیشنهادی</option><option value="low">ارزان‌ترین</option><option value="high">گران‌ترین</option></select></label>
          </div>

          {selectedCategory && <div className="category-intro-card"><BrandIcon id={selectedCategory.id} size={58}/><div><b>{selectedCategory.name}</b><p>{selectedCategory.description || "محصولات فعال این دسته را بررسی و مقایسه کن."}</p></div><span className="category-intro-count">{selectedCategory.count} محصول</span></div>}

          <div className="catalog-filter-summary"><SlidersHorizontal size={16}/><span>{category === "favorites" ? "محصولات ذخیره‌شده" : category === "all" ? "همه دسته‌ها" : shortCategory(selectedCategory?.name || "")}</span>{query && <span>جستجو: «{query}»</span>}</div>

          {filtered.length ? <div className="product-grid catalog-product-grid">{filtered.map(product => <ProductCard key={product.slug} product={product} favorite={favorites.includes(product.slug)} onFavorite={onFavorite} onOpen={onProduct}/>)}</div> : <EmptyState icon="search" title="محصولی پیدا نشد" description="جستجو یا فیلتر دسته‌بندی را تغییر بده." action="پاک کردن فیلترها" onAction={() => { onQuery(""); onCategory("all"); }}/>} 
        </main>
      </div>
    </div>
  );
}
