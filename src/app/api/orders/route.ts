import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cartItemSchema = z.object({
  vendorId: z.string(),
  kind: z.enum(["set", "item"]),
  productId: z.string().optional(),
  productItemId: z.string().optional(),
  name: z.string(),
  size: z.string().optional(),
  qty: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
});

const schema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(cartItemSchema).min(1),
});

// Splits a mixed multi-vendor cart into one Order per vendor (marketplace
// pattern) and creates them all. Payment is not charged yet — this only
// persists the order; Stripe Connect can be wired in later per vendor.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const byVendor = new Map<string, typeof data.items>();
  for (const item of data.items) {
    const list = byVendor.get(item.vendorId) ?? [];
    list.push(item);
    byVendor.set(item.vendorId, list);
  }

  const orderIds: string[] = [];
  for (const [vendorId, items] of byVendor) {
    const subtotalCents = items.reduce((sum, it) => sum + it.priceCents * it.qty, 0);
    const order = await prisma.order.create({
      data: {
        vendorId,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        notes: data.notes,
        subtotalCents,
        items: {
          create: items.map((it) => ({
            productId: it.kind === "set" ? it.productId : undefined,
            productItemId: it.kind === "item" ? it.productItemId : undefined,
            name: it.name,
            kind: it.kind,
            size: it.size,
            qty: it.qty,
            priceCents: it.priceCents,
          })),
        },
      },
    });
    orderIds.push(order.id);
  }

  return NextResponse.json({ orderIds });
}
