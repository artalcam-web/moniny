"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  sizes: string[];
};

type Props = {
  vendorId: string;
  vendorName: string;
  productId: string;
  productSlug: string;
  productName: string;
  priceCents: number;
  sellItemsSeparately: boolean;
  items: Item[];
  coverImageUrl?: string;
};

export function ProductPurchasePanel({
  vendorId,
  vendorName,
  productId,
  productName,
  priceCents,
  sellItemsSeparately,
  items,
  coverImageUrl,
}: Props) {
  const { add } = useCart();
  const [setAdded, setSetAdded] = useState(false);
  const [itemAdded, setItemAdded] = useState<string | null>(null);
  const [sizeByItem, setSizeByItem] = useState<Record<string, string>>({});

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-3 text-2xl font-semibold">{formatPrice(priceCents)}</p>
        <button
          onClick={() => {
            add({
              vendorId,
              vendorName,
              kind: "set",
              productId,
              name: productName,
              qty: 1,
              priceCents,
              imageUrl: coverImageUrl,
            });
            setSetAdded(true);
            setTimeout(() => setSetAdded(false), 1800);
          }}
          className="mn-btn-accent mt-5 w-full justify-center sm:w-auto"
        >
          {setAdded ? "✓ Conjunto añadido" : "Comprar el conjunto completo"}
        </button>
      </div>

      {sellItemsSeparately && items.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "var(--mn-navy)" }}>
            O compra cada pieza por separado
          </p>
          <div className="divide-y" style={{ borderColor: "var(--mn-line)" }}>
            {items.map((it) => {
              const hasSizes = it.sizes.length > 0;
              const size = sizeByItem[it.id] ?? it.sizes[0] ?? "";
              return (
                <div key={it.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{it.name}</p>
                    {it.description ? <p className="text-xs opacity-60">{it.description}</p> : null}
                    <p className="text-sm mt-1">{formatPrice(it.priceCents)}</p>
                  </div>
                  {hasSizes ? (
                    <select
                      className="mn-input !w-20 !py-2 text-xs"
                      value={size}
                      onChange={(e) => setSizeByItem((prev) => ({ ...prev, [it.id]: e.target.value }))}
                    >
                      {it.sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <button
                    onClick={() => {
                      add({
                        vendorId,
                        vendorName,
                        kind: "item",
                        productItemId: it.id,
                        name: it.name,
                        size: hasSizes ? size : undefined,
                        qty: 1,
                        priceCents: it.priceCents,
                        imageUrl: it.imageUrl || undefined,
                      });
                      setItemAdded(it.id);
                      setTimeout(() => setItemAdded(null), 1800);
                    }}
                    className="mn-btn-outline !py-2 !px-3 text-xs whitespace-nowrap"
                  >
                    {itemAdded === it.id ? "✓ Añadida" : "Añadir"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
