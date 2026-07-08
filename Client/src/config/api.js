import axios from "axios";

// LOCALHOST API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5004/api";
// PRODUCTION API URL
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://202.90.138.42:5002/api";
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.102:5002/api";
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://fms.ndc.gov.ph:5002/api";

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
    },

    units: {
        getAll: "/units/get-units",
    },

    departments: {
        getAll: "/departments/get-departments",
    },

    activityLogs: {
        getAll: "/activity-logs",
        retention: "/activity-logs/retention",
    },
}

export { endpoints, API_BASE_URL, FILE_BASE_URL };
export default api;