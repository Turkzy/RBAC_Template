import { Units } from "../models/index.js";
import { pathToFileURL } from "url";

const UNITS = [
    { UnitName: "Human Resources"},
    { UnitName: "Administrative"},
    { UnitName: "Accounting"},
    { UnitName: "Treasury"},
    { UnitName: "Budget"},
    { UnitName: "Information Technology"},
];

export const seedUnits = async () => {
  console.log("🚀 Starting unit seeding...");

  for (const unit of UNITS) {
    const [row, created] = await Units.findOrCreate({
      where: { UnitName: unit.UnitName },
    });
    console.log(created ? `✅ Created unit: ${row.UnitName}` : `↪️ unit already exists: ${row.UnitName}`);
  }

  console.log("✅ Units seeded successfully");
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedUnits()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}




