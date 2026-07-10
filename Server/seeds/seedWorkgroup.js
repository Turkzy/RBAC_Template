import { Workgroup } from "../models/index.js";
import { pathToFileURL } from "url";

const WORKGROUPS = [
    { workgroupName: "Assets Management Group"},
    { workgroupName: "Business Development Group"},
    { workgroupName: "Corporate Communications Group"},
    { workgroupName: "Corporate Support Group"},
    { workgroupName: "Finance and Subsidiaries Group"},
    { workgroupName: "Office of the General Manager"},
    { workgroupName: "Special Projects Group"},

];

export const seedWorkgroups = async () => {
    console.log("🚀 Starting workgroup seeding...");

    for (const workgroup of WORKGROUPS) {
        const [row, created] = await Workgroup.findOrCreate({
            where: { workgroupName: workgroup.workgroupName },
        });
         console.log(created ? `✅ Created workgroup: ${row.workgroupName}` : `↪️ Workgroup already exists: ${row.workgroupName}`);
  }

  console.log("✅ Workgroups seeded successfully");
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedWorkgroups()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}