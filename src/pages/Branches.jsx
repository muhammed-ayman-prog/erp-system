import { Fragment, useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  where,
} from "firebase/firestore";
import {
  Building2,
  MapPin,
  Phone,
  User,
  Users,
  Search,
  Archive,
  Pencil,
  Plus,
  CheckCircle2,
  RotateCcw,
  XCircle,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  X,
  ShieldCheck,
  LayoutList,
  BriefcaseBusiness,
  ArrowUpDown,
  Info,
  Hash,
  AlertCircle,
  Check,
} from "lucide-react";

import { db } from "../firebase";
import { useTranslate } from "../useTranslate";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import {
  createBranchService,
  updateBranchService,
  archiveBranchService,
  restoreBranchService,
} from "../features/branches/services/branchesService";

const defaultForm = {
  name: "",
  code: "",
  phone: "",
  address: "",
  manager: "",
  employees: [{ id: null, name: "", role: "seller" }],
};

const roleOptions = ["seller", "supervisor", "manager"];

function getBranchStatus(branch) {
  if (branch?.isArchived) return "archived";
  if (branch?.status === "inactive") return "inactive";
  return "active";
}

function getInitials(value = "") {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function getUserName(account) {
  return account?.name || account?.displayName || account?.fullName || account?.email || "—";
}

function getCompletion(branch) {
  const checks = [
    Boolean(branch?.name?.trim()),
    Boolean(String(branch?.code || "").trim()),
    Boolean(branch?.manager?.trim()),
    Boolean(branch?.phone?.trim()),
    Boolean(branch?.address?.trim()),
    Boolean(branch?.employees?.some((employee) => employee?.name?.trim())),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function formatCount(value, lang) {
  return Number(value || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
}

export default function Branches() {
  const { t, lang } = useTranslate();
  const { user } = useAuth();
  const { selectedBranch } = useApp();
  const isRTL = lang === "ar";

  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [expandedBranchId, setExpandedBranchId] = useState(null);
  const [detailsTab, setDetailsTab] = useState("overview");

  // Branches realtime listener — same Firestore source and access query as the original page.
  useEffect(() => {
    const q =
      user?.role === "owner"
        ? query(collection(db, "branches"))
        : query(
            collection(db, "branches"),
            where("__name__", "in", user?.branchIds || [])
          );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setBranches(
          snap.docs.map((branchDoc) => ({
            id: branchDoc.id,
            ...branchDoc.data(),
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Branches listener error:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Users realtime listener — keeps the original owner / selected-branch query behavior.
  useEffect(() => {
    const q =
      user?.role === "owner"
        ? collection(db, "users")
        : query(
            collection(db, "users"),
            where("branchIds", "array-contains", selectedBranch)
          );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setUsers(
          snap.docs.map((userDoc) => ({
            id: userDoc.id,
            ...userDoc.data(),
          }))
        );
      },
      (error) => console.error("Branch users listener error:", error)
    );

    return () => unsub();
  }, [user?.role, selectedBranch]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const usersByBranch = useMemo(() => {
    return users.reduce((acc, account) => {
      const assignedIds = new Set([
        account?.branchId,
        ...(Array.isArray(account?.branchIds) ? account.branchIds : []),
      ].filter(Boolean));

      assignedIds.forEach((branchId) => {
        if (!acc[branchId]) acc[branchId] = [];
        if (!acc[branchId].some((item) => item.id === account.id)) {
          acc[branchId].push(account);
        }
      });
      return acc;
    }, {});
  }, [users]);

  const branchStats = useMemo(() => {
    const stats = { all: branches.length, active: 0, inactive: 0, archived: 0, employees: 0, accounts: 0 };
    branches.forEach((branch) => {
      const status = getBranchStatus(branch);
      stats[status] += 1;
      stats.employees += (branch.employees || []).filter((employee) => employee?.name?.trim()).length;
      stats.accounts += (usersByBranch[branch.id] || []).length;
    });
    return stats;
  }, [branches, usersByBranch]);

  const filteredBranches = useMemo(() => {
    const searchKey = search.trim().toLocaleLowerCase();
    const filtered = branches.filter((branch) => {
      const status = getBranchStatus(branch);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const searchable = [
        branch.name,
        branch.code,
        branch.manager,
        branch.phone,
        branch.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return matchesStatus && (!searchKey || searchable.includes(searchKey));
    });

    return filtered.sort((a, b) => {
      if (sortBy === "team") {
        return (b.employees?.length || 0) - (a.employees?.length || 0);
      }
      if (sortBy === "accounts") {
        return (usersByBranch[b.id]?.length || 0) - (usersByBranch[a.id]?.length || 0);
      }
      if (sortBy === "completion") return getCompletion(b) - getCompletion(a);
      return String(a.name || "").localeCompare(String(b.name || ""), isRTL ? "ar" : "en");
    });
  }, [branches, search, statusFilter, sortBy, usersByBranch, isRTL]);

  const openCreateForm = () => {
    setEditingBranch(null);
    setForm({ ...defaultForm, employees: [{ ...defaultForm.employees[0] }] });
    setShowForm(true);
  };

  const openEditForm = (branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name || "",
      code: branch.code || "",
      phone: branch.phone || "",
      address: branch.address || "",
      manager: branch.manager || "",
      employees: branch.employees?.length
        ? branch.employees.map((employee) => ({ ...employee }))
        : [{ id: null, name: "", role: "seller" }],
    });
    setShowForm(true);
  };

  // Add / Edit — preserve the existing service calls and payload shape.
  const handleSubmit = async () => {
    if (saving) return;

    if (!form.name.trim()) {
      alert(t("branches.validation.nameRequired"));
      return;
    }

    if (!form.code.trim()) {
      alert("لازم تدخل كود الفرع");
      return;
    }

    const cleanedEmployees = form.employees.filter((employee) => employee.name?.trim());
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        code: form.code,
        phone: form.phone,
        address: form.address,
        manager: form.manager,
        employees: cleanedEmployees,
      };

      if (editingBranch) {
        await updateBranchService({ id: editingBranch.id, ...payload });
      } else {
        await createBranchService(payload);
      }

      setForm({ ...defaultForm, employees: [{ ...defaultForm.employees[0] }] });
      setEditingBranch(null);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  // Archive
  const handleArchive = async (branch) => {
    const confirmed = window.confirm(
  lang === "ar"
    ? `هل تريد أرشفة "${branch.name}"؟`
    : `Are you sure you want to archive "${branch.name}"?`
);
    if (!confirmed) return;

    try {
      await archiveBranchService({ id: branch.id });
      if (expandedBranchId === branch.id) setExpandedBranchId(null);
    } catch (error) {
      console.error(error);
      alert(t("common.error"));
    }
  };

  // Restore
  const handleRestore = async (branch) => {
    try {
      await restoreBranchService({ id: branch.id });
    } catch (error) {
      console.error(error);
      alert(t("common.error"));
    }
  };

  const toggleBranch = (branchId) => {
    setExpandedBranchId((current) => (current === branchId ? null : branchId));
    setDetailsTab("overview");
  };

  const copy = isRTL
    ? {
        directory: "دليل الفروع",
        description: "إدارة ومتابعة بيانات الفروع والفرق والحسابات من مكان واحد",
        add: "إضافة فرع",
        search: "ابحث بالاسم أو الكود أو المدير أو الهاتف...",
        all: "كل الفروع",
        active: "نشط",
        inactive: "غير نشط",
        archived: "مؤرشف",
        branch: "الفرع",
        manager: "مدير الفرع",
        team: "الفريق",
        accounts: "حسابات النظام",
        status: "الحالة",
        completion: "اكتمال البيانات",
        actions: "الإجراءات",
        details: "التفاصيل",
        overview: "نظرة عامة",
        employees: "فريق العمل المسجل",
        registeredUsers: "مستخدمو النظام",
        contact: "بيانات التواصل",
        address: "العنوان",
        phone: "رقم الهاتف",
        code: "كود الفرع",
        noManager: "لم يتم تحديد مدير",
        noEmployees: "لا يوجد فريق عمل مضاف لهذا الفرع بعد.",
        noUsers: "لا توجد حسابات مرتبطة بهذا الفرع.",
        noResults: "لا توجد فروع مطابقة لبحثك",
        noBranches: "لم يتم إضافة أي فروع حتى الآن",
        clear: "مسح البحث",
        sort: "ترتيب حسب",
        sortName: "اسم الفرع",
        sortTeam: "حجم الفريق",
        sortAccounts: "حسابات النظام",
        sortCompletion: "اكتمال البيانات",
        newBranch: "فرع جديد",
        editBranch: "تعديل بيانات الفرع",
        basicInfo: "البيانات الأساسية",
        contactInfo: "التواصل والإدارة",
        employeeManagement: "إدارة فريق العمل",
        branchName: "اسم الفرع",
        employeeName: "اسم الموظف",
        role: "الدور الوظيفي",
        addEmployee: "إضافة موظف",
        save: "حفظ التغييرات",
        create: "إنشاء الفرع",
        cancel: "إلغاء",
        required: "مطلوب",
        notAvailable: "غير متاح",
        complete: "مكتمل",
        needsInfo: "يحتاج استكمال",
        people: "موظف",
        user: "مستخدم",
        edit: "تعديل",
        archiveAction: "أرشفة",
        restore: "استرجاع",
        loading: "جاري تحميل الفروع...",
        selectBranch: "اختر فرعًا لعرض تفاصيله",
      }
    : {
        directory: "Branch Directory",
        description: "Manage branch information, teams and system accounts in one place",
        add: "Add branch",
        search: "Search by branch, code, manager or phone...",
        all: "All branches",
        active: "Active",
        inactive: "Inactive",
        archived: "Archived",
        branch: "Branch",
        manager: "Branch manager",
        team: "Team",
        accounts: "System accounts",
        status: "Status",
        completion: "Profile completeness",
        actions: "Actions",
        details: "Details",
        overview: "Overview",
        employees: "Branch team",
        registeredUsers: "System users",
        contact: "Contact information",
        address: "Address",
        phone: "Phone number",
        code: "Branch code",
        noManager: "No manager assigned",
        noEmployees: "No team members have been added to this branch yet.",
        noUsers: "No system accounts are linked to this branch.",
        noResults: "No branches match your search",
        noBranches: "No branches have been added yet",
        clear: "Clear search",
        sort: "Sort by",
        sortName: "Branch name",
        sortTeam: "Team size",
        sortAccounts: "System accounts",
        sortCompletion: "Profile completeness",
        newBranch: "New branch",
        editBranch: "Edit branch details",
        basicInfo: "Basic information",
        contactInfo: "Contact & management",
        employeeManagement: "Team management",
        branchName: "Branch name",
        employeeName: "Employee name",
        role: "Role",
        addEmployee: "Add employee",
        save: "Save changes",
        create: "Create branch",
        cancel: "Cancel",
        required: "Required",
        notAvailable: "Not available",
        complete: "Complete",
        needsInfo: "Needs attention",
        people: "employees",
        user: "users",
        edit: "Edit",
        archiveAction: "Archive",
        restore: "Restore",
        loading: "Loading branches...",
        selectBranch: "Select a branch to view its details",
      };

  const statusLabel = (status) => copy[status] || copy.active;

  const renderStatus = (branch) => {
    const status = getBranchStatus(branch);
    const config = {
      active: { icon: CheckCircle2, className: "brx-status-active" },
      inactive: { icon: XCircle, className: "brx-status-inactive" },
      archived: { icon: Archive, className: "brx-status-archived" },
    }[status];
    const StatusIcon = config.icon;
    return (
      <span className={`brx-status ${config.className}`}>
        <StatusIcon size={13} strokeWidth={2.4} />
        {statusLabel(status)}
      </span>
    );
  };

  const renderCompletion = (branch) => {
    const score = getCompletion(branch);
    return (
      <div className="brx-completion">
        <div className="brx-completion-meta">
          <span>{score}%</span>
          <span>{score === 100 ? copy.complete : copy.needsInfo}</span>
        </div>
        <div className="brx-progress-track">
          <span style={{ width: `${score}%` }} />
        </div>
      </div>
    );
  };

  const renderExpandedDetails = (branch) => {
    const branchUsers = usersByBranch[branch.id] || [];
    const employees = (branch.employees || []).filter((employee) => employee?.name?.trim());

    return (
      <div className="brx-expanded-content">
        <div className="brx-detail-tabs" role="tablist" aria-label={copy.details}>
          {[
            { id: "overview", label: copy.overview, icon: Info },
            { id: "team", label: copy.employees, icon: BriefcaseBusiness },
            { id: "accounts", label: copy.registeredUsers, icon: ShieldCheck },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                role="tab"
                aria-selected={detailsTab === tab.id}
                className={`brx-detail-tab ${detailsTab === tab.id ? "is-active" : ""}`}
                onClick={() => setDetailsTab(tab.id)}
              >
                <TabIcon size={15} />
                {tab.label}
                {tab.id === "team" && <span className="brx-tab-count">{employees.length}</span>}
                {tab.id === "accounts" && <span className="brx-tab-count">{branchUsers.length}</span>}
              </button>
            );
          })}
        </div>

        {detailsTab === "overview" && (
          <div className="brx-overview-grid">
            <section className="brx-detail-section">
              <div className="brx-section-heading"><MapPin size={16} />{copy.contact}</div>
              <div className="brx-info-grid">
                <div className="brx-info-item">
                  <span className="brx-info-icon"><User size={16} /></span>
                  <div><small>{copy.manager}</small><strong>{branch.manager || copy.noManager}</strong></div>
                </div>
                <div className="brx-info-item">
                  <span className="brx-info-icon"><Phone size={16} /></span>
                  <div><small>{copy.phone}</small><strong>{branch.phone || copy.notAvailable}</strong></div>
                </div>
                <div className="brx-info-item">
                  <span className="brx-info-icon"><MapPin size={16} /></span>
                  <div><small>{copy.address}</small><strong>{branch.address || copy.notAvailable}</strong></div>
                </div>
                <div className="brx-info-item">
                  <span className="brx-info-icon"><Hash size={16} /></span>
                  <div><small>{copy.code}</small><strong>{branch.code || copy.notAvailable}</strong></div>
                </div>
              </div>
            </section>
            <section className="brx-detail-section brx-health-card">
              <div className="brx-section-heading"><BadgeCheck size={16} />{copy.completion}</div>
              <div className="brx-health-score">{getCompletion(branch)}<span>%</span></div>
              <p>{getCompletion(branch) === 100 ? copy.complete : copy.needsInfo}</p>
              {renderCompletion(branch)}
            </section>
          </div>
        )}

        {detailsTab === "team" && (
          <section className="brx-detail-section">
            <div className="brx-section-heading"><BriefcaseBusiness size={16} />{copy.employees}<span className="brx-heading-count">{employees.length}</span></div>
            {employees.length ? (
              <div className="brx-people-grid">
                {employees.map((employee, index) => (
                  <div className="brx-person-card" key={employee.id || `${employee.name}-${index}`}>
                    <div className="brx-avatar">{getInitials(employee.name)}</div>
                    <div className="brx-person-copy">
                      <strong>{employee.name}</strong>
                      <span>{t(`roles.${employee.role || "seller"}`)}</span>
                    </div>
                    {employee.role === "manager" && <span className="brx-person-tag">{isRTL ? "إدارة" : "Lead"}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="brx-inline-empty"><Users size={19} /><span>{copy.noEmployees}</span></div>
            )}
          </section>
        )}

        {detailsTab === "accounts" && (
          <section className="brx-detail-section">
            <div className="brx-section-heading"><ShieldCheck size={16} />{copy.registeredUsers}<span className="brx-heading-count">{branchUsers.length}</span></div>
            {branchUsers.length ? (
              <div className="brx-accounts-list">
                {branchUsers.map((account) => (
                  <div className="brx-account-row" key={account.id}>
                    <div className="brx-avatar brx-avatar-muted">{getInitials(getUserName(account))}</div>
                    <div className="brx-account-copy">
                      <strong>{getUserName(account)}</strong>
                      <span>{account.email || copy.notAvailable}</span>
                    </div>
                    <span className="brx-role-pill">{account.role || copy.notAvailable}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="brx-inline-empty"><Users size={19} /><span>{copy.noUsers}</span></div>
            )}
          </section>
        )}

        <div className="brx-expanded-footer">
          <span><Info size={14} />{isRTL ? "التفاصيل المعروضة مأخوذة من بيانات الفرع الحالية" : "Details are based on the branch's current records"}</span>
          <div className="brx-row-actions">
            <button type="button" className="brx-btn brx-btn-soft" onClick={() => openEditForm(branch)}>
              <Pencil size={15} />{copy.edit}
            </button>
            {getBranchStatus(branch) === "archived" ? (
              <button type="button" className="brx-btn brx-btn-success" onClick={() => handleRestore(branch)}>
                <RotateCcw size={15} />{copy.restore}
              </button>
            ) : (
              <button type="button" className="brx-btn brx-btn-danger" onClick={() => handleArchive(branch)}>
                <Archive size={15} />{copy.archiveAction}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="brx-page" dir={isRTL ? "rtl" : "ltr"}>
      <style>{`
        .brx-page{--brx-ink:#172033;--brx-muted:#778196;--brx-line:#e8edf4;--brx-blue:#2563eb;--brx-blue-soft:#eff5ff;--brx-surface:#fff;color:var(--brx-ink);width:100%;min-width:0;padding-bottom:28px}
        .brx-page *{box-sizing:border-box}
        .brx-header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:22px}
        .brx-eyebrow{display:flex;align-items:center;gap:7px;color:#71809a;font-size:11px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;margin-bottom:8px}
        .brx-title{margin:0;color:#182338;font-size:clamp(23px,2.2vw,30px);font-weight:800;letter-spacing:-.04em;line-height:1.2}
        .brx-subtitle{margin:7px 0 0;color:#8791a3;font-size:13px;line-height:1.6}
        .brx-btn{border:1px solid transparent;border-radius:10px;min-height:39px;padding:0 13px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:12px;font-weight:750;cursor:pointer;transition:background .18s ease,border-color .18s ease,transform .18s ease;color:#344054;white-space:nowrap}
        .brx-btn:disabled{opacity:.6;cursor:not-allowed}
        .brx-btn-primary{background:#245fe5;color:#fff;box-shadow:0 5px 13px rgba(37,99,235,.16)}
        .brx-btn-primary:hover{background:#174fc9;transform:translateY(-1px)}
        .brx-btn-soft{background:#fff;border-color:#e4eaf2;color:#41516a}.brx-btn-soft:hover{background:#f6f8fb;border-color:#d6deea}
        .brx-btn-danger{background:#fff7f6;color:#c54545;border-color:#f7e2df}.brx-btn-danger:hover{background:#ffefed}
        .brx-btn-success{background:#effaf4;color:#168451;border-color:#d7f1e2}.brx-btn-success:hover{background:#e5f7ed}
        .brx-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}
        .brx-summary-card{background:#fff;border:1px solid var(--brx-line);border-radius:13px;padding:14px 16px;min-width:0;display:flex;align-items:center;gap:12px}
        .brx-summary-icon{width:34px;height:34px;border-radius:10px;background:#f1f5fb;color:#62728c;display:grid;place-items:center;flex:none}
        .brx-summary-card.is-active .brx-summary-icon{background:#ecf8f1;color:#21885a}.brx-summary-card.is-inactive .brx-summary-icon{background:#fff5e9;color:#b97927}.brx-summary-card.is-archived .brx-summary-icon{background:#f2f3f6;color:#788397}
        .brx-summary-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.brx-summary-copy span{font-size:11px;color:#8b95a5;font-weight:650}.brx-summary-copy strong{font-size:20px;line-height:1.2;font-weight:800;color:#253149;font-variant-numeric:tabular-nums}
        .brx-workspace{background:#fff;border:1px solid var(--brx-line);border-radius:15px;overflow:hidden;box-shadow:0 5px 22px rgba(21,39,71,.035)}
        .brx-toolbar{padding:15px 17px;display:flex;align-items:center;justify-content:space-between;gap:14px;border-bottom:1px solid var(--brx-line);background:linear-gradient(180deg,#fff,#fcfdff)}
        .brx-search-wrap{position:relative;flex:1;max-width:430px;min-width:150px}.brx-search-icon{position:absolute;top:50%;transform:translateY(-50%);left:12px;color:#9aa5b5;pointer-events:none}
        .brx-search{width:100%;height:40px;border:1px solid #e5eaf1;border-radius:10px;background:#fff;padding:0 13px 0 38px;color:#27344b;font-size:12px;outline:none;transition:border .18s,box-shadow .18s}
        .brx-search:focus{border-color:#9bb8f8;box-shadow:0 0 0 3px rgba(37,99,235,.08)}.brx-search::placeholder{color:#a4adbb}
        .brx-toolbar-right{display:flex;align-items:center;gap:9px}.brx-sort-wrap{display:flex;align-items:center;gap:7px;color:#8a95a6;font-size:11px;white-space:nowrap}
        .brx-select{height:39px;border:1px solid #e5eaf1;border-radius:9px;background:#fff;color:#536078;font-size:11px;padding:0 29px 0 10px;outline:none;max-width:180px}
        .brx-tabs{display:flex;align-items:center;gap:5px;padding:11px 17px 0;border-bottom:1px solid var(--brx-line);overflow-x:auto;scrollbar-width:none}.brx-tabs::-webkit-scrollbar{display:none}
        .brx-filter-tab{border:0;background:transparent;padding:10px 12px 12px;color:#8a94a5;font-size:11px;font-weight:750;white-space:nowrap;cursor:pointer;position:relative;display:inline-flex;align-items:center;gap:7px}
        .brx-filter-tab:after{content:"";position:absolute;bottom:-1px;left:10px;right:10px;height:2px;border-radius:3px;background:transparent}.brx-filter-tab.is-active{color:#245fe5}.brx-filter-tab.is-active:after{background:#2865eb}
        .brx-tab-number{font-size:10px;color:#8994a5;background:#f2f4f7;border-radius:5px;padding:2px 5px;font-weight:750}.brx-filter-tab.is-active .brx-tab-number{background:#edf3ff;color:#245fe5}
        .brx-table-scroll{width:100%;overflow-x:auto}.brx-table{width:100%;border-collapse:collapse;min-width:780px;text-align:start}
        .brx-table thead th{height:42px;padding:0 14px;background:#fbfcfe;color:#98a1b0;font-size:10px;font-weight:800;letter-spacing:.035em;text-transform:uppercase;white-space:nowrap;border-bottom:1px solid var(--brx-line)}
        .brx-table tbody tr.brx-main-row{border-bottom:1px solid #f0f2f6;transition:background .16s;cursor:pointer}.brx-table tbody tr.brx-main-row:hover{background:#fafcff}.brx-table tbody tr.brx-main-row.is-expanded{background:#f8faff}
        .brx-table td{padding:13px 14px;vertical-align:middle;color:#4b5870;font-size:11px}.brx-table td:first-child,.brx-table th:first-child{padding-inline-start:18px}
        .brx-branch-cell{display:flex;align-items:center;gap:11px;min-width:190px}.brx-branch-mark{width:37px;height:37px;border:1px solid #e7edf6;border-radius:10px;display:grid;place-items:center;background:#f6f8fc;color:#5b76a7;flex:none}
        .brx-branch-meta{min-width:0;display:flex;flex-direction:column;gap:4px}.brx-branch-meta strong{font-size:12px;color:#26334a;font-weight:800;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.brx-branch-meta span{font-size:10px;color:#99a3b2;font-weight:600}
        .brx-manager-cell{display:flex;align-items:center;gap:8px;min-width:125px}.brx-mini-avatar{width:27px;height:27px;border-radius:8px;background:#f0f4fb;color:#71819b;display:grid;place-items:center;font-size:9px;font-weight:850;flex:none}.brx-manager-cell span{max-width:125px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .brx-count-cell{display:inline-flex;align-items:center;gap:7px;color:#53627b;font-weight:750}.brx-count-icon{width:26px;height:26px;border:1px solid #edf0f4;border-radius:7px;display:grid;place-items:center;color:#8593a9;background:#fff}
        .brx-status{display:inline-flex;align-items:center;gap:5px;border-radius:6px;padding:5px 8px;font-size:10px;font-weight:800;white-space:nowrap}.brx-status-active{background:#edf9f2;color:#238653}.brx-status-inactive{background:#fff5e9;color:#ad762d}.brx-status-archived{background:#f1f3f6;color:#7b8798}
        .brx-completion{min-width:95px;max-width:115px}.brx-completion-meta{display:flex;justify-content:space-between;gap:7px;font-size:9px;color:#909bad;margin-bottom:6px}.brx-completion-meta span:first-child{font-weight:850;color:#5b6a82}.brx-progress-track{height:4px;border-radius:6px;background:#edf0f4;overflow:hidden}.brx-progress-track span{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#7ba6fa,#2563eb)}
        .brx-row-action{width:30px;height:30px;border:1px solid transparent;border-radius:8px;background:transparent;color:#8c97a8;display:grid;place-items:center;cursor:pointer}.brx-row-action:hover{background:#f0f4fa;color:#3f5f96}.brx-row-action.is-open{background:#edf3ff;color:#245fe5}
        .brx-expanded-row td{padding:0!important;background:#f8faff;border-bottom:1px solid #e8eef8}.brx-expanded-content{padding:17px 20px 18px;border-top:1px solid #e8eef8;animation:brx-reveal .2s ease both}@keyframes brx-reveal{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        .brx-detail-tabs{display:flex;gap:5px;align-items:center;border-bottom:1px solid #e7edf6;margin-bottom:16px;overflow-x:auto}.brx-detail-tab{border:0;background:transparent;padding:9px 11px 11px;display:inline-flex;align-items:center;gap:7px;color:#8a96a8;font-size:11px;font-weight:750;white-space:nowrap;cursor:pointer;position:relative}.brx-detail-tab:after{content:"";position:absolute;bottom:-1px;left:9px;right:9px;height:2px;background:transparent}.brx-detail-tab.is-active{color:#245fe5}.brx-detail-tab.is-active:after{background:#2865eb}.brx-tab-count,.brx-heading-count{font-size:10px;font-weight:800;color:#71809a;background:#edf1f6;border-radius:5px;padding:3px 6px}
        .brx-overview-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(190px,.7fr);gap:14px}.brx-detail-section{min-width:0;border:1px solid #e7edf5;border-radius:11px;background:rgba(255,255,255,.82);padding:15px}.brx-section-heading{display:flex;align-items:center;gap:8px;color:#52617a;font-size:11px;font-weight:850;margin-bottom:13px}.brx-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 18px}.brx-info-item{display:flex;align-items:center;gap:9px;min-width:0}.brx-info-icon{width:29px;height:29px;display:grid;place-items:center;flex:none;color:#8191aa;background:#f3f6fb;border-radius:8px}.brx-info-item div{display:flex;flex-direction:column;gap:3px;min-width:0}.brx-info-item small{font-size:9px;color:#9aa4b3;font-weight:650}.brx-info-item strong{font-size:11px;color:#3a4860;font-weight:750;overflow-wrap:anywhere}
        .brx-health-card{display:flex;flex-direction:column;align-items:flex-start;justify-content:center}.brx-health-card .brx-section-heading{margin-bottom:6px}.brx-health-score{font-size:32px;line-height:1.2;color:#263650;font-weight:850;letter-spacing:-.05em}.brx-health-score span{font-size:15px;color:#8794a8;margin-inline-start:2px}.brx-health-card p{font-size:10px;color:#929daf;margin:4px 0 14px}.brx-health-card .brx-completion{width:100%;max-width:none}
        .brx-people-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:9px}.brx-person-card{min-width:0;display:flex;align-items:center;gap:9px;padding:10px;border:1px solid #edf0f5;border-radius:9px;background:#fff}.brx-avatar{width:32px;height:32px;border-radius:10px;background:#eaf1ff;color:#426bb4;display:grid;place-items:center;font-size:10px;font-weight:850;flex:none}.brx-person-copy,.brx-account-copy{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.brx-person-copy strong,.brx-account-copy strong{font-size:11px;color:#39475e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.brx-person-copy span,.brx-account-copy span{font-size:9px;color:#939eae;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.brx-person-tag{font-size:9px;color:#5778b5;background:#f0f5ff;padding:4px 6px;border-radius:5px}
        .brx-accounts-list{display:flex;flex-direction:column;gap:7px}.brx-account-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #edf0f5;border-radius:9px;background:#fff}.brx-avatar-muted{background:#f1f3f7;color:#75829a}.brx-role-pill{font-size:9px;color:#73819a;background:#f3f5f8;padding:5px 7px;border-radius:6px;white-space:nowrap}
        .brx-inline-empty{min-height:68px;border:1px dashed #dfe6ef;border-radius:9px;display:flex;align-items:center;justify-content:center;gap:9px;color:#9aa5b5;font-size:11px;padding:15px;text-align:center}
        .brx-expanded-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding-top:13px;border-top:1px solid #e7edf6}.brx-expanded-footer>span{display:flex;align-items:center;gap:6px;font-size:9px;color:#9aa5b4}.brx-row-actions{display:flex;gap:7px}
        .brx-empty{padding:48px 20px;text-align:center}.brx-empty-icon{width:48px;height:48px;margin:0 auto 12px;border-radius:14px;background:#f2f5fa;color:#8191a9;display:grid;place-items:center}.brx-empty strong{display:block;color:#44516a;font-size:13px;margin-bottom:5px}.brx-empty p{color:#9aa4b2;font-size:11px;margin:0 0 14px}
        .brx-mobile-list{display:none}
        .brx-modal-backdrop{direction:ltr;position:fixed;inset:0;background:rgba(17,29,49,.36);backdrop-filter:blur(3px);z-index:1200;display:flex;justify-content:flex-end;animation:brx-fade .16s ease}@keyframes brx-fade{from{opacity:0}to{opacity:1}}
        .brx-form-panel{width:min(560px,100%);height:100%;background:#fff;box-shadow:-16px 0 55px rgba(17,31,56,.15);display:flex;flex-direction:column;animation:brx-slide .22s ease both}@keyframes brx-slide{from{transform:translateX(22px);opacity:.7}to{transform:translateX(0);opacity:1}}
        .brx-form-head{padding:21px 23px 17px;border-bottom:1px solid #edf0f4;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.brx-form-kicker{font-size:9px;color:#8e9aaf;font-weight:850;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}.brx-form-title{font-size:19px;font-weight:850;color:#26344c;margin:0}.brx-form-subtitle{font-size:11px;color:#98a2b1;margin:5px 0 0}.brx-close{width:31px;height:31px;border:1px solid #e9edf3;border-radius:9px;background:#fff;color:#7b8799;display:grid;place-items:center;cursor:pointer}.brx-form-body{padding:20px 23px;overflow-y:auto;flex:1}.brx-form-section{margin-bottom:22px}.brx-form-section-head{display:flex;align-items:center;gap:8px;color:#52617a;font-size:11px;font-weight:850;margin-bottom:12px}.brx-form-section-head span{width:25px;height:25px;background:#eef4ff;color:#4774c3;display:grid;place-items:center;border-radius:7px}.brx-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.brx-field{display:flex;flex-direction:column;gap:6px;min-width:0}.brx-field.full{grid-column:1/-1}.brx-field label{font-size:10px;color:#68758b;font-weight:750}.brx-field label em{color:#d45e5e;font-style:normal}.brx-input,.brx-form-select{width:100%;height:41px;border:1px solid #e3e9f1;border-radius:9px;padding:0 11px;background:#fff;color:#344258;font-size:11px;outline:none;transition:border .18s,box-shadow .18s}.brx-input:focus,.brx-form-select:focus{border-color:#9bb8f8;box-shadow:0 0 0 3px rgba(37,99,235,.08)}.brx-input::placeholder{color:#adb5c1}.brx-form-select{cursor:pointer}
        .brx-employee-form-list{display:flex;flex-direction:column;gap:9px}.brx-employee-form-row{display:grid;grid-template-columns:minmax(0,1fr) 145px 34px;gap:8px;align-items:center}.brx-remove-employee{width:34px;height:39px;border:1px solid #f3e0df;background:#fff8f7;color:#c55b58;border-radius:8px;display:grid;place-items:center;cursor:pointer}.brx-add-employee{display:inline-flex;align-items:center;gap:7px;border:0;background:#f0f5ff;color:#3266bd;font-weight:750;font-size:10px;padding:9px 11px;border-radius:8px;cursor:pointer;margin-top:9px}.brx-form-foot{border-top:1px solid #edf0f4;padding:14px 23px;display:flex;justify-content:flex-end;gap:8px;background:#fcfdff}
        @media(max-width:900px){.brx-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.brx-overview-grid{grid-template-columns:1fr}}
        @media(max-width:767px){.brx-page{padding-bottom:18px}.brx-header{align-items:stretch;flex-direction:column;gap:13px;margin-bottom:16px}.brx-header>.brx-btn{width:100%;height:43px}.brx-summary{gap:8px;margin-bottom:13px}.brx-summary-card{padding:11px;gap:9px}.brx-summary-icon{width:31px;height:31px}.brx-summary-copy strong{font-size:18px}.brx-summary-copy span{font-size:10px}.brx-toolbar{padding:12px;flex-direction:column;align-items:stretch}.brx-search-wrap{max-width:none;width:100%}.brx-toolbar-right{justify-content:space-between}.brx-sort-wrap{flex:1}.brx-select{flex:1;max-width:none}.brx-tabs{padding-inline:10px}.brx-mobile-list{display:flex;flex-direction:column}.brx-table-scroll{display:none}.brx-mobile-branch{padding:14px;border-bottom:1px solid #edf0f4}.brx-mobile-branch:last-child{border-bottom:0}.brx-mobile-top{display:flex;align-items:center;gap:10px}.brx-mobile-top .brx-branch-meta{flex:1}.brx-mobile-code{font-size:10px;color:#8f9bad;margin-top:4px}.brx-mobile-sub{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px}.brx-mobile-quick{display:flex;align-items:center;gap:13px;color:#7d899b;font-size:10px}.brx-mobile-expand{border:1px solid #e5ebf3;border-radius:8px;background:#fff;color:#6d7b91;width:30px;height:30px;display:grid;place-items:center}.brx-mobile-details{margin-top:12px}.brx-expanded-content{padding:13px 0 0;border-top:1px solid #e8eef8}.brx-info-grid{grid-template-columns:1fr}.brx-expanded-footer{align-items:stretch;flex-direction:column}.brx-expanded-footer>span{line-height:1.5}.brx-row-actions .brx-btn{flex:1}.brx-detail-section{padding:12px}.brx-people-grid{grid-template-columns:1fr}.brx-form-panel{width:100%}.brx-form-head{padding:17px}.brx-form-body{padding:17px}.brx-form-foot{padding:12px 17px}.brx-employee-form-row{grid-template-columns:minmax(0,1fr) 112px 32px;gap:6px}.brx-employee-form-row .brx-input,.brx-employee-form-row .brx-form-select{font-size:10px;padding-inline:7px}.brx-form-grid{gap:10px}}
        @media(max-width:380px){.brx-summary-card{padding:9px}.brx-summary-icon{display:none}.brx-summary-copy strong{font-size:16px}.brx-filter-tab{padding-inline:9px}.brx-form-grid{grid-template-columns:1fr}.brx-field.full{grid-column:auto}.brx-employee-form-row{grid-template-columns:1fr 100px 30px}}
      `}</style>

      <div className="brx-header">
        <div>
          <div className="brx-eyebrow"><LayoutList size={13} />{isRTL ? "إدارة الشبكة" : "NETWORK MANAGEMENT"}</div>
          <h1 className="brx-title">{copy.directory}</h1>
          <p className="brx-subtitle">{t("branches.subtitle") || copy.description}</p>
        </div>
        <button type="button" className="brx-btn brx-btn-primary" onClick={openCreateForm}>
          <Plus size={16} strokeWidth={2.5} />{t("branches.addBranch") || copy.add}
        </button>
      </div>

      <div className="brx-summary">
        <div className="brx-summary-card">
          <div className="brx-summary-icon"><Building2 size={17} /></div>
          <div className="brx-summary-copy"><span>{copy.all}</span><strong>{formatCount(branchStats.all, lang)}</strong></div>
        </div>
        <div className="brx-summary-card is-active">
          <div className="brx-summary-icon"><CheckCircle2 size={17} /></div>
          <div className="brx-summary-copy"><span>{copy.active}</span><strong>{formatCount(branchStats.active, lang)}</strong></div>
        </div>
        <div className="brx-summary-card is-inactive">
          <div className="brx-summary-icon"><Users size={17} /></div>
          <div className="brx-summary-copy"><span>{copy.team}</span><strong>{formatCount(branchStats.employees, lang)}</strong></div>
        </div>
        <div className="brx-summary-card is-archived">
          <div className="brx-summary-icon"><ShieldCheck size={17} /></div>
          <div className="brx-summary-copy"><span>{copy.accounts}</span><strong>{formatCount(branchStats.accounts, lang)}</strong></div>
        </div>
      </div>

      <section className="brx-workspace">
        <div className="brx-toolbar">
          <div className="brx-search-wrap">
            <Search className="brx-search-icon" size={16} />
            <input
              className="brx-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.search}
              aria-label={copy.search}
            />
          </div>
          <div className="brx-toolbar-right">
            <label className="brx-sort-wrap">
              <ArrowUpDown size={14} />
              <span>{copy.sort}</span>
              <select className="brx-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name">{copy.sortName}</option>
                <option value="team">{copy.sortTeam}</option>
                <option value="accounts">{copy.sortAccounts}</option>
                <option value="completion">{copy.sortCompletion}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="brx-tabs">
          {[
            { id: "all", label: copy.all, count: branchStats.all },
            { id: "active", label: copy.active, count: branchStats.active },
            { id: "inactive", label: copy.inactive, count: branchStats.inactive },
            { id: "archived", label: copy.archived, count: branchStats.archived },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`brx-filter-tab ${statusFilter === tab.id ? "is-active" : ""}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}<span className="brx-tab-number">{formatCount(tab.count, lang)}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="brx-empty"><div className="brx-empty-icon"><Building2 size={21} /></div><strong>{copy.loading}</strong></div>
        ) : filteredBranches.length === 0 ? (
          <div className="brx-empty">
            <div className="brx-empty-icon"><AlertCircle size={21} /></div>
            <strong>{branches.length ? copy.noResults : copy.noBranches}</strong>
            <p>{branches.length ? copy.search : copy.description}</p>
            {search || statusFilter !== "all" ? (
              <button type="button" className="brx-btn brx-btn-soft" onClick={() => { setSearch(""); setStatusFilter("all"); }}>{copy.clear}</button>
            ) : (
              <button type="button" className="brx-btn brx-btn-primary" onClick={openCreateForm}><Plus size={15} />{copy.add}</button>
            )}
          </div>
        ) : (
          <>
            <div className="brx-table-scroll">
              <table className="brx-table">
                <thead>
                  <tr>
                    <th>{copy.branch}</th>
                    <th>{copy.manager}</th>
                    <th>{copy.team}</th>
                    <th>{copy.accounts}</th>
                    <th>{copy.status}</th>
                    <th>{copy.completion}</th>
                    <th aria-label={copy.details}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch) => {
                    const expanded = expandedBranchId === branch.id;
                    const branchUsers = usersByBranch[branch.id] || [];
                    const employeeCount = (branch.employees || []).filter((employee) => employee?.name?.trim()).length;
                    return (
                      <Fragment key={branch.id}>
                        <tr
                          key={`${branch.id}-row`}
                          className={`brx-main-row ${expanded ? "is-expanded" : ""}`}
                          onClick={() => toggleBranch(branch.id)}
                          aria-expanded={expanded}
                        >
                          <td>
                            <div className="brx-branch-cell">
                              <div className="brx-branch-mark"><Building2 size={18} /></div>
                              <div className="brx-branch-meta"><strong>{branch.name || copy.notAvailable}</strong><span>{isRTL ? "كود الفرع" : "CODE"} · {branch.code || "—"}</span></div>
                            </div>
                          </td>
                          <td><div className="brx-manager-cell"><span className="brx-mini-avatar">{getInitials(branch.manager || "—")}</span><span>{branch.manager || copy.noManager}</span></div></td>
                          <td><span className="brx-count-cell"><span className="brx-count-icon"><Users size={14} /></span>{formatCount(employeeCount, lang)}</span></td>
                          <td><span className="brx-count-cell"><span className="brx-count-icon"><ShieldCheck size={14} /></span>{formatCount(branchUsers.length, lang)}</span></td>
                          <td>{renderStatus(branch)}</td>
                          <td>{renderCompletion(branch)}</td>
                          <td><button type="button" className={`brx-row-action ${expanded ? "is-open" : ""}`} aria-label={copy.details} onClick={(event) => { event.stopPropagation(); toggleBranch(branch.id); }}>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></td>
                        </tr>
                        {expanded && (
                          <tr key={`${branch.id}-details`} className="brx-expanded-row">
                            <td colSpan={7}>{renderExpandedDetails(branch)}</td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="brx-mobile-list">
              {filteredBranches.map((branch) => {
                const expanded = expandedBranchId === branch.id;
                const branchUsers = usersByBranch[branch.id] || [];
                const employeeCount = (branch.employees || []).filter((employee) => employee?.name?.trim()).length;
                return (
                  <div className="brx-mobile-branch" key={branch.id}>
                    <div className="brx-mobile-top" onClick={() => toggleBranch(branch.id)}>
                      <div className="brx-branch-mark"><Building2 size={18} /></div>
                      <div className="brx-branch-meta"><strong>{branch.name || copy.notAvailable}</strong><span className="brx-mobile-code">{isRTL ? "الكود" : "CODE"} · {branch.code || "—"}</span></div>
                      {renderStatus(branch)}
                    </div>
                    <div className="brx-mobile-sub">
                      <div className="brx-mobile-quick">
                        <span><Users size={13} style={{ verticalAlign: "-2px", marginInlineEnd: 4 }} />{formatCount(employeeCount, lang)} {copy.people}</span>
                        <span><ShieldCheck size={13} style={{ verticalAlign: "-2px", marginInlineEnd: 4 }} />{formatCount(branchUsers.length, lang)} {copy.user}</span>
                      </div>
                      <button type="button" className="brx-mobile-expand" aria-label={copy.details} onClick={() => toggleBranch(branch.id)}>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                    </div>
                    {expanded && <div className="brx-mobile-details">{renderExpandedDetails(branch)}</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {showForm && (
        <div className="brx-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
          <aside className="brx-form-panel" dir={isRTL ? "rtl" : "ltr"} role="dialog" aria-modal="true" aria-labelledby="brx-form-title">
            <div className="brx-form-head">
              <div>
                <div className="brx-form-kicker">{isRTL ? "إدارة بيانات الفروع" : "BRANCH MANAGEMENT"}</div>
                <h2 className="brx-form-title" id="brx-form-title">{editingBranch ? copy.editBranch : copy.newBranch}</h2>
                <p className="brx-form-subtitle">{isRTL ? "أدخل بيانات الفرع واحفظ التغييرات" : "Enter the branch details and save your changes"}</p>
              </div>
              <button type="button" className="brx-close" onClick={() => setShowForm(false)} aria-label={copy.cancel}><X size={17} /></button>
            </div>

            <div className="brx-form-body">
              <section className="brx-form-section">
                <div className="brx-form-section-head"><span><Building2 size={14} /></span>{copy.basicInfo}</div>
                <div className="brx-form-grid">
                  <div className="brx-field">
                    <label>{copy.branchName} <em>*</em></label>
                    <input className="brx-input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder={copy.branchName} />
                  </div>
                  <div className="brx-field">
                    <label>{copy.code} <em>*</em></label>
                    <input className="brx-input" value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase().replace(/\s+/g, "") }))} placeholder="e.g. CAI-01" />
                  </div>
                </div>
              </section>

              <section className="brx-form-section">
                <div className="brx-form-section-head"><span><MapPin size={14} /></span>{copy.contactInfo}</div>
                <div className="brx-form-grid">
                  <div className="brx-field">
                    <label>{copy.manager}</label>
                    <input className="brx-input" value={form.manager} onChange={(event) => setForm((prev) => ({ ...prev, manager: event.target.value }))} placeholder={copy.manager} />
                  </div>
                  <div className="brx-field">
                    <label>{copy.phone}</label>
                    <input className="brx-input" type="tel" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="01xxxxxxxxx" />
                  </div>
                  <div className="brx-field full">
                    <label>{copy.address}</label>
                    <input className="brx-input" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} placeholder={copy.address} />
                  </div>
                </div>
              </section>

              <section className="brx-form-section">
                <div className="brx-form-section-head"><span><Users size={14} /></span>{copy.employeeManagement}</div>
                <div className="brx-employee-form-list">
                  {form.employees.map((employee, index) => (
                    <div className="brx-employee-form-row" key={employee.id || `employee-${index}`}>
                      <input
                        className="brx-input"
                        value={employee.name}
                        onChange={(event) => {
                          const updated = [...form.employees];
                          updated[index] = { ...updated[index], name: event.target.value };
                          setForm((prev) => ({ ...prev, employees: updated }));
                        }}
                        placeholder={copy.employeeName}
                      />
                      <select
                        className="brx-form-select"
                        value={employee.role || "seller"}
                        onChange={(event) => {
                          const updated = [...form.employees];
                          updated[index] = { ...updated[index], role: event.target.value };
                          setForm((prev) => ({ ...prev, employees: updated }));
                        }}
                      >
                        {roleOptions.map((role) => <option value={role} key={role}>{t(`roles.${role}`)}</option>)}
                      </select>
                      <button
                        type="button"
                        className="brx-remove-employee"
                        aria-label={t("branches.removeEmployee")}
                        onClick={() => {
                          const updated = form.employees.filter((_, employeeIndex) => employeeIndex !== index);
                          setForm((prev) => ({
                            ...prev,
                            employees: updated.length ? updated : [{ id: null, name: "", role: "seller" }],
                          }));
                        }}
                      ><X size={15} /></button>
                    </div>
                  ))}
                </div>
                <button type="button" className="brx-add-employee" onClick={() => setForm((prev) => ({ ...prev, employees: [...prev.employees, { id: null, name: "", role: "seller" }] }))}>
                  <Plus size={14} />{copy.addEmployee}
                </button>
              </section>
            </div>

            <div className="brx-form-foot">
              <button type="button" className="brx-btn brx-btn-soft" onClick={() => setShowForm(false)}>{copy.cancel}</button>
              <button type="button" className="brx-btn brx-btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? t("common.loading") : <><Check size={15} />{editingBranch ? copy.save : copy.create}</>}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
