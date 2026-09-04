"use client";

import { CalendarDays, ChevronLeft, CircleCheck, Clock3, Heart, Headphones, LogOut, Mail, Package, Phone, ShieldCheck, ShoppingCart, UserRound, WalletCards, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { WebSessionUser } from "../../lib/web-auth";
import { HelpHint } from "./shared";
import { money } from "./utils";

type WebOrder = {
  id: number;
  number: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  status: string;
  admin_note?: string | null;
  created_at: string;
};

const statusFa: Record<string, string> = {
  pending: "در انتظار بررسی",
  approved: "تأیید شده",
  processing: "در حال انجام",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

export default function AccountPanel({ open, user, authLoading, cartCount, favoriteCount, onClose, onCart, onCatalog, onWallet, onSupport, onAuthenticated, onLoggedOut }: {
  open: boolean;
  user: WebSessionUser | null;
  authLoading: boolean;
  cartCount: number;
  favoriteCount: number;
  onClose: () => void;
  onCart: () => void;
  onCatalog: () => void;
  onWallet: () => void;
  onSupport: () => void;
  onAuthenticated: (user: WebSessionUser) => void;
  onLoggedOut: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<WebOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (!user) return;
    setOrdersLoading(true);
    fetch("/api/orders", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(data => setOrders(Array.isArray(data.orders) ? data.orders : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [open, user]);

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("ایمیل و رمز عبور را وارد کنید.");
    if (mode === "register" && password !== passwordRepeat) return setError("تکرار رمز عبور با رمز اصلی یکسان نیست.");
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "signup" : "login"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, passwordRepeat, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "عملیات انجام نشد.");
      onAuthenticated(data.user);
      setPassword("");
      setPasswordRepeat("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "عملیات انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    setOrders([]);
    onLoggedOut();
    setBusy(false);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="account-panel" role="dialog" aria-modal="true" aria-label="حساب کاربری" onMouseDown={event => event.stopPropagation()}>
        <div className="sheet-handle"/>
        <button className="sheet-close" onClick={onClose} aria-label="بستن"><X size={22}/></button>

        <div className={`account-hero-card ${user ? "account-hero-logged" : ""}`}>
          {user ? <img className="account-brand-logo" src="/api/brand/logo?brand=exact-user-v4" alt="Persian Shop"/> : <span className="account-avatar"><UserRound size={30}/></span>}
          <div>
            <small>Persian Shop Account</small>
            <h2>{user ? user.email.split("@")[0] : "ورود یا ساخت حساب"}</h2>
            <p>{user ? "داشبورد سفارش‌ها، پرداخت‌ها و کیف پول شما" : "برای ثبت سفارش و استفاده از کیف پول، یک حساب امن بسازید."}</p>
          </div>
          {user && <span className="account-verified"><ShieldCheck size={15}/> حساب فعال</span>}
        </div>

        {authLoading ? (
          <div className="account-loading">در حال بررسی وضعیت ورود…</div>
        ) : user ? (
          <>
            <div className="account-profile-card account-profile-premium">
              <div><Mail size={18}/><span><small>ایمیل</small><b dir="ltr">{user.email}</b></span></div>
              <div><Phone size={18}/><span><small>شماره تماس</small><b dir="ltr">{user.phone || "ثبت نشده"}</b></span></div>
              <div><CalendarDays size={18}/><span><small>تاریخ عضویت</small><b>{user.createdAt ? new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium"}).format(new Date(user.createdAt)) : "—"}</b></span></div>
            </div>

            <button className="account-wallet-card" onClick={onWallet}>
              <span><WalletCards size={24}/><small>موجودی قابل استفاده</small></span><strong>{money(user.balance)}</strong><i>افزایش موجودی <ChevronLeft size={17}/></i>
            </button>

            <div className="account-stats-grid premium-stats">
              <div><Package size={20}/><small>کل سفارش‌ها</small><strong>{orders.length.toLocaleString("fa-IR")}</strong></div>
              <div><Clock3 size={20}/><small>در حال انجام</small><strong>{orders.filter(x => ["pending","approved","processing"].includes(x.status)).length.toLocaleString("fa-IR")}</strong></div>
              <div><CircleCheck size={20}/><small>تکمیل‌شده</small><strong>{orders.filter(x => x.status === "completed").length.toLocaleString("fa-IR")}</strong></div>
              <div><Heart size={20}/><small>علاقه‌مندی‌ها</small><strong>{favoriteCount.toLocaleString("fa-IR")}</strong></div>
            </div>

            <div className="account-section-title"><b>سفارش‌های سایت</b><small>وضعیت‌ها مستقیماً توسط مدیریت ربات به‌روزرسانی می‌شوند.</small></div>
            <div className="web-order-list">
              {ordersLoading ? <div className="account-loading">در حال دریافت سفارش‌ها…</div> : orders.length ? orders.map(order => (
                <article key={order.id} className="web-order-row">
                  <div className="web-order-main"><span><small>{order.number}</small><b>{order.product_name}</b></span><strong>{money(order.total_amount)}</strong></div>
                  <div className="web-order-meta"><span>{order.quantity.toLocaleString("fa-IR")} عدد</span><span className={`web-order-status status-${order.status}`}>{statusFa[order.status] || order.status}</span></div>
                  {order.admin_note && <p>{order.admin_note}</p>}
                </article>
              )) : <div className="account-empty-orders"><Package size={26}/><span><b>هنوز سفارشی ثبت نشده</b><small>محصول دلخواهتان را انتخاب کنید؛ سفارش‌ها اینجا قابل پیگیری هستند.</small></span><button onClick={onCatalog}>مشاهده محصولات</button></div>}
            </div>

            <div className="account-menu-premium">
              <button onClick={onCart}><ShoppingCart size={20}/><span><b>سبد خرید</b><small>{cartCount.toLocaleString("fa-IR")} آیتم آماده خرید</small></span><ChevronLeft size={18}/></button>
              <button onClick={onSupport}><Headphones size={20}/><span><b>پشتیبانی سفارش</b><small>ارتباط مستقیم با مدیریت</small></span><ChevronLeft size={18}/></button>
              <button className="account-logout-row" onClick={() => setLogoutConfirm(true)}><LogOut size={20}/><span><b>خروج از حساب</b><small>پایان نشست امن در این دستگاه</small></span><ChevronLeft size={18}/></button>
            </div>
            {logoutConfirm && <div className="logout-confirm"><div><LogOut size={24}/><span><b>از حساب خارج می‌شوید؟</b><small>سبد خرید و علاقه‌مندی‌های دستگاه حذف نمی‌شوند.</small></span></div><footer><button onClick={() => setLogoutConfirm(false)}>انصراف</button><button onClick={logout} disabled={busy}>{busy ? "در حال خروج…" : "خروج از حساب"}</button></footer></div>}
          </>
        ) : (
          <>
            <div className="account-auth-tabs">
              <button className={mode === "login" ? "is-active" : ""} onClick={() => { setMode("login"); setError(""); }}>ورود</button>
              <button className={mode === "register" ? "is-active" : ""} onClick={() => { setMode("register"); setError(""); }}>ثبت‌نام</button>
            </div>

            <form className="account-login-card account-auth-form" onSubmit={submit} noValidate>
              <label><span>ایمیل</span><div className="account-text-input"><Mail size={18}/><input dir="ltr" inputMode="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com"/></div></label>
              <label><span>رمز عبور</span><div className="account-text-input"><ShieldCheck size={18}/><input dir="ltr" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="رمز عبور"/></div></label>
              {mode === "register" && <>
                <label><span>تکرار رمز عبور</span><div className="account-text-input"><ShieldCheck size={18}/><input dir="ltr" type="password" autoComplete="new-password" value={passwordRepeat} onChange={event => setPasswordRepeat(event.target.value)} placeholder="تکرار رمز عبور"/></div></label>
                <label><span>شماره موبایل <small>اختیاری</small></span><div className="account-text-input"><Phone size={18}/><input dir="ltr" inputMode="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="09xxxxxxxxx"/></div></label>
              </>}
              {error && <p className="account-form-error">{error}</p>}
              <button className="button button-primary account-login-button" disabled={busy}>{busy ? "در حال انجام…" : mode === "register" ? "ساخت حساب" : "ورود به حساب"}</button>
              <p className="account-backend-note"><ShieldCheck size={17}/>رمز عبور به‌صورت رمزنگاری‌شده ذخیره می‌شود و شماره موبایل برای ثبت‌نام اجباری نیست.</p>
            </form>

            <div className="account-section-title"><b>دسترسی بدون ورود</b><small>کیف پول و ثبت سفارش تا ورود قفل هستند.</small></div>
            <div className="account-quick-grid">
              <button onClick={onCart}><span className="account-quick-icon"><ShoppingCart size={22}/></span><span><b>سبد خرید</b><small>{cartCount} آیتم</small></span></button>
              <button onClick={onCatalog}><span className="account-quick-icon"><Package size={22}/></span><span><b>محصولات</b><small>مشاهده کاتالوگ</small></span></button>
              <button onClick={onSupport}><span className="account-quick-icon"><Headphones size={22}/></span><span><b>پشتیبانی</b><small>ارتباط با مدیریت</small></span></button>
            </div>

            <div className="account-local-card">
              <span className="account-local-icon"><Heart size={22}/></span>
              <div><b>علاقه‌مندی‌های این دستگاه</b><p>{favoriteCount ? `${favoriteCount} محصول روی همین مرورگر ذخیره شده است.` : "هنوز محصولی به علاقه‌مندی اضافه نکرده‌اید."}</p></div>
            </div>
            <HelpHint>سبد خرید و علاقه‌مندی‌ها می‌توانند بدون ورود روی دستگاه باقی بمانند؛ اما سفارش، موجودی و پرداخت فقط به حساب واردشده متصل می‌شوند.</HelpHint>
          </>
        )}
      </section>
    </div>
  );
}
