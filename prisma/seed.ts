import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding for User Authentication...");

  // 1. Master Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "suvamoyadmin907@gmail.com";
  const adminPasswordHash = await bcrypt.hash("suvamoy993347", 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: "Master Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Seeded Master Admin user:", admin.email);

  // 2. Demo Student User
  const studentPasswordHash = await bcrypt.hash("Student@12345", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@dsaplatform.com" },
    update: {},
    create: {
      name: "Test Student",
      email: "student@dsaplatform.com",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
    },
  });
  console.log("Seeded Student user:", student.email);

  console.log("User authentication seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
