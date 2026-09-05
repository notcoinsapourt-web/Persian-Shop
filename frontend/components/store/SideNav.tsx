"use client";
import { Headphones, Heart, House, LayoutGrid, Package, WalletCards } from "lucide-react";
export default function SideNav({ active, onHome, onCatalog, onFavorites, onAccount, onWallet, onSupport }: {
  active: string; onHome: () => void; onCatalog: () => void; onFavorites: () => void; onAccount: () => void; onWallet: () => void; onSupport: () => void;
}) {
  const items = [{ id: "home", label: "خانه", icon: House, action: onHome }, { id: "catalog", label: "محصولات", icon: LayoutGrid, action: onCatalog }, { id: "favorites", label: "علاقه‌مندی", icon: Heart, action: onFavorites }, { id: "account", label: "سفارش‌ها", icon: Package, action: onAccount }, { id: "wallet", label: "کیف پول", icon: WalletCards, action: onWallet }];
  return <nav className="shop-side-nav" aria-label="ناوبری فروشگاه">{items.map(item => <button key={item.id} className={active === item.id ? "is-active" : ""} aria-current={active === item.id ? "page" : undefined} onClick={item.action}><item.icon size={22}/><span>{item.label}</span></button>)}<button className="shop-side-support" onClick={onSupport}><Headphones size={22}/><span>پشتیبانی</span></button></nav>;
}
