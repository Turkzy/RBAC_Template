import { DataTypes } from "sequelize";
import database from "../config/database.js";

const ComplianceFormsTitle = database.define("ComplianceFormsTitle", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
});

export default ComplianceFormsTitle;
