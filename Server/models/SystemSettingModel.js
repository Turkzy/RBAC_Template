import { DataTypes } from "sequelize";
import database from "../config/database.js";

const SystemSetting = database.define("SystemSetting", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "system_settings",
  timestamps: true,
});

export default SystemSetting;
