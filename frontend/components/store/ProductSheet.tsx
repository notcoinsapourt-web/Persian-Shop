"use client";

import { Check, Clock3, Heart, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { StoreCategory, StoreProduct } from "../../lib/store-data";
import { InfoBadge, TrustPoint } from "./shared";
import { money } from "./utils";

export default function ProductSheet({ product, categories, favorite, onClose, onFavorite, onAdd }: {
  product: StoreProduct | null;
  categories: StoreCategory[];
  favorite: boolean;
  onClose: () => void;
  onFavorite: (slug: string) => void;
  onAdd: (product: StoreProduct, qty: number, input: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (product) {
      setQty(1);
      setInput("");
      document.body.classList.add("overlay-open");
    } else document.body.classList.remove("overlay-open");
    return () => document.body.classList.remove("overlay-open");
  }, [product]);

  if (!product) return null;
  const category = categories.find(item => item.id === product.category);
  const deliveryLabel = product.category === "ai" || product.category === "digital" ? "تحویل پس از بررسی سفارش" : "شروع پردازش پس از ثبت سفارش";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    onAdd(product, qty, input.trim());
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="product-sheet" role="dialog" aria-modal="true" aria-label={product.name} onSubmit={submit} onMouseDown={event => event.stopPropagation()}>
        <div className="sheet-handle"/>
        <button className="sheet-close" type="button" onClick={onClose} aria-label="بستن"><X size={22}/></button>

        <div className="product-sheet-media">
          {product.image ? <img src={product.image} alt={product.name}/> : <div className="product-image-fallback large">P</div>}
          <button type="button" className={`product-sheet-heart ${favorite ? "is-active" : ""}`} onClick={() => onFavorite(product.slug)} aria-label="علاقه‌مندی"><Heart size={21} fill={favorite ? "currentColor" : "none"}/></button>
        </div>

        <div className="product-sheet-content">
          <div className="product-breadcrumb"><span>فروشگاه</span><span>/</span><span>{category?.name || "محصول"}</span><span>/</span><b>{product.name}</b></div>
          <h2>{product.name}</h2>
          <div className="product-detail-status"><span className="availability-dot"/>قابل سفارش</div>
          <div className="product-sheet-price">{money(product.price)}</div>

          <div className="product-trust-row"><InfoBadge>قیمت نهایی مشخص</InfoBadge><InfoBadge>پیگیری از حساب کاربری</InfoBadge></div>

          <div className="product-service-facts">
            <span><Clock3 size={19}/><span><small>زمان شروع</small><b>{deliveryLabel}</b></span></span>
            <span><PackageCheck size={19}/><span><small>نوع تحویل</small><b>دیجیتال و قابل پیگیری</b></span></span>
          </div>

          {product.description && <section className="product-description"><h3>درباره این محصول</h3><p>{product.description}</p></section>}

          <label className="order-input-block">
            <span><b>اطلاعات موردنیاز سفارش</b><small>{product.inputPrompt}</small></span>
            <textarea required value={input} onChange={event => setInput(event.target.value)} placeholder="اطلاعات خواسته‌شده را وارد کنید..."/>
          </label>

          <div className="product-note"><ShieldCheck size={20}/><p>فقط اطلاعاتی را وارد کن که برای اجرای سرویس لازم است. رمز عبور یا اطلاعات حساس را ارسال نکن.</p></div>

          <section className="product-order-path" aria-label="مراحل سفارش">
            <h3>مسیر سفارش</h3>
            <div><span><Check size={15}/>ثبت اطلاعات</span><i/><span><Check size={15}/>پرداخت از کیف پول</span><i/><span><Check size={15}/>پیگیری در حساب</span></div>
          </section>

          <div className="product-sheet-buybar">
            <div className="qty-control"><button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="کاهش تعداد"><Minus size={17}/></button><b>{qty}</b><button type="button" onClick={() => setQty(qty + 1)} aria-label="افزایش تعداد"><Plus size={17}/></button></div>
            <div className="buy-total"><small>مبلغ نهایی</small><strong>{money(product.price * qty)}</strong></div>
            <button className="button button-primary add-to-cart-button" type="submit"><ShoppingBag size={18}/>افزودن به سبد</button>
          </div>

          <div className="product-sheet-trust"><TrustPoint>قیمت مشخص</TrustPoint><TrustPoint>اطلاعات سفارش اختصاصی</TrustPoint><TrustPoint>پشتیبانی قابل دسترس</TrustPoint></div>
        </div>
      </form>
    </div>
  );
}
