import ProductCard from './ProductCard';

type Product = {
  name: string;
  price: string;
};

const products: Product[] = [
  { name: 'Telegram Premium', price: '99,000 Toman' },
  { name: 'ChatGPT Plus', price: '499,000 Toman' },
  { name: 'Instagram Services', price: '120,000 Toman' },
];

export default function FeaturedProducts() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.name}
          name={product.name}
          price={product.price}
        />
      ))}
    </section>
  );
}
