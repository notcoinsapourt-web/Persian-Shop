import { motion } from "framer-motion";

const categories = [
  "Telegram Services",
  "Instagram Services",
  "TikTok Services",
  "YouTube Services",
  "AI Services",
  "Premium Accounts",
  "Digital Tools",
];

const products = [
  { name: "ChatGPT Premium", price: "299,000 تومان", tag: "AI Services" },
  { name: "Telegram Premium", price: "499,000 تومان", tag: "Premium Accounts" },
  { name: "Instagram Growth", price: "149,000 تومان", tag: "Instagram Services" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07070a] text-white px-6 py-10 md:px-16">
      <nav className="flex items-center justify-between max-w-7xl mx-auto mb-20">
        <h1 className="text-2xl font-bold tracking-wide">Persian Shop</h1>
        <button className="rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur">
          Telegram Login
        </button>
      </nav>

      <section className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.h2 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-5xl md:text-7xl font-extrabold leading-tight">
            Premium Digital Marketplace
          </motion.h2>
          <p className="mt-6 text-zinc-400 text-lg max-w-xl">
            خرید سریع و امن سرویس‌های دیجیتال، اکانت‌های پریمیوم و ابزارهای هوشمند با تجربه‌ای مدرن.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
          <p className="text-zinc-400">Persian Shop</p>
          <h3 className="text-3xl font-bold mt-3">Digital Store Experience</h3>
        </div>
      </section>

      <section className="max-w-7xl mx-auto mt-24">
        <h3 className="text-3xl font-bold mb-8">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((item) => (
            <div key={item} className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto mt-24">
        <h3 className="text-3xl font-bold mb-8">Featured Products</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.name} className="rounded-3xl bg-[#111116] border border-white/10 p-6">
              <span className="text-sm text-cyan-300">{product.tag}</span>
              <h4 className="text-xl font-bold mt-4">{product.name}</h4>
              <p className="text-zinc-400 mt-3">{product.price}</p>
              <button className="mt-6 w-full rounded-xl bg-white text-black py-3 font-semibold">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}