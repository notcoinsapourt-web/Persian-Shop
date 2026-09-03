import CategoryCard from './CategoryCard';

const categories = [
  { title: 'Telegram Services', description: 'Premium Telegram services, subscriptions and growth tools.' },
  { title: 'Instagram Services', description: 'Followers, likes, views and engagement services.' },
  { title: 'TikTok Services', description: 'TikTok growth, views and engagement services.' },
  { title: 'YouTube Services', description: 'YouTube views, subscribers and channel growth services.' },
  { title: 'AI Services', description: 'AI subscriptions and productivity services.' },
  { title: 'Digital Tools', description: 'Useful digital accounts, tools and online services.' },
];

export default function CategoryGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.title} {...category} />
      ))}
    </section>
  );
}
