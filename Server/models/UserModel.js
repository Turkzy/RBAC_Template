import { DataTypes } from "sequelize";
import database from "../config/database.js";

const User = database.define("User", {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    roleId: {
        type: DataTypes.INTEGER,
        references: {
            model: "Roles",
            key: "id",
        },
    },
});

export default User;