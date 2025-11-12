import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create default categories
  const categories = [
    {
      slug: "general",
      name: "General",
      description: "General discussions and topics",
      displayOrder: 1,
    },
    {
      slug: "tech",
      name: "Technology",
      description: "Technology, programming, and development",
      displayOrder: 2,
    },
    {
      slug: "gaming",
      name: "Gaming",
      description: "Video games and gaming discussions",
      displayOrder: 3,
    },
    {
      slug: "other",
      name: "Other",
      description: "Everything else",
      displayOrder: 4,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    console.log(`Created/Updated category: ${category.name}`);
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
