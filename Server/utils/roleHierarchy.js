const DEFAULT_ROLE_LEVELS = {
  user: 1,
  admin: 2,
  "super admin": 3,
};

const buildRoleLevels = () => {
  if (!process.env.ROLE_HIERARCHY) return DEFAULT_ROLE_LEVELS;

  try {
    const parsed = JSON.parse(process.env.ROLE_HIERARCHY);
    if (parsed && typeof parsed === "object") {
      return { ...DEFAULT_ROLE_LEVELS, ...parsed };
    }
  } catch (error) {
    console.warn("Invalid ROLE_HIERARCHY configuration, falling back to defaults.");
  }

  return DEFAULT_ROLE_LEVELS;
};

const ROLE_LEVELS = buildRoleLevels();

export const getRoleLevel = (roleName) => {
  if (!roleName) return 0;

  const normalized = String(roleName).trim().toLowerCase();
  if (ROLE_LEVELS[normalized] !== undefined) {
    return ROLE_LEVELS[normalized];
  }

  if (normalized.includes("super")) return 3;
  if (normalized.includes("admin")) return 2;
  if (normalized.includes("user")) return 1;

  return 0;
};

export const canAssignRole = (actorRoleName, targetRoleName) => {
  const actorLevel = getRoleLevel(actorRoleName);
  const targetLevel = getRoleLevel(targetRoleName);

  if (!actorLevel || !targetLevel) return false;

  const actorIsSuperAdmin = String(actorRoleName).trim().toLowerCase().includes("super");

  // Super Admin can assign any role except a higher-ranked role than themselves.
  if (actorIsSuperAdmin) {
    return actorLevel >= targetLevel;
  }

  // Other roles can only assign lower-ranked roles.
  return actorLevel > targetLevel;
};
