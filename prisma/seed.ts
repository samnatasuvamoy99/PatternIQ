import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dsaplatform.com" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@dsaplatform.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Seeded admin user:", admin.email);

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
  console.log("Seeded student user:", student.email);

  const topic = await prisma.topic.upsert({
    where: { slug: "array" },
    update: {},
    create: { name: "Array", slug: "array", description: "Array-based patterns", order: 1 },
  });

  const pattern = await prisma.pattern.upsert({
    where: { slug: "two-pointer" },
    update: {},
    create: {
      topicId: topic.id,
      number: 1,
      name: "Two Pointer Pattern",
      slug: "two-pointer",
      shortDescription: "Use two indices to process a sequence efficiently.",
      whatIsThis: "A technique that uses two indices to process a sequence efficiently.",
      interviewRule: "Sorted array + pair/triplet search -> Think Two Pointer.",
      difficulty: "EASY",
      importance: 5,
      status: "PUBLISHED",
      useCases: {
        create: [
          { content: "Two ends need to move inward.", order: 0 },
          { content: "Need to compare elements.", order: 1 },
        ],
      },
    },
  });

  const problem = await prisma.problem.upsert({
    where: { slug: "two-sum" },
    update: {},
    create: {
      title: "Two Sum",
      slug: "two-sum",
      platform: "LeetCode",
      solveUrl: "https://leetcode.com/problems/two-sum/",
      difficulty: "EASY",
    },
  });

  await prisma.patternProblem.upsert({
    where: { patternId_problemId: { patternId: pattern.id, problemId: problem.id } },
    update: {},
    create: { patternId: pattern.id, problemId: problem.id, isCore: true, order: 0 },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
