import database from "../config/database.js";

const run = async () => {
  try {
    const [columns] = await database.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'compliances'"
    );

    const hasComplianceTitleId = columns.some((col) => col.COLUMN_NAME === "complianceTitleId");
    const hasComplianceFormId = columns.some((col) => col.COLUMN_NAME === "complianceFormId");

    if (!hasComplianceTitleId) {
      await database.query(
        "ALTER TABLE `compliances` ADD COLUMN `complianceTitleId` INT NULL AFTER `complianceType`"
      );
      console.log("Added complianceTitleId column to compliances table");
    } else {
      console.log("complianceTitleId column already exists");
    }

    if (!hasComplianceFormId) {
      await database.query(
        "ALTER TABLE `compliances` ADD COLUMN `complianceFormId` INT NULL AFTER `complianceTitleId`"
      );
      console.log("Added complianceFormId column to compliances table");
    } else {
      console.log("complianceFormId column already exists");
    }

    console.log("Compliance hierarchy migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add compliance hierarchy columns:", error);
    process.exit(1);
  }
};

run();