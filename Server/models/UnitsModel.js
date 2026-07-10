import {DataTypes} from "sequelize";
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
    }
});

export default Units;