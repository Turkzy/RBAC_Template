export const getUserAccessScope = (requester) => {
  if (!requester) return null;

  const roleName = String(requester.role?.name || requester.roleName || "")
    .trim()
    .toLowerCase();

  if (roleName === "super admin") {
    return null;
  }

  const departmentId = requester.DepartmentId ?? requester.departmentId ?? null;
  if (departmentId !== null && departmentId !== undefined && departmentId !== "") {
    return { DepartmentId: departmentId };
  }

  return { id: requester.id };
};
