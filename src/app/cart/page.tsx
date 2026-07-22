"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/i18n/client";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { lines, subtotalCents, setQty, remove, keyOf } = useCart();
  const { dict } = useLocale();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 mn-fade-up">
      <h1 className="mn-headline text-2xl sm:text-3xl mb-8">{dict.cart.title}</h1>

      {lines.length === 0 ? (
        <div className="text-center py-20">
          <p className="opacity-60 mb-4">{dict.cart.empty}</p>
          <Link href="/marcas" className="mn-btn-accent">
            {dict.cart.explore}
          </Link>
        </div>
      ) : (
        <>
          <div className="mn-card divide-y" style={{ borderColor: "var(--mn-line)" }}>
            {lines.map((l) => {
              const key = keyOf(l);
              return (
                <div key={key} className="flex items-center gap-3 p-4 flex-wrap sm:flex-nowrap">
                  <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden bg-neutral-100 rounded-sm">
                    {l.imageUrl ? <Image src={l.imageUrl} alt={l.name} fill className="object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <p className="font-semibold text-sm">{l.name}</p>
                    <p className="text-xs opacity-60">
                      {l.vendorName} · {l.kind === "set" ? dict.cart.fullSet : dict.cart.singlePiece}
                      {l.size ? ` · ${dict.cart.size} ${l.size}` : ""}
                    </p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => setQty(key, Math.max(1, Number(e.target.value) || 1))}
                    className="mn-input !w-16 text-center"
                  />
                  <p className="w-20 text-right text-sm font-semibold">{formatPrice(l.priceCents * l.qty)}</p>
                  <button onClick={() => remove(key)} className="text-xs opacity-50 hover:opacity-100">
                    {dict.cart.remove}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm opacity-70">{dict.cart.subtotal}</p>
            <p className="text-xl font-semibold">{formatPrice(subtotalCents)}</p>
          </div>
          <p className="text-xs opacity-50 mt-1">{dict.cart.multiVendorNote}</p>
          <div className="mt-6 flex justify-end">
            <Link href="/checkout" className="mn-btn-accent">
              {dict.cart.checkout}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
