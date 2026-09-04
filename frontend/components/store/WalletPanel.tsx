"use client";

import { Check, Copy, CreditCard, FileImage, Headphones, Info, ShieldCheck, Upload, WalletCards, X } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import type { StoreSettings } from "../../lib/store-data";
import type { WalletMethod } from "./types";
import { HelpHint } from "./shared";
import { cardFormat, cleanTelegramText, money, parseAmount } from "./utils";

export default function WalletPanel({ open, settings, onClose, onSupport, onNotify }: {
  open: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onSupport: () => void;
  onNotify: (message: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WalletMethod>("card");
  const [receiptName, setReceiptName] = useState("");
  const numericAmount = useMemo(() => parseAmount(amount), [amount]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setAmount("");
      setReceiptName("");
    }
  }, [open]);

  if (!open) return null;

  const copy = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      onNotify(`${label} کپی شد`);
    } catch {
      onNotify("کپی خودکار در این مرورگر در دسترس نیست");
    }
  };

  const chooseMethod = (next: WalletMethod) => {
    setMethod(next);
    setStep(3);
  };

  const onReceipt = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setReceiptName(file?.name || "");
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="wallet-panel" role="dialog" aria-modal="true" aria-label="کیف پول" onMouseDown={event => event.stopPropagation()}>
        <div className="sheet-handle"/>
        <button className="sheet-close" onClick={onClose} aria-label="بستن"><X size={22}/></button>

        <div className="wallet-overview-card">
          <div className="wallet-overview-brand"><span className="wallet-overview-icon"><WalletCards size={28}/></span><span><small>Persian Shop Wallet</small><b>کیف پول</b></span></div>
          <div className="wallet-balance-placeholder"><small>موجودی قابل استفاده</small><strong>—</strong><span>پس از ورود امن نمایش داده می‌شود</span></div>
          <div className="wallet-overview-status"><ShieldCheck size={17}/><span>موجودی جعلی نمایش داده نمی‌شود؛ تا اتصال احراز هویت، فقط جریان شارژ دستی در دسترس است.</span></div>
        </div>

        <div className="wallet-stepper">
          {[
            [1, "مبلغ"],
            [2, "روش پرداخت"],
            [3, "اطلاعات پرداخت"],
            [4, "رسید"],
          ].map(([index, label]) => {
            const value = Number(index);
            return <span key={value} className={step >= value ? "is-active" : ""}><i>{step > value ? <Check size={14}/> : value}</i><b>{label}</b></span>;
          })}
        </div>

        {step === 1 && (
          <div className="wallet-stage">
            <div className="wallet-stage-head"><span><b>مبلغ افزایش موجودی</b><small>مبلغ موردنظر را به تومان وارد کن.</small></span></div>
            <label className="wallet-amount-field"><input inputMode="numeric" value={amount} onChange={event => setAmount(event.target.value)} placeholder="مثلاً 500000"/><span>تومان</span></label>
            <div className="wallet-quick-amounts">{[100000, 250000, 500000, 1000000].map(value => <button key={value} onClick={() => setAmount(String(value))}>{new Intl.NumberFormat("fa-IR").format(value)}</button>)}</div>
            <HelpHint>موجودی فقط بعد از بررسی پرداخت توسط مدیریت افزایش پیدا می‌کند.</HelpHint>
            <button className="button button-primary wallet-main-button" disabled={numericAmount < 10000} onClick={() => setStep(2)}>ادامه و انتخاب روش پرداخت</button>
          </div>
        )}

        {step === 2 && (
          <div className="wallet-stage">
            <div className="wallet-amount-summary"><span><small>مبلغ شارژ</small><b>{money(numericAmount)}</b></span><button onClick={() => setStep(1)}>ویرایش مبلغ</button></div>
            <div className="wallet-method-list">
              {settings.cardEnabled && <button onClick={() => chooseMethod("card")}><span className="wallet-method-icon"><CreditCard size={23}/></span><span><b>کارت‌به‌کارت</b><small>پرداخت ریالی و ارسال تصویر رسید</small></span><strong>انتخاب</strong></button>}
              {settings.cryptoEnabled && <button onClick={() => chooseMethod("crypto")}><span className="wallet-method-icon crypto">₮</span><span><b>USDT</b><small>شبکه {settings.cryptoNetwork || "BEP20"}</small></span><strong>انتخاب</strong></button>}
            </div>
            {!settings.cardEnabled && !settings.cryptoEnabled && <div className="wallet-empty-method"><Info size={24}/><b>روش پرداخت فعالی ثبت نشده است.</b><button className="button button-secondary" onClick={onSupport}>ارتباط با پشتیبانی</button></div>}
          </div>
        )}

        {step === 3 && (
          <div className="wallet-stage">
            <div className="wallet-payment-head"><span><small>مبلغ قابل پرداخت</small><b>{money(numericAmount)}</b></span><button onClick={() => setStep(2)}>تغییر روش</button></div>

            {method === "card" ? (
              <div className="wallet-payment-card">
                <div className="wallet-payment-title"><span className="wallet-method-icon"><CreditCard size={23}/></span><span><b>پرداخت کارت‌به‌کارت</b><small>مبلغ بالا را دقیقاً واریز کن.</small></span></div>
                <div className="wallet-copy-row"><span><small>شماره کارت</small><b dir="ltr">{cardFormat(settings.cardNumber) || "در مدیریت ثبت نشده"}</b></span><button onClick={() => copy(settings.cardNumber.replace(/\D/g, ""), "شماره کارت")} aria-label="کپی شماره کارت"><Copy size={18}/></button></div>
                <div className="wallet-info-row"><small>به نام</small><b>{settings.cardHolder || "—"}</b></div>
                {cleanTelegramText(settings.cardText) && <p className="wallet-payment-description">{cleanTelegramText(settings.cardText)}</p>}
              </div>
            ) : (
              <div className="wallet-payment-card">
                <div className="wallet-payment-title"><span className="wallet-method-icon crypto">₮</span><span><b>پرداخت USDT</b><small>فقط روی شبکه اعلام‌شده انتقال بده.</small></span></div>
                <div className="wallet-info-row"><small>شبکه</small><b>{settings.cryptoNetwork || "BEP20"}</b></div>
                <div className="wallet-copy-row"><span><small>آدرس کیف پول</small><b className="wallet-address" dir="ltr">{settings.cryptoAddress || "در مدیریت ثبت نشده"}</b></span><button onClick={() => copy(settings.cryptoAddress, "آدرس کیف پول")} aria-label="کپی آدرس"><Copy size={18}/></button></div>
                <div className="wallet-rate-note"><Info size={17}/><span>معادل لحظه‌ای USDT هنوز به API نرخ ارز متصل نشده است؛ عدد ساختگی نمایش داده نمی‌شود.</span></div>
                {cleanTelegramText(settings.cryptoText) && <p className="wallet-payment-description">{cleanTelegramText(settings.cryptoText)}</p>}
              </div>
            )}

            <button className="button button-primary wallet-main-button" onClick={() => setStep(4)}>پرداخت انجام شد؛ ثبت رسید</button>
          </div>
        )}

        {step === 4 && (
          <div className="wallet-stage">
            <div className="wallet-receipt-header"><span className="wallet-receipt-icon"><FileImage size={26}/></span><div><b>رسید پرداخت</b><p>فایل رسید را انتخاب کن و سپس از مسیر پشتیبانی ارسالش کن.</p></div></div>
            <label className={`receipt-upload-box ${receiptName ? "has-file" : ""}`}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onReceipt}/>
              <Upload size={25}/>
              {receiptName ? <span><b>{receiptName}</b><small>فایل برای ارسال آماده است.</small></span> : <span><b>انتخاب تصویر رسید</b><small>JPG، PNG یا WEBP</small></span>}
            </label>
            <div className="wallet-final-summary"><span><small>مبلغ</small><b>{money(numericAmount)}</b></span><span><small>روش</small><b>{method === "card" ? "کارت‌به‌کارت" : `USDT • ${settings.cryptoNetwork || "BEP20"}`}</b></span></div>
            <div className="wallet-backend-warning"><Info size={18}/><span>آپلود مستقیم رسید به دیتابیس وب هنوز Backend ندارد؛ بنابراین Success جعلی نمایش داده نمی‌شود. ارسال واقعی از پشتیبانی انجام می‌شود.</span></div>
            <button className="button button-dark wallet-main-button" onClick={onSupport}><Headphones size={18}/>ارسال رسید و پیگیری در پشتیبانی</button>
          </div>
        )}
      </section>
    </div>
  );
}
