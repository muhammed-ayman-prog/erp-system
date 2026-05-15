export function canAccessBranch(
  user,
  branchId
) {

  if (!user) {
    return false;
  }

  // 👑 owner
  if (
    user.role === "owner"
  ) {
    return true;
  }

  // 🔥 branch scope
  return (
    user.branchIds || []
  ).includes(branchId);
}