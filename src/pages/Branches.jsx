import { useEffect, useMemo, useState } from "react";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  onSnapshot,
  serverTimestamp,
  where,
  setDoc
} from "firebase/firestore";

import {
  Building2,
  MapPin,
  Phone,
  User,
  Users,
  ShoppingCart,
  Search,
  Archive,
  Pencil,
  Plus,
  CheckCircle2,
  RotateCcw,
  XCircle,
  ChevronDown,
  ChevronUp,
  BadgeCheck
} from "lucide-react";

import { db } from "../firebase";
import { useTranslate } from "../useTranslate";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
const cardStyle = {
  background: "#fff",
  borderRadius: "20px",
  padding: "20px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
};


const defaultForm = {
  name: "",
  code: "",
  phone: "",
  address: "",
  manager: "",
  employees: [
    {
      name: "",
      role: "seller"
    }
  ]
};

export default function Branches() {

  const {
    t,
    lang
  } = useTranslate();

  
const { user } = useAuth();

const { selectedBranch } = useApp();
  const [branches, setBranches] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [sales, setSales] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
  useState(false);
  const [
  showForm,
  setShowForm
] = useState(false);
  const [isMobile, setIsMobile] =
  useState(
    window.innerWidth < 768
  );

  const [editingBranch, setEditingBranch] =
    useState(null);

  const [form, setForm] =
  useState(defaultForm);

  // 🔥 Branches realtime
  useEffect(() => {

    const q =

user?.role === "owner"

  ? query(
      collection(db, "branches")
    )

  : query(
      collection(db, "branches"),

      where(
        "__name__",
        "in",
        user?.branchIds || []
      )
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBranches(data);

      setLoading(false);

    });

    return () => unsub();

  }, []);

  // 🔥 Users realtime
  useEffect(() => {

  const q =
    user?.role === "owner"

      ? collection(db, "users")

      : query(
          collection(db, "users"),

          where(
            "branchIds",
            "array-contains",
            selectedBranch
          )
        );

  const unsub = onSnapshot(
    q,
      (snap) => {

        setUsers(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      }
    );

    return () => unsub();

  }, []);

  // 🔥 Sales realtime
  useEffect(() => {

    const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const q =
  user?.role === "owner" &&
  selectedBranch === "all"

    ? query(
        collection(db, "sales"),

        where("createdAt", ">=", todayStart),
        where("createdAt", "<=", todayEnd)
      )

    : query(
        collection(db, "sales"),

        where(
          "branchId",
          "==",
          selectedBranch
        ),

        where("createdAt", ">=", todayStart),
        where("createdAt", "<=", todayEnd)
      );

    const unsub = onSnapshot(q, (snap) => {

      setSales(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    });

    return () => unsub();

  }, []);

  useEffect(() => {

  const handleResize = () => {

    setIsMobile(
      window.innerWidth < 768
    );

  };

  window.addEventListener(
    "resize",
    handleResize
  );

  return () => {

    window.removeEventListener(
      "resize",
      handleResize
    );

  };

}, []);

  // 🔥 Add / Edit
  const handleSubmit = async () => {

    if (saving) return;

    if (!form.name.trim()) {
      alert(
        t("branches.validation.nameRequired")
      );

      return;
    }

    if (!form.code.trim()) {
      alert("لازم تدخل كود الفرع");

      return;
    }
    const cleanedEmployees =
      form.employees.filter(
        employee =>
          employee.name?.trim()
      );

    setSaving(true);

    try {

      if (editingBranch) {

        await updateDoc(
          doc(
            db,
            "branches",
            editingBranch.id
          ),
          {
            ...form,

            employees:
              cleanedEmployees,

            updatedAt:
              serverTimestamp()
          }
        );

      } else {

        const branchRef = await addDoc(
          collection(db, "branches"),
          {
            ...form,
            employees: cleanedEmployees,
            status: "active",
            isArchived: false,
            createdAt: serverTimestamp()
          }
        );

        // create invoice counter
        await setDoc(
          doc(db, "counters", branchRef.id),
          {
            lastNumber: 0
          }
        );

      }

      setForm({
        name: "",
        code: "",
        phone: "",
        address: "",
        manager: "",

        employees: [
          {
            name: "",
            role: "seller"
          }
        ]
      });

      setEditingBranch(null);
      setShowForm(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (err) {

      console.error(err);

      alert(
        t("common.error")
      );

    }
    finally {

  setSaving(false);

}

  };
  

  // 🔥 Archive
  const handleArchive = async (
    branch
  ) => {

    const confirmed =
      window.confirm(
        t("branches.archiveConfirm", {
          name: branch.name
        })
      );

    if (!confirmed) return;

    try {

      await updateDoc(
        doc(
          db,
          "branches",
          branch.id
        ),
        {
          isArchived: true,
          status: "inactive"
        }
      );

    } catch (err) {

      console.error(err);

    }

  };

  // 🔥 Restore
  const handleRestore = async (
    branch
  ) => {

    try {

      await updateDoc(
        doc(
          db,
          "branches",
          branch.id
        ),
        {
          isArchived: false,
          status: "active"
        }
      );

    } catch (err) {

      console.error(err);

    }

  };

  // 🔥 Filter
  const filteredBranches =
    useMemo(() => {

      return branches.filter(branch => {

        const searchKey =
          search
            .trim()
            .toLowerCase();

        return (
          (branch.name || "")
            .toLowerCase()
            .includes(searchKey)

          ||

          String(branch.code || "")
           .toLowerCase()
            .includes(searchKey)
        );

      });

    }, [branches, search]);
const usersByBranch = useMemo(() => {

  return users.reduce((acc, user) => {

    const branchId = user.branchId;

    if (!branchId) return acc;

    if (!acc[branchId]) {
      acc[branchId] = [];
    }

    acc[branchId].push(user);

    return acc;

  }, {});

}, [users]);

const salesByBranch = useMemo(() => {

  return sales.reduce((acc, sale) => {

    const branchId = sale.branchId;

    if (!branchId) return acc;

    if (!acc[branchId]) {
      acc[branchId] = [];
    }

    acc[branchId].push(sale);

    return acc;

  }, {});

}, [sales]);
  return (
    <div style={{
      flex: 1
    }}>

      {/* Header */}
      <div style={{
        display: "flex",

        justifyContent:
          "space-between",

        alignItems:
          isMobile
            ? "stretch"
            : "center",

        flexDirection:
          isMobile
            ? "column"
            : "row",

        gap: "14px",

        marginBottom: "20px"
      }}>

        <div>

          <h2 style={{
            marginBottom: "6px"
          }}>
            🏪 {t("branches.title")}
          </h2>

          <p style={{
            color: "#6b7280",
            fontSize: "13px",
            opacity: 0.7
          }}>
            {t("branches.subtitle")}
          </p>

        </div>

        <div
          className="card"
          onMouseEnter={(e) => {

            if (isMobile) return;

            e.currentTarget.style.transform =
              "translateY(-2px)";
          }}

          onMouseLeave={(e) => {

            e.currentTarget.style.transform =
              "translateY(0)";
          }}
          style={{
            padding: "12px 18px",
            fontWeight: "700",
            transition: "0.2s ease",
            width:
              isMobile
                ? "100%"
                : "fit-content",

            textAlign: "center"
          }}
        >

          {
            branches.filter(
              b => !b.isArchived
            ).length
          }

          {" "}

          {t("branches.activeBranches")}

        </div>

      </div>

      {/* Controls */}
<div style={{
  ...cardStyle,
  marginBottom: "20px",
  padding:
    isMobile
      ? "16px"
      : "20px"
}}>

  {/* Top Bar */}
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom:
      showForm
        ? "18px"
        : "0"
  }}>

    <div>

      <h3 style={{
        marginBottom: "4px"
      }}>
        {editingBranch
          ? t("branches.editBranch")
          : t("branches.addBranch")}
      </h3>

      <p style={{
        fontSize: "13px",
        color: "#6b7280"
      }}>
        {t("branches.manageBranches")}
      </p>

    </div>

    <button
      type="button"

      onClick={() =>
        setShowForm(
          prev => !prev
        )
      }

      style={{
        border: "none",
        background: "#eff6ff",
        color: "#2563eb",
        borderRadius: "12px",
        padding: "10px 14px",
        cursor: "pointer",

        display: "flex",
        alignItems: "center",
        gap: "8px",

        fontWeight: "600"
      }}
    >

      {
        showForm
          ? <ChevronUp size={18} />
          : <ChevronDown size={18} />
      }

      {
        showForm
          ? t("common.hide")
          : t("common.show")
      }

    </button>

  </div>

  {/* Form */}
  {showForm && (

    <>

      {/* Search */}
      <div style={{
        position: "relative",
        marginBottom: "18px"
      }}>

        <Search
          size={18}
          style={{
            position: "absolute",

            top: "50%",

            transform:
              "translateY(-50%)",

            [lang === "ar"
              ? "right"
              : "left"]: "12px",

            color: "#9ca3af"
          }}
        />

        <input
          type="text"

          placeholder={
            t("branches.search")
          }

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          style={{
            width: "100%",

            padding:
              lang === "ar"
                ? "12px 42px 12px 12px"
                : "12px 12px 12px 42px",

            borderRadius: "14px",

            border:
              "1px solid #e5e7eb",

            outline: "none"
          }}
        />

      </div>

      {/* Inputs */}
      <div style={{
        display: "grid",

        gridTemplateColumns:
          isMobile
            ? "1fr"
            : "repeat(3, 1fr)",

        gap: "12px"
      }}>

        <input
        style={inputStyle}
          placeholder={
            t("branches.fields.name")
          }

          value={form.name}

          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              name: e.target.value
            }))
          }
        />

        <input
        style={inputStyle}
          placeholder={
            t("branches.fields.code")
          }

          value={form.code}

          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              code: e.target.value
                .toUpperCase()
                .replace(/\s+/g, "")
            }))
          }
        />

        <input
        style={inputStyle}
          placeholder={
            t("branches.fields.phone")
          }

          value={form.phone}

          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              phone: e.target.value
            }))
          }
        />

        <input
        style={inputStyle}
          placeholder={
            t("branches.fields.manager")
          }

          value={form.manager}

          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              manager: e.target.value
            }))
          }
        />

        <input
        style={inputStyle}
          placeholder={
            t("branches.fields.address")
          }

          value={form.address}

          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              address: e.target.value
            }))
          }
        />

      </div>

      {/* Employees */}
      <div style={{
        marginTop: "20px"
      }}>

        <p style={{
          marginBottom: "10px",
          fontWeight: "600",
          fontSize: "14px"
        }}>
          {t("branches.employees")}
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>

          {form.employees.map((employee, index) => (

            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                flexDirection:
                  isMobile
                    ? "column"
                    : "row"
              }}
            >

              <input
        style={inputStyle}
                placeholder={
                  t("branches.employeeName")
                }

                value={employee.name}

                onChange={(e) => {

                  const updated =
                    [...form.employees];

                  updated[index] = {
                    ...updated[index],
                    name: e.target.value
                  };

                  setForm(prev => ({
                    ...prev,
                    employees: updated
                  }));

                }}

                style={{
                  flex: 1
                }}
              />

              <select
                value={employee.role}

                onChange={(e) => {

                  const updated =
                    [...form.employees];

                  updated[index] = {
                    ...updated[index],
                    role: e.target.value
                  };

                  setForm(prev => ({
                    ...prev,
                    employees: updated
                  }));

                }}

                style={{
                  minWidth: "140px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "0 12px",
                  background: "#fff",
                  height: "48px",
                  outline: "none",
                }}
              >

                <option value="seller">
                  {t("roles.seller")}
                </option>

                <option value="supervisor">
                  {t("roles.supervisor")}
                </option>

                <option value="manager">
                  {t("roles.manager")}
                </option>

              </select>

              <button
                type="button"

                onClick={() => {

                  const updated =
                    form.employees.filter(
                      (_, i) =>
                        i !== index
                    );

                  setForm(prev => ({
                    ...prev,

                    employees:
                      updated.length
                        ? updated
                        : [
                            {
                              name: "",
                              role: "seller"
                            }
                          ]
                  }));

                }}

                style={{
                  border: "none",

                  background: "#fef2f2",

                  color: "#dc2626",

                  borderRadius: "10px",

                  padding: "0 14px",

                  cursor: "pointer",

                  minWidth: "48px",

                  height: "48px",

                  fontWeight: "700"
                }}
              >
                ✕
              </button>

            </div>

          ))}

          <button
            type="button"

            onClick={() =>
              setForm(prev => ({
                ...prev,

                employees: [
                  ...prev.employees,
                  {
                    name: "",
                    role: "seller"
                  }
                ]
              }))
            }

            style={{
              border: "none",

              background: "#eff6ff",

              color: "#2563eb",

              padding: "10px",

              borderRadius: "10px",

              cursor: "pointer",

              fontWeight: "600"
            }}
          >

            + {t("branches.addEmployee")}

          </button>

        </div>

      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}

        disabled={saving}

        style={{
          marginTop: "20px",

          width: "100%",

          border: "none",

          background: "#2563eb",

          color: "#fff",

          padding: "14px",

          borderRadius: "14px",

          fontWeight: "700",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          opacity:
            saving ? 0.7 : 1,

          cursor:
            saving
              ? "not-allowed"
              : "pointer",

          gap: "8px"
        }}
      >

        <Plus size={18} />

        {
          saving
            ? t("common.loading")
            : editingBranch
              ? t("common.save")
              : t("branches.add")
        }

      </button>

    </>

  )}

