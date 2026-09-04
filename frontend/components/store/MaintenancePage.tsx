import { Headphones, RefreshCw, ShieldCheck, Wrench } from "lucide-react";

export default function MaintenancePage({ shopName, supportUsername }: { shopName: string; supportUsername: string }) {
  const support = (supportUsername || "@Znoxe_shope").replace(/^@/, "");
  return (
    <main className="maintenance-page">
      <section className="maintenance-shell" aria-labelledby="maintenance-title">
        <img className="maintenance-logo" src="/persian-shop-logo.svg" alt={`${shopName} logo`}/>
        <span className="maintenance-kicker"><Wrench size={16} strokeWidth={1.75}/> بروزرسانی فروشگاه</span>
        <h1 className="maintenance-title" id="maintenance-title">{shopName} در حال بروزرسانی است</h1>
        <p className="maintenance-message">سایت در حال تعمیر و بروزرسانی می‌باشد.{"\n"}لطفاً کمی بعد دوباره تلاش کنید.</p>
        <div className="maintenance-activity" aria-hidden="true"><i/><i/><i/></div>
        <div className="maintenance-note"><ShieldCheck size={18} strokeWidth={1.75}/><span>حساب‌ها، سفارش‌ها و موجودی کاربران محفوظ هستند. این حالت فقط دسترسی عمومی سایت را موقتاً متوقف می‌کند و ربات فروشگاه فعال می‌ماند.</span></div>
        <div className="maintenance-actions">
          <a className="maintenance-refresh" href="/"><RefreshCw size={18} strokeWidth={1.75}/>تلاش مجدد</a>
          <a className="maintenance-support" href={`https://t.me/${support}`} target="_blank" rel="noreferrer"><Headphones size={18} strokeWidth={1.75}/>ارتباط با پشتیبانی</a>
        </div>
        <div className="maintenance-foot">Persian Shop • @Znoxe_shope</div>
      </section>
    </main>
  );
}
