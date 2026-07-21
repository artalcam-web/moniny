import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Monica2026!", 10);

  const vendor = await prisma.vendor.upsert({
    where: { email: "monica@moniny.com" },
    update: {},
    create: {
      slug: "monica-nyc",
      name: "Mónica NYC",
      email: "monica@moniny.com",
      passwordHash,
      city: "New York",
      bio: "Curaduría de conjuntos armados a mano en el West Village. Piezas seleccionadas, mezcladas y combinadas temporada a temporada.",
    },
  });

  const collection = await prisma.collection.upsert({
    where: { vendorId_slug: { vendorId: vendor.id, slug: "verano" } },
    update: {},
    create: {
      vendorId: vendor.id,
      slug: "verano",
      name: "Verano en la Ciudad",
      season: "Verano",
      description: "Piezas ligeras para días largos de Manhattan a Brooklyn.",
    },
  });

  const images = Array.from({ length: 8 }, (_, i) => `/uploads/seed/dress_${i + 1}.jpg`);

  const existing = await prisma.product.findUnique({ where: { slug: "vestido-floral-soho" } });
  if (!existing) {
    await prisma.product.create({
      data: {
        vendorId: vendor.id,
        collectionId: collection.id,
        slug: "vestido-floral-soho",
        name: "Vestido Floral Soho",
        description:
          "Vestido midi de algodón con estampado floral azul y lazo a la cintura, fotografiado en un showroom de Soho. Conjunto curado por Mónica: el vestido solo o combinado con el cinturón a juego.",
        priceCents: 12900,
        sellItemsSeparately: true,
        status: "published",
        images: { create: images.map((url, i) => ({ url, position: i })) },
        items: {
          create: [
            {
              name: "Vestido floral midi",
              description: "La pieza principal del conjunto.",
              priceCents: 9900,
              imageUrl: images[0],
              sizes: JSON.stringify(["XS", "S", "M", "L"]),
              position: 0,
            },
            {
              name: "Cinturón lazo a juego",
              description: "Cinturón de tela removible, mismo estampado.",
              priceCents: 2500,
              imageUrl: images[2],
              sizes: JSON.stringify(["Única"]),
              position: 1,
            },
          ],
        },
      },
    });
  }

  console.log("Seed listo. Vendedora demo:", vendor.email, "/ contraseña: Monica2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
