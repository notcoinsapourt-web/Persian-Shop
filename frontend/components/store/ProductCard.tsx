"use client";

import { Heart, ShoppingBag } from "lucide-react";
import type { StoreProduct } from "../../lib/store-data";
import { money } from "./utils";

export default function ProductCard({ product, favorite, onFavorite, onOpen, compact = false }: {
  product: StoreProduct;
  favorite: boolean;
  onFavorite: (slug: string) => void;
  onOpen: (product: StoreProduct) => void;
  compact?: boolean;
}) {
  const categoryLabel: Record<string, string> = {
    telegram: "تلگرام", instagram: "اینستاگرام", tiktok: "تیک‌تاک", youtube: "یوتیوب", ai: "هوش مصنوعی", digital: "اشتراک دیجیتال", social: "شبکه اجتماعی",
  };
  return (
    <article className={`product-card ${compact ? "product-card-compact" : ""}`}>
      <div className="product-card-media">
        <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`مشاهده ${product.name}`}>
          {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" width={320} height={320} /> : <div className="product-image-fallback">P</div>}
        </button>
        <button className={`favorite-button ${favorite ? "is-active" : ""}`} onClick={() => onFavorite(product.slug)} aria-pressed={favorite} aria-label={favorite ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}>
          <Heart size={18} fill={favorite ? "currentColor" : "none"}/>
        </button>
      </div>
      <div className="product-card-body">
        <small className="product-category-label">{categoryLabel[product.category] || "محصول دیجیتال"}</small>
        <button className="product-card-title" onClick={() => onOpen(product)}>{product.name}</button>
        
        <div className="product-card-footer">
          <strong>{money(product.price)}</strong>
          <button className="product-order-button" onClick={() => onOpen(product)} aria-label={`خرید ${product.name}`}><ShoppingBag size={16}/><span>خرید</span></button>
        </div>
      </div>
    </article>
  );
}
