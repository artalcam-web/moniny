import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ orders?: string }>;
}) {
  const { orders } = await searchParams;
  const { dict } = await getDictionary();
  const count = orders ? Number(orders) : 1;
  const multi = count > 1 ? dict.orderConfirmed.multiSuffix.replace("{count}", String(count)) : "";

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center mn-fade-up">
      <p className="mn-headline text-6xl mb-4">✓</p>
      <h1 className="mn-headline text-2xl sm:text-3xl mb-3">{dict.orderConfirmed.title}</h1>
      <p className="opacity-70">{dict.orderConfirmed.body.replace("{multi}", multi)}</p>
      <Link href="/marcas" className="mn-btn-accent mt-8 inline-flex">
        {dict.orderConfirmed.keepExploring}
      </Link>
    </div>
  );
}
