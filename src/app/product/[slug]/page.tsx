import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      vendor: true,
      collection: true,
      images: { orderBy: { position: "asc" } },
      items: { orderBy: { position: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moniny.onrender.com";
  const absoluteImage = product.images[0] ? `${siteUrl}${product.images[0].url}` : undefined;
  return {
    title: `${product.name} — ${product.vendor.name} | moniNY`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: absoluteImage ? [absoluteImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status !== "published") notFound();

  const items = product.items.map((it) => ({
    id: it.id,
    name: it.name,
    description: it.description,
    priceCents: it.priceCents,
    imageUrl: it.imageUrl,
    sizes: JSON.parse(it.sizes) as string[],
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 mn-fade-up">
      <div className="mb-6 text-sm">
        <Link href={`/marcas/${product.vendor.slug}`} className="mn-btn-ghost">
          ← {product.vendor.name}
        </Link>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="mn-card relative aspect-[4/5] overflow-hidden bg-neutral-100">
            {product.images[0] ? (
              <Image src={product.images[0].url} alt={product.name} fill sizes="50vw" className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-xs opacity-40">Sin imagen</div>
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="mn-card relative aspect-square overflow-hidden bg-neutral-100">
                  <Image src={img.url} alt={product.name} fill sizes="12vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
          {product.videoUrl ? (
            <video controls className="mn-card w-full" src={product.videoUrl} />
          ) : null}
        </div>

        <div>
          {product.collection ? (
            <span className="mn-tag" style={{ background: "var(--mn-yellow)" }}>
              {product.collection.season || product.collection.name}
            </span>
          ) : null}
          <h1 className="mn-headline mt-3 text-3xl">{product.name}</h1>
          <p className="text-sm opacity-60 mt-1">por {product.vendor.name} · {product.vendor.city}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed opacity-80 whitespace-pre-line">{product.description}</p>

          <div className="mt-8">
            <ProductPurchasePanel
              vendorId={product.vendorId}
              vendorName={product.vendor.name}
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              priceCents={product.priceCents}
              sellItemsSeparately={product.sellItemsSeparately}
              items={items}
              coverImageUrl={product.images[0]?.url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
