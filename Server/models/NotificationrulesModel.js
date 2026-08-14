import { DataTypes } from "sequelize";
// NOTE: adjust this import to match how your other models pull in the
// sequelize instance (check e.g. models/ComplianceModel.js for the exact path).
import sequelize from "../config/database.js";

const NotificationRule = sequelize.define(
  "NotificationRule",
  {
    id: {
      // Human-readable, stable key instead of an autoincrement int, e.g.
      // "compliance_submission_received". Controllers/services reference
      // notifications by this key, so it must never change once shipped.
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inApp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    email: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    emailTemplate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "notification_rules",
    timestamps: true,
  }
);

export default NotificationRule;