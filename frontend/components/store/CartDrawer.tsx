"use client";

import { Headphones, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import type { CartLine } from "./types";
import { EmptyState } from "./shared";
import { money } from "./utils";

export default function CartDrawer({ open, cart, onClose, onQty, onRemove, onCatalog, onSupport }: {
  open: boolean;
  cart: CartLine[];
  onClose: () => void;
  onQty: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onCatalog: () => void;
  onSupport: () => void;
}) {
  if (!open) return null;
  const count = cart.reduce((sum, line) => sum + line.qty, 0);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}/>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="سبد خرید">
        <header className="drawer-header">
          <div><span className="drawer-header-icon"><ShoppingCart size={22}/></span><span><b>سبد خرید</b><small>{count} آیتم</small></span></div>
          <button className="round-icon-button" onClick={onClose} aria-label="بستن"><X size={21}/></button>
        </header>

        <div className="cart-drawer-body">
          {cart.length ? cart.map((line, index) => (
            <article className="cart-item" key={`${line.product.slug}-${index}`}>
              <span className="cart-item-image">{line.product.image ? <img src={line.product.image} alt={line.product.name}/> : "P"}</span>
              <div className="cart-item-content">
                <b>{line.product.name}</b>
                <small>{line.input}</small>
                <strong>{money(line.product.price * line.qty)}</strong>
              </div>
              <div className="cart-item-actions">
                <button className="remove-cart-item" onClick={() => onRemove(index)} aria-label="حذف از سبد"><Trash2 size={16}/></button>
                <div className="cart-qty-control"><button onClick={() => onQty(index, 1)} aria-label="افزایش"><Plus size={15}/></button><b>{line.qty}</b><button onClick={() => onQty(index, -1)} aria-label="کاهش"><Minus size={15}/></button></div>
              </div>
            </article>
          )) : <EmptyState title="سبد خرید خالی است" description="محصول موردنظرت را از دسته‌بندی‌ها انتخاب و به سبد اضافه کن." action="مشاهده محصولات" onAction={() => { onClose(); onCatalog(); }}/>} 
        </div>

        {!!cart.length && (
          <footer className="cart-summary">
            <div className="cart-summary-row"><span>تعداد آیتم‌ها</span><b>{count}</b></div>
            <div className="cart-summary-row cart-total"><span>مبلغ کل</span><strong>{money(total)}</strong></div>
            <div className="cart-checkout-note">ثبت نهایی سفارش وب هنوز به Backend سفارش متصل نشده است؛ برای جلوگیری از سفارش جعلی، مسیر فعلی از پشتیبانی ادامه پیدا می‌کند.</div>
            <button className="button button-primary cart-checkout-button" onClick={onSupport}><Headphones size={18}/>ادامه ثبت سفارش با پشتیبانی</button>
          </footer>
        )}
      </aside>
    </>
  );
}
