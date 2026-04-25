import { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../store/useAuth";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
const ALL_PERMISSIONS = [
  "view_dashboard",
  "view_sales",
  "view_reports",
  "view_inventory",
  "view_customers",
  "view_branches",
  "view_users",
  "view_settings",
  "view_operations",

  "create_users",
  "edit_users",
  "delete_users"
];
const ROLE_PERMISSIONS = {
  admin: ["*"],

  branch_manager: [
    "view_dashboard",
    "view_sales",
    "view_reports",
    "view_inventory",
    "view_customers",
    "view_operations"
  ],

  employee: [
    "view_dashboard",
    "view_sales"
  ]
};

export default function Users() {
  
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
  const esc = (e) => {
    if (e.key === "Escape") setShowModal(false);
  };

  window.addEventListener("keydown", esc);
  return () => window.removeEventListener("keydown", esc);
}, []);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    branchId: ""
  });

  // 🔥 Fetch
  const fetchData = async () => {
    try {
      setLoading(true);

      const usersSnap = await getDocs(collection(db, "users"));
      const branchesSnap = await getDocs(collection(db, "branches"));

      setUsers(usersSnap.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    status: data.status || "active"
  };
}));
      setBranches(branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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

  
  // 🔐 Create
  const handleCreateUser = async () => {
  try {
    if (!auth.currentUser) {
      alert("لازم تعمل تسجيل دخول الأول ❗");
      return;
    }
    if (!newUser.name || !newUser.email || !newUser.password) {
  alert("املأ كل البيانات ❗");
  return;
}
if (newUser.role !== "admin" && !newUser.branchId) {
  alert("اختار الفرع ❗");
  return;
}

    // 🔥 أهم سطر
    console.log("AUTH USER:", auth.currentUser); 
    if (!auth.currentUser) {
  alert("اعمل Login تاني");
  return;
}
    const token = await auth.currentUser.getIdToken(true);
    console.log("TOKEN:", token);
    const createUserFn = httpsCallable(functions, "createUser");

const res = await createUserFn({
  name: newUser.name,
  email: newUser.email,
  password: newUser.password,
  role: newUser.role,
  branchId: newUser.branchId
});

console.log("RESULT:", res);
    alert("User created successfully ✅");

    setShowModal(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "employee",
      branchId: ""
    });

    fetchData();

  } catch (err) {
    console.error(err);
    alert(err.message || err?.details || "حصل خطأ ❌");
  }
};

  // ❌ Delete
  const handleDelete = async (id) => {
  try {
    if (user?.uid === id) {
      alert("مش ينفع تمسح نفسك ❌");
      return;
    }

    if (users.find(x => x.id === id)?.role === "admin") {
      alert("مينفعش تمسح Admin ❌");
      return;
    }

    if (!window.confirm("متأكد؟")) return;

    const deleteUserFn = httpsCallable(functions, "deleteUser");

    await deleteUserFn({ uid: id });

    alert("Deleted ✅");

    fetchData();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const toggleStatus = async (u) => {
  try {
    const toggleFn = httpsCallable(functions, "toggleUserStatus");

    await toggleFn({ uid: u.id });

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
  try {
    const updateUserFn = httpsCallable(functions, "updateUser");

    await updateUserFn({
      uid: editingUser.id,
      name: editingUser.name,
      role: editingUser.role,
      branchId: editingUser.branchId,
      permissions: selectedPermissions
    });

    alert("Updated ✅");

    setEditingUser(null);
    setSelectedPermissions([]);

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
    .filter(u => filterBranch === "all" ? true : u.branchId === filterBranch);
    }, [users, search, filterBranch]);
    const isMobile = window.innerWidth < 768;
  return (
    <div style={{ flex: 1, background: "#f5f5f7", padding: "20px" }}>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>Users 👥</h2>

        {(user?.permissions?.includes("create_users") || user?.permissions?.includes("*")) && (
          <button
  onClick={() => {
    setSelectedPermissions([]);
    setShowModal(true);
  }}
  style={{
    background: "#007aff",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,122,255,0.3)"
  }}
>
  + Add User
</button>
        )}
      </div>

      {/* Loading */}
      {loading && <p>جارى التحميل...</p>}

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap", // 🔥 مهم جدًا
          gap: "10px",
          marginBottom: "10px"
        }}
      >
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          outline: "none",
          fontSize: "14px",
          background: "#fff",
          flex: "1 1 200px" // 🔥 ده المهم
        }}
