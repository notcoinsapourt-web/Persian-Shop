import type { StoreCategory, StoreProduct } from "../../lib/store-data";

export const money = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(Math.max(0, Math.round(value)))} تومان`;

export const faToEn = (value: string) =>
  value
    .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

export const parseAmount = (value: string) => Number(faToEn(value).replace(/\D/g, "")) || 0;

export const cardFormat = (value: string) =>
  faToEn(value).replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

export const cleanTelegramText = (value: string) =>
  String(value || "")
    .replace(/<tg-emoji[^>]*>/gi, "")
    .replace(/<\/tg-emoji>/gi, "")
    .replace(/&lt;tg-emoji[^&]*&gt;/gi, "")
    .replace(/&lt;\/tg-emoji&gt;/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const shortCategory = (name: string) =>
  name
    .replace("خدمات ", "")
    .replace("اشتراک ", "")
    .replace("سایر محصولات ", "")
    .replace("سایر شبکه‌های ", "");

export const categoryTone = (id: string) => ({
  telegram: { accent: "#229ED9", soft: "#EAF7FD" },
  instagram: { accent: "#E4405F", soft: "#FFF0F4" },
  tiktok: { accent: "#111111", soft: "#F2F2F2" },
  youtube: { accent: "#FF0033", soft: "#FFF0F2" },
  ai: { accent: "#635BFF", soft: "#F1EFFF" },
  digital: { accent: "#E7A515", soft: "#FFF8E5" },
  social: { accent: "#0EA5E9", soft: "#ECFAFE" },
}[id] || { accent: "#C99B00", soft: "#FFF7D8" });

export function buildHomePlan(categories: StoreCategory[], products: StoreProduct[]) {
  const used = new Set<string>();
  const featured: StoreProduct[] = [];

  for (const category of categories) {
    const product = products.find(item => item.category === category.id && !used.has(item.slug));
    if (product) {
      featured.push(product);
      used.add(product.slug);
    }
  }

  const rails: { category: StoreCategory; items: StoreProduct[] }[] = [];
  for (const category of categories) {
    const items = products.filter(item => item.category === category.id && !used.has(item.slug)).slice(0, 4);
    items.forEach(item => used.add(item.slug));
    if (items.length >= 2) rails.push({ category, items });
    if (rails.length === 3) break;
  }

  return { featured: featured.slice(0, 7), rails };
}
