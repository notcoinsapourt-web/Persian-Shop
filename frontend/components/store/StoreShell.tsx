"use client";

import { ArrowUp, Check, Headphones, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StoreData, StoreProduct } from "../../lib/store-data";
import type { WebSessionUser } from "../../lib/web-auth";
import AccountPanel from "./AccountPanel";
import CartDrawer from "./CartDrawer";
import CatalogPanel from "./CatalogPanel";
import Header from "./Header";
import SideNav from "./SideNav";
import { restoreCart, restoreStrings, syncCart } from "./catalog-state";
import { useOverlayFocus } from "./useOverlayFocus";
import HomeView from "./HomeView";
import MobileNav from "./MobileNav";
import ProductCard from "./ProductCard";
import ProductSheet from "./ProductSheet";
import SearchOverlay from "./SearchOverlay";
import WalletPanel from "./WalletPanel";
import type { CartLine } from "./types";
import { SectionHeading } from "./shared";

export default function StoreShell({ data }: { data: StoreData }) {
  const [storeData, setStoreData] = useState(data);
  const { categories, products, settings } = storeData;
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
  const [user, setUser] = useState<WebSessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const checkoutAttempt = useRef<{ signature: string; key: string } | null>(null);
  const catalogRequest = useRef<AbortController | null>(null);
  useOverlayFocus(supportOpen ? "support" : walletOpen ? "wallet" : accountOpen ? "account" : cartOpen ? "cart" : selected ? "product" : catalogOpen ? "catalog" : searchOpen ? "search" : "");

  const refreshCatalog = useCallback(async () => {
    if (catalogRequest.current) return;
    const controller = new AbortController();
    catalogRequest.current = controller;
    try {
      const response = await fetch("/api/store/catalog", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Catalog unavailable");
      const next = await response.json() as StoreData;
      if (!Array.isArray(next.products) || !Array.isArray(next.categories) || !next.settings) throw new Error("Invalid catalog");
      setStoreData(next);
      setCatalogError(false);
    } catch {
      if (!controller.signal.aborted) setCatalogError(true);
    } finally {
      if (catalogRequest.current === controller) catalogRequest.current = null;
    }
  }, []);

  const refreshAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) { setUser(null); return null; }
      const payload = await response.json();
      setUser(payload.user || null);
      return payload.user as WebSessionUser | null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("persian-shop-cart-v4");
      const savedFavorites = localStorage.getItem("persian-shop-favs-v4");
      const savedViewed = localStorage.getItem("persian-shop-viewed-v4");
      const savedSearches = localStorage.getItem("persian-shop-searches-v4");
      if (savedCart) setCart(restoreCart(JSON.parse(savedCart), data.products));
      if (savedFavorites) setFavorites(restoreStrings(JSON.parse(savedFavorites)));
      if (savedViewed) setRecentlyViewed(restoreStrings(JSON.parse(savedViewed)));
      if (savedSearches) setRecentSearches(restoreStrings(JSON.parse(savedSearches)));
    } catch {}
    setStorageReady(true);
    void refreshAuth();
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => { if (document.visibilityState !== "hidden") void refreshCatalog(); };
    const timer = window.setInterval(refreshWhenVisible, 60_000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    refreshWhenVisible();
    return () => {
      catalogRequest.current?.abort();
      catalogRequest.current = null;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshCatalog]);

  useEffect(() => {
    setCart(current => syncCart(current, products));
    setSelected(current => current ? products.find(product => String(product.id) === String(current.id)) || null : null);
  }, [products]);

  useEffect(() => { if (!storageReady) return; try { localStorage.setItem("persian-shop-cart-v4", JSON.stringify(cart)); } catch {} }, [cart, storageReady]);
  useEffect(() => { if (!storageReady) return; try { localStorage.setItem("persian-shop-favs-v4", JSON.stringify(favorites)); } catch {} }, [favorites, storageReady]);
  useEffect(() => { if (!storageReady) return; try { localStorage.setItem("persian-shop-viewed-v4", JSON.stringify(recentlyViewed)); } catch {} }, [recentlyViewed, storageReady]);
  useEffect(() => { if (!storageReady) return; try { localStorage.setItem("persian-shop-searches-v4", JSON.stringify(recentSearches)); } catch {} }, [recentSearches, storageReady]);

  useEffect(() => {
    const anyOverlay = searchOpen || catalogOpen || selected || cartOpen || accountOpen || walletOpen || supportOpen;
    document.body.classList.toggle("overlay-open", Boolean(anyOverlay));
    return () => document.body.classList.remove("overlay-open");
  }, [searchOpen, catalogOpen, selected, cartOpen, accountOpen, walletOpen, supportOpen]);

  useEffect(() => {
    const closeActiveOverlay = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (supportOpen) setSupportOpen(false);
      else if (walletOpen) setWalletOpen(false);
      else if (accountOpen) setAccountOpen(false);
      else if (cartOpen) setCartOpen(false);
      else if (selected) setSelected(null);
      else if (catalogOpen) setCatalogOpen(false);
      else if (searchOpen) setSearchOpen(false);
    };
    window.addEventListener("keydown", closeActiveOverlay);
    return () => window.removeEventListener("keydown", closeActiveOverlay);
  }, [supportOpen, walletOpen, accountOpen, cartOpen, selected, catalogOpen, searchOpen]);

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const recentProducts = useMemo(() => recentlyViewed.map(slug => products.find(product => product.slug === slug)).filter((product): product is StoreProduct => Boolean(product)).slice(0, 4), [recentlyViewed, products]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2300);
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

  const openCatalog = (id = "all", preserveSearch = false) => {
    if (!preserveSearch) setQuery("");
    setCategory(id);
    setCatalogOpen(true);
    setSearchOpen(false);
  };

  const openSupport = () => {
    const username = settings.supportUsername?.replace(/^@/, "");
    if (username) window.open(`https://t.me/${username}`, "_blank", "noopener,noreferrer");
    else setSupportOpen(true);
  };

  const openWallet = () => {
    if (!user) {
      setAccountOpen(true);
      notify("برای استفاده از کیف پول ابتدا وارد حساب شوید");
      return;
    }
    setWalletOpen(true);
  };

  const addToCart = (product: StoreProduct, qty: number, input: string) => {
    setCart(current => {
      const existingIndex = current.findIndex(line => line.product.slug === product.slug && line.input === input);
      if (existingIndex < 0) return [...current, { product, qty, input }];
      return current.map((line, index) => index === existingIndex ? { ...line, qty: Math.min(10000, line.qty + qty) } : line);
    });
    setSelected(null);
    notify("محصول به سبد خرید اضافه شد");
  };

  const toggleFavorite = (slug: string) => {
    setFavorites(current => current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]);
  };

  const changeCartQty = (index: number, delta: number) => {
    setCart(current => current.flatMap((line, currentIndex) => currentIndex === index ? (line.qty + delta > 0 ? [{ ...line, qty: Math.min(10000, line.qty + delta) }] : []) : [line]));
  };

  const checkout = async () => {
    if (!user) {
      setCartOpen(false);
      setAccountOpen(true);
      return;
    }
    if (!cart.length || checkingOut || catalogError || cart.some(line => line.unavailable)) return;
    setCheckingOut(true);
    const signature = JSON.stringify({ userId: user.id, cart: cart.map(line => [line.product.id, line.product.price, line.qty, line.input]) });
    if (checkoutAttempt.current?.signature !== signature) checkoutAttempt.current = { signature, key: crypto.randomUUID() };
    const checkoutKey = checkoutAttempt.current.key;
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ checkoutKey, lines: cart.map(line => ({ productId: Number(line.product.id), qty: line.qty, input: line.input, expectedUnitPrice: line.product.price })) }),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          checkoutAttempt.current = null;
          await refreshCatalog();
        }
        if (payload.code === "INSUFFICIENT_BALANCE") {
          setCartOpen(false);
          setWalletOpen(true);
        }
        throw new Error(payload.error || "ثبت سفارش انجام نشد.");
      }
      checkoutAttempt.current = null;
      setCart([]);
      setCartOpen(false);
      await refreshAuth();
      notify(`سفارش ${payload.batchNumber || "جدید"} ثبت شد`);
      setAccountOpen(true);
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "ثبت سفارش انجام نشد");
    } finally {
      setCheckingOut(false);
    }
  };

  const home = () => {
    setCatalogOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="store-shell minimal-store">
      <a className="shop-skip-link" href="#store-content">رفتن به محتوای فروشگاه</a>
      <Header shopName={settings.shopName} query={query} cartCount={cartCount} searchFocused={searchOpen} accountLabel={user ? "حساب من" : "ورود | ثبت‌نام"} onQuery={setQuery} onSearchFocus={setSearchOpen} onSearchSubmit={() => { saveSearch(); openCatalog("all", true); }} onHome={home} onOpenAccount={() => setAccountOpen(true)} onOpenCart={() => setCartOpen(true)} onFavorites={() => openCatalog("favorites")}/>
      <SideNav active={catalogOpen ? category === "favorites" ? "favorites" : "catalog" : walletOpen ? "wallet" : accountOpen ? "account" : "home"} onHome={home} onCatalog={() => openCatalog("all")} onFavorites={() => openCatalog("favorites")} onAccount={() => setAccountOpen(true)} onWallet={openWallet} onSupport={openSupport}/>
      <main className="shop-surface">



      <HomeView categories={categories} products={products} favorites={favorites} isLoggedIn={Boolean(user)} onFavorite={toggleFavorite} onProduct={openProduct} onCategory={openCatalog} onCatalog={() => openCatalog("all")} onWallet={openWallet} onAccount={() => setAccountOpen(true)} onSupport={openSupport}/>

      {!!recentProducts.length && <section className="page-container recently-viewed-section"><SectionHeading title="بازدیدهای اخیر" /><div className="product-grid shop-product-grid recently-viewed-grid">{recentProducts.map(product => <ProductCard key={product.slug} product={product} favorite={favorites.includes(product.slug)} onFavorite={toggleFavorite} onOpen={openProduct}/>)}</div></section>}

      <footer className="site-footer">
        <div className="page-container footer-grid">
          <div className="footer-brand"><div className="footer-brand-lockup"><span className="brand-logo-image"><img src="/api/brand/logo?brand=exact-user-v4" alt={`لوگوی ${settings.shopName}`}/></span><span><b>{settings.shopName}</b><small>فروشگاه خدمات دیجیتال</small></span></div><p>خرید خدمات شبکه‌های اجتماعی، ابزارهای هوش مصنوعی و اشتراک‌های دیجیتال با قیمت مشخص و امکان پیگیری سفارش.</p><button className="footer-support-pill" onClick={openSupport}><Headphones size={17}/>پشتیبانی: {settings.supportUsername || "@Znoxe_shope"}</button></div>
          <div><b>فروشگاه</b><button onClick={() => openCatalog("all")}>همه محصولات</button><button onClick={() => setCartOpen(true)}>سبد خرید</button>{user && <button onClick={openWallet}>کیف پول</button>}</div>
          <div><b>حساب و پشتیبانی</b><button onClick={() => setAccountOpen(true)}>حساب کاربری</button><button onClick={openSupport}>پشتیبانی</button><button onClick={() => document.querySelector(".faq-section")?.scrollIntoView({ behavior: "smooth" })}>سؤالات متداول</button></div>
          <div><b>دسته‌بندی‌های محبوب</b>{categories.slice(0, 4).map(item => <button key={item.id} onClick={() => openCatalog(item.id)}>{item.name}</button>)}</div>
        </div>
        <div className="page-container footer-bottom"><span>© 2026 Persian Shop — تمامی حقوق محفوظ است.</span><button onClick={home}>بازگشت به بالا<ArrowUp size={16}/></button></div>
      </footer>
      </main>
      <SearchOverlay open={searchOpen} query={query} products={products} categories={categories} recentSearches={recentSearches} onClose={() => setSearchOpen(false)} onQuery={setQuery} onProduct={product => { saveSearch(); openProduct(product); }} onCategory={id => { saveSearch(); openCatalog(id); }} onRecent={value => { setQuery(value); saveSearch(value); }} onResults={() => { saveSearch(); openCatalog("all", true); }}/>

      <CatalogPanel open={catalogOpen} categories={categories} products={products} category={category} query={query} sort={sort} favorites={favorites} onClose={() => setCatalogOpen(false)} onCategory={id => { setCategory(id); setQuery(""); }} onQuery={setQuery} onSort={setSort} onFavorite={toggleFavorite} onProduct={openProduct}/>
      <ProductSheet product={selected} categories={categories} favorite={selected ? favorites.includes(selected.slug) : false} onClose={() => setSelected(null)} onFavorite={toggleFavorite} onAdd={addToCart}/>
      <CartDrawer catalogError={catalogError} onRefresh={() => void refreshCatalog()} open={cartOpen} cart={cart} isLoggedIn={Boolean(user)} walletBalance={user?.balance || 0} checkingOut={checkingOut} onClose={() => setCartOpen(false)} onQty={changeCartQty} onRemove={index => setCart(current => current.filter((_, currentIndex) => currentIndex !== index))} onCatalog={() => openCatalog("all")} onLogin={() => { setCartOpen(false); setAccountOpen(true); }} onWallet={() => { setCartOpen(false); openWallet(); }} onCheckout={checkout}/>
      <AccountPanel open={accountOpen} user={user} authLoading={authLoading} cartCount={cartCount} favoriteCount={favorites.length} onClose={() => setAccountOpen(false)} onCart={() => { setAccountOpen(false); setCartOpen(true); }} onCatalog={() => { setAccountOpen(false); openCatalog("all"); }} onWallet={() => { setAccountOpen(false); openWallet(); }} onSupport={openSupport} onAuthenticated={authenticated => { setUser(authenticated); notify("ورود با موفقیت انجام شد"); }} onLoggedOut={() => { setUser(null); setWalletOpen(false); notify("از حساب خارج شدید"); }}/>
      {user && <WalletPanel open={walletOpen} balance={user.balance} settings={settings} onClose={() => setWalletOpen(false)} onNotify={notify} onSubmitted={() => notify("رسید برای بررسی مدیریت ثبت شد")}/>} 
      <MobileNav cartCount={cartCount} isLoggedIn={Boolean(user)} onHome={home} onCatalog={() => openCatalog("all")} onCart={() => setCartOpen(true)} onWallet={openWallet} onSupport={openSupport} onAccount={() => setAccountOpen(true)}/>

      {supportOpen && <div className="modal-backdrop" onMouseDown={() => setSupportOpen(false)}><section role="dialog" aria-modal="true" aria-label="پشتیبانی" className="support-dialog" onMouseDown={event => event.stopPropagation()}><button className="sheet-close" onClick={() => setSupportOpen(false)} aria-label="بستن"><X size={21}/></button><img className="account-brand-logo" src="/api/brand/logo?brand=exact-user-v4" alt="Persian Shop"/><h2>پشتیبانی Persian Shop</h2><p>برای پیگیری سفارش، پرداخت یا حساب کاربری از پشتیبانی فروشگاه کمک بگیرید.</p><button className="button button-primary" onClick={() => setSupportOpen(false)}>بستن</button></section></div>}
      {toast && <div role="status" className="store-toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}