</div>

      {/* Loading */}
      {loading && (

        <div
          className="card"
          style={{
            textAlign: "center"
          }}
        >
          {t("common.loading")}
        </div>

      )}

      {/* Empty */}
      {!loading &&
        filteredBranches.length === 0 && (

        <div style={{
          ...cardStyle,

          textAlign: "center",

          color: "#6b7280"
        }}>

          {t("branches.empty")}

        </div>

      )}

      {/* Grid */}
      <div style={{
        display: "grid",

        gridTemplateColumns:
          isMobile
            ? "1fr"
            : "repeat(auto-fill,minmax(320px,1fr))",

        gap: "18px"
      }}>

        {filteredBranches.map(branch => {

          const branchUsers =
            usersByBranch[branch.id] || [];

          const branchSales =
            salesByBranch[branch.id]
            || [];

          const salesTotal =
            branchSales.reduce(
              (sum, s) =>
                sum +
                (
                  Number(s?.total) || 0
                ),
              0
            );

          return (
            <div
              key={branch.id}
              onMouseEnter={(e) => {

  if (isMobile) return;

  e.currentTarget.style.transform =
    "translateY(-2px)";
}}

onMouseLeave={(e) => {

  e.currentTarget.style.transform =
    "translateY(0)";
}}
              style={{
                ...cardStyle,

                opacity:
                  branch.isArchived
                    ? 0.65
                    : 1,

                position: "relative",

                padding:
                  isMobile
                    ? "14px"
                    : "18px",
                transition: "0.2s ease",
              }}
            >

              {/* Status */}
              <div style={{
                position: "absolute",

                top: "16px",

                [lang === "ar"
                  ? "left"
                  : "right"]: "16px",

                display: "flex",

                alignItems: "center",

                gap: "6px",

                fontSize: "13px",

                fontWeight: "600",

                color:
                  branch.status === "active"
                    ? "#16a34a"
                    : "#dc2626"
              }}>

                {
                  branch.status !== "inactive"
                    ? <CheckCircle2 size={16} />
                    : <XCircle size={16} />
                }

                {
                  branch.status !== "inactive"
                    ? t("common.active")
                    : t("common.inactive")
                }

              </div>

              {/* Top */}
              <div style={{
                marginBottom: "20px"
              }}>

                <div style={{
                  display: "flex",

                  alignItems: "center",

                  gap: "10px"
                }}>

                  <div style={{
                    width: "50px",
                    height: "50px",

                    borderRadius: "14px",

                    background: "#eff6ff",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center"
                  }}>

                    <Building2
                      color="#2563eb"
                    />

                  </div>

                  <div>

                    <h3 style={{
                      marginBottom: "3px"
                    }}>
                      {branch.name}
                    </h3>

                    <p style={{
                      color: "#6b7280",
                      fontSize: "13px"
                    }}>
                      {
                        branch.code
                        || t("common.notAvailable")
                      }
                    </p>

                  </div>

                </div>

              </div>

              {/* Info */}
              <div style={{
                display: "flex",

                flexDirection: "column",

                gap: "10px",

                marginBottom: "20px"
              }}>

                <InfoRow
                  icon={
                    <User size={16} />
                  }

                  text={
                    branch.manager
                    || t("common.notAvailable")
                  }
                />

                <InfoRow
                  icon={
                    <Phone size={16} />
                  }

                  text={
                    branch.phone
                    || t("common.notAvailable")
                  }
                />

                <InfoRow
                  icon={
                    <MapPin size={16} />
                  }

                  text={
                    branch.address
                    || t("common.notAvailable")
                  }
                />
                <div style={{
                  marginTop: "10px"
                }}>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}>

                    <BadgeCheck size={15} />

                    {t("branches.employees")}

                  </div>

                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px"
                  }}>

                    {branch.employees?.length ? (

                      branch.employees.map(
                        (employee, index) => (

                          <div
                            key={index}
                            style={{
                              background: "#f3f4f6",

                              padding: "8px 12px",

                              borderRadius: "999px",

                              fontSize: "13px",

                              fontWeight: "500"
                            }}
                          >

                            {
                              employee.role === "manager"
                                ? "👑 "
                                : employee.role === "supervisor"
                                  ? "🛡️ "
                                  : "🛒 "
                            }

                            {employee.name}
                            <div style={{
                              fontSize: "11px",
                              opacity: 0.6
                            }}>
                              {t(`roles.${employee.role || "seller"}`)}
                            </div>
                          </div>

                        )
                      )

                    ) : (

                      <span style={{
                        fontSize: "13px",
                        color: "#9ca3af"
                      }}>
                        {t("common.notAvailable")}
                      </span>

                    )}

                  </div>

                </div>

              </div>

              {/* Stats */}
              <div style={{
                display: "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap: "10px",

                marginBottom: "20px"
              }}>

                <StatBox
                  icon={
                    <Users size={18} />
                  }

                  label={
                    t("branches.users")
                  }

                  value={
                    branchUsers.length
                  }
                />

                <StatBox
                  icon={
                    <ShoppingCart size={18} />
                  }

                  label={
                    t("branches.salesToday")
                  }

                  value={
                    `${salesTotal.toLocaleString(
                      lang === "ar"
                        ? "ar-EG"
                        : "en-US"
                    )} EGP`
                  }
                />

              </div>

              {/* Actions */}
              <div style={{
                display: "flex",

                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

                gap: "10px"
              }}>

                <button
                  onClick={() => {

                    setEditingBranch(
                      branch
                    );
                    setShowForm(true);

                    setForm({
                      name:
                        branch.name || "",

                      code:
                        branch.code || "",

                      phone:
                        branch.phone || "",

                      address:
                        branch.address || "",

                      manager:
                        branch.manager || "",

                      employees:
                        branch.employees?.length
                          ? branch.employees
                          : [
                              {
                                name: "",
                                role: "seller"
                              }
                            ]
                    });

                    window.scrollTo({
                      top: 0,
                      behavior:
                        isMobile
                          ? "auto"
                          : "smooth"
                    });

                  }}

                  style={actionBtn}
                >

                  <Pencil size={16} />

                  {t("common.edit")}

                </button>

                {!branch.isArchived ? (

                  <button
                    onClick={() =>
                      handleArchive(branch)
                    }

                    style={{
                      ...actionBtn,

                      background:
                        "#fef2f2",

                      color: "#dc2626"
                    }}
                  >

                    <Archive size={16} />

                    {t("common.archive")}

                  </button>

                ) : (

                  <button
                    onClick={() =>
                      handleRestore(branch)
                    }

                    style={{
                      ...actionBtn,

                      background:
                        "#ecfdf5",

                      color: "#16a34a"
                    }}
                  >

                    <RotateCcw size={16} />

                    {t("common.restore")}

                  </button>

                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

function InfoRow({
  icon,
  text
}) {

  return (
    <div style={{
      display: "flex",

      alignItems: "center",

      gap: "8px",

      color: "#4b5563",

      fontSize: "14px"
    }}>

      {icon}

      <span>
        {text}
      </span>

    </div>
  );
}

function StatBox({
  icon,
  label,
  value
}) {

  return (
    <div style={{
      background: "#f9fafb",

      borderRadius: "14px",

      padding: "12px",

      display: "flex",

      flexDirection: "column",

      gap: "6px"
    }}>

      <div style={{
        color: "#6b7280",

        display: "flex",

        alignItems: "center",

        gap: "6px",

        fontSize: "13px"
      }}>

        {icon}

        {label}

      </div>

      <div style={{
        fontWeight: "700",
        fontSize: "15px"
      }}>
        {value}
      </div>

    </div>
  );
}
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  outline: "none",
  background: "#fff"
};
const actionBtn = {

  flex: 1,

  border: "none",

  padding: "12px",

  borderRadius: "12px",

  cursor: "pointer",

  fontWeight: "600",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: "6px",

  background: "#f3f4f6"
};