import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function VendorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  return (
    <div className="mn-fade-up">
      <section className="border-b py-14" style={{ borderColor: "var(--mn-line)", background: "var(--mn-panel)" }}>
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--mn-navy)" }}>
            {vendor.city}
          </p>
          <h1 className="mn-headline mt-2 text-4xl">{vendor.name}</h1>
          {vendor.bio ? <p className="mt-3 max-w-xl text-sm opacity-75">{vendor.bio}</p> : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 space-y-16">
        {vendor.collections.map((c) =>
          c.products.length > 0 ? (
            <section key={c.id}>
              <div className="mb-6">
                {c.season ? (
                  <span className="mn-tag" style={{ background: "var(--mn-yellow)" }}>
                    {c.season}
                  </span>
                ) : null}
                <h2 className="mn-headline text-2xl mt-2">{c.name}</h2>
                {c.description ? <p className="text-sm opacity-70 mt-1">{c.description}</p> : null}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {c.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    vendorName={vendor.name}
                    priceCents={p.priceCents}
                    imageUrl={p.images[0]?.url}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )}

        {vendor.products.length > 0 ? (
          <section>
            <h2 className="mn-headline text-2xl mb-6">Otros conjuntos</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {vendor.products.map((p) => (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name}
                  vendorName={vendor.name}
                  priceCents={p.priceCents}
                  imageUrl={p.images[0]?.url}
                />
              ))}
            </div>
          </section>
        ) : null}

        {vendor.collections.every((c) => c.products.length === 0) && vendor.products.length === 0 ? (
          <p className="opacity-60 text-sm">Esta vendedora todavía no publicó conjuntos.</p>
        ) : null}
      </div>
    </div>
  );
}
