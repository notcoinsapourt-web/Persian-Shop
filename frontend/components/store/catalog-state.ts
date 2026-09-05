import type { StoreProduct } from "../../lib/store-data";
import type { CartLine } from "./types";

export function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک")
    .replace(/[۰-۹]/g, char => String(char.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, char => String(char.charCodeAt(0) - 1632))
    .replace(/[\s\u200c]+/g, " ").trim();
}

export function restoreCart(value: unknown, products: StoreProduct[]): CartLine[] {
  if (!Array.isArray(value)) return [];
  const byId = new Map(products.map(product => [String(product.id), product]));
  return value.slice(0, 25).flatMap(line => {
    if (!line || typeof line !== "object" || !line.product || typeof line.product !== "object") return [];
    const saved = line.product;
    if ((typeof saved.id !== "number" && typeof saved.id !== "string") || typeof saved.name !== "string" || typeof saved.slug !== "string" || !Number.isFinite(saved.price) || saved.price < 0 || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > 10000 || typeof line.input !== "string") return [];
    const latest = byId.get(String(saved.id));
    return [{ product: latest || saved, qty: line.qty, input: line.input.slice(0, 4000), unavailable: !latest }];
  });
}

export function syncCart(cart: CartLine[], products: StoreProduct[]): CartLine[] {
  const byId = new Map(products.map(product => [String(product.id), product]));
  return cart.map(line => {
    const product = byId.get(String(line.product.id));
    return { ...line, product: product || line.product, unavailable: !product };
  });
}

export function restoreStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 200) : [];
}
