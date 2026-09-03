import CategoryCard from './CategoryCard';

const categories = [
  'Telegram Services',
  'Instagram Services',
  'TikTok Services',
  'YouTube Services',
  'AI Services',
  'Digital Tools',
];

export default function CategoryGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category} title={category} />
      ))}
    </section>
  );
}
