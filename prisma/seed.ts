import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// PostgreSQL 接続プールを作成 / Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Prisma adapter を作成 / Create Prisma adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // 預設分類資料 / Default categories
  const defaultCategories = [
    {
      name: "General",
      slug: "general",
      description: "一般討論 / General discussion",
      displayOrder: 1,
    },
    {
      name: "Boxing",
      slug: "boxing",
      description: "拳擊相關討論 / Boxing related discussions",
      displayOrder: 2,
    },
    {
      name: "Kick-Boxing",
      slug: "kick-boxing",
      description: "踢拳相關討論 / Kick-boxing related discussions",
      displayOrder: 3,
    },
    {
      name: "Muay-Thai",
      slug: "muay-thai",
      description: "泰拳相關討論 / Muay Thai related discussions",
      displayOrder: 4,
    },
    {
      name: "MMA",
      slug: "mma",
      description: "綜合格鬥相關討論 / MMA related discussions",
      displayOrder: 5,
    },
  ];

  // 使用 upsert 確保不會重複建立 / Use upsert to avoid duplicates
  for (const category of defaultCategories) {
    const result = await prisma.category.upsert({
      where: {
        name: category.name, // 根據 name 檢查是否存在 / Check by name
      },
      update: {
        // 如果已存在，更新 displayOrder 和 description / If exists, update displayOrder and description
        displayOrder: category.displayOrder,
        description: category.description,
        slug: category.slug,
      },
      create: {
        // 如果不存在，建立新分類 / If not exists, create new category
        name: category.name,
        slug: category.slug,
        description: category.description,
        displayOrder: category.displayOrder,
      },
    });

    console.log(`✅ Category "${result.name}" processed (displayOrder: ${result.displayOrder})`);
  }

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

