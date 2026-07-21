import { redirect } from "next/navigation";
import { getVendorIdFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewProductForm } from "./new-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const vendorId = await getVendorIdFromSession();
  if (!vendorId) redirect("/vendor/login");

  const collections = await prisma.collection.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, season: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 mn-fade-up">
      <h1 className="mn-headline text-3xl mb-2">Nuevo conjunto</h1>
      <p className="text-sm opacity-70 mb-8">
        Sube tu conjunto ya armado: fotos, descripción, video opcional y precio. Cada conjunto tiene su
        propia página, lista para compartir como landing page.
      </p>
      <NewProductForm collections={collections} />
    </div>
  );
}
