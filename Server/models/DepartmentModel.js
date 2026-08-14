import { DataTypes } from "sequelize";
import database from "../config/database.js";

const Department = database.define("Department", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    departmentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    workgroupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Workgroups",
            key: "id",
        },
    },
});

export default Department;