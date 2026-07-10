import database from "../config/database.js";

const run = async () => {
  try {
    const [columns] = await database.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'compliances'"
    );

    const hasStartDate = columns.some((col) => col.COLUMN_NAME === "startDate");
    const hasEndDate = columns.some((col) => col.COLUMN_NAME === "endDate");
    const hasEventDate = columns.some((col) => col.COLUMN_NAME === "eventDate");

    if (!hasStartDate) {
      await database.query(
        "ALTER TABLE `compliances` ADD COLUMN `startDate` DATETIME NOT NULL"
      );
      console.log("Added startDate column to compliances table");
    } else {
      console.log("startDate column already exists");
    }

    if (!hasEndDate) {
      await database.query(
        "ALTER TABLE `compliances` ADD COLUMN `endDate` DATETIME NOT NULL"
      );
      console.log("Added endDate column to compliances table");
    } else {
      console.log("endDate column already exists");
    }

    if (hasEventDate) {
      await database.query(
        "UPDATE `compliances` SET `startDate` = `eventDate`, `endDate` = `eventDate` WHERE `startDate` IS NULL OR `endDate` IS NULL"
      );
      console.log("Populated startDate and endDate from existing eventDate values");
    }

    console.log("Compliance date migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to migrate compliance dates:", err);
    process.exit(1);
  }
};

run();
