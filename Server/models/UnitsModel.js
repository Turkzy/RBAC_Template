import { DataTypes } from "sequelize";
import database from "../config/database.js";

const Units = database.define("Units", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UnitName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Departments",
            key: "id",
        },
    },
});

export default Units;