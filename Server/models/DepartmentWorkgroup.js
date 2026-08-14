import { DataTypes } from "sequelize";
import database from "../config/database.js";

const DepartmentWorkgroup = database.define(
  "DepartmentWorkgroup",
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
    workgroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Workgroups",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  },
);

export default DepartmentWorkgroup;
