"use client";

import { ArrowLeft, BadgeCheck, Headphones, PackageCheck, SearchCheck, ShieldCheck, Sparkles, UserRound, WalletCards, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StoreCategory, StoreProduct } from "../../lib/store-data";
import ProductCard from "./ProductCard";
import { BrandIcon, RailArrows, SectionHeading } from "./shared";
import { buildHomePlan, money, shortCategory } from "./utils";

const heroSlides = [
  { key: "social", eyebrow: "فروشگاه تخصصی خدمات دیجیتال", title: "هر سرویس دیجیتال، با مسیر خرید روشن", text: "محصول را انتخاب کن، اطلاعات لازم را ببین و سفارش را از حساب کاربری تا زمان تکمیل پیگیری کن.", primary: "telegram", tone: "yellow", chips: ["Telegram", "Instagram", "TikTok"] },
  { key: "ai", eyebrow: "ابزارهای هوش مصنوعی", title: "اشتراک‌های هوش مصنوعی برای کار و خلاقیت", text: "ChatGPT، Claude و ابزارهای منتخب را با قیمت مشخص و توضیحات شفاف در یک دسته مقایسه کن.", primary: "ai", tone: "violet", chips: ["ChatGPT", "Claude", "AI"] },
  { key: "premium", eyebrow: "اشتراک‌های دیجیتال", title: "خرید مرتب، پرداخت ساده و پیگیری در دسترس", text: "جزئیات هر محصول پیش از خرید مشخص است و وضعیت سفارش پس از ثبت در حساب کاربری نمایش داده می‌شود.", primary: "digital", tone: "mint", chips: ["اشتراک", "اکانت", "پشتیبانی"] },
] as const;

