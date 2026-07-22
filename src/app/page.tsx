import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const NEW_WINDOW_DAYS = 14;

export default async function HomePage() {
  const { dict } = await getDictionary();

  const products = await prisma.product.findMany({
    where: { status: "published" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, vendor: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { _count: { select: { products: true } } },
  });

  // eslint-disable-next-line react-hooks/purity -- server-only, request-scoped "is this recent" cutoff, safe in a force-dynamic route
  const newCutoff = Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return (
    <div className="mn-fade-up">
      {/* Hero */}
      <section className="border-b" style={{ borderColor: "var(--mn-line)", background: "var(--mn-panel)" }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 text-center">
          <span className="mn-tag mn-badge-new">{dict.home.badge}</span>
          <h1 className="mn-headline mt-4 text-3xl leading-tight sm:text-5xl">
            {dict.home.title1}
            <br />
            {dict.home.title2}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base opacity-70">{dict.home.subtitle}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/marcas" className="mn-btn-accent">
              {dict.home.cta1}
            </Link>
            <Link href="/vendor/register" className="mn-btn-outline">
              {dict.home.cta2}
            </Link>
          </div>
        </div>
      </section>

      {/* Deals strip */}
      <div className="px-4 py-2 text-center text-xs font-bold tracking-wide sm:text-sm" style={{ background: "var(--mn-pink)", color: "#fff" }}>
        {dict.home.dealsStrip}
      </div>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="mn-headline text-xl sm:text-2xl">{dict.home.trending}</h2>
          <Link href="/marcas" className="mn-btn-ghost text-sm">
            {dict.home.viewAll}
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="opacity-60 text-sm">
            {dict.home.noProducts}{" "}
            <Link href="/vendor/register" className="underline">
              {dict.home.beFirst}
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                vendorName={p.vendor.name}
                priceCents={p.priceCents}
                compareAtPriceCents={p.compareAtPriceCents}
                imageUrl={p.images[0]?.url}
                isNew={p.createdAt.getTime() > newCutoff}
                dict={dict}
              />
            ))}
          </div>
        )}
      </section>

      {/* Vendors */}
      <section className="border-t" style={{ borderColor: "var(--mn-line)", background: "var(--mn-panel)" }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="mn-headline text-xl sm:text-2xl mb-6">{dict.home.sellers}</h2>
          {vendors.length === 0 ? (
            <p className="opacity-60 text-sm">{dict.home.noSellers}</p>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {vendors.map((v) => (
                <Link key={v.id} href={`/marcas/${v.slug}`} className="mn-card p-4 block">
                  <p className="mn-headline text-sm">{v.name}</p>
                  <p className="text-xs opacity-60 mt-1">{v.city}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {v._count.products} {dict.home.setsCount}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
