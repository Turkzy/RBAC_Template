import database from "../config/database.js";

const run = async () => {
  try {
    const [columns] = await database.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'compliances'"
    );

    const hasColumn = (name) => columns.some((col) => col.COLUMN_NAME === name);

    if (!hasColumn("fileUrls")) {
      await database.query("ALTER TABLE `compliances` ADD COLUMN `fileUrls` LONGTEXT NULL AFTER `complianceFormId`");
      console.log("Added fileUrls column to compliances table");
    } else {
      console.log("fileUrls column already exists");
    }

    if (!hasColumn("originalFilenames")) {
      await database.query("ALTER TABLE `compliances` ADD COLUMN `originalFilenames` LONGTEXT NULL AFTER `fileUrls`");
      console.log("Added originalFilenames column to compliances table");
    } else {
      console.log("originalFilenames column already exists");
    }

    if (!hasColumn("submissionStatus")) {
      await database.query(
        "ALTER TABLE `compliances` ADD COLUMN `submissionStatus` ENUM('Pending Review','Approved','Rejected') NULL AFTER `originalFilenames`"
      );
      console.log("Added submissionStatus column to compliances table");
    } else {
      console.log("submissionStatus column already exists");
    }

    if (!hasColumn("isSubmissionClosed")) {
      await database.query(
        "ALTER TABLE `compliances` ADD COLUMN `isSubmissionClosed` TINYINT(1) NOT NULL DEFAULT 0 AFTER `submissionStatus`"
      );
      console.log("Added isSubmissionClosed column to compliances table");
    } else {
      console.log("isSubmissionClosed column already exists");
    }

    if (!hasColumn("reviewerRemarks")) {
      await database.query("ALTER TABLE `compliances` ADD COLUMN `reviewerRemarks` TEXT NULL AFTER `isSubmissionClosed`");
      console.log("Added reviewerRemarks column to compliances table");
    } else {
      console.log("reviewerRemarks column already exists");
    }

    if (!hasColumn("submittedBy")) {
      await database.query("ALTER TABLE `compliances` ADD COLUMN `submittedBy` INT NULL AFTER `reviewerRemarks`");
      console.log("Added submittedBy column to compliances table");
    } else {
      console.log("submittedBy column already exists");
    }

    if (!hasColumn("submittedAt")) {
      await database.query("ALTER TABLE `compliances` ADD COLUMN `submittedAt` DATETIME NULL AFTER `submittedBy`");
      console.log("Added submittedAt column to compliances table");
    } else {
      console.log("submittedAt column already exists");
    }

    if (!hasColumn("reviewedBy")) {
      await database.query("ALTER TABLE `compliances` ADD COLUMN `reviewedBy` INT NULL AFTER `submittedAt`");
      console.log("Added reviewedBy column to compliances table");
    } else {
      console.log("reviewedBy column already exists");
    }

    if (!hasColumn("reviewedAt")) {
      await database.query("ALTER TABLE `compliances` ADD COLUMN `reviewedAt` DATETIME NULL AFTER `reviewedBy`");
      console.log("Added reviewedAt column to compliances table");
    } else {
      console.log("reviewedAt column already exists");
    }

    console.log("Compliance submission migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add compliance submission columns:", error);
    process.exit(1);
  }
};

run();
