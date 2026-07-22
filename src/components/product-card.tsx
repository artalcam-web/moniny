import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  slug: string;
  name: string;
  vendorName: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl?: string | null;
  isNew?: boolean;
  dict: Dictionary;
};

// Deterministic placeholder rating (no review system yet) so cards read like
// a real marketplace listing. Swap for real aggregated reviews later.
function placeholderRating(seed: string): { stars: number; count: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const stars = 3.8 + (hash % 12) / 10; // 3.8–5.0
  const count = 8 + (hash % 240);
  return { stars: Math.min(5, Math.round(stars * 10) / 10), count };
}

export function ProductCard({ slug, name, vendorName, priceCents, compareAtPriceCents, imageUrl, isNew, dict }: Props) {
  const { stars, count } = placeholderRating(slug);
  const fullStars = Math.round(stars);
  const onSale = !!compareAtPriceCents && compareAtPriceCents > priceCents;

  return (
    <Link href={`/product/${slug}`} className="mn-card group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs opacity-40">No image</div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isNew ? <span className="mn-tag mn-badge-new">{dict.productCard.new}</span> : null}
          {onSale ? <span className="mn-tag mn-badge-sale">{dict.productCard.sale}</span> : null}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium leading-snug line-clamp-2">{name}</h3>
        <p className="mn-stars mt-1">
          {"★".repeat(fullStars)}
          {"☆".repeat(5 - fullStars)}{" "}
          <span className="text-[11px] font-normal opacity-60">
            {stars.toFixed(1)} ({count})
          </span>
        </p>
        <p className="mt-1 text-base font-bold">
          {formatPrice(priceCents)}
          {onSale ? <span className="mn-strike ml-2 text-xs font-normal">{formatPrice(compareAtPriceCents!)}</span> : null}
        </p>
        <p className="mt-0.5 text-[11px] opacity-50">
          {dict.productCard.soldBy} {vendorName}
        </p>
      </div>
    </Link>
  );
}
