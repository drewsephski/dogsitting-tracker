import { seedDomainData } from "@/db/seed-domain";

async function runSeed() {
  console.log("⏳ Running seed...");

  const start = Date.now();

  await seedDomainData();

  const end = Date.now();

  console.log(`✅ Seed completed in ${end - start}ms`);

  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seed failed");
  console.error(err);
  process.exit(1);
});
