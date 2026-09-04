"use client";

import { ArrowLeft, BadgeCheck, Headphones, ShieldCheck, Sparkles, WalletCards, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StoreCategory, StoreProduct } from "../../lib/store-data";
import ProductCard from "./ProductCard";
import { BrandIcon, RailArrows, SectionHeading } from "./shared";
import { buildHomePlan, money, shortCategory } from "./utils";

const heroSlides = [
  {
    key: "social",
    eyebrow: "فروشگاه تخصصی خدمات دیجیتال",
    title: "سرویس‌های دیجیتال، مرتب و قابل اعتماد",
    text: "از شبکه‌های اجتماعی تا اشتراک‌های پرمیوم؛ انتخاب سریع، جزئیات شفاف و مسیر خرید ساده در یک فروشگاه.",
    primary: "telegram",
    tone: "yellow",
    chips: ["Telegram", "Instagram", "TikTok"],
  },
  {
    key: "ai",
    eyebrow: "AI Premium Collection",
    title: "ابزارهای هوش مصنوعی برای کار و خلاقیت",
    text: "ChatGPT، Claude و سایر سرویس‌های AI فروشگاه را در یک دسته مستقل و قابل مقایسه پیدا کن.",
    primary: "ai",
    tone: "violet",
    chips: ["ChatGPT", "Claude", "AI Tools"],
  },
  {
    key: "premium",
    eyebrow: "Premium Digital",
    title: "اشتراک‌ها و اکانت‌های پرمیوم بدون شلوغی",
    text: "محصولات دیجیتال منتخب با قیمت مشخص، توضیح واضح و پشتیبانی در دسترس؛ بدون تکرار مصنوعی محصول.",
    primary: "digital",
    tone: "mint",
    chips: ["Premium", "Subscriptions", "Support"],
  },
] as const;

