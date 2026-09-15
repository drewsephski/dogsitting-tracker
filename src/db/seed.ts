import { seedDomainData } from "@/db/seed-domain";

function requireSeedUserId(): string {
  const raw = process.env.SEED_USER_ID?.trim();

  if (!raw) {
    console.error(
      "SEED_USER_ID is required (Neon Auth user id to own seeded clients, bookings, and settings).",
    );
    process.exit(1);
  }

  return raw;
}

async function runSeed() {
  const userId = requireSeedUserId();

  console.log("⏳ Running seed...", { userId });

  const start = Date.now();

  await seedDomainData(userId);

  const end = Date.now();

  console.log(`✅ Seed completed in ${end - start}ms`);

  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seed failed");
  console.error(err);
  process.exit(1);
});
