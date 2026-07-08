import { DataTypes } from "sequelize";
import database from "../config/database.js";

const PasswordReset = database.define("PasswordReset", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  resetTokenHash: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default PasswordReset;