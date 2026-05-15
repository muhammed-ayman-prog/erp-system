import { useAuth }
from "../store/useAuth";

import {
  hasPermission
}
from "../utils/permissions";

export function usePermission(
  permission
) {

  const { user } =
    useAuth();

  return hasPermission(
    user,
    permission
  );
}