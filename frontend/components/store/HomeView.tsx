"use client";

import { ArrowLeft, Headphones, ListChecks, ShieldCheck, WalletCards } from "lucide-react";
import { useMemo } from "react";
import type { StoreCategory, StoreProduct } from "../../lib/store-data";
import ProductCard from "./ProductCard";
import { BrandIcon, SectionHeading } from "./shared";
import { buildHomePlan, shortCategory } from "./utils";

export default function HomeView({ categories, products, favorites, isLoggedIn, onFavorite, onProduct, onCategory, onCatalog, onWallet, onAccount, onSupport }: {
  categories: StoreCategory[]; products: StoreProduct[]; favorites: string[]; isLoggedIn: boolean;
  onFavorite: (slug: string) => void; onProduct: (product: StoreProduct) => void;
  onCategory: (id: string) => void; onCatalog: () => void; onWallet: () => void; onAccount: () => void; onSupport: () => void;
}) {
  const featured = useMemo(() => buildHomePlan(categories, products).featured.slice(0, 5), [categories, products]);
  const aiProducts = products.filter(product => product.category === "ai" && !featured.some(item => item.id === product.id)).slice(0, 5);
  return <div className="shop-home" id="store-content" tabIndex={-1}>
    <section className="shop-hero" aria-labelledby="shop-hero-title">
      <img className="shop-hero-image" src="/images/digital-lifestyle.webp" width={1280} height={853} alt="" fetchPriority="high"/>
      <div className="shop-hero-copy">
        <h1 id="shop-hero-title">دنیای دیجیتال،<br/><em>به انتخاب تو.</em></h1>
        <p>اشتراک‌های محبوب و خدمات آنلاین؛<br/>انتخاب کن، سفارش بده، پیگیری کن.</p>
        <button className="button button-primary" onClick={onCatalog}>کشف محصولات<ArrowLeft size={18}/></button>
      </div>
    </section>

    <section className="shop-benefits" aria-label="راهنمای خرید">
      <span><ListChecks size={23}/><span><b>جزئیات قبل از خرید</b><small>اطلاعات مخصوص هر محصول</small></span></span>
      <span><ShieldCheck size={23}/><span><b>سفارش قابل پیگیری</b><small>از داخل حساب کاربری</small></span></span>
      <span><WalletCards size={23}/><span><b>پرداخت با کیف پول</b><small>شارژ ریالی یا تتر</small></span></span>
      <button onClick={onSupport}><Headphones size={23}/><span><b>ارتباط با پشتیبانی</b><small>راهنمای خرید و سفارش</small></span></button>
    </section>

    <section className="shop-section">
      <SectionHeading title="از کجا شروع کنیم؟" action="همه محصولات" onAction={onCatalog}/>
      <div className="shop-category-row" aria-label="دسته‌بندی محصولات">
        {categories.map(category => <button key={category.id} className={`shop-category category-${category.id}`} onClick={() => onCategory(category.id)}>
          <BrandIcon id={category.id} size={68}/><b>{shortCategory(category.name)}</b><small>{category.count.toLocaleString("fa-IR")} محصول</small>
        </button>)}
      </div>
    </section>

    {!!featured.length && <section className="shop-section">
      <SectionHeading title="انتخاب‌های فروشگاه" action="مشاهده همه" onAction={onCatalog}/>
      <div className="product-grid shop-product-grid">{featured.map(product => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.slug)} onFavorite={onFavorite} onOpen={onProduct}/>)}</div>
    </section>}

    <section className="shop-promotions" aria-label="خرید اشتراک و خدمات">
      <article className="shop-promo promo-ai"><div><small>ابزارهای هوش مصنوعی</small><h2>برای ایده‌های<br/>بزرگ‌تر.</h2><p>ابزار مناسب کار و خلاقیتت را پیدا کن.</p><button onClick={() => onCategory("ai")}>مشاهده اشتراک‌ها<ArrowLeft size={17}/></button></div><BrandIcon id="ai" size={104}/></article>
      <article className="shop-promo promo-digital"><div><small>اشتراک‌های دیجیتال</small><h2>بیشتر گوش کن،<br/>بیشتر لذت ببر.</h2><p>سرویس‌های محبوب، در یک فروشگاه.</p><button onClick={() => onCategory("digital")}>انتخاب اشتراک<ArrowLeft size={17}/></button></div><BrandIcon id="digital" size={104}/></article>
    </section>

    {!!aiProducts.length && <section className="shop-section">
      <SectionHeading title="برای کار و خلاقیت" action="همه ابزارها" onAction={() => onCategory("ai")}/>
      <div className="product-grid shop-product-grid">{aiProducts.map(product => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.slug)} onFavorite={onFavorite} onOpen={onProduct}/>)}</div>
    </section>}

    <section className="shop-help-row">
      <div><h2>خرید اولته؟</h2><p>محصول را انتخاب کن و اطلاعات خواسته‌شده را وارد کن. ادامهٔ سفارش از سبد خرید انجام می‌شود.</p></div>
      <button className="button button-light" onClick={isLoggedIn ? onWallet : onAccount}>{isLoggedIn ? "مشاهده کیف پول" : "ساخت حساب"}<ArrowLeft size={17}/></button>
    </section>

    <section className="faq-section shop-section"><SectionHeading title="قبل از خرید بدان"/><div className="faq-list">
      <details><summary>برای سفارش چه اطلاعاتی لازم است؟</summary><p>داخل صفحهٔ هر محصول، اطلاعات همان سرویس نمایش داده می‌شود؛ مانند لینک عمومی، نام کاربری یا ایمیل.</p></details>
      <details><summary>کیف پول چطور شارژ می‌شود؟</summary><p>پس از ورود، مبلغ را وارد کن، روش پرداخت را انتخاب کن و تصویر رسید را بفرست. موجودی پس از تأیید مدیریت افزایش می‌یابد.</p></details>
      <details><summary>از کجا وضعیت سفارش را ببینم؟</summary><p>سفارش‌های ثبت‌شده و وضعیت آن‌ها در حساب کاربری در دسترس هستند. برای سؤال بیشتر با پشتیبانی ارتباط بگیر.</p></details>
    </div></section>
  </div>;
}
