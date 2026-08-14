import axios from "axios";

// LOCALHOST API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5004/api";
// PRODUCTION API URL
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://202.90.138.42:5004/api";
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.102:5004/api";
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://fms.ndc.gov.ph:5004/api";

const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const endpoints = {
    auth: {
        verify: "/users/verify",
        login: "/users/login",
        logout: "/users/logout",
        passwordReset: {
            request: "/password-reset/request",
            reset: "/password-reset/reset",
        },
    },

    users: {
        getAll: "/users/get-users",
        create: "/users/create-account",
        setTwoFactor: "/users/set-2fa",
        trustDevice: "/users/trust-device",
        update: (id) => `/users/update-user/${id}`,
        delete: (id) => `/users/delete-user/${id}`,
    },

    roles: {
        getAll: "/rbac/get-roles",
    },

    rbac: {
        roles: {
            getAll: "/rbac/get-roles",
            create: "/rbac/roles",
            update: (id) => `/rbac/roles/${id}`,
            delete: (id) => `/rbac/roles/${id}`,
        },
        permissions: {
            getAll: "/rbac/get-permissions",
            create: "/rbac/permissions",
            update: (id) => `/rbac/permissions/${id}`,
            delete: (id) => `/rbac/permissions/${id}`,
        },
        rolePermission: {
            assign: "/rbac/role-permission/assign",
            remove: "/rbac/role-permission/remove",
        },
    },

    workgroups: {
        getAll: "/workgroups/get-workgroups",
        create: "/workgroups/create-workgroup",
        update: (id) => `/workgroups/update-workgroup/${id}`,
        delete: (id) => `/workgroups/delete-workgroup/${id}`,
    },

    units: {
        getAll: "/units/get-units",
        create: "/units/create-unit",
        update: (id) => `/units/update-unit/${id}`,
        delete: (id) => `/units/delete-unit/${id}`,
    },

    departments: {
        getAll: "/departments/get-departments",
        create: "/departments/create-department",
        update: (id) => `/departments/update-department/${id}`,
        delete: (id) => `/departments/delete-department/${id}`,
    },

    activityLogs: {
        getAll: "/activity-logs",
        getById: (id) => `/activity-logs/${id}`,
        retention: "/activity-logs/retention",
    },



    compliance: {
        list: "/compliance",
        create: "/compliance",
        update: (id) => `/compliance/${id}`,
        getById: (id) => `/compliance/${id}`,
    delete: (id) => `/compliance/${id}`,
        download: (id) => `/compliance/${id}/download`,
        markRead: (id) => `/compliance/${id}/mark-read`,
        deleteNotification: (id) => `/compliance/${id}/notification`,
        deleteNotificationPermanent: (id) => `/compliance/${id}/notification/permanent`,
        notificationRecords: `/compliance/notifications`,
        restoreNotification: (id) => `/compliance/${id}/notification/restore`,
        markAllRead: "/compliance/mark-all-read",
    },

    complianceForms: {
        titles: {
            getAll: "/compliance-forms/titles",
            getById: (id) => `/compliance-forms/titles/${id}`,
            create: "/compliance-forms/titles",
            update: (id) => `/compliance-forms/titles/${id}`,
            delete: (id) => `/compliance-forms/titles/${id}`,
        },
        forms: {
            getAll: "/compliance-forms/forms",
            getById: (id) => `/compliance-forms/forms/${id}`,
            create: "/compliance-forms/forms",
            update: (id) => `/compliance-forms/forms/${id}`,

            delete: (id) => `/compliance-forms/forms/${id}`,
        },
        subforms: {
            getAll: "/compliance-forms/subforms",
            getById: (id) => `/compliance-forms/subforms/${id}`,
            create: "/compliance-forms/subforms",
            update: (id) => `/compliance-forms/subforms/${id}`,
            delete: (id) => `/compliance-forms/subforms/${id}`,
        },
    },

    notificationRules: {
        getAll: "/notification-rules",
        update: (id) => `/notification-rules/${id}`,
    },

    systemSettings: {
        get: (key) => `/system-settings/${key}`,
        upsert: "/system-settings",
    },
}

export { endpoints, API_BASE_URL, FILE_BASE_URL };
export default api;