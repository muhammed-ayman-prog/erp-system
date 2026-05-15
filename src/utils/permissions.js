import {
  ROLE_PERMISSIONS
} from "../constants/rolePermissions";

export const hasPermission = (
  user,
  permission
) => {

  if (!user) return false;

  if (user.role === "owner") {
    return true;
  }

  const permissions =
    ROLE_PERMISSIONS[
      user.role
    ] || [];

  return permissions.includes(
    permission
  );
};

export const hasAnyPermission = (
  user,
  permissions = []
) => {

  if (!user) return false;

  if (user.role === "owner") {
    return true;
  }

  const rolePermissions =
    ROLE_PERMISSIONS[
      user.role
    ] || [];

  return permissions.some(
    permission =>
      rolePermissions.includes(
        permission
      )
  );
};

export const hasBranchAccess = (
  user,
  branchId
) => {

  if (!user) return false;

  if (user.role === "owner") {
    return true;
  }

  return user.branchIds?.includes(
    branchId
  );
};