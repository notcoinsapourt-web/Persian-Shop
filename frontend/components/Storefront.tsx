"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { StoreCategory, StoreData, StoreProduct } from "../lib/store-data";

type CartLine = { product: StoreProduct; qty: number; input: string };
type Profile = { name: string; mobile: string };
type LocalOrder = { ref: string; total: number; count: number; createdAt: string };
type WalletMethod = "card" | "crypto";
type IconName =
  | "home" | "grid" | "search" | "user" | "cart" | "wallet" | "headset"
  | "heart" | "chevron" | "menu" | "shield" | "bolt" | "copy" | "trash"
  | "plus" | "minus" | "close" | "check" | "orders" | "edit" | "clock";

const money = (n: number) => new Intl.NumberFormat("fa-IR").format(Math.max(0, Math.round(n))) + " تومان";

const faToEn = (value: string) =>
  value
    .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const parseAmount = (value: string) => Number(faToEn(value).replace(/\D/g, "")) || 0;

const cardFormat = (value: string) =>
  faToEn(value).replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

const cleanTelegramText = (value: string) =>
  String(value || "")
    .replace(/<tg-emoji[^>]*>/gi, "")
    .replace(/<\/tg-emoji>/gi, "")
    .replace(/&lt;tg-emoji[^&]*&gt;/gi, "")
    .replace(/&lt;\/tg-emoji&gt;/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const brandColor = (id: string) => ({
  telegram: "#229ED9",
  instagram: "#E4405F",
  tiktok: "#111111",
  youtube: "#FF0033",
  ai: "#5B5BD6",
  digital: "#EAA514",
  social: "#0EA5E9",
}[id] || "#E4B415");

export default function Storefront({ data }: { data: StoreData }) {
  const { categories, products, settings } = data;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"popular" | "low" | "high">("popular");
  const [catalogOpen, setCatalogOpen] = useState(false);

  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [qty, setQty] = useState(1);
  const [input, setInput] = useState("");

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [profile, setProfile] = useState<Profile>({ name: "", mobile: "" });
  const [accountOpen, setAccountOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  const [walletOpen, setWalletOpen] = useState(false);
  const [walletStep, setWalletStep] = useState<1 | 2 | 3>(1);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletMethod, setWalletMethod] = useState<WalletMethod>("card");

  const [supportOpen, setSupportOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [hero, setHero] = useState(0);

  useEffect(() => {
    try {
      const c = localStorage.getItem("persian-shop-cart");
      if (c) setCart(JSON.parse(c));
      const p = localStorage.getItem("persian-shop-profile");
      if (p) setProfile(JSON.parse(p));
      const f = localStorage.getItem("persian-shop-favs");
      if (f) setFavorites(JSON.parse(f));
      const o = localStorage.getItem("persian-shop-orders");
      if (o) setOrders(JSON.parse(o));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("persian-shop-cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem("persian-shop-favs", JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem("persian-shop-orders", JSON.stringify(orders)); } catch {}
  }, [orders]);

  useEffect(() => {
    const id = window.setInterval(() => setHero(v => (v + 1) % 3), 5600);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (category === "all" || p.category === category) &&
      (!query || `${p.name} ${p.en} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, category, query, sort]);

  const homePlan = useMemo(() => {
    const used = new Set<string>();
    const featured: StoreProduct[] = [];

    for (const c of categories) {
      const p = products.find(x => x.category === c.id && !used.has(x.slug));
      if (p) {
        featured.push(p);
        used.add(p.slug);
      }
    }

    const rails: { category: StoreCategory; items: StoreProduct[] }[] = [];
    for (const c of categories) {
      const items = products.filter(p => p.category === c.id && !used.has(p.slug)).slice(0, 4);
      items.forEach(p => used.add(p.slug));
      if (items.length >= 2) rails.push({ category: c, items });
      if (rails.length === 4) break;
    }

    return { featured: featured.slice(0, 7), rails };
  }, [categories, products]);

  const heroSlides = [
    {
      eyebrow: "فروشگاه تخصصی خدمات دیجیتال",
      title: "سرویس‌های دیجیتال، مرتب و قابل اعتماد",
      text: "از شبکه‌های اجتماعی تا اشتراک‌های پرمیوم؛ انتخاب سریع، اطلاعات شفاف و پشتیبانی در یک مسیر ساده.",
      tone: "hero-yellow",
      cat: "telegram",
      chips: ["تلگرام", "اینستاگرام", "TikTok"],
    },
    {
      eyebrow: "AI Premium Collection",
      title: "اشتراک ابزارهای هوش مصنوعی",
      text: "محصولات فعال AI فروشگاه در یک دسته مستقل با جزئیات سفارش مشخص و دسترسی سریع.",
      tone: "hero-lilac",
      cat: "ai",
      chips: ["ChatGPT", "Claude", "AI Tools"],
    },
    {
      eyebrow: "Premium Digital",
      title: "اکانت‌ها و سرویس‌های پرمیوم",
      text: "محصولات دیجیتال منتخب، بدون شلوغی و تکرار؛ هر سرویس فقط در جای مناسب خودش نمایش داده می‌شود.",
      tone: "hero-mint",
      cat: "digital",
      chips: ["Premium", "Subscription", "Support"],
    },
  ];

  const currentHero = heroSlides[hero] || heroSlides[0];

  const cartCount = cart.reduce((sum, x) => sum + x.qty, 0);
  const cartTotal = cart.reduce((sum, x) => sum + x.product.price * x.qty, 0);
  const walletAmountNumber = parseAmount(walletAmount);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1900);
  };

  const openProduct = (product: StoreProduct) => {
    setSelected(product);
    setQty(1);
    setInput("");
  };

  const addToCart = (e?: FormEvent) => {
    e?.preventDefault();
    if (!selected) return;

    setCart(current => {
      const index = current.findIndex(x => x.product.slug === selected.slug && x.input === input);
      if (index < 0) return [...current, { product: selected, qty, input }];
      const copy = [...current];
      copy[index] = { ...copy[index], qty: copy[index].qty + qty };
      return copy;
    });

    setSelected(null);
    notify("به سبد خرید اضافه شد");
  };

  const toggleFav = (slug: string) =>
    setFavorites(current =>
      current.includes(slug) ? current.filter(x => x !== slug) : [...current, slug]
    );

  const openCatalog = (id = "all") => {
    setCategory(id);
    setCatalogOpen(true);
  };

  const launchWallet = () => {
    setWalletOpen(true);
    setWalletStep(1);
  };

  const openSupport = () => {
    const username = settings.supportUsername?.replace(/^@/, "");
    if (username) window.open(`https://t.me/${username}`, "_blank");
    else setSupportOpen(true);
  };

  const copyText = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      notify(`${label} کپی شد`);
    } catch {
      notify("کپی خودکار در این مرورگر در دسترس نیست");
    }
  };

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    const cleanedMobile = faToEn(profile.mobile).replace(/\D/g, "");
    if (profile.name.trim().length < 2 || cleanedMobile.length < 10) {
      notify("نام و شماره موبایل را کامل وارد کنید");
      return;
    }
    const next = { name: profile.name.trim(), mobile: cleanedMobile };
    setProfile(next);
    try { localStorage.setItem("persian-shop-profile", JSON.stringify(next)); } catch {}
    setEditingProfile(false);
    notify("اطلاعات حساب ذخیره شد");
  };

  const updateCartQty = (index: number, delta: number) =>
    setCart(current =>
      current.flatMap((x, i) =>
        i === index ? (x.qty + delta > 0 ? [{ ...x, qty: x.qty + delta }] : []) : [x]
      )
    );

  const finishCheckout = () => {
    if (!cart.length) return;
    const order: LocalOrder = {
      ref: `PS-${Date.now().toString().slice(-8)}`,
      total: cartTotal,
      count: cartCount,
      createdAt: new Date().toISOString(),
    };
    setOrders(current => [order, ...current].slice(0, 12));
    setCart([]);
    setCartOpen(false);
    setAccountOpen(true);
    notify("درخواست خرید در حساب ذخیره شد");
  };

  const chooseWalletMethod = (method: WalletMethod) => {
    setWalletMethod(method);
    setWalletStep(3);
  };

  return (
    <main className="shop">
      <div className="topCampaign">
        <div className="container">
          <span><Icon name="bolt" size={15} /> خرید سریع سرویس‌های دیجیتال</span>
          <button onClick={launchWallet}>افزایش موجودی</button>
        </div>
      </div>

      <header className="header">
        <div className="container headerMain">
          <button className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="logoMark">P</span>
            <span><b>{settings.shopName}</b><small>Digital Marketplace</small></span>
          </button>

          <label className="searchBox">
            <Icon name="search" size={20} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") openCatalog("all"); }}
              placeholder="جستجو در محصولات Persian Shop"
            />
            {query && <button type="button" onClick={() => setQuery("")}><Icon name="close" size={17} /></button>}
          </label>

          <div className="headActions">
            <button onClick={() => setAccountOpen(true)} className="headAction">
              <Icon name="user" size={21} />
              <span>{profile.name || "حساب کاربری"}</span>
            </button>
            <button onClick={() => setCartOpen(true)} className="headIcon" aria-label="سبد خرید">
              <Icon name="cart" size={24} />
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
          </div>
        </div>

        <div className="container navRow">
          <button className="navStrong" onClick={() => openCatalog("all")}><Icon name="menu" size={17} /> دسته‌بندی محصولات</button>
          {categories.slice(0, 5).map(c => <button key={c.id} onClick={() => openCatalog(c.id)}>{c.name}</button>)}
          <span />
          <button onClick={launchWallet}><Icon name="wallet" size={16} /> کیف پول</button>
          <button onClick={openSupport}><Icon name="headset" size={16} /> پشتیبانی</button>
        </div>
      </header>

      <section className="container quickCategories">
        {categories.slice(0, 7).map(c => (
          <button key={c.id} onClick={() => openCatalog(c.id)}>
            <BrandGlyph id={c.id} size={54} />
            <b>{shortCategory(c.name)}</b>
          </button>
        ))}
        <button onClick={openSupport}>
          <span className="supportGlyph"><Icon name="headset" size={25} /></span>
          <b>پشتیبانی</b>
        </button>
      </section>

      <section className={`container hero ${currentHero.tone}`}>
        <div className="heroCopy">
          <small>{currentHero.eyebrow}</small>
          <h1>{currentHero.title}</h1>
          <p>{currentHero.text}</p>
          <div className="heroActions">
            <button className="primaryDark" onClick={() => openCatalog(currentHero.cat)}>مشاهده محصولات <Icon name="chevron" size={15} /></button>
            <button className="secondaryLight" onClick={launchWallet}>شارژ کیف پول</button>
          </div>
        </div>

        <div className="heroVisual">
          <div className="heroOrb orbOne"><BrandGlyph id={currentHero.cat} size={74} /></div>
          <div className="heroOrb orbTwo"><Icon name="shield" size={32} /></div>
          <div className="heroChips">
            {currentHero.chips.map(chip => <span key={chip}>{chip}</span>)}
          </div>
        </div>

        <div className="heroDots">
          {heroSlides.map((_, i) => <button key={i} className={hero === i ? "on" : ""} onClick={() => setHero(i)} />)}
        </div>
      </section>

      {!!homePlan.featured.length && (
        <section className="container specialShelf">
          <div className="specialLead">
            <span><Icon name="bolt" size={28} /></span>
            <h2>پیشنهادهای منتخب</h2>
            <p>از هر دسته فقط یک انتخاب؛ بدون تکرار مصنوعی محصول</p>
            <button onClick={() => openCatalog("all")}>مشاهده همه <Icon name="chevron" size={14} /></button>
          </div>
          <div className="specialRail">
            {homePlan.featured.map(p => <MiniProduct key={p.slug} product={p} onOpen={openProduct} />)}
          </div>
        </section>
      )}

      <section className="container campaignGrid">
        <Campaign id="telegram" title="خدمات تلگرام" text="ممبر، بازدید و تعامل" onClick={() => openCatalog("telegram")} />
        <Campaign id="ai" title="AI Premium" text="اشتراک ابزارهای هوش مصنوعی" onClick={() => openCatalog("ai")} />
        <Campaign id="instagram" title="رشد اینستاگرام" text="فالوور، لایک و بازدید" onClick={() => openCatalog("instagram")} />
        <Campaign id="digital" title="Premium Accounts" text="اکانت و اشتراک دیجیتال" onClick={() => openCatalog("digital")} />
      </section>

      <section className="container categorySection">
        <div className="sectionHeading">
          <div><h2>خرید بر اساس دسته‌بندی</h2><p>هر دسته هویت مستقل دارد؛ پوستر محصول جای آیکون دسته‌بندی استفاده نمی‌شود.</p></div>
          <button onClick={() => openCatalog("all")}>همه دسته‌ها <Icon name="chevron" size={14} /></button>
        </div>

        <div className="categoryGrid">
          {categories.map(c => (
            <button key={c.id} onClick={() => openCatalog(c.id)}>
              <BrandGlyph id={c.id} size={66} />
              <b>{c.name}</b>
              <small>{c.count} محصول فعال</small>
            </button>
          ))}
        </div>
      </section>

      {homePlan.rails.map((rail, index) => (
        <section className="container editorialBlock" key={rail.category.id}>
          <div className="editorialTop">
            <div>
              <span className="editorialBrand"><BrandGlyph id={rail.category.id} size={38} /></span>
              <div><h2>{rail.category.name}</h2><p>{rail.category.description || "محصولات منتخب این دسته"}</p></div>
            </div>
            <button onClick={() => openCatalog(rail.category.id)}>مشاهده همه <Icon name="chevron" size={14} /></button>
          </div>
          <div className="editorialProducts">
            {rail.items.map(p => (
              <ProductCard key={p.slug} product={p} favorite={favorites.includes(p.slug)} onFav={toggleFav} onOpen={openProduct} />
            ))}
          </div>
          {index === 1 && (
            <div className="inlineWalletBanner">
              <div><Icon name="wallet" size={25} /><span><b>کیف پول Persian Shop</b><small>مبلغ را وارد کن، روش پرداخت را انتخاب کن، سپس رسید را برای تأیید ارسال کن.</small></span></div>
              <button onClick={launchWallet}>افزایش موجودی</button>
            </div>
          )}
        </section>
      ))}

      <section className="container trustStrip">
        <article><Icon name="shield" size={26} /><span><b>خرید شفاف</b><small>اطلاعات لازم هر محصول مشخص است</small></span></article>
        <article><Icon name="wallet" size={26} /><span><b>پرداخت مرحله‌ای</b><small>کارت‌به‌کارت یا USDT</small></span></article>
        <article><Icon name="headset" size={26} /><span><b>پشتیبانی سفارش</b><small>پیگیری از پشتیبانی فروشگاه</small></span></article>
        <article><Icon name="grid" size={26} /><span><b>دسته‌بندی واقعی</b><small>محصولات مرتب و قابل جستجو</small></span></article>
      </section>

      <section className="container faq">
        <div className="sectionHeading"><div><h2>سؤالات متداول</h2><p>پاسخ کوتاه به مراحل خرید و پرداخت</p></div></div>
        <details><summary>بعد از انتخاب محصول چه اطلاعاتی لازم است؟</summary><p>در صفحه هر محصول، نوع اطلاعات لازم برای همان سرویس نمایش داده می‌شود. اطلاعات غیرضروری درخواست نمی‌شود.</p></details>
        <details><summary>شارژ کیف پول چگونه انجام می‌شود؟</summary><p>ابتدا مبلغ را وارد می‌کنی، روش پرداخت را انتخاب می‌کنی، سپس مشخصات پرداخت و مرحله ارسال رسید نمایش داده می‌شود.</p></details>
        <details><summary>چطور وضعیت خرید را پیگیری کنم؟</summary><p>شناسه درخواست در حساب کاربری نگهداری می‌شود و برای پیگیری می‌توانی از بخش پشتیبانی استفاده کنی.</p></details>
      </section>

      <footer className="footer">
        <div className="container footerGrid">
          <div className="footerBrand">
            <div className="logo"><span className="logoMark">P</span><span><b>{settings.shopName}</b><small>Digital Marketplace</small></span></div>
            <p>فروشگاه خدمات دیجیتال با دسته‌بندی شفاف، پرداخت مرحله‌ای و پشتیبانی سفارش.</p>
          </div>
          <div><b>فروشگاه</b><button onClick={() => openCatalog("all")}>همه محصولات</button><button onClick={launchWallet}>کیف پول</button><button onClick={() => setAccountOpen(true)}>حساب کاربری</button></div>
          <div><b>پشتیبانی</b><button onClick={openSupport}>ارتباط با پشتیبانی</button><button onClick={() => document.querySelector(".faq")?.scrollIntoView({ behavior: "smooth" })}>سؤالات متداول</button></div>
        </div>
        <div className="container copyright">© 2026 Persian Shop</div>
      </footer>

      <nav className="mobileBottom">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Icon name="home" size={23} /><span>خانه</span></button>
        <button onClick={() => openCatalog("all")}><Icon name="grid" size={23} /><span>دسته‌بندی</span></button>
        <button className="mobileCart" onClick={() => setCartOpen(true)}><i><Icon name="cart" size={25} />{cartCount > 0 && <b>{cartCount}</b>}</i><span>سبد خرید</span></button>
        <button onClick={launchWallet}><Icon name="wallet" size={23} /><span>کیف پول</span></button>
        <button onClick={() => setAccountOpen(true)}><Icon name="user" size={23} /><span>حساب من</span></button>
      </nav>

      {catalogOpen && (
        <div className="catalogLayer">
          <div className="catalogHeader">
            <button onClick={() => setCatalogOpen(false)}><Icon name="close" size={22} /></button>
            <div><b>دسته‌بندی محصولات</b><small>{products.length} محصول فعال</small></div>
            <span />
          </div>

          <div className="catalogSearch">
            <Icon name="search" size={19} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو در محصولات..." />
          </div>

          <div className="catalogBody">
            <aside className="catalogSidebar">
              <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>
                <span className="allCatIcon"><Icon name="grid" size={21} /></span><b>همه</b>
              </button>
              {categories.map(c => (
                <button key={c.id} className={category === c.id ? "active" : ""} onClick={() => setCategory(c.id)}>
                  <BrandGlyph id={c.id} size={36} /><b>{shortCategory(c.name)}</b>
                </button>
              ))}
            </aside>

            <section className="catalogContent">
              <div className="catalogTitle">
                <div><h2>{category === "all" ? "همه محصولات" : categories.find(c => c.id === category)?.name}</h2><p>{filtered.length} محصول</p></div>
                <label><Icon name="grid" size={15} /><select value={sort} onChange={e => setSort(e.target.value as "popular" | "low" | "high")}><option value="popular">پیشنهادی</option><option value="low">ارزان‌ترین</option><option value="high">گران‌ترین</option></select></label>
              </div>

              {category !== "all" && (
                <div className="categoryIntro">
                  <BrandGlyph id={category} size={54} />
                  <div><b>{categories.find(c => c.id === category)?.name}</b><p>{categories.find(c => c.id === category)?.description || "محصولات فعال این دسته را انتخاب و بررسی کن."}</p></div>
                </div>
              )}

              {filtered.length ? (
                <div className="catalogGrid">
                  {filtered.map(p => <ProductCard key={p.slug} product={p} favorite={favorites.includes(p.slug)} onFav={toggleFav} onOpen={openProduct} />)}
                </div>
              ) : (
                <div className="emptyState"><Icon name="search" size={34} /><b>محصولی پیدا نشد</b><button onClick={() => { setQuery(""); setCategory("all"); }}>پاک کردن فیلترها</button></div>
              )}
            </section>
          </div>
        </div>
      )}

      {selected && (
        <div className="overlay" onMouseDown={() => setSelected(null)}>
          <form className="productSheet" onSubmit={addToCart} onMouseDown={e => e.stopPropagation()}>
            <button className="sheetClose" type="button" onClick={() => setSelected(null)}><Icon name="close" size={21} /></button>
            <div className="productMedia">
              <img src={selected.image} alt={selected.name} />
              <button type="button" className={favorites.includes(selected.slug) ? "heart active" : "heart"} onClick={() => toggleFav(selected.slug)}><Icon name="heart" size={20} /></button>
            </div>
            <div className="productInfo">
              <small>{categories.find(c => c.id === selected.category)?.name}</small>
              <h2>{selected.name}</h2>
              <p>{selected.description || "جزئیات این محصول از کاتالوگ اصلی Persian Shop دریافت می‌شود."}</p>
              <div className="productPoints"><span><Icon name="shield" size={15} /> سفارش امن</span><span><Icon name="headset" size={15} /> پشتیبانی</span></div>
              <label className="orderInputLabel"><b>اطلاعات سفارش</b><small>{selected.inputPrompt}</small><textarea required value={input} onChange={e => setInput(e.target.value)} placeholder="اطلاعات خواسته‌شده را وارد کنید..." /></label>
              <div className="productBuyBar">
                <div className="qtyBox"><button type="button" onClick={() => setQty(Math.max(1, qty - 1))}><Icon name="minus" size={16} /></button><b>{qty}</b><button type="button" onClick={() => setQty(qty + 1)}><Icon name="plus" size={16} /></button></div>
                <div className="buyPrice"><small>مبلغ</small><b>{money(selected.price * qty)}</b></div>
                <button className="addButton" type="submit">افزودن به سبد</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {cartOpen && (
        <>
          <div className="drawerBack" onClick={() => setCartOpen(false)} />
          <aside className="cartDrawer">
            <div className="drawerHeader"><div><b>سبد خرید</b><small>{cartCount} آیتم</small></div><button onClick={() => setCartOpen(false)}><Icon name="close" size={21} /></button></div>
            <div className="cartList">
              {cart.length ? cart.map((line, i) => (
                <article className="cartLine" key={`${line.product.slug}-${i}`}>
                  <img src={line.product.image} alt={line.product.name} />
                  <div><b>{line.product.name}</b><small>{line.input || "اطلاعات سفارش ثبت شده"}</small><strong>{money(line.product.price * line.qty)}</strong></div>
                  <div className="cartQty"><button onClick={() => updateCartQty(i, 1)}><Icon name="plus" size={14} /></button><b>{line.qty}</b><button onClick={() => updateCartQty(i, -1)}>{line.qty === 1 ? <Icon name="trash" size={14} /> : <Icon name="minus" size={14} />}</button></div>
                </article>
              )) : <div className="emptyState"><Icon name="cart" size={36} /><b>سبد خرید خالی است</b><button onClick={() => { setCartOpen(false); openCatalog("all"); }}>مشاهده محصولات</button></div>}
            </div>
            {!!cart.length && <div className="cartSummary"><div><span>مبلغ کل</span><b>{money(cartTotal)}</b></div><button onClick={finishCheckout}>ثبت درخواست خرید</button></div>}
          </aside>
        </>
      )}

      {walletOpen && (
        <div className="overlay" onMouseDown={() => setWalletOpen(false)}>
          <section className="accountSheet walletSheet" onMouseDown={e => e.stopPropagation()}>
            <button className="sheetClose" onClick={() => setWalletOpen(false)}><Icon name="close" size={21} /></button>
            <div className="sheetHero"><span className="sheetIcon"><Icon name="wallet" size={25} /></span><div><h2>افزایش موجودی کیف پول</h2><p>شارژ کیف پول در سه مرحله انجام می‌شود.</p></div></div>
            <div className="steps">{[1, 2, 3].map(step => <span key={step} className={walletStep >= step ? "active" : ""}><i>{walletStep > step ? <Icon name="check" size={13} /> : step}</i><b>{step === 1 ? "مبلغ" : step === 2 ? "روش پرداخت" : "ارسال رسید"}</b></span>)}</div>

            {walletStep === 1 && (
              <div className="walletStage">
                <label className="amountField"><span>مبلغ شارژ</span><div><input inputMode="numeric" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="مثلاً 500000" /><b>تومان</b></div></label>
                <div className="quickAmounts">{[100000, 250000, 500000, 1000000].map(amount => <button key={amount} onClick={() => setWalletAmount(String(amount))}>{new Intl.NumberFormat("fa-IR").format(amount)}</button>)}</div>
                <div className="stageNotice"><Icon name="shield" size={18} /><span>بعد از وارد کردن مبلغ، روش پرداخت را انتخاب می‌کنی. موجودی فقط پس از تأیید مدیریت اعمال می‌شود.</span></div>
                <button className="sheetPrimary" disabled={walletAmountNumber < 10000} onClick={() => setWalletStep(2)}>ادامه و انتخاب روش پرداخت</button>
              </div>
            )}

            {walletStep === 2 && (
              <div className="walletStage">
                <div className="amountSummary"><span>مبلغ شارژ</span><b>{money(walletAmountNumber)}</b><button onClick={() => setWalletStep(1)}>ویرایش</button></div>
                <div className="paymentMethods">
                  {settings.cardEnabled && <button onClick={() => chooseWalletMethod("card")}><span className="methodIcon"><Icon name="wallet" size={23} /></span><div><b>کارت‌به‌کارت</b><small>پرداخت ریالی و ارسال رسید</small></div><Icon name="chevron" size={18} /></button>}
                  {settings.cryptoEnabled && <button onClick={() => chooseWalletMethod("crypto")}><span className="methodIcon crypto">₮</span><div><b>پرداخت USDT</b><small>شبکه {settings.cryptoNetwork || "BEP20"}</small></div><Icon name="chevron" size={18} /></button>}
                </div>
                {!settings.cardEnabled && !settings.cryptoEnabled && <div className="emptyState"><Icon name="headset" size={31} /><b>روش پرداخت فعالی ثبت نشده</b><button onClick={openSupport}>ارتباط با پشتیبانی</button></div>}
              </div>
            )}

            {walletStep === 3 && (
              <div className="walletStage">
                <div className="paymentReceiptHead"><div><small>مبلغ قابل پرداخت</small><b>{money(walletAmountNumber)}</b></div><button onClick={() => setWalletStep(2)}>تغییر روش</button></div>
                {walletMethod === "card" ? (
                  <div className="paymentCard">
                    <div className="paymentTitle"><span className="methodIcon"><Icon name="wallet" size={22} /></span><div><b>کارت‌به‌کارت</b><small>مبلغ بالا را دقیقاً واریز کنید</small></div></div>
                    <div className="copyRow"><span><small>شماره کارت</small><b dir="ltr">{cardFormat(settings.cardNumber) || "در مدیریت ثبت نشده"}</b></span><button onClick={() => copyText(faToEn(settings.cardNumber).replace(/\D/g, ""), "شماره کارت")}><Icon name="copy" size={18} /></button></div>
                    <div className="infoRow"><small>به نام</small><b>{settings.cardHolder || "—"}</b></div>
                    {cleanTelegramText(settings.cardText) && <p className="paymentHint">{cleanTelegramText(settings.cardText)}</p>}
                  </div>
                ) : (
                  <div className="paymentCard">
                    <div className="paymentTitle"><span className="methodIcon crypto">₮</span><div><b>پرداخت USDT</b><small>فقط روی شبکه اعلام‌شده انتقال دهید</small></div></div>
                    <div className="infoRow"><small>شبکه</small><b>{settings.cryptoNetwork || "BEP20"}</b></div>
                    <div className="copyRow"><span><small>آدرس کیف پول</small><b className="address" dir="ltr">{settings.cryptoAddress || "در مدیریت ثبت نشده"}</b></span><button onClick={() => copyText(settings.cryptoAddress, "آدرس کیف پول")}><Icon name="copy" size={18} /></button></div>
                    {cleanTelegramText(settings.cryptoText) && <p className="paymentHint">{cleanTelegramText(settings.cryptoText)}</p>}
                  </div>
                )}
                <div className="receiptStep"><span><Icon name="orders" size={22} /></span><div><b>مرحله آخر: ارسال رسید</b><p>پس از پرداخت، رسید را همراه مبلغ <strong>{money(walletAmountNumber)}</strong> برای پشتیبانی بفرست. بعد از تأیید مدیریت، موجودی کیف پول افزایش پیدا می‌کند.</p></div></div>
                <button className="sheetPrimary dark" onClick={openSupport}><Icon name="headset" size={19} /> ارسال رسید برای پشتیبانی</button>
              </div>
            )}
          </section>
        </div>
      )}

      {accountOpen && (
        <div className="overlay" onMouseDown={() => setAccountOpen(false)}>
          <section className="accountSheet" onMouseDown={e => e.stopPropagation()}>
            <button className="sheetClose" onClick={() => setAccountOpen(false)}><Icon name="close" size={21} /></button>
            {!profile.name || editingProfile ? (
              <>
                <div className="sheetHero"><span className="sheetIcon"><Icon name="user" size={25} /></span><div><h2>{profile.name ? "ویرایش اطلاعات حساب" : "تکمیل حساب خرید"}</h2><p>این اطلاعات برای نظم سفارش‌ها و پیگیری خرید روی همین دستگاه نگهداری می‌شود.</p></div></div>
                <form className="profileForm" onSubmit={saveProfile}>
                  <label><span>نام و نام خانوادگی</span><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="نام شما" /></label>
                  <label><span>شماره موبایل</span><input dir="ltr" inputMode="tel" value={profile.mobile} onChange={e => setProfile({ ...profile, mobile: e.target.value })} placeholder="09xxxxxxxxx" /></label>
                  <div className="profileInfo"><Icon name="shield" size={18} /><span>در این نسخه، اطلاعات حساب در مرورگر همین دستگاه ذخیره می‌شود و برای ورود بانکی یا دریافت رمز استفاده نمی‌شود.</span></div>
                  <button className="sheetPrimary" type="submit">ذخیره اطلاعات</button>
                </form>
              </>
            ) : (
              <>
                <div className="accountDashboardHead"><span className="avatar">{profile.name.trim().slice(0, 1)}</span><div><h2>{profile.name}</h2><p dir="ltr">{profile.mobile}</p></div><button onClick={() => setEditingProfile(true)}><Icon name="edit" size={17} /> ویرایش</button></div>
                <div className="accountStats">
                  <button onClick={() => { setAccountOpen(false); setCartOpen(true); }}><Icon name="cart" size={22} /><span><b>{cartCount}</b><small>سبد خرید</small></span></button>
                  <button onClick={() => { setAccountOpen(false); openCatalog("all"); }}><Icon name="heart" size={22} /><span><b>{favorites.length}</b><small>علاقه‌مندی</small></span></button>
                  <button onClick={() => { setAccountOpen(false); launchWallet(); }}><Icon name="wallet" size={22} /><span><b>+</b><small>افزایش موجودی</small></span></button>
                </div>
                <div className="accountMenu"><button onClick={() => { setAccountOpen(false); openCatalog("all"); }}><span><Icon name="grid" size={20} /><b>مشاهده محصولات</b></span><Icon name="chevron" size={17} /></button><button onClick={openSupport}><span><Icon name="headset" size={20} /><b>پشتیبانی و پیگیری</b></span><Icon name="chevron" size={17} /></button></div>
                <div className="recentOrders">
                  <div className="recentOrdersTitle"><span><Icon name="orders" size={19} /><b>درخواست‌های اخیر</b></span><small>{orders.length ? `${orders.length} مورد` : "هنوز موردی نیست"}</small></div>
                  {orders.length ? orders.slice(0, 4).map(order => <article key={order.ref}><span><b>{order.ref}</b><small>{new Date(order.createdAt).toLocaleDateString("fa-IR")}</small></span><span><b>{money(order.total)}</b><small>{order.count} آیتم</small></span></article>) : <div className="ordersEmpty"><Icon name="clock" size={24} /><span>بعد از ثبت درخواست خرید، شناسه آن اینجا دیده می‌شود.</span></div>}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {supportOpen && (
        <div className="overlay" onMouseDown={() => setSupportOpen(false)}>
          <section className="smallDialog" onMouseDown={e => e.stopPropagation()}>
            <button className="sheetClose" onClick={() => setSupportOpen(false)}><Icon name="close" size={20} /></button>
            <span className="sheetIcon"><Icon name="headset" size={25} /></span><h2>پشتیبانی Persian Shop</h2><p>نام کاربری پشتیبانی هنوز در تنظیمات فروشگاه ثبت نشده است.</p><button className="sheetPrimary" onClick={() => setSupportOpen(false)}>متوجه شدم</button>
          </section>
        </div>
      )}

      {toast && <div className="toast"><Icon name="check" size={17} />{toast}</div>}
    </main>
  );
}

function ProductCard({ product, favorite, onFav, onOpen }: { product: StoreProduct; favorite: boolean; onFav: (slug: string) => void; onOpen: (product: StoreProduct) => void; }) {
  return <article className="productCard"><button className="productImage" onClick={() => onOpen(product)}><img src={product.image} alt={product.name} /></button><button className={favorite ? "cardHeart active" : "cardHeart"} onClick={() => onFav(product.slug)} aria-label="علاقه‌مندی"><Icon name="heart" size={17} /></button><div className="productCardBody"><button className="productName" onClick={() => onOpen(product)}>{product.name}</button><small className="productStatus"><i /> قابل سفارش</small><div className="productPrice"><b>{money(product.price)}</b></div><button className="productCta" onClick={() => onOpen(product)}>جزئیات و سفارش</button></div></article>;
}

function MiniProduct({ product, onOpen }: { product: StoreProduct; onOpen: (product: StoreProduct) => void }) {
  return <button className="miniProduct" onClick={() => onOpen(product)}><img src={product.image} alt={product.name} /><span>{product.name}</span><b>{money(product.price)}</b></button>;
}

function Campaign({ id, title, text, onClick }: { id: string; title: string; text: string; onClick: () => void }) {
  return <button className={`campaign campaign-${id}`} onClick={onClick}><div><small>Persian Shop</small><b>{title}</b><span>{text}</span><em>مشاهده محصولات <Icon name="chevron" size={13} /></em></div><BrandGlyph id={id} size={78} /></button>;
}

function BrandGlyph({ id, size = 52 }: { id: string; size?: number }) {
  const color = brandColor(id);
  const common = { width: size, height: size };
  if (id === "telegram") return <span className="brandGlyph" style={{ ...common, background: "#EAF7FD", color }}><svg viewBox="0 0 24 24"><path d="M20.6 4.1 3.7 10.6c-1.2.5-1.2 1.1-.2 1.4l4.3 1.3 1.7 5.1c.2.6.1.8.8.8.5 0 .8-.2 1-.4l2.1-2 4.4 3.2c.8.5 1.4.2 1.6-.8l2.8-13.3c.3-1.2-.5-1.8-1.6-1.4ZM9.4 13l8.5-5.4c.4-.2.8-.1.5.2l-7 6.4-.3 3.2-1.7-4.4Z" fill="currentColor"/></svg></span>;
  if (id === "instagram") return <span className="brandGlyph" style={{ ...common, background: "#FFF0F4", color }}><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.2" cy="6.9" r="1.1" fill="currentColor"/></svg></span>;
  if (id === "youtube") return <span className="brandGlyph" style={{ ...common, background: "#FFF0F2", color }}><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="4" fill="currentColor"/><path d="m10 9 5 3-5 3V9Z" fill="#fff"/></svg></span>;
  if (id === "tiktok") return <span className="brandGlyph" style={{ ...common, background: "#F1F1F1", color }}><svg viewBox="0 0 24 24"><path d="M14 4v10.2a4.2 4.2 0 1 1-3.2-4.1v2.4a1.9 1.9 0 1 0 1 1.7V4h2.2c.5 2.1 1.8 3.4 4 3.8V10c-1.7-.2-3-.8-4-1.8V4Z" fill="currentColor"/></svg></span>;
  if (id === "ai") return <span className="brandGlyph" style={{ ...common, background: "#F0EFFF", color }}><svg viewBox="0 0 24 24"><path d="M12 2.8 13.7 8l5.2 1.7-5.2 1.7L12 16.6l-1.7-5.2-5.2-1.7L10.3 8 12 2.8Zm6 11.1.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9.9-2.7Z" fill="currentColor"/></svg></span>;
  if (id === "digital") return <span className="brandGlyph" style={{ ...common, background: "#FFF8E5", color }}><svg viewBox="0 0 24 24"><path d="m4 8 4-4h8l4 4-8 12L4 8Zm4.8-2-2 2h10.4l-2-2H8.8ZM7.4 10 12 17.1 16.6 10H7.4Z" fill="currentColor"/></svg></span>;
  return <span className="brandGlyph" style={{ ...common, background: "#ECFAFE", color }}><svg viewBox="0 0 24 24"><circle cx="8" cy="9" r="3" fill="currentColor"/><circle cx="16" cy="8" r="2.5" fill="currentColor" opacity=".72"/><path d="M3.5 19c.4-3.6 2-5.4 4.5-5.4s4.2 1.8 4.5 5.4h-9Zm8.3 0c.3-2.9 1.6-4.4 4-4.4 2.1 0 3.6 1.5 3.9 4.4h-7.9Z" fill="currentColor"/></svg></span>;
}

function shortCategory(name: string) {
  return name.replace("خدمات ", "").replace("اشتراک ", "").replace("سایر محصولات ", "").replace("سایر شبکه‌های ", "");
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const base = { width: size, height: size };
  const strokeProps = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths = {
    home: <><path d="m3 10 9-7 9 7" {...strokeProps}/><path d="M5 9v11h14V9M9 20v-6h6v6" {...strokeProps}/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1.3" {...strokeProps}/><rect x="14" y="4" width="6" height="6" rx="1.3" {...strokeProps}/><rect x="4" y="14" width="6" height="6" rx="1.3" {...strokeProps}/><rect x="14" y="14" width="6" height="6" rx="1.3" {...strokeProps}/></>,
    search: <><circle cx="11" cy="11" r="6.5" {...strokeProps}/><path d="m16 16 4.2 4.2" {...strokeProps}/></>,
    user: <><circle cx="12" cy="8" r="4" {...strokeProps}/><path d="M4.5 21c.8-5 3.3-7 7.5-7s6.7 2 7.5 7" {...strokeProps}/></>,
    cart: <><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" {...strokeProps}/><circle cx="9" cy="20" r="1" fill="currentColor"/><circle cx="18" cy="20" r="1" fill="currentColor"/></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="3" {...strokeProps}/><path d="M3 9h14.5a3.5 3.5 0 0 1 0 7H15a2.5 2.5 0 0 1 0-5h6" {...strokeProps}/></>,
    headset: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" {...strokeProps}/><path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a1 1 0 0 0 1-1v-5ZM17 19c0 1.2-1.7 2-4 2" {...strokeProps}/></>,
    heart: <path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z" {...strokeProps}/>,
    chevron: <path d="m9 5 7 7-7 7" {...strokeProps}/>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" {...strokeProps}/>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.3 7 10 4.2-1.7 7-5.4 7-10V6l-7-3Z" {...strokeProps}/><path d="m9 12 2 2 4-4" {...strokeProps}/></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z" fill="currentColor"/>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" {...strokeProps}/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" {...strokeProps}/></>,
    trash: <><path d="M5 7h14M9 7V4h6v3M7 7l1 14h8l1-14" {...strokeProps}/></>,
    plus: <path d="M12 5v14M5 12h14" {...strokeProps}/>,
    minus: <path d="M5 12h14" {...strokeProps}/>,
    close: <path d="m6 6 12 12M18 6 6 18" {...strokeProps}/>,
    check: <path d="m5 12 4 4L19 6" {...strokeProps}/>,
    orders: <><rect x="5" y="4" width="14" height="17" rx="2" {...strokeProps}/><path d="M9 4.5h6M9 9h6M9 13h6M9 17h4" {...strokeProps}/></>,
    edit: <><path d="m4 20 4.5-1 10-10a2.2 2.2 0 0 0-3.1-3.1l-10 10L4 20Z" {...strokeProps}/><path d="m13.8 7.5 2.8 2.8" {...strokeProps}/></>,
    clock: <><circle cx="12" cy="12" r="9" {...strokeProps}/><path d="M12 7v5l3 2" {...strokeProps}/></>,
  };
  return <svg viewBox="0 0 24 24" style={base} aria-hidden="true">{paths[name]}</svg>;
}
