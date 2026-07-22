import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Monica2026!", 10);

  const vendorData = {
    name: "Monica NYC",
    city: "New York",
    bio: "Hand-curated sets from a West Village studio. Pieces scouted, styled, and put together season after season.",
  };

  const vendor = await prisma.vendor.upsert({
    where: { email: "monica@moniny.com" },
    update: vendorData,
    create: {
      slug: "monica-nyc",
      email: "monica@moniny.com",
      passwordHash,
      ...vendorData,
    },
  });

  const collectionData = {
    name: "Summer in the City",
    season: "summer",
    description: "Lightweight pieces for long days from Manhattan to Brooklyn.",
  };

  const collection = await prisma.collection.upsert({
    where: { vendorId_slug: { vendorId: vendor.id, slug: "summer" } },
    update: collectionData,
    create: {
      vendorId: vendor.id,
      slug: "summer",
      ...collectionData,
    },
  });

  // Retire the old Spanish-slug collection from earlier seeds, if present.
  await prisma.collection.deleteMany({ where: { vendorId: vendor.id, slug: "verano", NOT: { id: collection.id } } });

  const images = Array.from({ length: 8 }, (_, i) => `/uploads/seed/dress_${i + 1}.jpg`);

  const productData = {
    collectionId: collection.id,
    name: "Soho Floral Dress",
    description:
      "Cotton midi dress with a blue floral print and a waist tie, shot in a Soho showroom. Curated by Monica: the dress alone or paired with the matching belt.",
    priceCents: 12900,
    sellItemsSeparately: true,
    status: "published",
  };

  const product = await prisma.product.upsert({
    where: { slug: "soho-floral-dress" },
    update: productData,
    create: { vendorId: vendor.id, slug: "soho-floral-dress", ...productData },
  });

  const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
  if (existingImages === 0) {
    await prisma.productImage.createMany({
      data: images.map((url, i) => ({ productId: product.id, url, position: i })),
    });
  }

  const existingItems = await prisma.productItem.count({ where: { productId: product.id } });
  if (existingItems === 0) {
    await prisma.productItem.createMany({
      data: [
        {
          productId: product.id,
          name: "Floral midi dress",
          description: "The centerpiece of the set.",
          priceCents: 9900,
          imageUrl: images[0],
          sizes: JSON.stringify(["XS", "S", "M", "L"]),
          position: 0,
        },
        {
          productId: product.id,
          name: "Matching tie belt",
          description: "Removable fabric belt, same print.",
          priceCents: 2500,
          imageUrl: images[2],
          sizes: JSON.stringify(["One size"]),
          position: 1,
        },
      ],
    });
  }

  console.log("Seed complete. Demo seller:", vendor.email, "/ password: Monica2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
