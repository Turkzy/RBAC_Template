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
    }
});

export default Department;