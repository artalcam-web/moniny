"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { lines, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: lines.map((l) => ({
            vendorId: l.vendorId,
            kind: l.kind,
            productId: l.productId,
            productItemId: l.productItemId,
            name: l.name,
            size: l.size,
            qty: l.qty,
            priceCents: l.priceCents,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos procesar tu pedido");
      clear();
      router.push(`/pedido-confirmado?orders=${data.orderIds.length}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos procesar tu pedido. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center mn-fade-up">
        <p className="opacity-60">Tu carrito está vacío. Añade conjuntos o piezas antes de finalizar la compra.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 mn-fade-up">
      <h1 className="mn-headline text-3xl mb-8">Finalizar compra</h1>
      <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Nombre completo</label>
            <input
              required
              className="mn-input"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <input
                required
                type="email"
                className="mn-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Teléfono</label>
              <input className="mn-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Dirección de envío</label>
            <input
              required
              className="mn-input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Ciudad</label>
            <input required className="mn-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Notas (opcional)</label>
            <textarea
              className="mn-input"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="rounded border p-4 text-sm" style={{ borderColor: "var(--mn-line)", background: "var(--mn-panel)" }}>
            Pago: cada vendedora te contactará por email para coordinar el pago de su parte del pedido.
            El cobro automático en línea (Stripe) se activará próximamente.
          </div>

          {error ? <p className="text-sm" style={{ color: "var(--mn-red)" }}>{error}</p> : null}

          <button type="submit" disabled={submitting} className="mn-btn-accent w-full justify-center disabled:opacity-60">
            {submitting ? "Enviando pedido…" : `Confirmar pedido · ${formatPrice(subtotalCents)}`}
          </button>
        </form>

        <aside className="mn-card h-fit p-5">
          <h2 className="mn-headline text-lg mb-4">Resumen</h2>
          <div className="space-y-3 text-sm">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {l.name} <span className="opacity-50">× {l.qty}</span>
                </span>
                <span>{formatPrice(l.priceCents * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t pt-4 text-sm font-semibold" style={{ borderColor: "var(--mn-line)" }}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
