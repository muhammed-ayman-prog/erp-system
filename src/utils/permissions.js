export const hasPermission = (user, permission) => {
  return user?.permissions?.includes(permission);
};