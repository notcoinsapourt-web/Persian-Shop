type ProductCardProps = {
  name: string;
  category: string;
  price: string;
};

export default function ProductCard({ name, category, price }: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-4 h-32 rounded-xl bg-white/5" />
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-sm text-slate-400">{category}</p>
      <div className="mt-4 flex items-center justify-between">
        <span>{price}</span>
        <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm">خرید</button>
      </div>
    </article>
  );
}
