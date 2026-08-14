import { DataTypes } from "sequelize";
import database from "../config/database.js";

const Compliance = database.define("Compliance", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  complianceType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
  complianceTitleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  complianceFormId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fileUrls: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("fileUrls");
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    set(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        this.setDataValue("fileUrls", null);
        return;
      }
      const normalized = Array.isArray(value) ? value : [value];
      this.setDataValue("fileUrls", JSON.stringify(normalized));
    },
  },
  originalFilenames: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("originalFilenames");
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    set(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        this.setDataValue("originalFilenames", null);
        return;
      }
      const normalized = Array.isArray(value) ? value : [value];
      this.setDataValue("originalFilenames", JSON.stringify(normalized));
    },
  },
  submissionStatus: {
    type: DataTypes.ENUM("Pending Review", "Approved", "Rejected"),
    allowNull: true,
    defaultValue: null,
  },
  isSubmissionClosed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  reviewerRemarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  submittedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  assignedToUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assignedToWorkgroupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assignedToDepartmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assignedToUnitsId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assignedToUserIds: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("assignedToUserIds");
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch {
        return [];
      }
    },
    set(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        this.setDataValue("assignedToUserIds", null);
        return;
      }
      const normalized = Array.isArray(value)
        ? value
        : typeof value === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return value.split(",").map((v) => v.trim()).filter(Boolean);
            }
          })()
        : [value];
      this.setDataValue("assignedToUserIds", JSON.stringify(normalized));
    },
  },
  assignedToWorkgroupIds: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("assignedToWorkgroupIds");
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch {
        return [];
      }
    },
    set(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        this.setDataValue("assignedToWorkgroupIds", null);
        return;
      }
      const normalized = Array.isArray(value)
        ? value
        : typeof value === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return value.split(",").map((v) => v.trim()).filter(Boolean);
            }
          })()
        : [value];
      this.setDataValue("assignedToWorkgroupIds", JSON.stringify(normalized));
    },
  },
  assignedToDepartmentIds: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("assignedToDepartmentIds");
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch {
        return [];
      }
    },
    set(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        this.setDataValue("assignedToDepartmentIds", null);
        return;
      }
      const normalized = Array.isArray(value)
        ? value
        : typeof value === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return value.split(",").map((v) => v.trim()).filter(Boolean);
            }
          })()
        : [value];
      this.setDataValue("assignedToDepartmentIds", JSON.stringify(normalized));
    },
  },
  assignedToUnitsIds: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("assignedToUnitsIds");
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch {
        return [];
      }
    },
    set(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        this.setDataValue("assignedToUnitsIds", null);
        return;
      }
      const normalized = Array.isArray(value)
        ? value
        : typeof value === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return value.split(",").map((v) => v.trim()).filter(Boolean);
            }
          })()
        : [value];
      this.setDataValue("assignedToUnitsIds", JSON.stringify(normalized));
    },
  },
  status: {
    type: DataTypes.ENUM("Compliant", "Under Evaluation", "No Submission", "Non-Compliant", "Not Applicable"),
    allowNull: false,
    defaultValue: "No Submission",
  },
  colorIndex: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reminderStagesSent: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("reminderStagesSent");
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return String(rawValue)
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
      }
    },
    set(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        this.setDataValue("reminderStagesSent", null);
        return;
      }
      const normalized = Array.isArray(value)
        ? value
        : typeof value === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return value.split(",").map((item) => item.trim()).filter(Boolean);
            }
          })()
        : [value];
      this.setDataValue("reminderStagesSent", JSON.stringify(normalized));
    },
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "compliances",
  timestamps: true,
});

export default Compliance;