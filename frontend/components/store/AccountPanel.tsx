"use client";

import { Heart, Headphones, LockKeyhole, Package, ShieldCheck, ShoppingCart, UserRound, WalletCards, X } from "lucide-react";
import { HelpHint } from "./shared";

export default function AccountPanel({ open, cartCount, favoriteCount, onClose, onCart, onCatalog, onWallet, onSupport }: {
  open: boolean;
  cartCount: number;
  favoriteCount: number;
  onClose: () => void;
  onCart: () => void;
  onCatalog: () => void;
  onWallet: () => void;
  onSupport: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="account-panel" role="dialog" aria-modal="true" aria-label="حساب کاربری" onMouseDown={event => event.stopPropagation()}>
        <div className="sheet-handle"/>
        <button className="sheet-close" onClick={onClose} aria-label="بستن"><X size={22}/></button>

        <div className="account-hero-card">
          <span className="account-avatar"><UserRound size={30}/></span>
          <div><small>Persian Shop Account</small><h2>ورود یا ساخت حساب</h2><p>برای مشاهده سفارش‌ها، موجودی کیف پول و پیگیری یکپارچه خریدها، حساب وب باید به سیستم احراز هویت متصل شود.</p></div>
        </div>

        <div className="account-login-card">
          <label><span>شماره موبایل</span><div className="account-phone-input"><span>+98</span><input dir="ltr" inputMode="tel" placeholder="09xxxxxxxxx" disabled/></div></label>
          <button className="button button-primary account-login-button" disabled><LockKeyhole size={18}/>دریافت کد ورود</button>
          <p className="account-backend-note"><ShieldCheck size={17}/>برای جلوگیری از ورود جعلی، تا زمان اتصال سرویس OTP این دکمه عمداً غیرفعال است.</p>
        </div>

        <div className="account-section-title"><b>دسترسی‌های فعلی</b><small>بخش‌هایی که بدون ورود هم قابل استفاده‌اند</small></div>
        <div className="account-quick-grid">
          <button onClick={onCart}><span className="account-quick-icon"><ShoppingCart size={22}/></span><span><b>سبد خرید</b><small>{cartCount} آیتم</small></span></button>
          <button onClick={onCatalog}><span className="account-quick-icon"><Package size={22}/></span><span><b>محصولات</b><small>مشاهده کاتالوگ</small></span></button>
          <button onClick={onWallet}><span className="account-quick-icon"><WalletCards size={22}/></span><span><b>کیف پول</b><small>افزایش موجودی دستی</small></span></button>
          <button onClick={onSupport}><span className="account-quick-icon"><Headphones size={22}/></span><span><b>پشتیبانی</b><small>پیگیری خرید</small></span></button>
        </div>

        <div className="account-local-card">
          <span className="account-local-icon"><Heart size={22}/></span>
          <div><b>علاقه‌مندی‌های این دستگاه</b><p>{favoriteCount ? `${favoriteCount} محصول روی همین مرورگر ذخیره شده است.` : "هنوز محصولی به علاقه‌مندی اضافه نکرده‌ای."}</p></div>
        </div>

        <HelpHint>بعد از اتصال احراز هویت، سفارش‌ها، موجودی و تراکنش‌ها باید از دیتابیس واقعی کاربر خوانده شوند؛ LocalStorage به‌عنوان حساب کاربری واقعی استفاده نمی‌شود.</HelpHint>
      </section>
    </div>
  );
}
