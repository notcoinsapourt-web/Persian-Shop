"use client";

import { Heart, Headphones, LogOut, Mail, Package, Phone, ShieldCheck, ShoppingCart, UserRound, WalletCards, X } from "lucide-react";
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

        <div className="account-hero-card">
          <span className="account-avatar"><UserRound size={30}/></span>
          <div>
            <small>Persian Shop Account</small>
            <h2>{user ? "حساب کاربری" : "ورود یا ساخت حساب"}</h2>
            <p>{user ? "سفارش‌ها، کیف پول و وضعیت پرداخت‌های سایت از همین حساب مدیریت می‌شوند." : "برای ثبت سفارش و استفاده از کیف پول، یک حساب با ایمیل و رمز عبور بسازید."}</p>
          </div>
        </div>

        {authLoading ? (
          <div className="account-loading">در حال بررسی وضعیت ورود…</div>
        ) : user ? (
          <>
            <div className="account-profile-card">
              <div><Mail size={18}/><span><small>ایمیل</small><b dir="ltr">{user.email}</b></span></div>
              <div><Phone size={18}/><span><small>شماره تماس</small><b dir="ltr">{user.phone || "ثبت نشده"}</b></span></div>
              <button onClick={logout} disabled={busy}><LogOut size={17}/>خروج از حساب</button>
            </div>

            <div className="account-stats-grid">
              <button onClick={onWallet}><small>موجودی کیف پول</small><strong>{money(user.balance)}</strong><span>مدیریت کیف پول</span></button>
              <button onClick={onCart}><small>سبد خرید</small><strong>{cartCount}</strong><span>آیتم آماده خرید</span></button>
              <div><small>علاقه‌مندی‌ها</small><strong>{favoriteCount}</strong><span>ذخیره روی این دستگاه</span></div>
            </div>

            <div className="account-section-title"><b>سفارش‌های سایت</b><small>وضعیت‌ها مستقیماً توسط مدیریت ربات به‌روزرسانی می‌شوند.</small></div>
            <div className="web-order-list">
              {ordersLoading ? <div className="account-loading">در حال دریافت سفارش‌ها…</div> : orders.length ? orders.map(order => (
                <article key={order.id} className="web-order-row">
                  <div className="web-order-main"><span><small>{order.number}</small><b>{order.product_name}</b></span><strong>{money(order.total_amount)}</strong></div>
                  <div className="web-order-meta"><span>{order.quantity.toLocaleString("fa-IR")} عدد</span><span className={`web-order-status status-${order.status}`}>{statusFa[order.status] || order.status}</span></div>
                  {order.admin_note && <p>{order.admin_note}</p>}
                </article>
              )) : <div className="account-empty-orders"><Package size={24}/><span><b>هنوز سفارشی ثبت نشده</b><small>بعد از پرداخت از کیف پول، سفارش‌ها اینجا نمایش داده می‌شوند.</small></span></div>}
            </div>
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
