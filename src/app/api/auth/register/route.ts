import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createVendorSession } from "@/lib/auth";
import { slugify, randomSuffix } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  city: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { name, email, password, city, bio } = parsed.data;

  const existing = await prisma.vendor.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  let slug = slugify(name);
  while (await prisma.vendor.findUnique({ where: { slug } })) {
    slug = `${slugify(name)}-${randomSuffix(4)}`;
  }

  const passwordHash = await hashPassword(password);
  const vendor = await prisma.vendor.create({
    data: { name, email, passwordHash, slug, city: city || "New York", bio },
  });

  await createVendorSession(vendor.id);

  return NextResponse.json({ vendor: { id: vendor.id, slug: vendor.slug, name: vendor.name } });
}
