"use client";

import { LogIn, Minus, Plus, ShoppingCart, Trash2, WalletCards, X } from "lucide-react";
import type { CartLine } from "./types";
import { EmptyState } from "./shared";
import { money } from "./utils";

export default function CartDrawer({ catalogError, onRefresh, open, cart, isLoggedIn, walletBalance, checkingOut, onClose, onQty, onRemove, onCatalog, onLogin, onWallet, onCheckout }: {
  catalogError: boolean;
  onRefresh: () => void;
  open: boolean;
  cart: CartLine[];
  isLoggedIn: boolean;
  walletBalance: number;
  checkingOut: boolean;
  onClose: () => void;
  onQty: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onCatalog: () => void;
  onLogin: () => void;
  onWallet: () => void;
  onCheckout: () => void;
}) {
  if (!open) return null;
  const count = cart.reduce((sum, line) => sum + line.qty, 0);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.qty, 0);
  const unavailable = cart.some(line => line.unavailable);
  const hasBalance = walletBalance >= total;
  const shortage = Math.max(0, total - walletBalance);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}/>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="سبد خرید">
        <header className="drawer-header">
          <div><span className="drawer-header-icon"><ShoppingCart size={22}/></span><span><b>سبد خرید</b><small>{count} آیتم</small></span></div>
          <button className="round-icon-button" onClick={onClose} aria-label="بستن"><X size={21}/></button>
        </header>

        <div className="cart-drawer-body">
          {cart.length ? cart.map((line, index) => <article className="cart-item" key={`${line.product.slug}-${index}`}>
            <span className="cart-item-image">{line.product.image ? <img src={line.product.image} alt={line.product.name}/> : "P"}</span>
            <div className="cart-item-content"><b>{line.product.name}</b><small>{line.input}</small>{line.unavailable && <small className="cart-unavailable">این محصول دیگر قابل سفارش نیست؛ از سبد حذف کن.</small>}<strong>{money(line.product.price * line.qty)}</strong></div>
            <div className="cart-item-actions"><button className="remove-cart-item" onClick={() => onRemove(index)} aria-label="حذف از سبد"><Trash2 size={16}/></button><div className="cart-qty-control"><button onClick={() => onQty(index, 1)} aria-label="افزایش"><Plus size={15}/></button><b>{line.qty}</b><button onClick={() => onQty(index, -1)} aria-label="کاهش"><Minus size={15}/></button></div></div>
          </article>) : <EmptyState title="سبد خرید خالی است" description="محصول موردنظرت را از دسته‌بندی‌ها انتخاب و به سبد اضافه کن." action="مشاهده محصولات" onAction={() => { onClose(); onCatalog(); }}/>} 
        </div>

        {!!cart.length && <footer className="cart-summary">
          <div className="cart-summary-row"><span>تعداد آیتم‌ها</span><b>{count}</b></div>
          <div className="cart-summary-row cart-total"><span>مبلغ کل</span><strong>{money(total)}</strong></div>
          {isLoggedIn && <><div className="cart-wallet-balance"><span>موجودی کیف پول</span><b className={hasBalance ? "is-enough" : "is-low"}>{money(walletBalance)}</b></div>{!hasBalance && <div className="cart-shortage"><span>کسری موجودی</span><strong>{money(shortage)}</strong></div>}</>}

          {catalogError || unavailable ? <div className="cart-checkout-note" role="alert">{unavailable ? "محصول ناموجود را از سبد حذف کن تا بتوانی ادامه بدهی." : "دریافت قیمت‌های تازه انجام نشد. قبل از پرداخت دوباره تلاش کن."}{catalogError && <button className="button button-light" onClick={onRefresh}>تلاش مجدد</button>}</div> : !isLoggedIn ? <>
            <div className="cart-checkout-note">برای ثبت نهایی سفارش و پرداخت امن، ابتدا وارد حساب سایت شوید.</div>
            <button className="button button-primary cart-checkout-button" onClick={onLogin}><LogIn size={18}/>ورود یا ثبت‌نام</button>
          </> : !hasBalance ? <>
            <div className="cart-checkout-note">موجودی کیف پول برای این سفارش کافی نیست. ابتدا موجودی را افزایش دهید.</div>
            <button className="button button-primary cart-checkout-button" onClick={onWallet}><WalletCards size={18}/>افزایش موجودی</button>
          </> : <>
            <div className="cart-checkout-note">مبلغ نهایی از کیف پول کسر می‌شود. وضعیت سفارش را از حساب کاربری پیگیری کن.</div>
            <button className="button button-primary cart-checkout-button" disabled={checkingOut} onClick={onCheckout}><ShoppingCart size={18}/>{checkingOut ? "در حال ثبت سفارش…" : "ثبت و پرداخت سفارش"}</button>
          </>}
        </footer>}
      </aside>
    </>
  );
}
