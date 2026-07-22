import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const NEW_WINDOW_DAYS = 14;
const SEASON_KEYS = ["spring", "summer", "fall", "winter", "sport", "formal"] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; season?: string }>;
}) {
  const { q, season } = await searchParams;
  const { dict } = await getDictionary();

  const hasFilters = !!q || !!season;

  const products = hasFilters
    ? await prisma.product.findMany({
        where: {
          status: "published",
          ...(season ? { collection: { season: { equals: season, mode: "insensitive" } } } : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  { vendor: { name: { contains: q, mode: "insensitive" } } },
                ],
              }
            : {}),
        },
        include: { images: { orderBy: { position: "asc" }, take: 1 }, vendor: true },
        orderBy: { createdAt: "desc" },
      })
    : await prisma.product.findMany({
        where: { status: "published" },
        include: { images: { orderBy: { position: "asc" }, take: 1 }, vendor: true },
        orderBy: { createdAt: "desc" },
      });

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  // eslint-disable-next-line react-hooks/purity -- server-only, request-scoped "is this recent" cutoff, safe in a force-dynamic route
  const newCutoff = Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 mn-fade-up">
      <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--mn-link)" }}>
        {dict.marcas.eyebrow}
      </p>
      <h1 className="mn-headline mt-1 text-2xl sm:text-3xl mb-2">
        {q ? dict.marcas.searchResultsFor.replace("{q}", q) : dict.marcas.title}
      </h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/marcas"
          className={!season ? "mn-btn-primary !py-2 !px-4 text-sm" : "mn-btn-outline !py-2 !px-4 text-sm"}
        >
          {dict.marcas.allCategories}
        </Link>
        {SEASON_KEYS.map((key) => (
          <Link
            key={key}
            href={`/marcas?season=${key}`}
            className={season === key ? "mn-btn-primary !py-2 !px-4 text-sm" : "mn-btn-outline !py-2 !px-4 text-sm"}
          >
            {dict.seasons[key]}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="opacity-60 text-sm mb-12">{dict.marcas.noResults}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 mb-16">
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

      <div className="border-t pt-10" style={{ borderColor: "var(--mn-line)" }}>
        <h2 className="mn-headline text-xl mb-6">{dict.marcas.sellersTitle}</h2>
        {vendors.length === 0 ? (
          <p className="opacity-60 text-sm">
            {dict.marcas.noSellers}{" "}
            <Link href="/vendor/register" className="underline">
              {dict.marcas.beFirst}
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {vendors.map((v) => (
              <Link key={v.id} href={`/marcas/${v.slug}`} className="mn-card p-4 block">
                <p className="mn-headline text-sm">{v.name}</p>
                <p className="text-xs opacity-60 mt-1">{v.city}</p>
                {v.bio ? <p className="text-xs mt-2 opacity-75 line-clamp-2">{v.bio}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
