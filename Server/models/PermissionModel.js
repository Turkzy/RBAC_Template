import { DataTypes } from "sequelize";
import database from "./../config/database.js";

const Permission = database.define("Permission", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false,
    }

});

export default Permission;