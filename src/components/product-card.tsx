import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

type Props = {
  slug: string;
  name: string;
  vendorName: string;
  priceCents: number;
  imageUrl?: string | null;
};

export function ProductCard({ slug, name, vendorName, priceCents, imageUrl }: Props) {
  return (
    <Link href={`/product/${slug}`} className="mn-card group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs opacity-40">Sin imagen</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs opacity-60">{vendorName}</p>
        <h3 className="mn-headline text-base mt-1">{name}</h3>
        <p className="text-sm font-semibold mt-2">{formatPrice(priceCents)}</p>
      </div>
    </Link>
  );
}
