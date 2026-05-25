import { useEffect, useState, useMemo } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../store/useAuth";
import {
  createUserService,
  updateUserService,
  toggleUserStatusService,
} from "../features/users/services/users.service";
import { usePermission }
from "../hooks/usePermission";


import { useTranslate } from "../useTranslate";
import { useResponsive }

from "../hooks/useResponsive";
import AppButton
from "../components/ui/AppButton";

import UsersFilters
from "../features/users/components/UsersFilters";

import useUsersData
from "../features/users/hooks/useUsersData";

import PageHeader
from "../components/ui/layout/PageHeader";
import { PERMISSIONS }
from "../constants/permissions";
import UsersTable
from "../features/users/components/UsersTable";
import CreateUserModal
from "../features/users/modals/CreateUserModal";
import EditUserModal
from "../features/users/modals/EditUserModal";
import {
  getRoleLabels,
} from "../features/users/utils/roleLabels";
export default function Users() {
  
  const { user } = useAuth();
  const { t, lang } = useTranslate(); 
  const isRTL =
  lang === "ar";
 const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { isMobile } =
  useResponsive();
  const canCreateUsers =
  usePermission(
    PERMISSIONS.USERS_CREATE
  );

const canEditUsers =
  usePermission(
    PERMISSIONS.USERS_EDIT
  );




  useEffect(() => {

  const esc = (e) => {

    if (e.key === "Escape") {

      setShowModal(false);

      setEditingUser(null);

    }
  };

  window.addEventListener("keydown", esc);

  return () =>
    window.removeEventListener(
      "keydown",
      esc
    );

}, []);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
    branchIds: []
  });

  // 🔥 Fetch
  
const {
  users,
  branches,
  loading,
  fetchData,
} = useUsersData(); 
  // 🔐 Create
  const handleCreateUser = async () => {
  if (!canCreateUsers) return;
  try {
    if (!auth.currentUser) {
      alert("لازم تعمل تسجيل دخول الأول ❗");
      return;
    }
    if (!newUser.name || !newUser.email || !newUser.password) {
  alert("املأ كل البيانات ❗");
  return;
}
if (
  newUser.role !== "owner" &&
  !newUser.branchIds.length
) {
  alert("اختار الفرع ❗");
  return;
}

    // 🔥 أهم سطر
   if (!auth.currentUser) {
  alert("اعمل Login تاني");
  return;
}
  await createUserService({
  name: newUser.name,
  email: newUser.email,
  password: newUser.password,
  role: newUser.role,
  branchIds: newUser.branchIds,
});


    alert("User created successfully ✅");

    setShowModal(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "sales",
      branchIds: []
    });

    fetchData();

  } catch (err) {
    console.error(err);
    alert(err.message || err?.details || "حصل خطأ ❌");
  }
};
 const toggleStatus = async (u) => {
if (!canEditUsers) return;
  try {
    await toggleUserStatusService(
  u.id
);
    
    if (u.id === auth.currentUser?.uid && u.status === "active") {
      await signOut(auth);
    }

    fetchData();

  } catch (err) {
    console.error(err);
    alert("Error ❌");
  }
};

  // ✏️ Update
  const handleUpdateUser = async () => {
  if (!canEditUsers) return;
  try {
    await updateUserService({
      uid: editingUser.id,
      name: editingUser.name,
      role: editingUser.role,
      branchIds: editingUser.branchIds,
    });

    
    alert("Updated ✅");

    setEditingUser(null);

    fetchData();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  // 🔍 Filter
  const filteredUsers = useMemo(() => {
    return users
    .filter(u =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter(u =>

  filterBranch === "all"

    ? true

    : u.branchIds?.includes(
        filterBranch
      )

);
    }, [users, search, filterBranch]);
 const roleLabels =
  getRoleLabels(t);
  return (
    <div
  style={{
    flex: 1,
    padding: "20px",
    direction: isRTL
      ? "rtl"
      : "ltr"
  }}
>

      {/* Header */}
      <PageHeader
  title={`${t("users.title")} 👥`}
  subtitle={t("users.subtitle")}
  actions={
    canCreateUsers && (
      <AppButton
        onClick={() => {
          setShowModal(true);
        }}
      >
        + {t("users.addUser")}
      </AppButton>
    )
  }
/>

      {/* Loading */}
      {loading && (
  <p>
    {t("common.loading")}
  </p>
)}

<UsersFilters
  t={t}
  search={search}
  setSearch={setSearch}
  filterBranch={filterBranch}
  setFilterBranch={setFilterBranch}
  branches={branches}
/>

      <UsersTable
  users={filteredUsers}
  branches={branches}
  roleLabels={roleLabels}
  t={t}
  isRTL={isRTL}
  isMobile={isMobile}
  canEditUsers={canEditUsers}
  setEditingUser={setEditingUser}
  toggleStatus={toggleStatus}
/>

  {/* Create User Modal  */}
    <CreateUserModal
  open={showModal}
  onClose={() => {
    setShowModal(false);
  }}
  t={t}
  newUser={newUser}
  setNewUser={setNewUser}
  branches={branches}
  isMobile={isMobile}
  isRTL={isRTL}
  handleCreateUser={handleCreateUser}
/>

{/* Modal Edit */}
<EditUserModal
  editingUser={editingUser}
  setEditingUser={setEditingUser}
  t={t}
  branches={branches}
  isRTL={isRTL}
  handleUpdateUser={handleUpdateUser}
/>
  </div>
  );
}