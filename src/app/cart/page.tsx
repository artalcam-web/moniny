"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { lines, subtotalCents, setQty, remove, keyOf } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 mn-fade-up">
      <h1 className="mn-headline text-3xl mb-8">Tu carrito</h1>

      {lines.length === 0 ? (
        <div className="text-center py-20">
          <p className="opacity-60 mb-4">Tu carrito está vacío.</p>
          <Link href="/marcas" className="mn-btn-accent">
            Explorar vendedoras
          </Link>
        </div>
      ) : (
        <>
          <div className="mn-card divide-y" style={{ borderColor: "var(--mn-line)" }}>
            {lines.map((l) => {
              const key = keyOf(l);
              return (
                <div key={key} className="flex items-center gap-4 p-4">
                  <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden bg-neutral-100 rounded-sm">
                    {l.imageUrl ? (
                      <Image src={l.imageUrl} alt={l.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{l.name}</p>
                    <p className="text-xs opacity-60">
                      {l.vendorName} · {l.kind === "set" ? "Conjunto completo" : "Pieza individual"}
                      {l.size ? ` · Talla ${l.size}` : ""}
                    </p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => setQty(key, Math.max(1, Number(e.target.value) || 1))}
                    className="mn-input !w-16 text-center"
                  />
                  <p className="w-24 text-right text-sm font-semibold">{formatPrice(l.priceCents * l.qty)}</p>
                  <button onClick={() => remove(key)} className="text-xs opacity-50 hover:opacity-100">
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm opacity-70">Subtotal</p>
            <p className="text-xl font-semibold">{formatPrice(subtotalCents)}</p>
          </div>
          <p className="text-xs opacity-50 mt-1">
            Si compras de varias vendedoras, se generará un pedido por cada una.
          </p>
          <div className="mt-6 flex justify-end">
            <Link href="/checkout" className="mn-btn-accent">
              Finalizar compra
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