/>

        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          style={{
            flex: "1 1 150px" // 🔥 مهم
          }}
        >
          <option value="all">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div style={{
  background: "#fff",
  borderRadius: "16px",
  marginTop: "20px",
  overflow: "hidden",
  boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
}}>
  <div style={{ overflowX: "auto", width: "100%" }}>
  <table style={{ minWidth: "600px" }}>
      

    {/* Header */}
    <thead style={{ background: "#f9f9fb" }}>
      <tr style={{ textAlign: "left", fontSize: "13px", color: "#666" }}>
        <th style={{ padding: "8px",fontSize: "13px" }}>User</th>
        <th>Role</th>
        <th>Branch</th>
        <th>Status</th>
        <th style={{ textAlign: "right", paddingRight: "20px" }}>
          Actions
        </th>
      </tr>
    </thead>

    {/* Body */}
    <tbody>
      {filteredUsers.map((u) => (
        <tr
  key={u.id}
  style={{
    borderTop: "1px solid #eee",
    transition: "0.2s"
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#f9f9fb")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>

          {/* User + Avatar */}
          <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#007aff",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}>
              {u.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ fontWeight: "500" }}>{u.name}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>{u.email}</div>
            </div>
          </td>

          {/* Role */}
          <td style={{ fontSize: "13px" }}>{u.role}</td>

          {/* Branch */}
          <td style={{ fontSize: "13px" }}>
            {branches.find(b => b.id === u.branchId)?.name || "-"}
          </td>

          {/* Status */}
<td>
  <div style={{
    display: "flex",
    gap: "6px",
    alignItems: "center"
  }}>
    
    <span style={{
      padding: "3px 8px",
      borderRadius: "20px",
      fontSize: "12px",
      background: (u.status || "active") === "active" ? "#e6f9f0" : "#ffecec",
      color: (u.status || "active") === "active" ? "#00a86b" : "#ff3b30"
    }}>
      {(u.status || "active") === "active" ? "Active" : "Disabled"}
    </span>

    <button
      onClick={() => toggleStatus(u)}
      style={{
        background: (u.status || "active") === "active" ? "#fff3cd" : "#e6f0ff",
        color: (u.status || "active") === "active" ? "#856404" : "#004085",
        border: "none",
        padding: "6px 8px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px"
      }}
    >
      {(u.status || "active") === "active" ? "Disable" : "Enable"}
    </button>

  </div>
</td>

{/* Actions */}
<td style={{ textAlign: "right", paddingRight: "20px" }}>
  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>

    <button
      onClick={() => {
        setEditingUser(u);
        setSelectedPermissions(
          u.permissions?.includes("*")
            ? ALL_PERMISSIONS
            : u.permissions || []
        );
      }}
      style={{
        background: "#f2f2f7",
        border: "none",
        padding: "6px 8px",
        fontSize: "12px",
        borderRadius: "8px",
        cursor: "pointer"
      }}
    >
      Edit
    </button>

    <button
      onClick={() => handleDelete(u.id)}
      style={{
        background: "#ffecec",
        color: "#ff3b30",
        border: "none",
        padding: "6px 8px",
        fontSize: "12px",
        borderRadius: "8px",
        cursor: "pointer"
      }}
    >
      Delete
    </button>

  </div>
</td>
        

        </tr>
      ))}
    </tbody>
  </table>
</div>
</div>

      

      {/* Modal Create */}
      {showModal && (
        <div
  onClick={() => setShowModal(false)}   // 🔥 ضيف دي
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }}
>
  <div
  onClick={(e) => e.stopPropagation()}
  style={{
    background: "#fff",
    padding: isMobile ? "16px" : "24px",
    borderRadius: "20px",
    width: isMobile ? "90%" : "380px", // 🔥 أهم سطر
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    border: "1px solid #eee"
  }}
>
  <h3 style={{ marginBottom: "10px" }}>
  Add User 👤
</h3>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  }}
>

  <input
    style={{
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      fontSize: "14px",
      width: "100%"
    }}
    placeholder="Name"
    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
  />

  <input
    style={{
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      fontSize: "14px",
      width: "100%"
    }}
    placeholder="Email"
    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
  />

  <input
    type="password"
    style={{
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      fontSize: "14px",
      width: "100%"
    }}
    placeholder="Password"
    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
  />

  <select
    style={{
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      width: "100%"
    }}
    value={newUser.role}
    onChange={(e) =>
      setNewUser({ ...newUser, role: e.target.value })
    }
  >
    <option value="employee">Employee</option>
    <option value="branch_manager">Branch Manager</option>
    <option value="admin">Admin</option>
  </select>

  {newUser.role !== "admin" && (
    <select
      style={{
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        width: "100%"
      }}
      value={newUser.branchId}
      onChange={(e) =>
        setNewUser({ ...newUser, branchId: e.target.value })
      }
    >
      <option value="">Select Branch</option>
      {branches.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  )}

</div>



          <button onClick={handleCreateUser}>Create</button>
          <button
  onClick={() => setShowModal(false)}
  style={{
    background: "#f5f5f7",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "8px",
    cursor: "pointer"
  }}
>
  Cancel
</button>
        </div>
        </div>
      )}
      {editingUser && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }}>
    <div style={{
      background: "#fff",
      padding: isMobile ? "16px" : "20px",
      borderRadius: "12px",
      width: isMobile ? "90%" : "350px",
      maxHeight: "90vh",
      overflowY: "auto"
    }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

      <h3>Edit User ✏️</h3>

      {/* Name */}
      <input
  value={editingUser.name}
  onChange={(e) =>
    setEditingUser({ ...editingUser, name: e.target.value })
  }
  placeholder="Name"
  style={{
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
    width: "100%"
  }}
/>

      {/* Role */}
      <select
        value={editingUser.role}
        onChange={(e) => {
          const role = e.target.value;

          setEditingUser({
            ...editingUser,
            role,
            ...(role === "admin" && { branchId: "" })
          });

          // 🔥 admin ياخد كل الصلاحيات
          

// 🔥 أهم تعديل
setSelectedPermissions(prev =>
  prev.length ? prev : (ROLE_PERMISSIONS[role] ?? [])
);
        }}
      >
        <option value="employee">Employee</option>
        <option value="branch_manager">Branch Manager</option>
        <option value="admin">Admin</option>
      </select>

      {/* Branch */}
      {editingUser.role !== "admin" && (
        <select
          value={editingUser.branchId || ""}
          onChange={(e) =>
            setEditingUser({ ...editingUser, branchId: e.target.value })
          }
        >
          <option value="">Select Branch</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      )}

{editingUser.role !== "admin" && (
  <div style={{ marginTop: "10px" }}>
    <p><b>Permissions:</b></p>

    {ALL_PERMISSIONS.map((perm) => (
      <label
  key={perm}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
    cursor: "pointer"
  }}
>
        <input
          type="checkbox"
          style={{ width: "16px", height: "16px" }}
          checked={selectedPermissions.includes(perm)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedPermissions(prev =>
  prev.includes(perm) ? prev : [...prev, perm]
);
            } else {
              setSelectedPermissions(prev =>
                prev.filter(p => p !== perm)
              );
            }
          }}
        />
        {perm}
      </label>
    ))}
  </div>
)}
      </div>

      {/* Buttons */}
      <button
  onClick={handleUpdateUser}
    style={{
    background: "#007aff",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%"
  }}
>
  Save
</button>
      <button
  onClick={() => {
    setEditingUser(null);
    setSelectedPermissions([]);
  }}
  style={{
  background: "#f5f5f7",
  border: "1px solid #e0e0e0",
  padding: "12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500",
  width: "100%"
}}
  onMouseEnter={(e) => e.target.style.background = "#eaeaea"}
  onMouseLeave={(e) => e.target.style.background = "#f5f5f7"}
>
  Cancel
</button>

    </div>
  </div>
)}

    </div>
  );
}