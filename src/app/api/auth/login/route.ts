import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createVendorSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const vendor = await prisma.vendor.findUnique({ where: { email } });
  if (!vendor || !(await verifyPassword(password, vendor.passwordHash))) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  await createVendorSession(vendor.id);
  return NextResponse.json({ vendor: { id: vendor.id, slug: vendor.slug, name: vendor.name } });
}
