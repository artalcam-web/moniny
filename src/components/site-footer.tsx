"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/client";

export function SiteFooter() {
  const { dict } = useLocale();
  return (
    <footer className="mt-20 border-t" style={{ borderColor: "var(--mn-line)", background: "var(--mn-navy)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 sm:grid-cols-3 text-white">
        <div>
          <p className="mn-headline text-xl">
            moni<span style={{ color: "var(--mn-orange)" }}>NY</span>
          </p>
          <p className="mt-2 text-sm opacity-70">{dict.footer.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-2">{dict.footer.explore}</p>
          <p><Link className="opacity-70 hover:opacity-100" href="/marcas">{dict.nav.brands}</Link></p>
          <p><Link className="opacity-70 hover:opacity-100" href="/vendor/register">{dict.nav.sell}</Link></p>
          <p><Link className="opacity-70 hover:opacity-100" href="/vendor/login">{dict.nav.vendorPanel}</Link></p>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-2">{dict.footer.newsletter}</p>
          <p className="opacity-70 mb-2">{dict.footer.newsletterCopy}</p>
          <div className="flex gap-2">
            <input className="mn-input" placeholder="you@email.com" />
            <button className="mn-btn-accent !px-4 whitespace-nowrap">{dict.footer.join}</button>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-white/60" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
        © {new Date().getFullYear()} moniNY. {dict.footer.rights}
      </div>
    </footer>
  );
}
