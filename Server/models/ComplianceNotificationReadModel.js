import { DataTypes } from "sequelize";
import database from "../config/database.js";

const ComplianceNotificationRead = database.define(
	"ComplianceNotificationRead",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		complianceId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		readAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		snapshot: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		isDeleted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		isPermanentlyDeleted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		deletedAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ["complianceId", "userId"],
			},
			{
				fields: ["userId", "isDeleted"],
			},
		],
	},
);

export default ComplianceNotificationRead;
