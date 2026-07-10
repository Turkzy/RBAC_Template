import database from "../config/database.js";

const run = async () => {
  try {
    const [rows] = await database.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'twoFactorEnabled'"
    );

    if (rows && rows.length > 0) {
      console.log('twoFactorEnabled column already exists');
      process.exit(0);
    }

    await database.query(
      "ALTER TABLE `Users` ADD COLUMN `twoFactorEnabled` TINYINT(1) NOT NULL DEFAULT 0"
    );
    console.log('Added twoFactorEnabled column to Users table');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add twoFactorEnabled column:', err);
    process.exit(1);
  }
};

run();
