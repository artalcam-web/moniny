import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 mn-fade-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--mn-navy)" }}>
        Marketplace
      </p>
      <h1 className="mn-headline mt-2 text-3xl mb-10">Vendedoras</h1>

      {vendors.length === 0 ? (
        <p className="opacity-60 text-sm">
          Aún no hay vendedoras.{" "}
          <Link href="/vendor/register" className="underline">
            Regístrate como la primera
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <Link key={v.id} href={`/marcas/${v.slug}`} className="mn-card p-5 block">
              <p className="mn-headline text-lg">{v.name}</p>
              <p className="text-xs opacity-60 mt-1">{v.city}</p>
              {v.bio ? <p className="text-sm mt-3 opacity-75 line-clamp-2">{v.bio}</p> : null}
              <p className="text-xs opacity-60 mt-3">{v._count.products} conjunto(s)</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
