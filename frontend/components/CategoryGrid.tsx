import CategoryCard from './CategoryCard';

const categories = [
  { key: 'telegram', title: 'Telegram Services', description: 'Premium Telegram services, subscriptions and growth tools.' },
  { key: 'instagram', title: 'Instagram Services', description: 'Followers, likes, views and engagement services.' },
  { key: 'tiktok', title: 'TikTok Services', description: 'TikTok growth, views and engagement services.' },
  { key: 'youtube', title: 'YouTube Services', description: 'YouTube views, subscribers and channel growth services.' },
  { key: 'ai', title: 'AI Services', description: 'AI subscriptions and productivity services.' },
  { key: 'tools', title: 'Digital Tools', description: 'Useful digital accounts, tools and online services.' },
];

export default function CategoryGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.key} title={category.title} description={category.description} />
      ))}
    </section>
  );
}
