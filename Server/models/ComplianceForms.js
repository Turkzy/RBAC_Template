import { DataTypes } from "sequelize";
import database from "../config/database.js";

const ComplianceForms = database.define("ComplianceForm", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ComplianceFormsTitleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  formName: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
});

export default ComplianceForms;
