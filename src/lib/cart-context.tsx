"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  vendorId: string;
  vendorName: string;
  kind: "set" | "item";
  productId?: string;
  productItemId?: string;
  name: string;
  size?: string;
  qty: number;
  priceCents: number;
  imageUrl?: string;
};

const STORAGE_KEY = "moniny_marketplace_cart_v1";

function lineKey(l: CartLine) {
  return [l.kind, l.productId ?? "", l.productItemId ?? "", l.size ?? ""].join("|");
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (line: CartLine) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  keyOf: typeof lineKey;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, SSR-safe by design
    setLines(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const k = lineKey(line);
      const idx = prev.findIndex((l) => lineKey(l) === k);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + line.qty };
        return next;
      }
      return [...prev, line];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (lineKey(l) === key ? { ...l, qty } : l)).filter((l) => l.qty > 0));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotalCents = useMemo(() => lines.reduce((s, l) => s + l.qty * l.priceCents, 0), [lines]);

  const value = useMemo(
    () => ({ lines, count, subtotalCents, add, remove, setQty, clear, keyOf: lineKey }),
    [lines, count, subtotalCents, add, remove, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
