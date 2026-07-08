/**
 * One-off cleanup script.
 *
 * Repeated `database.sync({ alter: true })` runs can cause Sequelize/MySQL
 * to accumulate duplicate unique indexes on the same column (username_2,
 * username_3, email_2, ...) until MySQL's 64-key-per-table limit is hit.
 *
 * This script inspects a table's indexes, keeps ONE index per unique
 * column (preferring the one matching the column name, or the oldest
 * one otherwise), and drops the rest.
 *
 * Usage:
 *   node scripts/cleanupDuplicateIndexes.js Users
 *   node scripts/cleanupDuplicateIndexes.js Users --dry-run
 */
import database from "../config/database.js";

const tableName = process.argv[2] || "Users";
const dryRun = process.argv.includes("--dry-run");

const run = async () => {
  await database.authenticate();
  console.log(`✅ Connected. Inspecting indexes on \`${tableName}\`...`);

  const [rows] = await database.query(`SHOW INDEX FROM \`${tableName}\``);

  // Group index rows by Key_name (a composite index can span multiple rows,
  // one per column — we only deal with single-column unique indexes here).
  const byKeyName = {};
  for (const row of rows) {
    const keyName = row.Key_name;
    if (keyName === "PRIMARY") continue; // never touch the primary key
    if (row.Non_unique !== 0) continue; // only care about UNIQUE indexes
    if (!byKeyName[keyName]) byKeyName[keyName] = [];
    byKeyName[keyName].push(row);
  }

  // Group those unique indexes by the column they cover, so we can spot
  // duplicates like username / username_2 / username_3 all covering "username".
  const byColumn = {};
  for (const [keyName, indexRows] of Object.entries(byKeyName)) {
    const columns = indexRows.map((r) => r.Column_name).sort().join(",");
    if (!byColumn[columns]) byColumn[columns] = [];
    byColumn[columns].push(keyName);
  }

  let totalDropped = 0;

  for (const [columns, keyNames] of Object.entries(byColumn)) {
    if (keyNames.length <= 1) continue; // no duplicates for this column set

    // Keep the index whose name matches the column exactly if present,
    // otherwise keep the first one and drop the rest.
    const preferred = keyNames.find((k) => k === columns) || keyNames[0];
    const toDrop = keyNames.filter((k) => k !== preferred);

    console.log(
      `\n🔎 Column(s) "${columns}" has ${keyNames.length} unique indexes: ${keyNames.join(", ")}`
    );
    console.log(`   Keeping: ${preferred}`);

    for (const keyName of toDrop) {
      if (dryRun) {
        console.log(`   [dry-run] Would drop: ${keyName}`);
        continue;
      }
      try {
        await database.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${keyName}\``);
        console.log(`   ✅ Dropped: ${keyName}`);
        totalDropped++;
      } catch (err) {
        console.error(`   ❌ Failed to drop ${keyName}:`, err.message);
      }
    }
  }

  if (totalDropped === 0 && !dryRun) {
    console.log("\nℹ️  No duplicate indexes found (or none needed dropping).");
  } else if (!dryRun) {
    console.log(`\n✅ Done. Dropped ${totalDropped} duplicate index(es).`);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});