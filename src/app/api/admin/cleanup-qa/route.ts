import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-off cleanup endpoint for QA test data created during deployment
// verification. Protected by AUTH_SECRET as a shared secret. Safe to delete
// this file after use.
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const emails = ["qa-test@moniny.com"];
  const vendors = await prisma.vendor.findMany({ where: { email: { in: emails } } });
  for (const v of vendors) {
    await prisma.vendor.delete({ where: { id: v.id } });
  }
  await prisma.order.deleteMany({ where: { customerName: "Cliente QA" } });
  return NextResponse.json({ deletedVendors: vendors.map((v) => v.email) });
}
