import { DataTypes } from "sequelize";
import database from "../config/database.js";

const RolePermission = database.define("RolePermission", {
    roleId: {
        type: DataTypes.INTEGER,
        references: {
            model: "Roles",
            key: "id",
        },
    },
    permissionId: {
        type: DataTypes.INTEGER,
        references: {
            model: "Permissions",
            key: "id",
        },
    },
});

export default RolePermission;