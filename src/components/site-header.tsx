"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b" style={{ borderColor: "var(--mn-line)", background: "var(--mn-bg)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="mn-headline text-2xl">
          moni<span style={{ color: "var(--mn-red)" }}>NY</span>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium sm:flex">
          <Link href="/marcas" className="mn-btn-ghost">
            Vendedoras
          </Link>
          <Link href="/vendor/register" className="mn-btn-ghost">
            Vender en moniNY
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/vendor/login" className="hidden text-sm font-medium sm:inline mn-btn-ghost">
            Panel de vendedora
          </Link>
          <Link href="/cart" className="mn-btn-outline !py-2 !px-4 text-sm">
            Carrito
            {count > 0 ? (
              <span
                className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold"
                style={{ background: "var(--mn-red)", color: "#fff" }}
              >
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
