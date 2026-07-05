import { Department } from "../models/index.js";
import { pathToFileURL } from "url";

const DEPARTMENTS = [
    { departmentName: "FAD" },
    { departmentName: "Legal" },
    { departmentName: "Corporate Planning" },
    { departmentName: "IAO" },
];

export const seedDepartments = async () => {
  console.log("🚀 Starting department seeding...");

  for (const department of DEPARTMENTS) {
    const [row, created] = await Department.findOrCreate({
      where: { departmentName: department.departmentName },
    });
    console.log(created ? `✅ Created department: ${row.departmentName}` : `↪️ department already exists: ${row.departmentName}`);
  }

  console.log("✅ Departments seeded successfully");
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDepartments()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}