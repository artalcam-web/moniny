import Link from "next/link";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ orders?: string }>;
}) {
  const { orders } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center mn-fade-up">
      <p className="mn-headline text-6xl mb-4">✓</p>
      <h1 className="mn-headline text-3xl mb-3">¡Pedido recibido!</h1>
      <p className="opacity-70">
        Gracias por tu compra{orders && Number(orders) > 1 ? ` (${orders} vendedoras distintas)` : ""}. Cada
        vendedora te escribirá por email para coordinar el pago y el envío.
      </p>
      <Link href="/marcas" className="mn-btn-accent mt-8 inline-flex">
        Seguir explorando
      </Link>
    </div>
  );
}
