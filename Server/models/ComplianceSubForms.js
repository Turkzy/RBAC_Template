import { DataTypes } from "sequelize";
import database from "../config/database.js";

const ComplianceSubForms = database.define("ComplianceSubForm", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ComplianceFormsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ParentSubFormId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  formName: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
});

export default ComplianceSubForms;
