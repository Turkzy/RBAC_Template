import { DataTypes } from "sequelize";
import database from "../config/database.js";

const DepartmentUnit = database.define(
  "DepartmentUnit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Departments",
        key: "id",
      },
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Units",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  },
);

export default DepartmentUnit;
