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
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 mn-fade-up">
      <h1 className="mn-headline text-2xl sm:text-3xl mb-2">New set</h1>
      <p className="text-sm opacity-70 mb-8">
        Upload your already-curated set: photos, description, optional video, and price. Every set gets
        its own page, ready to share as a landing page.
      </p>
      <NewProductForm collections={collections} />
    </div>
  );
}
