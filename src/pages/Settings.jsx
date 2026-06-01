import { auth } from "../firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  useState,
  useEffect
} from "react";
import { resetSystem } from "../utils/resetSystem";
import { useAuth } from "../store/useAuth";
import { useTranslate } from "../useTranslate";

export default function Settings() {
  const {
  user,
  updateUser
} = useAuth();
const [loadingReset, setLoadingReset] = useState(false);
const { t, tt, lang } = useTranslate();
const SUPER_ADMIN_UID = "w9o5o3PnKHfXAZzzuNlbNLhbxEg2";
const handleReset = async () => {
  const confirmText = prompt("اكتب RESET ALL للتأكيد");

if (confirmText !== "RESET ALL") {
  alert("تم الإلغاء ❌");
  return;
}

  try {
    setLoadingReset(true);
    await resetSystem();
    alert("تم تصفير السيستم ✅");
  } catch (err) {
    console.error(err);
    alert("حصل خطأ ❌");
  } finally {
    setLoadingReset(false);
  }
};
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  useEffect(() => {
  setName(user?.name || "");
}, [user?.name]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("لازم تسجل دخول تاني");
      return;
    }

    if (!currentPassword || !newPassword) {
      alert("كمل البيانات ❗");
      return;
    }

    try {
      // 🔐 re-auth
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(
        currentUser,
        credential
      );

      // 🔥 update password
      await updatePassword(
        currentUser,
        newPassword
      );

      alert("تم تغيير الباسورد ✅");

      setCurrentPassword("");
      setNewPassword("");

    } catch (err) {
      alert("الباسورد القديم غلط ❌ أو لازم تسجل دخول تاني");
    }
  };
  const handleSaveName = async () => {
  if (!name) {
    alert("اكتب اسم ❗");
    return;
  }
  if (name.trim() === user?.name) {
  setEditing(false);
  return;
}

  try {
    // 🔥 update firestore
    await updateDoc(
      doc(db, "users", user.uid),
      {
  name: name.trim()
}
    );

    updateUser({
  name: name.trim()
});
    alert("تم تحديث الاسم ✅");
    setEditing(false);
  } catch (err) {
    alert("في مشكلة ❌");
  }
};

  return (
    
    <div style={{
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "20px 14px"
}}>

  <div style={{ width: "100%", maxWidth: "420px" }}>

    <h2 style={{ marginBottom: "20px" }}>
      Settings ⚙️
    </h2>
    <div style={{
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
    padding: "15px",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
    }}>

  <img
  src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=3b82f6&color=fff`}
  style={{
    width: "60px",
    height: "60px",
    borderRadius: "50%"
  }}
/>

  <div>
  <div style={{
    fontSize: "18px",
    fontWeight: "bold"
  }}>
    {user?.name || "User"}
  </div>

  {/* 👇 ضيف ده */}
  <div style={{
    fontSize: "13px",
    color: "#64748b",
    marginTop: "2px"
  }}>
    {user?.email}
  </div>

  <div style={{
    marginTop: "5px",
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "999px",
    display: "inline-block",
    background: user?.role === "owner" ? "#fee2e2" : "#e0f2fe",
    color: user?.role === "owner" ? "#b91c1c" : "#0369a1"
  }}>
    {user?.role}
  </div>
</div>

</div>

    {/* Profile */}
    <div
    className="card"
    style={{
        marginBottom: "20px",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        border: "1px solid #eee"
    }}
    >

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h3>Profile 👤</h3>

  <button
    onClick={() => setEditing(!editing)}
    style={{
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "#3b82f6",
      fontWeight: "bold"
    }}
  >
    {editing ? "Cancel" : "Edit"}
  </button>
</div>

        <div style={{ marginTop: "8px" }}>
        {editing ? (
  <input
    value={name}
    onChange={(e) => setName(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      marginTop: "8px"
    }}
  />
) : (
  <strong>{user?.name || "—"}</strong>
)}
{editing && (
  <button
    onClick={handleSaveName}
    style={{
      marginTop: "10px",
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      background: "#22c55e",
      color: "#fff",
      cursor: "pointer"
    }}
  >
    Save
  </button>
)}
        </div>

        <p style={{ marginTop: "8px" }}>
        <strong>Email:</strong> {user?.email}
        </p>

        <p style={{ marginTop: "8px" }}>
        <strong>Role:</strong> {user?.role}
        </p>

        <p style={{ marginTop: "8px" }}>
        <strong>Branch:</strong> {
            user?.role === "owner"
            ? "All Branches"
            : user?.branchIds?.join(", ") || "—"
        }
        </p>

    </div>

    {/* Password */}
    <div
    className="card"
    style={{
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        border: "1px solid #eee"
    }}
    >

      <h3>Change Password 🔐</h3>

      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginTop: "10px"
        }}
        />

      <input
  type="password"
  placeholder="New Password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginTop: "10px"
  }}
/>

      <button
  onClick={handleChangePassword}
  style={{
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "#fff",
    fontWeight: "bold",
    width: "100%",
    cursor: "pointer"
  }}
>
  Update Password
</button>

    </div>
    <div style={{
  marginTop: "14px",
  textAlign: "center",
  fontSize: "11px",
  color: "#94a3b8"
}}>

  APS v
  {import.meta.env.VITE_APP_VERSION}

</div>

  </div>

{user?.uid === SUPER_ADMIN_UID && (
  <div
    className="card"
    style={{
      marginTop: "20px",
      padding: "20px",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      border: "1px solid #eee"
    }}
  >
    <h3 style={{ marginBottom: "10px", color: "#ef4444" }}>
      Danger Zone ⚠️
    </h3>
    
    <button
      onClick={handleReset}
      disabled={loadingReset}
      style={{
        width: "100%",
        padding: "14px",
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        opacity: loadingReset ? 0.6 : 1,
        fontWeight: "bold"
      }}
    >
      {loadingReset ? "Resetting..." : "🔥 Reset System"}
    </button>
    
  </div>
)}
</div>
  );
}