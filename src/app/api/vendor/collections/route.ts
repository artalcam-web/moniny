import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getVendorIdFromSession } from "@/lib/auth";
import { slugify, randomSuffix } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  season: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const vendorId = await getVendorIdFromSession();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { name, season, description } = parsed.data;
  let slug = slugify(name);
  while (await prisma.collection.findUnique({ where: { vendorId_slug: { vendorId, slug } } })) {
    slug = `${slugify(name)}-${randomSuffix(4)}`;
  }

  const collection = await prisma.collection.create({
    data: { vendorId, name, season, description, slug },
  });

  return NextResponse.json({ collection });
}
