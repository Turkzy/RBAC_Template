import { DataTypes } from "sequelize";
import database from "../config/database.js";

const Compliance = database.define("Compliance", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  complianceType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Audit",
  },
  assigned: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending",
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "compliances",
  timestamps: true,
});

export default Compliance;