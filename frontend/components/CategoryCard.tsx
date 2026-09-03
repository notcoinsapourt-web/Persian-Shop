type CategoryCardProps = {
  title: string;
  description: string;
};

export default function CategoryCard({ title, description }: CategoryCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:bg-white/10">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/60">{description}</p>
    </div>
  );
}
