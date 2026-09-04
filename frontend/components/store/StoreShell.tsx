"use client";

import { Check, Headphones, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StoreData, StoreProduct } from "../../lib/store-data";
import AccountPanel from "./AccountPanel";
import CartDrawer from "./CartDrawer";
import CatalogPanel from "./CatalogPanel";
import Header from "./Header";
import HomeView from "./HomeView";
import MobileNav from "./MobileNav";
import ProductCard from "./ProductCard";
import ProductSheet from "./ProductSheet";
import SearchOverlay from "./SearchOverlay";
import WalletPanel from "./WalletPanel";
import type { CartLine } from "./types";
import { SectionHeading } from "./shared";

export default function StoreShell({ data }: { data: StoreData }) {
  const { categories, products, settings } = data;
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"popular" | "low" | "high">("popular");
  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("persian-shop-cart-v4");
      const savedFavorites = localStorage.getItem("persian-shop-favs-v4");
      const savedViewed = localStorage.getItem("persian-shop-viewed-v4");
      const savedSearches = localStorage.getItem("persian-shop-searches-v4");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedViewed) setRecentlyViewed(JSON.parse(savedViewed));
      if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem("persian-shop-cart-v4", JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem("persian-shop-favs-v4", JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => { try { localStorage.setItem("persian-shop-viewed-v4", JSON.stringify(recentlyViewed)); } catch {} }, [recentlyViewed]);
  useEffect(() => { try { localStorage.setItem("persian-shop-searches-v4", JSON.stringify(recentSearches)); } catch {} }, [recentSearches]);

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const recentProducts = useMemo(() => recentlyViewed.map(slug => products.find(product => product.slug === slug)).filter((product): product is StoreProduct => Boolean(product)).slice(0, 4), [recentlyViewed, products]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1900);
  };

  const saveSearch = (value = query) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    setRecentSearches(current => [cleaned, ...current.filter(item => item !== cleaned)].slice(0, 5));
  };

  const openProduct = (product: StoreProduct) => {
    setSelected(product);
    setSearchOpen(false);
    setRecentlyViewed(current => [product.slug, ...current.filter(slug => slug !== product.slug)].slice(0, 6));
  };

  const openCatalog = (id = "all") => {
    setCategory(id);
    setCatalogOpen(true);
    setSearchOpen(false);
  };

  const openSupport = () => {
    const username = settings.supportUsername?.replace(/^@/, "");
    if (username) window.open(`https://t.me/${username}`, "_blank", "noopener,noreferrer");
    else setSupportOpen(true);
  };

  const addToCart = (product: StoreProduct, qty: number, input: string) => {
    setCart(current => {
      const existingIndex = current.findIndex(line => line.product.slug === product.slug && line.input === input);
      if (existingIndex < 0) return [...current, { product, qty, input }];
      return current.map((line, index) => index === existingIndex ? { ...line, qty: line.qty + qty } : line);
    });
    setSelected(null);
    notify("محصول به سبد خرید اضافه شد");
  };

  const toggleFavorite = (slug: string) => {
    setFavorites(current => current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]);
  };

  const changeCartQty = (index: number, delta: number) => {
    setCart(current => current.flatMap((line, currentIndex) => currentIndex === index ? (line.qty + delta > 0 ? [{ ...line, qty: line.qty + delta }] : []) : [line]));
  };

  const home = () => {
    setCatalogOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="store-shell">
      <Header
        shopName={settings.shopName}
        categories={categories}
        query={query}
        cartCount={cartCount}
        searchFocused={searchOpen}
        onQuery={setQuery}
        onSearchFocus={setSearchOpen}
        onSearchSubmit={() => { saveSearch(); openCatalog("all"); }}
        onOpenCategory={openCatalog}
        onOpenCatalog={() => openCatalog("all")}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenWallet={() => setWalletOpen(true)}
        onSupport={openSupport}
      />

      <SearchOverlay
        open={searchOpen}
        query={query}
        products={products}
        categories={categories}
        recentSearches={recentSearches}
        onClose={() => setSearchOpen(false)}
        onQuery={setQuery}
        onProduct={product => { saveSearch(); openProduct(product); }}
        onCategory={id => { saveSearch(); openCatalog(id); }}
        onRecent={value => { setQuery(value); saveSearch(value); }}
      />

      <HomeView
        categories={categories}
        products={products}
        favorites={favorites}
        onFavorite={toggleFavorite}
        onProduct={openProduct}
        onCategory={openCatalog}
        onCatalog={() => openCatalog("all")}
        onWallet={() => setWalletOpen(true)}
        onSupport={openSupport}
      />

      {!!recentProducts.length && (
        <section className="page-container recently-viewed-section">
          <SectionHeading title="بازدیدهای اخیر" subtitle="محصولاتی که اخیراً بررسی کرده‌ای؛ فقط روی همین دستگاه ذخیره می‌شود."/>
          <div className="product-grid recently-viewed-grid">{recentProducts.map(product => <ProductCard key={product.slug} product={product} favorite={favorites.includes(product.slug)} onFavorite={toggleFavorite} onOpen={openProduct}/>)}</div>
        </section>
      )}

      <footer className="site-footer">
        <div className="page-container footer-grid">
          <div className="footer-brand"><div className="footer-brand-lockup"><span className="brand-logo-mark">P</span><span><b>{settings.shopName}</b><small>Digital Marketplace</small></span></div><p>فروشگاه خدمات دیجیتال با دسته‌بندی شفاف، محصولات واقعی و مسیر خرید ساده و قابل پیگیری.</p></div>
          <div><b>فروشگاه</b><button onClick={() => openCatalog("all")}>همه محصولات</button><button onClick={() => setCartOpen(true)}>سبد خرید</button><button onClick={() => setWalletOpen(true)}>کیف پول</button></div>
          <div><b>حساب و پشتیبانی</b><button onClick={() => setAccountOpen(true)}>حساب کاربری</button><button onClick={openSupport}>پشتیبانی</button><button onClick={() => document.querySelector(".faq-section")?.scrollIntoView({ behavior: "smooth" })}>سؤالات متداول</button></div>
          <div><b>دسته‌بندی‌های محبوب</b>{categories.slice(0, 4).map(item => <button key={item.id} onClick={() => openCatalog(item.id)}>{item.name}</button>)}</div>
        </div>
        <div className="page-container footer-bottom"><span>© 2026 Persian Shop</span><button onClick={home}>بازگشت به بالا</button></div>
      </footer>

      <CatalogPanel open={catalogOpen} categories={categories} products={products} category={category} query={query} sort={sort} favorites={favorites} onClose={() => setCatalogOpen(false)} onCategory={setCategory} onQuery={setQuery} onSort={setSort} onFavorite={toggleFavorite} onProduct={openProduct}/>
      <ProductSheet product={selected} categories={categories} favorite={selected ? favorites.includes(selected.slug) : false} onClose={() => setSelected(null)} onFavorite={toggleFavorite} onAdd={addToCart}/>
      <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onQty={changeCartQty} onRemove={index => setCart(current => current.filter((_, currentIndex) => currentIndex !== index))} onCatalog={() => openCatalog("all")} onSupport={openSupport}/>
      <AccountPanel open={accountOpen} cartCount={cartCount} favoriteCount={favorites.length} onClose={() => setAccountOpen(false)} onCart={() => { setAccountOpen(false); setCartOpen(true); }} onCatalog={() => { setAccountOpen(false); openCatalog("all"); }} onWallet={() => { setAccountOpen(false); setWalletOpen(true); }} onSupport={openSupport}/>
      <WalletPanel open={walletOpen} settings={settings} onClose={() => setWalletOpen(false)} onSupport={openSupport} onNotify={notify}/>
      <MobileNav cartCount={cartCount} onHome={home} onCatalog={() => openCatalog("all")} onCart={() => setCartOpen(true)} onWallet={() => setWalletOpen(true)} onAccount={() => setAccountOpen(true)}/>

      {supportOpen && <div className="modal-backdrop" onMouseDown={() => setSupportOpen(false)}><section className="support-dialog" onMouseDown={event => event.stopPropagation()}><button className="sheet-close" onClick={() => setSupportOpen(false)} aria-label="بستن"><X size={21}/></button><span className="support-dialog-icon"><Headphones size={27}/></span><h2>پشتیبانی Persian Shop</h2><p>نام کاربری پشتیبانی هنوز در تنظیمات فروشگاه ثبت نشده است. بعد از ثبت در مدیریت، این دکمه مستقیماً پشتیبانی را باز می‌کند.</p><button className="button button-primary" onClick={() => setSupportOpen(false)}>متوجه شدم</button></section></div>}
      {toast && <div className="store-toast"><Check size={17}/>{toast}</div>}
    </main>
  );
}
