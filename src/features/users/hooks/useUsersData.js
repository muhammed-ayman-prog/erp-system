import { useEffect, useState } from "react";

import {
  getUsers,
  getBranches,
} from "../services/users.service";

export function useUsersData() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersData, branchesData] =
        await Promise.all([
          getUsers(),
          getBranches(),
        ]);

      setUsers(usersData);
      setBranches(branchesData);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    users,
    branches,
    loading,
    fetchData,
  };
}