export default function HomeView({ categories, products, favorites, isLoggedIn, onFavorite, onProduct, onCategory, onCatalog, onWallet, onAccount, onSupport }: {
  categories: StoreCategory[];
  products: StoreProduct[];
  favorites: string[];
  isLoggedIn: boolean;
  onFavorite: (slug: string) => void;
  onProduct: (product: StoreProduct) => void;
  onCategory: (id: string) => void;
  onCatalog: () => void;
  onWallet: () => void;
  onAccount: () => void;
  onSupport: () => void;
}) {
  const [slide, setSlide] = useState(0);
  const specialRef = useRef<HTMLDivElement | null>(null);
  const plan = useMemo(() => buildHomePlan(categories, products), [categories, products]);

  useEffect(() => { const timer = window.setInterval(() => setSlide(current => (current + 1) % heroSlides.length), 6500); return () => window.clearInterval(timer); }, []);
  const current = heroSlides[slide];
  const heroProducts = products.filter(product => product.category === current.primary && product.image).slice(0, 3);
  const heroProductCount = categories.find(item => item.id === current.primary)?.count || heroProducts.length;
  const scrollSpecial = (direction: number) => specialRef.current?.scrollBy({ left: direction * 420, behavior: "smooth" });

  return (
    <>
      <section className={`hero hero-cinematic hero-${current.tone}`}>
        <div className="hero-cinematic-backdrop" aria-hidden="true">
          {heroProducts[0]?.image && <img src={heroProducts[0].image} alt=""/>}
          <span/>
        </div>
        <div className="page-container hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow"><Sparkles size={16}/>{current.eyebrow}</span>
            <h1>{current.title}</h1><p>{current.text}</p>
            <div className="hero-actions">
              <button className="button hero-primary-action" onClick={() => onCategory(current.primary)}>خرید از این دسته<ArrowLeft size={18}/></button>
              {isLoggedIn ? <button className="button button-light" onClick={onWallet}><WalletCards size={18}/>افزایش موجودی</button> : <button className="button button-light" onClick={onAccount}><UserRound size={18}/>ورود یا ثبت‌نام</button>}
            </div>
            <div className="hero-benefits"><span><ShieldCheck size={17}/>اطلاعات سفارش شفاف</span><span><Headphones size={17}/>پشتیبانی در دسترس</span></div>
          </div>

          <div className="hero-poster-stage" aria-label={`پوسترهای ${current.eyebrow}`}>
            <div className="hero-poster-stack">
              {heroProducts.map((product, index) => <button key={product.slug} className={`hero-product-poster poster-${index + 1}`} onClick={() => onProduct(product)} aria-label={`مشاهده ${product.name}`}><img src={product.image} alt={product.name}/></button>)}
              {!heroProducts.length && <span className="hero-poster-fallback"><BrandIcon id={current.primary} size={92}/></span>}
            </div>
            <div className="hero-real-stats"><BadgeCheck size={20}/><span><b>{heroProductCount} محصول فعال</b><small>در دسته {shortCategory(categories.find(item => item.id === current.primary)?.name || current.primary)}</small></span></div>
            <div className="hero-chip-row">{current.chips.map(chip => <span key={chip}>{chip}</span>)}</div>
          </div>
          <div className="hero-pagination">{heroSlides.map((item, index) => <button key={item.key} className={index === slide ? "is-active" : ""} onClick={() => setSlide(index)} aria-label={`اسلاید ${index + 1}`}/>)}</div>
        </div>
      </section>

      <section className="page-container quick-actions-panel" aria-label="دسترسی سریع">
        {categories.slice(0, 5).map(category => <button key={category.id} onClick={() => onCategory(category.id)}><BrandIcon id={category.id} size={56}/><span><b>{shortCategory(category.name)}</b><small>{category.count} محصول</small></span></button>)}
        <button className="quick-support" onClick={onSupport}><span className="quick-support-icon"><Headphones size={25}/></span><span><b>پشتیبانی</b><small>پیگیری خرید</small></span></button>
      </section>

      {!!plan.featured.length && <section className="page-container special-section">
        <div className="special-head"><div className="special-copy"><span className="special-icon"><Zap size={27}/></span><div><h2>منتخب‌های Persian Shop</h2><p>از هر دسته یک انتخاب؛ بدون تکرار مصنوعی محصول</p></div></div><RailArrows onPrev={() => scrollSpecial(1)} onNext={() => scrollSpecial(-1)}/></div>
        <div className="special-rail" ref={specialRef}>{plan.featured.map(product => <button key={product.slug} className="special-card" onClick={() => onProduct(product)}><span className="special-product-image">{product.image ? <img src={product.image} alt={product.name}/> : "P"}</span><span className="special-product-copy"><b>{product.name}</b><small>قابل سفارش</small><strong>{money(product.price)}</strong></span></button>)}<button className="special-all" onClick={onCatalog}><span>همه محصولات</span><ArrowLeft size={22}/></button></div>
      </section>}

      <section className="page-container commerce-category-section">
        <SectionHeading title="خرید بر اساس دسته‌بندی" subtitle="سرویس موردنظر را انتخاب کن و محصولات فعال همان بخش را ببین." action="همه محصولات" onAction={onCatalog}/>
        <div className="commerce-category-grid">
          {categories.map((category, index) => <button key={category.id} className={`commerce-category-card commerce-category-${category.id} ${index < 2 ? "is-featured" : ""}`} onClick={() => onCategory(category.id)}>
            <span><small>{category.en}</small><b>{category.name}</b><p>{category.description || `${category.count} محصول فعال و قابل سفارش`}</p><em>مشاهده {category.count} محصول<ArrowLeft size={16}/></em></span>
            <BrandIcon id={category.id} size={index < 2 ? 84 : 64}/>
          </button>)}
        </div>
      </section>

      {plan.rails.map((rail, index) => <section key={rail.category.id} className="page-container product-rail-section">
        <SectionHeading title={rail.category.name} subtitle={rail.category.description || "محصولات منتخب این دسته"} action="مشاهده همه" onAction={() => onCategory(rail.category.id)}/>
        <div className="product-grid product-grid-home">{rail.items.map(product => <ProductCard key={product.slug} product={product} favorite={favorites.includes(product.slug)} onFavorite={onFavorite} onOpen={onProduct}/>)}</div>
        {index === 0 && isLoggedIn && <div className="wallet-promo"><span className="wallet-promo-icon"><WalletCards size={29}/></span><div><b>کیف پول Persian Shop</b><p>مبلغ را مشخص کنید، روش پرداخت را انتخاب کنید و رسید را برای تأیید مدیریت ارسال کنید.</p></div><button className="button button-primary" onClick={onWallet}>افزایش موجودی</button></div>}
      </section>)}

      <section className="page-container editorial-guide-grid" aria-label="مزیت‌های فروشگاه">
        <article><span><SearchCheck size={26}/></span><div><b>اطلاعات روشن پیش از خرید</b><p>قیمت و اطلاعات موردنیاز هر سرویس را قبل از ثبت سفارش می‌بینی.</p></div></article>
        <article><span><PackageCheck size={26}/></span><div><b>سفارش قابل پیگیری</b><p>وضعیت سفارش‌های ثبت‌شده از داخل حساب کاربری در دسترس است.</p></div></article>
        <article><span><Headphones size={26}/></span><div><b>پشتیبانی در مسیر خرید</b><p>برای پرداخت و پیگیری سفارش می‌توانی مستقیماً با پشتیبانی ارتباط بگیری.</p></div></article>
      </section>

      <section className="page-container faq-section"><SectionHeading title="سؤالات متداول" subtitle="پاسخ کوتاه به مراحل اصلی خرید و پرداخت"/><div className="faq-list"><details><summary>بعد از انتخاب محصول چه اطلاعاتی لازم است؟</summary><p>داخل صفحه هر محصول، اطلاعات موردنیاز همان سرویس نمایش داده می‌شود؛ مانند لینک عمومی، نام کاربری یا ایمیل.</p></details>{isLoggedIn && <details><summary>کیف پول چگونه شارژ می‌شود؟</summary><p>مبلغ را انتخاب می‌کنید، روش پرداخت فعال فروشگاه را می‌بینید و رسید مستقیماً برای بررسی مدیریت ثبت می‌شود.</p></details>}<details><summary>اگر محصول موردنظر را پیدا نکنم چه کار کنم؟</summary><p>از جستجو، دسته‌بندی‌ها یا بخش پشتیبانی استفاده کنید. محصولات غیرفعال عمداً در فروشگاه نمایش داده نمی‌شوند.</p></details></div></section>
    </>
  );
}
