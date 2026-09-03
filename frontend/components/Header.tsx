export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-xl font-bold text-white">Persian Shop</div>
        <nav className="flex gap-6 text-sm text-white/70">
          <span>Products</span>
          <span>Categories</span>
          <span>Dashboard</span>
        </nav>
      </div>
    </header>
  );
}
