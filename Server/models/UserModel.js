import { DataTypes } from "sequelize";
import database from "../config/database.js";

const User = database.define("User", {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    middleName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
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
    workgroupId: {
        type: DataTypes.INTEGER,
        references: {
            model: "Workgroups",
            key: "id",
        },
    },
    unitsId: {
        type: DataTypes.INTEGER,
        references: {
            model: "Units",
            key: "id",
        },
    },
    position: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    DepartmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Departments",
            key: "id",
        },
    },
    status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        allowNull: false,
        defaultValue: "Active",
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});

export default User;