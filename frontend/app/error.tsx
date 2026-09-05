"use client";
export default function StoreError({ reset }: { reset: () => void }) {
  return <main dir="rtl" style={{ maxWidth: 440, margin: "12vh auto", padding: 24, textAlign: "center" }}>
    <img src="/api/brand/logo?brand=exact-user-v4" width={64} height={64} alt="Persian Shop" style={{ margin: "0 auto 24px", borderRadius: "50%" }}/>
    <h1 style={{ fontSize: 23 }}>فروشگاه موقتاً در دسترس نیست</h1>
    <p>دریافت اطلاعات محصولات انجام نشد. کمی بعد دوباره تلاش کن.</p>
    <button className="button button-primary" onClick={reset}>تلاش مجدد</button>
  </main>;
}
