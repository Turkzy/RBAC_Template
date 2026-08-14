import database from "../config/database.js";

const run = async () => {
  try {
    const [columns] = await database.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ComplianceNotificationReads'"
    );

    const hasColumn = (name) => columns.some((col) => col.COLUMN_NAME === name);

    if (!hasColumn("notificationCategory")) {
      await database.query(
        "ALTER TABLE `ComplianceNotificationReads` ADD COLUMN `notificationCategory` VARCHAR(255) NULL AFTER `deletedAt`"
      );
      console.log("Added notificationCategory column to ComplianceNotificationReads table");
    } else {
      console.log("notificationCategory column already exists");
    }

    if (!hasColumn("snapshot")) {
      await database.query(
        "ALTER TABLE `ComplianceNotificationReads` ADD COLUMN `snapshot` LONGTEXT NULL AFTER `notificationCategory`"
      );
      console.log("Added snapshot column to ComplianceNotificationReads table");
    } else {
      console.log("snapshot column already exists");
    }

    console.log("ComplianceNotificationReads migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add ComplianceNotificationReads columns:", error);
    process.exit(1);
  }
};

run();