export default function HomeView({
  categories,
  products,
  favorites,
  onFavorite,
  onProduct,
  onCategory,
  onCatalog,
  onWallet,
  onSupport,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  favorites: string[];
  onFavorite: (slug: string) => void;
  onProduct: (product: StoreProduct) => void;
  onCategory: (id: string) => void;
  onCatalog: () => void;
  onWallet: () => void;
  onSupport: () => void;
}) {
  const [slide, setSlide] = useState(0);
  const specialRef = useRef<HTMLDivElement | null>(null);
  const plan = useMemo(() => buildHomePlan(categories, products), [categories, products]);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide(current => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const current = heroSlides[slide];
  const scrollSpecial = (direction: number) => specialRef.current?.scrollBy({ left: direction * 420, behavior: "smooth" });

  return (
    <>
      <section className={`hero hero-${current.tone}`}>
        <div className="page-container hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow"><Sparkles size={16}/>{current.eyebrow}</span>
            <h1>{current.title}</h1>
            <p>{current.text}</p>
            <div className="hero-actions">
              <button className="button button-dark" onClick={() => onCategory(current.primary)}>مشاهده محصولات<ArrowLeft size={18}/></button>
              <button className="button button-light" onClick={onWallet}><WalletCards size={18}/>شارژ کیف پول</button>
            </div>
            <div className="hero-benefits">
              <span><ShieldCheck size={17}/>اطلاعات سفارش شفاف</span>
              <span><Headphones size={17}/>پشتیبانی در دسترس</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual-main"><BrandIcon id={current.primary} size={118}/><b>{shortCategory(categories.find(item => item.id === current.primary)?.name || current.primary)}</b><small>دسته منتخب</small></div>
            <div className="hero-floating-card hero-float-one"><BadgeCheck size={24}/><span><b>{products.length}</b><small>محصول فعال</small></span></div>
            <div className="hero-floating-card hero-float-two"><Zap size={24}/><span><b>۷</b><small>دسته تخصصی</small></span></div>
            <div className="hero-chip-row">{current.chips.map(chip => <span key={chip}>{chip}</span>)}</div>
          </div>

          <div className="hero-pagination">{heroSlides.map((item, index) => <button key={item.key} className={index === slide ? "is-active" : ""} onClick={() => setSlide(index)} aria-label={`اسلاید ${index + 1}`}/>)}</div>
        </div>
      </section>

      <section className="page-container quick-actions-panel">
        {categories.slice(0, 7).map(category => (
          <button key={category.id} onClick={() => onCategory(category.id)}>
            <BrandIcon id={category.id} size={56}/>
            <span><b>{shortCategory(category.name)}</b><small>{category.count} محصول</small></span>
          </button>
        ))}
        <button className="quick-support" onClick={onSupport}>
          <span className="quick-support-icon"><Headphones size={25}/></span>
          <span><b>پشتیبانی</b><small>پیگیری خرید</small></span>
        </button>
      </section>

      {!!plan.featured.length && (
        <section className="page-container special-section">
          <div className="special-head">
            <div className="special-copy"><span className="special-icon"><Zap size={27}/></span><div><h2>منتخب‌های Persian Shop</h2><p>از هر دسته یک انتخاب؛ بدون تکرار مصنوعی محصول</p></div></div>
            <RailArrows onPrev={() => scrollSpecial(1)} onNext={() => scrollSpecial(-1)}/>
          </div>
          <div className="special-rail" ref={specialRef}>
            {plan.featured.map(product => (
              <button key={product.slug} className="special-card" onClick={() => onProduct(product)}>
                <span className="special-product-image">{product.image ? <img src={product.image} alt={product.name}/> : "P"}</span>
                <span className="special-product-copy"><b>{product.name}</b><small>قابل سفارش</small><strong>{money(product.price)}</strong></span>
              </button>
            ))}
            <button className="special-all" onClick={onCatalog}><span>همه محصولات</span><ArrowLeft size={22}/></button>
          </div>
        </section>
      )}

      <section className="page-container campaign-grid">
        <button className="campaign-card campaign-telegram" onClick={() => onCategory("telegram")}><span><small>Social Growth</small><b>خدمات تلگرام</b><p>ممبر، بازدید و تعامل کانال</p><em>مشاهده محصولات<ArrowLeft size={15}/></em></span><BrandIcon id="telegram" size={78}/></button>
        <button className="campaign-card campaign-ai" onClick={() => onCategory("ai")}><span><small>AI Premium</small><b>اشتراک هوش مصنوعی</b><p>ابزارهای حرفه‌ای کار و خلاقیت</p><em>مشاهده محصولات<ArrowLeft size={15}/></em></span><BrandIcon id="ai" size={78}/></button>
        <button className="campaign-card campaign-instagram" onClick={() => onCategory("instagram")}><span><small>Instagram</small><b>رشد اینستاگرام</b><p>فالوور، لایک و بازدید</p><em>مشاهده محصولات<ArrowLeft size={15}/></em></span><BrandIcon id="instagram" size={78}/></button>
        <button className="campaign-card campaign-digital" onClick={() => onCategory("digital")}><span><small>Digital Premium</small><b>اکانت‌های پرمیوم</b><p>اشتراک‌ها و سرویس‌های دیجیتال</p><em>مشاهده محصولات<ArrowLeft size={15}/></em></span><BrandIcon id="digital" size={78}/></button>
      </section>

      <section className="page-container category-showcase">
        <SectionHeading title="خرید بر اساس دسته‌بندی" subtitle="هر دسته هویت مستقل دارد و مستقیماً به محصولات واقعی همان بخش متصل است." action="همه دسته‌ها" onAction={onCatalog}/>
        <div className="category-showcase-grid">
          {categories.map(category => (
            <button key={category.id} onClick={() => onCategory(category.id)}>
              <BrandIcon id={category.id} size={66}/>
              <b>{category.name}</b>
              <small>{category.count} محصول فعال</small>
            </button>
          ))}
        </div>
      </section>

      {plan.rails.map((rail, index) => (
        <section key={rail.category.id} className="page-container product-rail-section">
          <SectionHeading title={rail.category.name} subtitle={rail.category.description || "محصولات منتخب این دسته"} action="مشاهده همه" onAction={() => onCategory(rail.category.id)}/>
          <div className="product-grid product-grid-home">
            {rail.items.map(product => <ProductCard key={product.slug} product={product} favorite={favorites.includes(product.slug)} onFavorite={onFavorite} onOpen={onProduct}/>) }
          </div>
          {index === 0 && <div className="wallet-promo"><span className="wallet-promo-icon"><WalletCards size={29}/></span><div><b>کیف پول Persian Shop</b><p>مبلغ را مشخص کن، روش پرداخت را انتخاب کن و رسید را برای تأیید ارسال کن.</p></div><button className="button button-primary" onClick={onWallet}>افزایش موجودی</button></div>}
        </section>
      ))}

      <section className="page-container editorial-guide-grid">
        <article><span><ShieldCheck size={26}/></span><div><b>خرید با اطلاعات روشن</b><p>قبل از سفارش دقیقاً می‌بینی چه اطلاعاتی برای انجام همان سرویس لازم است.</p></div></article>
        <article><span><WalletCards size={26}/></span><div><b>پرداخت مرحله‌ای</b><p>کارت‌به‌کارت و USDT فقط در صورت فعال بودن در مدیریت نمایش داده می‌شوند.</p></div></article>
        <article><span><Headphones size={26}/></span><div><b>پشتیبانی قابل دسترس</b><p>در هر مرحله از خرید، مسیر ارتباط با پشتیبانی در دسترس باقی می‌ماند.</p></div></article>
      </section>

      <section className="page-container faq-section">
        <SectionHeading title="سؤالات متداول" subtitle="پاسخ کوتاه به مراحل اصلی خرید و پرداخت"/>
        <div className="faq-list">
          <details><summary>بعد از انتخاب محصول چه اطلاعاتی لازم است؟</summary><p>داخل صفحه هر محصول، اطلاعات موردنیاز همان سرویس نمایش داده می‌شود؛ مانند لینک عمومی، نام کاربری یا ایمیل.</p></details>
          <details><summary>کیف پول چگونه شارژ می‌شود؟</summary><p>مبلغ را انتخاب می‌کنی، روش پرداخت فعال فروشگاه را می‌بینی و بعد از پرداخت، رسید را برای بررسی ارسال می‌کنی.</p></details>
          <details><summary>اگر محصول موردنظر را پیدا نکنم چه کار کنم؟</summary><p>از جستجو، دسته‌بندی‌ها یا بخش پشتیبانی استفاده کن. محصولات غیرفعال عمداً در فروشگاه نمایش داده نمی‌شوند.</p></details>
        </div>
      </section>
    </>
  );
}
