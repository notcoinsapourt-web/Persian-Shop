import type { StoreCategory, StoreProduct } from "../../lib/store-data";

export type CartLine = {
  product: StoreProduct;
  qty: number;
  input: string;
  unavailable?: boolean;
};

export type WalletMethod = "card" | "crypto";

export type HomePlan = {
  featured: StoreProduct[];
  rails: { category: StoreCategory; items: StoreProduct[] }[];
};

export type ToastState = {
  message: string;
  tone?: "default" | "success" | "warning";
};
