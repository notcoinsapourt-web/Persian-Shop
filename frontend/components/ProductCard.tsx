type ProductCardProps = {
  name: string;
  price: string;
};

export default function ProductCard({ name, price }: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg font-bold">
        {name.charAt(0)}
      </div>
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <p className="mt-2 text-sm text-white/60">Fast delivery with secure order tracking and customer support.</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="font-semibold text-white">{price}</span>
        <button type="button" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
          View
        </button>
      </div>
    </article>
  );
}
