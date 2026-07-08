import { Role } from "../models/index.js";

const ROLES = [
  { name: "Admin" },
  { name: "User" },
  { name: "Super Admin"},
];

export const seedRoles = async () => {
  console.log("🚀 Starting role seeding...");

  for (const role of ROLES) {
    const [row, created] = await Role.findOrCreate({
      where: { name: role.name },
    });
    console.log(created ? `✅ Created role: ${row.name}` : `↪️ Role already exists: ${row.name}`);
  }

  console.log("✅ Roles seeded successfully");
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('seedRoles')) {
  seedRoles()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}