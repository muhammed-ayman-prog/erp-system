import { useAuth }
from "../store/useAuth";

import {
  canAccessBranch
}
from "../utils/branchAccess";

export function useBranchAccess(
  branchId
) {

  const { user } =
    useAuth();

  return canAccessBranch(
    user,
    branchId
  );
}