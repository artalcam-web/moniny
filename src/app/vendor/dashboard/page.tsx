import Link from "next/link";
import { redirect } from "next/navigation";
import { getVendorIdFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const vendorId = await getVendorIdFromSession();
  if (!vendorId) redirect("/vendor/login");

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      collections: { orderBy: { createdAt: "desc" }, include: { _count: { select: { products: true } } } },
      products: { orderBy: { createdAt: "desc" }, include: { images: { take: 1 }, collection: true } },
    },
  });
  if (!vendor) redirect("/vendor/login");

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 mn-fade-up">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs opacity-60">Hola, {vendor.name}</p>
          <h1 className="mn-headline text-3xl">Tu panel</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/marcas/${vendor.slug}`} className="mn-btn-outline !py-2 !px-4 text-sm">
            Ver mi tienda
          </Link>
          <LogoutButton />
        </div>
      </div>

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="mn-headline text-xl">Divisiones / Colecciones</h2>
          <Link href="/vendor/dashboard/collections/new" className="mn-btn-accent !py-2 !px-4 text-sm">
            + Nueva colección
          </Link>
        </div>
        {vendor.collections.length === 0 ? (
          <p className="text-sm opacity-60">
            Aún no tienes colecciones (ej. Verano, Otoño, Sport, Formal). Crea una para organizar tus conjuntos.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {vendor.collections.map((c) => (
              <div key={c.id} className="mn-card p-4">
                <p className="font-semibold text-sm">{c.name}</p>
                {c.season ? <p className="text-xs opacity-60">{c.season}</p> : null}
                <p className="text-xs opacity-60 mt-2">{c._count.products} conjunto(s)</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="mn-headline text-xl">Tus conjuntos</h2>
          <Link href="/vendor/dashboard/products/new" className="mn-btn-accent !py-2 !px-4 text-sm">
            + Nuevo conjunto
          </Link>
        </div>
        {vendor.products.length === 0 ? (
          <p className="text-sm opacity-60">Todavía no subiste ningún conjunto.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {vendor.products.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="mn-card flex items-center gap-3 p-3">
                <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-100">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs opacity-60">
                    {p.collection?.name ?? "Sin colección"} · {p.status === "published" ? "Publicado" : "Borrador"}
                  </p>
                  <p className="text-xs mt-1">{formatPrice(p.priceCents)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
