"use client";

import { Check, Copy, CreditCard, FileImage, Info, ShieldCheck, Upload, WalletCards, X } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import type { StoreSettings } from "../../lib/store-data";
import type { WalletMethod } from "./types";
import { HelpHint } from "./shared";
import { cardFormat, cleanTelegramText, money, parseAmount } from "./utils";

export default function WalletPanel({ open, balance, settings, onClose, onNotify, onSubmitted }: {
  open: boolean;
  balance: number;
  settings: StoreSettings;
  onClose: () => void;
  onNotify: (message: string) => void;
  onSubmitted: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WalletMethod>("card");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedNumber, setSubmittedNumber] = useState("");
  const numericAmount = useMemo(() => parseAmount(amount), [amount]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setAmount("");
      setReceiptFile(null);
      setTransactionHash("");
      setSubmitError("");
      setSubmittedNumber("");
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
    setReceiptFile(event.target.files?.[0] || null);
    setSubmitError("");
  };

  const submitReceipt = async () => {
    if (!receiptFile || numericAmount < 10000) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const form = new FormData();
      form.append("amount", String(numericAmount));
      form.append("method", method);
      form.append("receipt", receiptFile);
      if (transactionHash.trim()) form.append("transactionHash", transactionHash.trim());
      const response = await fetch("/api/wallet/deposit", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ثبت رسید انجام نشد.");
      setSubmittedNumber(data.deposit.number);
      onSubmitted();
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : "ثبت رسید انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="wallet-panel" role="dialog" aria-modal="true" aria-label="کیف پول" onMouseDown={event => event.stopPropagation()}>
        <div className="sheet-handle"/>
        <button className="sheet-close" onClick={onClose} aria-label="بستن"><X size={22}/></button>

        <div className="wallet-overview-card">
          <div className="wallet-overview-brand"><span className="wallet-overview-icon"><WalletCards size={28}/></span><span><small>Persian Shop Wallet</small><b>کیف پول</b></span></div>
          <div className="wallet-balance-placeholder"><small>موجودی قابل استفاده</small><strong>{money(balance)}</strong><span>متصل به حساب سایت</span></div>
          <div className="wallet-overview-status"><ShieldCheck size={17}/><span>افزایش موجودی فقط پس از تأیید رسید توسط مدیریت ربات انجام می‌شود.</span></div>
        </div>

        <div className="wallet-stepper">
          {[[1, "مبلغ"], [2, "روش پرداخت"], [3, "اطلاعات پرداخت"], [4, "رسید"]].map(([index, label]) => {
            const value = Number(index);
            return <span key={value} className={step >= value ? "is-active" : ""}><i>{step > value ? <Check size={14}/> : value}</i><b>{label}</b></span>;
          })}
        </div>

        {step === 1 && <div className="wallet-stage">
          <div className="wallet-stage-head"><span><b>مبلغ افزایش موجودی</b><small>مبلغ موردنظر را به تومان وارد کنید.</small></span></div>
          <label className="wallet-amount-field"><input inputMode="numeric" value={amount} onChange={event => setAmount(event.target.value)} placeholder="مثلاً 500000"/><span>تومان</span></label>
          <div className="wallet-quick-amounts">{[100000, 250000, 500000, 1000000].map(value => <button key={value} onClick={() => setAmount(String(value))}>{new Intl.NumberFormat("fa-IR").format(value)}</button>)}</div>
          <HelpHint>حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است و تا قبل از تأیید مدیریت، موجودی تغییر نمی‌کند.</HelpHint>
          <button className="button button-primary wallet-main-button" disabled={numericAmount < 10000} onClick={() => setStep(2)}>ادامه و انتخاب روش پرداخت</button>
        </div>}

        {step === 2 && <div className="wallet-stage">
          <div className="wallet-amount-summary"><span><small>مبلغ شارژ</small><b>{money(numericAmount)}</b></span><button onClick={() => setStep(1)}>ویرایش مبلغ</button></div>
          <div className="wallet-method-list">
            {settings.cardEnabled && <button onClick={() => chooseMethod("card")}><span className="wallet-method-icon"><CreditCard size={23}/></span><span><b>کارت‌به‌کارت</b><small>پرداخت ریالی و ارسال تصویر رسید</small></span><strong>انتخاب</strong></button>}
            {settings.cryptoEnabled && <button onClick={() => chooseMethod("crypto")}><span className="wallet-method-icon crypto">₮</span><span><b>USDT</b><small>شبکه {settings.cryptoNetwork || "BEP20"}</small></span><strong>انتخاب</strong></button>}
          </div>
          {!settings.cardEnabled && !settings.cryptoEnabled && <div className="wallet-empty-method"><Info size={24}/><b>روش پرداخت فعالی ثبت نشده است.</b></div>}
        </div>}

        {step === 3 && <div className="wallet-stage">
          <div className="wallet-payment-head"><span><small>مبلغ قابل پرداخت</small><b>{money(numericAmount)}</b></span><button onClick={() => setStep(2)}>تغییر روش</button></div>
          {method === "card" ? <div className="wallet-payment-card">
            <div className="wallet-payment-title"><span className="wallet-method-icon"><CreditCard size={23}/></span><span><b>پرداخت کارت‌به‌کارت</b><small>مبلغ بالا را دقیقاً واریز کنید.</small></span></div>
            <div className="wallet-copy-row"><span><small>شماره کارت</small><b dir="ltr">{cardFormat(settings.cardNumber) || "در مدیریت ثبت نشده"}</b></span><button onClick={() => copy(settings.cardNumber.replace(/\D/g, ""), "شماره کارت")} aria-label="کپی شماره کارت"><Copy size={18}/></button></div>
            <div className="wallet-info-row"><small>به نام</small><b>{settings.cardHolder || "—"}</b></div>
            {cleanTelegramText(settings.cardText) && <p className="wallet-payment-description">{cleanTelegramText(settings.cardText)}</p>}
          </div> : <div className="wallet-payment-card">
            <div className="wallet-payment-title"><span className="wallet-method-icon crypto">₮</span><span><b>پرداخت USDT</b><small>فقط روی شبکه اعلام‌شده انتقال دهید.</small></span></div>
            <div className="wallet-info-row"><small>شبکه</small><b>{settings.cryptoNetwork || "BEP20"}</b></div>
            <div className="wallet-copy-row"><span><small>آدرس کیف پول</small><b className="wallet-address" dir="ltr">{settings.cryptoAddress || "در مدیریت ثبت نشده"}</b></span><button onClick={() => copy(settings.cryptoAddress, "آدرس کیف پول")} aria-label="کپی آدرس"><Copy size={18}/></button></div>
            <label className="wallet-hash-field"><span>هش تراکنش <small>اختیاری</small></span><input dir="ltr" value={transactionHash} onChange={event => setTransactionHash(event.target.value)} placeholder="Transaction hash"/></label>
            <div className="wallet-rate-note"><Info size={17}/><span>معادل لحظه‌ای USDT تا زمان اتصال منبع نرخ مطمئن نمایش داده نمی‌شود.</span></div>
            {cleanTelegramText(settings.cryptoText) && <p className="wallet-payment-description">{cleanTelegramText(settings.cryptoText)}</p>}
          </div>}
          <button className="button button-primary wallet-main-button" onClick={() => setStep(4)}>پرداخت انجام شد؛ ثبت رسید</button>
        </div>}

        {step === 4 && <div className="wallet-stage">
          {submittedNumber ? <div className="wallet-submit-success"><span><Check size={26}/></span><h3>رسید ثبت شد</h3><p>درخواست <b dir="ltr">{submittedNumber}</b> وارد صف بررسی مدیریت شده است. پس از تأیید، موجودی حساب به‌صورت خودکار افزایش پیدا می‌کند.</p><button className="button button-primary" onClick={onClose}>بستن</button></div> : <>
            <div className="wallet-receipt-header"><span className="wallet-receipt-icon"><FileImage size={26}/></span><div><b>رسید پرداخت</b><p>تصویر رسید را انتخاب کنید؛ فایل مستقیماً برای مدیریت سایت ثبت می‌شود.</p></div></div>
            <label className={`receipt-upload-box ${receiptFile ? "has-file" : ""}`}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onReceipt}/>
              <Upload size={25}/>
              {receiptFile ? <span><b>{receiptFile.name}</b><small>{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</small></span> : <span><b>انتخاب تصویر رسید</b><small>JPG، PNG یا WEBP • حداکثر ۵MB</small></span>}
            </label>
            <div className="wallet-final-summary"><span><small>مبلغ</small><b>{money(numericAmount)}</b></span><span><small>روش</small><b>{method === "card" ? "کارت‌به‌کارت" : `USDT • ${settings.cryptoNetwork || "BEP20"}`}</b></span></div>
            {submitError && <div className="wallet-submit-error">{submitError}</div>}
            <button className="button button-dark wallet-main-button" disabled={!receiptFile || submitting} onClick={submitReceipt}>{submitting ? "در حال ثبت رسید…" : "ثبت رسید برای بررسی مدیریت"}</button>
          </>}
        </div>}
      </section>
    </div>
  );
}
