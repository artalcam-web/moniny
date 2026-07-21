import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: "published" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, vendor: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mn-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--mn-line)" }}>
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--mn-ink) 0, var(--mn-ink) 2px, transparent 2px, transparent 64px)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28 text-center">
          <span className="mn-tag" style={{ background: "var(--mn-yellow)" }}>
            Hecho en Nueva York
          </span>
          <h1 className="mn-headline mt-5 text-4xl leading-tight sm:text-6xl">
            Conjuntos curados,
            <br />
            directo de vendedoras independientes.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base opacity-70">
            Cada vendedora arma sus propios conjuntos — colección por colección, temporada por temporada.
            Compra el look completo o cada pieza por separado.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/marcas" className="mn-btn-accent">
              Explorar el marketplace →
            </Link>
            <Link href="/vendor/register" className="mn-btn-outline">
              Vender en moniNY
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="mn-headline text-2xl">Conjuntos del momento</h2>
          <Link href="/marcas" className="mn-btn-ghost text-sm">
            Ver todo
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="opacity-60 text-sm">
            Todavía no hay conjuntos publicados.{" "}
            <Link href="/vendor/register" className="underline">
              Sé la primera vendedora
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                vendorName={p.vendor.name}
                priceCents={p.priceCents}
                imageUrl={p.images[0]?.url}
              />
            ))}
          </div>
        )}
      </section>

      {/* Vendors */}
      <section className="border-y" style={{ borderColor: "var(--mn-line)", background: "var(--mn-panel)" }}>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="mn-headline text-2xl mb-8">Vendedoras en moniNY</h2>
          {vendors.length === 0 ? (
            <p className="opacity-60 text-sm">Aún no hay vendedoras registradas.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {vendors.map((v) => (
                <Link key={v.id} href={`/marcas/${v.slug}`} className="mn-card p-5 block">
                  <p className="mn-headline text-lg">{v.name}</p>
                  <p className="text-xs opacity-60 mt-1">{v.city}</p>
                  <p className="text-xs opacity-60 mt-3">{v._count.products} conjunto(s)</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
