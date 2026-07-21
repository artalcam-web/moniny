import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getVendorIdFromSession } from "@/lib/auth";
import { slugify, randomSuffix } from "@/lib/utils";

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().optional(),
  sizes: z.array(z.string()).default([]),
});

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  videoUrl: z.string().optional(),
  priceCents: z.number().int().positive(),
  collectionId: z.string().optional(),
  sellItemsSeparately: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("published"),
  images: z.array(z.string()).min(1),
  items: z.array(itemSchema).default([]),
});

export async function POST(req: NextRequest) {
  const vendorId = await getVendorIdFromSession();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.collectionId) {
    const collection = await prisma.collection.findFirst({ where: { id: data.collectionId, vendorId } });
    if (!collection) return NextResponse.json({ error: "Colección inválida" }, { status: 400 });
  }

  let slug = slugify(data.name);
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slugify(data.name)}-${randomSuffix(4)}`;
  }

  const product = await prisma.product.create({
    data: {
      vendorId,
      slug,
      name: data.name,
      description: data.description,
      videoUrl: data.videoUrl || null,
      priceCents: data.priceCents,
      collectionId: data.collectionId || null,
      sellItemsSeparately: data.sellItemsSeparately,
      status: data.status,
      images: {
        create: data.images.map((url, i) => ({ url, position: i })),
      },
      items: {
        create: data.items.map((it, i) => ({
          name: it.name,
          description: it.description || null,
          priceCents: it.priceCents,
          imageUrl: it.imageUrl || null,
          sizes: JSON.stringify(it.sizes),
          position: i,
        })),
      },
    },
    include: { images: true, items: true },
  });

  return NextResponse.json({ product });
}
