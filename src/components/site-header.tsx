"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/i18n/client";

export function SiteHeader() {
  const { count } = useCart();
  const { dict, locale, setLocale } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/marcas?q=${encodeURIComponent(query.trim())}` : "/marcas");
  }

  return (
    <header className="sticky top-0 z-30">
      <div style={{ background: "var(--mn-navy)" }}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="mn-headline shrink-0 text-xl text-white">
            moni<span style={{ color: "var(--mn-orange)" }}>NY</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 items-center sm:flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.nav.searchPlaceholder}
              className="h-10 w-full rounded-l-md border-0 px-3 text-sm text-black outline-none"
            />
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded-r-md px-4"
              style={{ background: "var(--mn-orange)" }}
              aria-label="Search"
            >
              🔍
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-4 text-sm text-white">
            <Link href="/marcas" className="hidden sm:inline hover:underline">
              {dict.nav.brands}
            </Link>
            <Link href="/vendor/register" className="hidden md:inline hover:underline">
              {dict.nav.sell}
            </Link>
            <Link href="/vendor/login" className="hidden md:inline hover:underline">
              {dict.nav.vendorPanel}
            </Link>

            <div className="flex overflow-hidden rounded border border-white/30 text-xs font-semibold">
              <button
                onClick={() => setLocale("en")}
                className="px-2 py-1"
                style={{ background: locale === "en" ? "var(--mn-orange)" : "transparent", color: locale === "en" ? "#000" : "#fff" }}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("es")}
                className="px-2 py-1"
                style={{ background: locale === "es" ? "var(--mn-orange)" : "transparent", color: locale === "es" ? "#000" : "#fff" }}
              >
                ES
              </button>
            </div>

            <Link href="/cart" className="flex items-center gap-1 whitespace-nowrap">
              🛒 {dict.nav.cart}
              {count > 0 ? (
                <span
                  className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold"
                  style={{ background: "var(--mn-orange)", color: "#000" }}
                >
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex px-4 pb-3 sm:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.nav.searchPlaceholder}
            className="h-9 w-full rounded-l-md border-0 px-3 text-sm text-black outline-none"
          />
          <button type="submit" className="flex h-9 items-center justify-center rounded-r-md px-3" style={{ background: "var(--mn-orange)" }}>
            🔍
          </button>
        </form>
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 py-2 text-sm sm:px-6" style={{ background: "var(--mn-navy-2)", color: "#fff" }}>
        <Link href="/marcas" className="whitespace-nowrap hover:underline sm:hidden">
          {dict.nav.brands}
        </Link>
        <Link href="/vendor/register" className="whitespace-nowrap hover:underline">
          {dict.nav.sell}
        </Link>
        <Link href="/marcas?season=summer" className="whitespace-nowrap hover:underline">
          {dict.seasons.summer}
        </Link>
        <Link href="/marcas?season=fall" className="whitespace-nowrap hover:underline">
          {dict.seasons.fall}
        </Link>
        <Link href="/marcas?season=sport" className="whitespace-nowrap hover:underline">
          {dict.seasons.sport}
        </Link>
        <Link href="/marcas?season=formal" className="whitespace-nowrap hover:underline">
          {dict.seasons.formal}
        </Link>
      </div>
    </header>
  );
}
