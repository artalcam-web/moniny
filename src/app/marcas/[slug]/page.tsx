import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

const NEW_WINDOW_DAYS = 14;

function seasonLabel(dict: Dictionary, season: string | null): string | null {
  if (!season) return null;
  const key = season.toLowerCase() as keyof Dictionary["seasons"];
  return dict.seasons[key] ?? season;
}

export default async function VendorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { dict } = await getDictionary();
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    include: {
      collections: {
        orderBy: { createdAt: "desc" },
        include: {
          products: {
            where: { status: "published" },
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
        },
      },
      products: {
        where: { status: "published", collectionId: null },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  });

  if (!vendor) notFound();

  // eslint-disable-next-line react-hooks/purity -- server-only, request-scoped "is this recent" cutoff, safe in a force-dynamic route
  const newCutoff = Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return (
    <div className="mn-fade-up">
      <section className="border-b py-12" style={{ borderColor: "var(--mn-line)", background: "var(--mn-panel)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--mn-link)" }}>
            {vendor.city}
          </p>
          <h1 className="mn-headline mt-2 text-3xl sm:text-4xl">{vendor.name}</h1>
          {vendor.bio ? <p className="mt-3 max-w-xl text-sm opacity-75">{vendor.bio}</p> : null}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
        {vendor.collections.map((c) =>
          c.products.length > 0 ? (
            <section key={c.id}>
              <div className="mb-5">
                {c.season ? <span className="mn-tag mn-badge-new">{seasonLabel(dict, c.season)}</span> : null}
                <h2 className="mn-headline text-xl mt-2">{c.name}</h2>
                {c.description ? <p className="text-sm opacity-70 mt-1">{c.description}</p> : null}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {c.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    vendorName={vendor.name}
                    priceCents={p.priceCents}
                    compareAtPriceCents={p.compareAtPriceCents}
                    imageUrl={p.images[0]?.url}
                    isNew={p.createdAt.getTime() > newCutoff}
                    dict={dict}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )}

        {vendor.products.length > 0 ? (
          <section>
            <h2 className="mn-headline text-xl mb-5">{dict.vendorPage.otherSets}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {vendor.products.map((p) => (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name}
                  vendorName={vendor.name}
                  priceCents={p.priceCents}
                  compareAtPriceCents={p.compareAtPriceCents}
                  imageUrl={p.images[0]?.url}
                  isNew={p.createdAt.getTime() > newCutoff}
                  dict={dict}
                />
              ))}
            </div>
          </section>
        ) : null}

        {vendor.collections.every((c) => c.products.length === 0) && vendor.products.length === 0 ? (
          <p className="opacity-60 text-sm">{dict.vendorPage.noSets}</p>
        ) : null}
      </div>
    </div>
  );
}
