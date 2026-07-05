import { DataTypes } from "sequelize";
import database from "../config/database.js";

const Workgroup = database.define("Workgroup", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    workgroupName: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

export default Workgroup;