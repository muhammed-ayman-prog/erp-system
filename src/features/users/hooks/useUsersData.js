import {
  useEffect,
  useState,
} from "react";

import {
  getUsersService,
  getBranchesService,
} from "../services/users.service";

export default function useUsersData() {

  const [users, setUsers] =
    useState([]);

  const [branches, setBranches] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const fetchData = async () => {

    try {

      setLoading(true);

      const [
        usersData,
        branchesData,
      ] = await Promise.all([
        getUsersService(),
        getBranchesService(),
      ]);

      setUsers(usersData);

      setBranches(branchesData);

    } catch (err) {

      console.error(err);

      alert("Error loading data ❌");

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