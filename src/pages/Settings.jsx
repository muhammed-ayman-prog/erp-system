import { useEffect, useMemo, useState } from "react";
import {
  auth,
  db,
} from "../firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  MonitorCog,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { resetSystem } from "../utils/resetSystem";
import { useAuth } from "../store/useAuth";
import { useTranslate } from "../useTranslate";
import { theme } from "../theme";

const SUPER_ADMIN_UID = "w9o5o3PnKHfXAZzzuNlbNLhbxEg2";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
};

const getRoleLabel = (role, isArabic) => {
  const roles = {
    owner: isArabic ? "مالك النظام" : "Owner",
    admin: isArabic ? "مدير" : "Admin",
    manager: isArabic ? "مدير فرع" : "Branch Manager",
    employee: isArabic ? "موظف" : "Employee",
  };
  return roles[role] || role || (isArabic ? "مستخدم" : "User");
};

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { lang } = useTranslate();
  const isArabic = lang === "ar";
  const isSuperAdmin = user?.uid === SUPER_ADMIN_UID;

  const [activeSection, setActiveSection] = useState("overview");
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [loadingReset, setLoadingReset] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  const branchesLabel = useMemo(() => {
    if (user?.role === "owner") return isArabic ? "كل الفروع" : "All branches";
    const ids = Array.isArray(user?.branchIds) ? user.branchIds : [];
    return ids.length ? ids.join("، ") : isArabic ? "غير محدد" : "Not assigned";
  }, [user?.branchIds, user?.role, isArabic]);

  const appVersion = import.meta.env.VITE_APP_VERSION || "—";

  const text = (ar, en) => (isArabic ? ar : en);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4500);
  };

  const handleSaveName = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      showNotice("error", text("اكتب الاسم الأول", "Please enter your name"));
      return;
    }

    if (!user?.uid) {
      showNotice("error", text("انتهت الجلسة. سجل الدخول مرة أخرى", "Your session expired. Please sign in again"));
      return;
    }

    if (trimmedName === (user?.name || "")) {
      setEditingName(false);
      return;
    }

    try {
      setSavingName(true);
      await updateDoc(doc(db, "users", user.uid), { name: trimmedName });
      updateUser({ name: trimmedName });
      setName(trimmedName);
      setEditingName(false);
      showNotice("success", text("تم تحديث الاسم بنجاح", "Your name has been updated"));
    } catch (error) {
      console.error("Settings: update name failed", error);
      showNotice("error", text("تعذر تحديث الاسم. حاول مرة أخرى", "Could not update your name. Please try again"));
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (event) => {
    event?.preventDefault();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      showNotice("error", text("سجل الدخول مرة أخرى", "Please sign in again"));
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotice("error", text("اكمل كل حقول كلمة المرور", "Complete all password fields"));
      return;
    }

    if (newPassword.length < 6) {
      showNotice("error", text("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف", "The new password must be at least 6 characters"));
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotice("error", text("كلمتا المرور الجديدتان غير متطابقتين", "The new passwords do not match"));
      return;
    }

    if (currentPassword === newPassword) {
      showNotice("error", text("اختر كلمة مرور مختلفة عن الحالية", "Choose a password different from your current one"));
      return;
    }

    try {
      setChangingPassword(true);
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showNotice("success", text("تم تغيير كلمة المرور بنجاح", "Your password has been changed successfully"));
    } catch (error) {
      console.error("Settings: change password failed", error);
      const errorCode = error?.code;
      let message = text(
        "تعذر تغيير كلمة المرور. تأكد من كلمة المرور الحالية وحاول مرة أخرى",
        "Could not change the password. Check your current password and try again"
      );
      if (errorCode === "auth/too-many-requests") {
        message = text("محاولات كثيرة. حاول مرة أخرى لاحقًا", "Too many attempts. Please try again later");
      } else if (errorCode === "auth/weak-password") {
        message = text("كلمة المرور ضعيفة. استخدم كلمة مرور أقوى", "The password is too weak. Choose a stronger password");
      }
      showNotice("error", message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleReset = async () => {
    if (!isSuperAdmin) return;

    const confirmText = window.prompt(
      text(
        'هذا الإجراء سيمسح بيانات النظام. اكتب RESET ALL للتأكيد',
        'This will erase system data. Type RESET ALL to confirm'
      )
    );

    if (confirmText !== "RESET ALL") {
      showNotice("info", text("تم إلغاء العملية", "The operation was cancelled"));
      return;
    }

    try {
      setLoadingReset(true);
      await resetSystem();
      showNotice("success", text("تم تنفيذ تصفير النظام", "System reset completed"));
    } catch (error) {
      console.error("Settings: system reset failed", error);
      showNotice("error", text("حدث خطأ أثناء تصفير النظام", "Something went wrong while resetting the system"));
    } finally {
      setLoadingReset(false);
    }
  };

  const sections = [
    { id: "overview", label: text("نظرة عامة", "Overview"), description: text("ملخص الحساب والنظام", "Account and system summary"), icon: MonitorCog },
    { id: "profile", label: text("الحساب الشخصي", "My Account"), description: text("بياناتك الشخصية", "Your personal information"), icon: UserRound },
    { id: "security", label: text("الأمان", "Security"), description: text("كلمة المرور وحماية الحساب", "Password and account protection"), icon: ShieldCheck },
    ...(isSuperAdmin ? [{ id: "system", label: text("إدارة النظام", "System Management"), description: text("معلومات النظام والصيانة", "System information and maintenance"), icon: Settings2 }] : []),
  ];

  const activeSectionInfo = sections.find((section) => section.id === activeSection) || sections[0];
  const ActiveIcon = activeSectionInfo.icon;

  const panelStyle = {
    background: theme.colors.card || "#FFFFFF",
    border: `1px solid ${theme.colors.border || "#E2E8F0"}`,
    borderRadius: 22,
    boxShadow: "0 8px 28px rgba(15, 23, 42, 0.045)",
  };

  const inputStyle = {
    width: "100%",
    minHeight: 48,
    boxSizing: "border-box",
    border: `1px solid ${theme.colors.border || "#E2E8F0"}`,
    borderRadius: 12,
    padding: "0 14px",
    background: "#FFFFFF",
    color: theme.colors.text || "#0F172A",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit",
  };

  const primaryButtonStyle = {
    minHeight: 44,
    padding: "0 17px",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
    color: "#FFFFFF",
    fontWeight: 750,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    opacity: 1,
  };

  const renderOverview = () => (
    <div className="aps-settings-stack">
      <div className="aps-settings-welcome">
        <div className="aps-settings-welcome-copy">
          <span className="aps-settings-eyebrow">{text("مساحة العمل", "WORKSPACE")}</span>
          <h2>{text(`أهلاً ${user?.name || "بك"}`, `Welcome${user?.name ? `, ${user.name}` : ""}`)}</h2>
          <p>{text("إدارة حسابك وإعدادات الوصول والأمان من مكان واحد.", "Manage your account, access details and security in one place.")}</p>
        </div>
        <div className="aps-settings-welcome-icon"><Sparkles size={28} /></div>
      </div>

      <div className="aps-settings-overview-grid">
        <div className="aps-settings-info-card">
          <div className="aps-settings-info-icon blue"><UserRound size={19} /></div>
          <div className="aps-settings-info-label">{text("اسم المستخدم", "Account name")}</div>
          <div className="aps-settings-info-value">{user?.name || "—"}</div>
          <button className="aps-settings-text-action" onClick={() => setActiveSection("profile")}>
            {text("تعديل الحساب", "Edit account")} <ChevronLeft size={15} />
          </button>
        </div>
        <div className="aps-settings-info-card">
          <div className="aps-settings-info-icon violet"><ShieldCheck size={19} /></div>
          <div className="aps-settings-info-label">{text("مستوى الصلاحية", "Access role")}</div>
          <div className="aps-settings-info-value">{getRoleLabel(user?.role, isArabic)}</div>
          <span className="aps-settings-muted-note">{text("حسب صلاحيات حسابك", "Based on your account permissions")}</span>
        </div>
        <div className="aps-settings-info-card">
          <div className="aps-settings-info-icon teal"><Building2 size={19} /></div>
          <div className="aps-settings-info-label">{text("نطاق الفروع", "Branch access")}</div>
          <div className="aps-settings-info-value aps-settings-wrap">{branchesLabel}</div>
          <span className="aps-settings-muted-note">{text("الفروع المتاحة لحسابك", "Branches available to your account")}</span>
        </div>
      </div>

      <div className="aps-settings-panel-inner" style={panelStyle}>
        <div className="aps-settings-panel-heading">
          <div>
            <h3>{text("إعدادات الحساب", "Account settings")}</h3>
            <p>{text("اختصارات للوصول إلى الإعدادات المهمة.", "Quick access to the settings that matter.")}</p>
          </div>
          <Settings2 size={21} color="#64748B" />
        </div>
        <div className="aps-settings-link-list">
          <button className="aps-settings-link-row" onClick={() => setActiveSection("profile")}>
            <span className="aps-settings-link-icon blue"><UserRound size={18} /></span>
            <span className="aps-settings-link-copy"><strong>{text("البيانات الشخصية", "Personal details")}</strong><small>{text("تحديث الاسم ومراجعة بيانات الحساب", "Update your name and review account details")}</small></span>
            <ChevronRight size={18} className="aps-settings-row-chevron" />
          </button>
          <button className="aps-settings-link-row" onClick={() => setActiveSection("security")}>
            <span className="aps-settings-link-icon green"><LockKeyhole size={18} /></span>
            <span className="aps-settings-link-copy"><strong>{text("كلمة المرور والأمان", "Password and security")}</strong><small>{text("تغيير كلمة المرور باستخدام التحقق من الهوية", "Change your password after identity verification")}</small></span>
            <ChevronRight size={18} className="aps-settings-row-chevron" />
          </button>
          {isSuperAdmin && (
            <button className="aps-settings-link-row" onClick={() => setActiveSection("system")}>
              <span className="aps-settings-link-icon orange"><MonitorCog size={18} /></span>
              <span className="aps-settings-link-copy"><strong>{text("إدارة النظام", "System management")}</strong><small>{text("معلومات الإصدار وأدوات الصيانة الحساسة", "Version information and restricted maintenance tools")}</small></span>
              <ChevronRight size={18} className="aps-settings-row-chevron" />
            </button>
          )}
        </div>
      </div>

      <div className="aps-settings-security-tip">
        <div className="aps-settings-tip-icon"><Shield size={19} /></div>
        <div>
          <strong>{text("حافظ على أمان حسابك", "Keep your account secure")}</strong>
          <p>{text("استخدم كلمة مرور قوية ولا تشارك بيانات تسجيل الدخول مع أي شخص.", "Use a strong password and never share your sign-in credentials.")}</p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="aps-settings-stack">
      <div className="aps-settings-profile-banner">
        <div className="aps-settings-avatar-large">{getInitials(user?.name)}</div>
        <div className="aps-settings-profile-banner-copy">
          <h3>{user?.name || text("مستخدم النظام", "System user")}</h3>
          <p>{user?.email || "—"}</p>
          <span className="aps-settings-role-pill"><BadgeCheck size={13} /> {getRoleLabel(user?.role, isArabic)}</span>
        </div>
      </div>

      <div className="aps-settings-panel-inner" style={panelStyle}>
        <div className="aps-settings-panel-heading">
          <div>
            <h3>{text("المعلومات الشخصية", "Personal information")}</h3>
            <p>{text("يمكنك تعديل اسم العرض، أما بيانات الدخول فتتم إدارتها بشكل منفصل.", "You can update your display name. Sign-in details are managed separately.")}</p>
          </div>
          <UserRound size={21} color="#64748B" />
        </div>

        <div className="aps-settings-form-grid">
          <div className="aps-settings-field aps-settings-field-full">
            <label>{text("الاسم", "Display name")}</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!editingName || savingName}
              placeholder={text("اكتب اسمك", "Enter your name")}
              style={{ ...inputStyle, background: editingName ? "#FFFFFF" : "#F8FAFC" }}
            />
          </div>
          <div className="aps-settings-field">
            <label>{text("البريد الإلكتروني", "Email address")}</label>
            <div className="aps-settings-readonly"><Mail size={16} /><span dir="ltr">{user?.email || "—"}</span><LockKeyhole size={14} /></div>
          </div>
          <div className="aps-settings-field">
            <label>{text("الصلاحية", "Role")}</label>
            <div className="aps-settings-readonly"><ShieldCheck size={16} /><span>{getRoleLabel(user?.role, isArabic)}</span><LockKeyhole size={14} /></div>
          </div>
          <div className="aps-settings-field aps-settings-field-full">
            <label>{text("الفروع المتاحة", "Branch access")}</label>
            <div className="aps-settings-readonly"><Building2 size={16} /><span>{branchesLabel}</span><LockKeyhole size={14} /></div>
          </div>
        </div>

        <div className="aps-settings-form-actions">
          {editingName ? (
            <>
              <button className="aps-settings-button secondary" onClick={() => { setName(user?.name || ""); setEditingName(false); }} disabled={savingName}>
                <X size={16} /> {text("إلغاء", "Cancel")}
              </button>
              <button className="aps-settings-button primary" onClick={handleSaveName} disabled={savingName}>
                {savingName ? <RefreshCw size={16} className="aps-settings-spin" /> : <Save size={16} />}
                {savingName ? text("جارٍ الحفظ...", "Saving...") : text("حفظ التغييرات", "Save changes")}
              </button>
            </>
          ) : (
            <button className="aps-settings-button primary" onClick={() => setEditingName(true)}>
              <UserRound size={16} /> {text("تعديل الاسم", "Edit name")}
            </button>
          )}
        </div>
      </div>

      <div className="aps-settings-readonly-note">
        <LockKeyhole size={17} />
        <span>{text("البريد الإلكتروني والصلاحيات والفروع للعرض فقط، ويتم تغييرها من خلال إدارة المستخدمين.", "Email, role and branch access are read-only here and are managed through User Management.")}</span>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="aps-settings-stack">
      <div className="aps-settings-security-banner">
        <div className="aps-settings-security-banner-icon"><Fingerprint size={27} /></div>
        <div>
          <h3>{text("حماية حسابك", "Protect your account")}</h3>
          <p>{text("تغيير كلمة المرور يتطلب تأكيد كلمة المرور الحالية أولاً.", "Changing your password requires verification with your current password.")}</p>
        </div>
      </div>

      <div className="aps-settings-panel-inner" style={panelStyle}>
        <div className="aps-settings-panel-heading">
          <div>
            <h3>{text("تغيير كلمة المرور", "Change password")}</h3>
            <p>{text("اختر كلمة مرور جديدة يصعب تخمينها.", "Choose a new password that is difficult to guess.")}</p>
          </div>
          <KeyRound size={21} color="#64748B" />
        </div>

        <form onSubmit={handleChangePassword}>
          <div className="aps-settings-password-fields">
            <PasswordField
              label={text("كلمة المرور الحالية", "Current password")}
              placeholder={text("أدخل كلمة المرور الحالية", "Enter current password")}
              value={currentPassword}
              onChange={setCurrentPassword}
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((value) => !value)}
              inputStyle={inputStyle}
              text={text}
            />
            <PasswordField
              label={text("كلمة المرور الجديدة", "New password")}
              placeholder={text("6 أحرف على الأقل", "At least 6 characters")}
              value={newPassword}
              onChange={setNewPassword}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((value) => !value)}
              inputStyle={inputStyle}
              text={text}
            />
            <PasswordField
              label={text("تأكيد كلمة المرور الجديدة", "Confirm new password")}
              placeholder={text("أعد كتابة كلمة المرور الجديدة", "Re-enter the new password")}
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
              inputStyle={inputStyle}
              text={text}
            />
          </div>

          <div className="aps-settings-password-hints">
            <div><CheckCircle2 size={15} color={newPassword.length >= 6 ? "#16A34A" : "#94A3B8"} /> {text("6 أحرف على الأقل", "At least 6 characters")}</div>
            <div><CheckCircle2 size={15} color={confirmPassword && newPassword === confirmPassword ? "#16A34A" : "#94A3B8"} /> {text("تأكيد كلمة المرور مطابق", "Password confirmation matches")}</div>
          </div>

          <div className="aps-settings-form-actions">
            <button type="submit" className="aps-settings-button primary" disabled={changingPassword}>
              {changingPassword ? <RefreshCw size={16} className="aps-settings-spin" /> : <LockKeyhole size={16} />}
              {changingPassword ? text("جارٍ تحديث كلمة المرور...", "Updating password...") : text("تحديث كلمة المرور", "Update password")}
            </button>
          </div>
        </form>
      </div>

      <div className="aps-settings-readonly-note">
        <ShieldCheck size={17} />
        <span>{text("يتم التحقق من كلمة المرور الحالية من خلال Firebase قبل حفظ كلمة المرور الجديدة.", "Firebase verifies your current password before saving the new one.")}</span>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="aps-settings-stack">
      <div className="aps-settings-panel-inner" style={panelStyle}>
        <div className="aps-settings-panel-heading">
          <div>
            <h3>{text("معلومات النظام", "System information")}</h3>
            <p>{text("بيانات تعريفية عن نسخة التطبيق الحالية.", "Information about the current application build.")}</p>
          </div>
          <MonitorCog size={21} color="#64748B" />
        </div>
        <div className="aps-settings-system-grid">
          <div className="aps-settings-system-item">
            <span className="aps-settings-system-icon"><Sparkles size={18} /></span>
            <div><small>{text("اسم النظام", "Application")}</small><strong>A Perfume Story ERP</strong></div>
          </div>
          <div className="aps-settings-system-item">
            <span className="aps-settings-system-icon"><Activity size={18} /></span>
            <div><small>{text("إصدار التطبيق", "Application version")}</small><strong>APS v{appVersion}</strong></div>
          </div>
          <div className="aps-settings-system-item">
            <span className="aps-settings-system-icon"><UsersRound size={18} /></span>
            <div><small>{text("المستخدم الحالي", "Current user")}</small><strong>{user?.name || user?.email || "—"}</strong></div>
          </div>
          <div className="aps-settings-system-item">
            <span className="aps-settings-system-icon"><Building2 size={18} /></span>
            <div><small>{text("نطاق الوصول", "Access scope")}</small><strong>{branchesLabel}</strong></div>
          </div>
        </div>
      </div>

      <div className="aps-settings-danger-panel">
        <div className="aps-settings-danger-heading">
          <div className="aps-settings-danger-icon"><AlertTriangle size={21} /></div>
          <div>
            <h3>{text("منطقة خطرة", "Danger zone")}</h3>
            <p>{text("أدوات إدارية قد تؤثر على بيانات النظام بالكامل.", "Administrative actions that may affect system-wide data.")}</p>
          </div>
        </div>
        <div className="aps-settings-danger-content">
          <div>
            <strong>{text("تصفير النظام", "Reset system")}</strong>
            <p>{text("استخدم هذه العملية فقط عند الحاجة وبموافقة إدارية. لا يمكن التراجع عن حذف البيانات.", "Use this only when required and with administrative approval. Deleted data may not be recoverable.")}</p>
          </div>
          <button className="aps-settings-button danger" onClick={handleReset} disabled={loadingReset}>
            {loadingReset ? <RefreshCw size={16} className="aps-settings-spin" /> : <AlertTriangle size={16} />}
            {loadingReset ? text("جارٍ التصفير...", "Resetting...") : text("Reset System", "Reset System")}
          </button>
        </div>
      </div>

      <div className="aps-settings-readonly-note danger-note">
        <Shield size={17} />
        <span>{text("أدوات إدارة النظام ظاهرة لحساب المسؤول الأعلى فقط.", "System administration tools are visible only to the designated super administrator account.")}</span>
      </div>
    </div>
  );

  return (
    <div className="aps-settings-page" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .aps-settings-page { width:100%; max-width:1440px; margin:0 auto; padding:4px 0 36px; color:${theme.colors.text || "#0F172A"}; }
        .aps-settings-page * { box-sizing:border-box; }
        .aps-settings-topbar { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:24px; }
        .aps-settings-title-wrap { display:flex; align-items:center; gap:13px; }
        .aps-settings-title-icon { width:48px; height:48px; border-radius:15px; display:flex; align-items:center; justify-content:center; background:#EFF6FF; color:#2563EB; }
        .aps-settings-topbar h1 { margin:0; font-size:clamp(24px,3vw,31px); font-weight:850; letter-spacing:-.6px; }
        .aps-settings-topbar p { margin:6px 0 0; color:${theme.colors.textSecondary || "#64748B"}; font-size:13px; }
        .aps-settings-version { display:inline-flex; align-items:center; gap:7px; padding:8px 12px; border:1px solid #DBEAFE; border-radius:999px; color:#1D4ED8; background:#EFF6FF; font-size:11px; font-weight:800; direction:ltr; }
        .aps-settings-layout { display:grid; grid-template-columns:260px minmax(0,1fr); gap:20px; align-items:start; }
        .aps-settings-sidebar { padding:14px; position:sticky; top:18px; }
        .aps-settings-sidebar-user { display:flex; align-items:center; gap:11px; padding:10px 8px 18px; margin-bottom:10px; border-bottom:1px solid #EEF2F7; min-width:0; }
        .aps-settings-avatar { width:43px; height:43px; flex:0 0 43px; border-radius:14px; display:flex; align-items:center; justify-content:center; color:#1D4ED8; background:linear-gradient(145deg,#DBEAFE,#EFF6FF); font-size:14px; font-weight:900; }
        .aps-settings-sidebar-user-copy { min-width:0; }
        .aps-settings-sidebar-user-copy strong { display:block; font-size:13px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
        .aps-settings-sidebar-user-copy span { display:block; color:#64748B; font-size:11px; margin-top:4px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
        .aps-settings-nav-label { padding:8px 10px; color:#94A3B8; font-size:10px; font-weight:850; letter-spacing:.8px; }
        .aps-settings-nav { display:flex; flex-direction:column; gap:5px; }
        .aps-settings-nav-item { appearance:none; border:1px solid transparent; background:transparent; width:100%; display:flex; gap:11px; align-items:center; padding:11px 10px; border-radius:12px; cursor:pointer; text-align:start; color:#475569; transition:all .18s ease; font-family:inherit; }
        .aps-settings-nav-item:hover { background:#F8FAFC; }
        .aps-settings-nav-item.active { background:#EFF6FF; border-color:#DBEAFE; color:#1D4ED8; }
        .aps-settings-nav-icon { width:34px; height:34px; flex:0 0 34px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:#F1F5F9; color:#64748B; }
        .aps-settings-nav-item.active .aps-settings-nav-icon { background:#DBEAFE; color:#2563EB; }
        .aps-settings-nav-copy { flex:1; min-width:0; }
        .aps-settings-nav-copy strong { display:block; font-size:12px; font-weight:800; }
        .aps-settings-nav-copy small { display:block; color:#94A3B8; font-size:10px; margin-top:3px; line-height:1.4; }
        .aps-settings-nav-arrow { opacity:.55; }
        .aps-settings-sidebar-foot { display:flex; align-items:center; gap:8px; color:#94A3B8; font-size:10px; padding:17px 9px 5px; margin-top:12px; border-top:1px solid #EEF2F7; }
        .aps-settings-content { min-width:0; }
        .aps-settings-content-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:2px 2px 16px; }
        .aps-settings-content-heading-left { display:flex; align-items:center; gap:11px; min-width:0; }
        .aps-settings-content-heading-icon { width:39px; height:39px; flex:0 0 39px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#2563EB; background:#EFF6FF; }
        .aps-settings-content-heading h2 { margin:0; font-size:18px; font-weight:850; }
        .aps-settings-content-heading p { margin:4px 0 0; color:#64748B; font-size:11px; }
        .aps-settings-stack { display:flex; flex-direction:column; gap:16px; }
        .aps-settings-welcome { position:relative; overflow:hidden; padding:25px 27px; min-height:156px; border-radius:22px; display:flex; justify-content:space-between; align-items:center; gap:15px; background:linear-gradient(120deg,#102F68 0%,#1D4ED8 58%,#4F7DEB 100%); color:#fff; }
        .aps-settings-welcome:after { content:""; position:absolute; width:230px; height:230px; border-radius:50%; border:1px solid rgba(255,255,255,.15); inset-inline-end:-65px; top:-105px; box-shadow:0 0 0 25px rgba(255,255,255,.035),0 0 0 52px rgba(255,255,255,.025); }
        .aps-settings-welcome-copy { position:relative; z-index:1; }
        .aps-settings-eyebrow { font-size:9px; font-weight:900; letter-spacing:1.7px; color:#BFDBFE; }
        .aps-settings-welcome h2 { margin:10px 0 7px; font-size:25px; font-weight:900; }
        .aps-settings-welcome p { margin:0; color:#DBEAFE; font-size:12px; line-height:1.7; }
        .aps-settings-welcome-icon { position:relative; z-index:1; width:58px; height:58px; flex:0 0 58px; display:flex; align-items:center; justify-content:center; border-radius:18px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.2); }
        .aps-settings-overview-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
        .aps-settings-info-card { min-width:0; padding:16px; border-radius:18px; border:1px solid ${theme.colors.border || "#E2E8F0"}; background:${theme.colors.card || "#fff"}; box-shadow:0 4px 15px rgba(15,23,42,.025); }
        .aps-settings-info-icon { width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; margin-bottom:13px; }
        .aps-settings-info-icon.blue { background:#EFF6FF; color:#2563EB; } .aps-settings-info-icon.violet { background:#F5F3FF; color:#7C3AED; } .aps-settings-info-icon.teal { background:#F0FDFA; color:#0F766E; }
        .aps-settings-info-label { color:#64748B; font-size:11px; margin-bottom:6px; }
        .aps-settings-info-value { font-size:16px; font-weight:850; overflow-wrap:anywhere; min-height:22px; }
        .aps-settings-info-value.aps-settings-wrap { font-size:13px; }
        .aps-settings-muted-note { display:block; margin-top:7px; font-size:10px; color:#94A3B8; }
        .aps-settings-text-action { display:inline-flex; align-items:center; gap:4px; padding:0; margin-top:10px; border:0; background:transparent; color:#2563EB; font-size:11px; font-weight:800; cursor:pointer; font-family:inherit; }
        .aps-settings-panel-inner { padding:21px; }
        .aps-settings-panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:15px; padding-bottom:17px; margin-bottom:18px; border-bottom:1px solid #EEF2F7; }
        .aps-settings-panel-heading h3 { margin:0; font-size:15px; font-weight:850; }
        .aps-settings-panel-heading p { margin:5px 0 0; color:#64748B; font-size:11px; line-height:1.65; }
        .aps-settings-link-list { display:flex; flex-direction:column; }
        .aps-settings-link-row { width:100%; display:flex; align-items:center; gap:12px; padding:12px 2px; border:0; border-bottom:1px solid #F1F5F9; background:transparent; cursor:pointer; text-align:start; font-family:inherit; }
        .aps-settings-link-row:last-child { border-bottom:0; }
        .aps-settings-link-icon { width:38px; height:38px; flex:0 0 38px; display:flex; align-items:center; justify-content:center; border-radius:12px; }
        .aps-settings-link-icon.blue { background:#EFF6FF; color:#2563EB; } .aps-settings-link-icon.green { background:#ECFDF5; color:#059669; } .aps-settings-link-icon.orange { background:#FFF7ED; color:#EA580C; }
        .aps-settings-link-copy { flex:1; min-width:0; }
        .aps-settings-link-copy strong { display:block; color:#0F172A; font-size:12px; font-weight:800; }
        .aps-settings-link-copy small { display:block; color:#94A3B8; font-size:10px; margin-top:4px; line-height:1.5; }
        .aps-settings-row-chevron { color:#94A3B8; }
        .aps-settings-security-tip,.aps-settings-readonly-note { display:flex; align-items:flex-start; gap:11px; padding:14px 16px; border:1px solid #DBEAFE; border-radius:15px; background:#F8FBFF; color:#1E40AF; }
        .aps-settings-tip-icon { width:32px; height:32px; flex:0 0 32px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:#DBEAFE; }
        .aps-settings-security-tip strong { display:block; font-size:12px; }
        .aps-settings-security-tip p { margin:4px 0 0; color:#64748B; font-size:11px; line-height:1.6; }
        .aps-settings-profile-banner { display:flex; align-items:center; gap:16px; padding:20px; border:1px solid #DBEAFE; border-radius:20px; background:linear-gradient(110deg,#EFF6FF,#FFFFFF); }
        .aps-settings-avatar-large { width:66px; height:66px; flex:0 0 66px; border-radius:20px; display:flex; align-items:center; justify-content:center; background:linear-gradient(145deg,#2563EB,#6366F1); color:#fff; font-size:21px; font-weight:900; box-shadow:0 8px 18px rgba(37,99,235,.18); }
        .aps-settings-profile-banner-copy { min-width:0; }
        .aps-settings-profile-banner h3 { margin:0; font-size:17px; font-weight:900; overflow-wrap:anywhere; }
        .aps-settings-profile-banner p { margin:5px 0 8px; color:#64748B; font-size:12px; overflow-wrap:anywhere; }
        .aps-settings-role-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 9px; border-radius:999px; background:#DBEAFE; color:#1D4ED8; font-size:10px; font-weight:800; }
        .aps-settings-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
        .aps-settings-field { min-width:0; }
        .aps-settings-field-full { grid-column:1/-1; }
        .aps-settings-field label,.aps-settings-password-field label { display:block; margin-bottom:8px; color:#475569; font-size:11px; font-weight:800; }
        .aps-settings-readonly { width:100%; min-height:48px; display:flex; align-items:center; gap:9px; padding:0 13px; border:1px solid #E2E8F0; border-radius:12px; background:#F8FAFC; color:#64748B; font-size:12px; }
        .aps-settings-readonly span { flex:1; min-width:0; overflow-wrap:anywhere; }
        .aps-settings-form-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:9px; margin-top:20px; }
        .aps-settings-button { min-height:43px; padding:0 15px; display:inline-flex; align-items:center; justify-content:center; gap:8px; border:1px solid transparent; border-radius:11px; font-family:inherit; font-size:12px; font-weight:800; cursor:pointer; transition:all .18s ease; }
        .aps-settings-button:disabled { opacity:.55; cursor:not-allowed; }
        .aps-settings-button.primary { color:#fff; background:linear-gradient(135deg,#2563EB,#4F46E5); box-shadow:0 5px 12px rgba(37,99,235,.13); }
        .aps-settings-button.secondary { color:#475569; background:#fff; border-color:#E2E8F0; }
        .aps-settings-button.danger { color:#fff; background:#DC2626; }
        .aps-settings-readonly-note { align-items:center; color:#475569; background:#F8FAFC; border-color:#E2E8F0; font-size:11px; line-height:1.65; }
        .aps-settings-readonly-note svg { flex:0 0 auto; color:#64748B; }
        .aps-settings-security-banner { display:flex; align-items:center; gap:14px; padding:18px 20px; border-radius:18px; background:linear-gradient(110deg,#ECFDF5,#F8FFFC); border:1px solid #BBF7D0; }
        .aps-settings-security-banner-icon { width:47px; height:47px; flex:0 0 47px; border-radius:15px; background:#D1FAE5; color:#059669; display:flex; align-items:center; justify-content:center; }
        .aps-settings-security-banner h3 { margin:0; font-size:14px; font-weight:850; color:#065F46; }
        .aps-settings-security-banner p { margin:5px 0 0; font-size:11px; color:#047857; line-height:1.6; }
        .aps-settings-password-fields { display:flex; flex-direction:column; gap:15px; max-width:620px; }
        .aps-settings-password-input-wrap { position:relative; }
        .aps-settings-password-input-wrap input { padding-inline-end:48px !important; }
        .aps-settings-eye-button { position:absolute; top:50%; inset-inline-end:7px; transform:translateY(-50%); width:34px; height:34px; display:flex; align-items:center; justify-content:center; border:0; border-radius:9px; background:transparent; color:#64748B; cursor:pointer; }
        .aps-settings-password-hints { display:flex; flex-wrap:wrap; gap:15px; margin-top:16px; color:#64748B; font-size:10px; }
        .aps-settings-password-hints div { display:flex; align-items:center; gap:6px; }
        .aps-settings-system-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:11px; }
        .aps-settings-system-item { min-width:0; display:flex; align-items:center; gap:11px; padding:14px; border:1px solid #EEF2F7; border-radius:14px; background:#FAFCFF; }
        .aps-settings-system-icon { width:36px; height:36px; flex:0 0 36px; display:flex; align-items:center; justify-content:center; border-radius:11px; background:#EFF6FF; color:#2563EB; }
        .aps-settings-system-item small { display:block; margin-bottom:4px; color:#94A3B8; font-size:10px; }
        .aps-settings-system-item strong { display:block; color:#334155; font-size:11px; overflow-wrap:anywhere; }
        .aps-settings-danger-panel { padding:20px; border:1px solid #FECACA; border-radius:20px; background:linear-gradient(135deg,#FFF7F7,#FFFFFF); }
        .aps-settings-danger-heading { display:flex; align-items:center; gap:11px; padding-bottom:16px; border-bottom:1px solid #FEE2E2; }
        .aps-settings-danger-icon { width:39px; height:39px; display:flex; align-items:center; justify-content:center; border-radius:12px; color:#DC2626; background:#FEE2E2; }
        .aps-settings-danger-heading h3 { margin:0; color:#991B1B; font-size:14px; font-weight:900; }
        .aps-settings-danger-heading p { margin:4px 0 0; color:#B91C1C; opacity:.8; font-size:10px; }
        .aps-settings-danger-content { display:flex; align-items:center; justify-content:space-between; gap:18px; padding-top:16px; }
        .aps-settings-danger-content strong { color:#7F1D1D; font-size:12px; }
        .aps-settings-danger-content p { max-width:500px; margin:5px 0 0; color:#9F5454; font-size:10px; line-height:1.7; }
        .aps-settings-notice { position:fixed; z-index:9999; inset-inline-end:24px; bottom:24px; max-width:min(420px,calc(100vw - 32px)); display:flex; align-items:center; gap:10px; padding:13px 16px; border-radius:13px; box-shadow:0 12px 35px rgba(15,23,42,.16); font-size:12px; font-weight:750; animation:apsNoticeIn .2s ease; }
        .aps-settings-notice.success { color:#166534; background:#F0FDF4; border:1px solid #BBF7D0; }
        .aps-settings-notice.error { color:#991B1B; background:#FEF2F2; border:1px solid #FECACA; }
        .aps-settings-notice.info { color:#1E40AF; background:#EFF6FF; border:1px solid #BFDBFE; }
        .aps-settings-spin { animation:apsSpin 1s linear infinite; }
        @keyframes apsSpin { to { transform:rotate(360deg); } }
        @keyframes apsNoticeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 900px) { .aps-settings-layout { grid-template-columns:220px minmax(0,1fr); gap:14px; } .aps-settings-sidebar { padding:10px; } .aps-settings-overview-grid { grid-template-columns:1fr 1fr; } .aps-settings-overview-grid > :last-child { grid-column:1/-1; } }
        @media (max-width: 680px) { .aps-settings-page { padding-top:0; } .aps-settings-topbar { align-items:flex-start; margin-bottom:17px; } .aps-settings-title-icon { width:42px; height:42px; border-radius:13px; } .aps-settings-version { display:none; } .aps-settings-layout { grid-template-columns:minmax(0,1fr); gap:13px; } .aps-settings-sidebar { position:static; padding:10px; } .aps-settings-sidebar-user,.aps-settings-nav-label,.aps-settings-sidebar-foot { display:none; } .aps-settings-nav { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; } .aps-settings-nav-item { padding:9px 7px; gap:7px; border-radius:10px; } .aps-settings-nav-icon { width:30px; height:30px; flex-basis:30px; } .aps-settings-nav-copy strong { font-size:10px; } .aps-settings-nav-copy small,.aps-settings-nav-arrow { display:none; } .aps-settings-content-heading { margin:2px 1px 12px; } .aps-settings-welcome { padding:20px; min-height:145px; border-radius:18px; } .aps-settings-welcome h2 { font-size:21px; } .aps-settings-welcome p { max-width:260px; font-size:11px; } .aps-settings-welcome-icon { width:46px; height:46px; flex-basis:46px; } .aps-settings-overview-grid { grid-template-columns:1fr 1fr; gap:9px; } .aps-settings-info-card { padding:13px; } .aps-settings-info-value { font-size:14px; } .aps-settings-panel-inner { padding:16px; } .aps-settings-form-grid,.aps-settings-system-grid { grid-template-columns:1fr; } .aps-settings-field-full { grid-column:auto; } .aps-settings-danger-content { align-items:stretch; flex-direction:column; } .aps-settings-danger-content .aps-settings-button { width:100%; } .aps-settings-form-actions { justify-content:stretch; } .aps-settings-form-actions .aps-settings-button { flex:1; } .aps-settings-security-banner { align-items:flex-start; padding:15px; } }
        @media (max-width: 390px) { .aps-settings-overview-grid { grid-template-columns:1fr; } .aps-settings-overview-grid > :last-child { grid-column:auto; } .aps-settings-title-wrap { gap:9px; } .aps-settings-topbar h1 { font-size:23px; } }
      `}</style>

      <div className="aps-settings-topbar">
        <div className="aps-settings-title-wrap">
          <div className="aps-settings-title-icon"><Settings2 size={23} /></div>
          <div>
            <h1>{text("الإعدادات", "Settings")}</h1>
            <p>{text("إدارة حسابك وإعدادات نظام A Perfume Story", "Manage your A Perfume Story account and system settings")}</p>
          </div>
        </div>
        <div className="aps-settings-version"><Sparkles size={13} /> APS v{appVersion}</div>
      </div>

      <div className="aps-settings-layout">
        <aside className="aps-settings-sidebar" style={panelStyle}>
          <div className="aps-settings-sidebar-user">
            <div className="aps-settings-avatar">{getInitials(user?.name)}</div>
            <div className="aps-settings-sidebar-user-copy">
              <strong>{user?.name || text("مستخدم النظام", "System user")}</strong>
              <span>{user?.email || "—"}</span>
            </div>
          </div>
          <div className="aps-settings-nav-label">{text("الإعدادات", "SETTINGS")}</div>
          <nav className="aps-settings-nav" aria-label={text("أقسام الإعدادات", "Settings sections")}>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`aps-settings-nav-item${isActive ? " active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="aps-settings-nav-icon"><Icon size={17} /></span>
                  <span className="aps-settings-nav-copy"><strong>{section.label}</strong><small>{section.description}</small></span>
                  <ChevronRight size={15} className="aps-settings-nav-arrow" />
                </button>
              );
            })}
          </nav>
          <div className="aps-settings-sidebar-foot"><ShieldCheck size={14} /> {text("إعدادات آمنة حسب صلاحياتك", "Secure settings based on your access")}</div>
        </aside>

        <main className="aps-settings-content">
          <div className="aps-settings-content-heading">
            <div className="aps-settings-content-heading-left">
              <div className="aps-settings-content-heading-icon"><ActiveIcon size={19} /></div>
              <div>
                <h2>{activeSectionInfo.label}</h2>
                <p>{activeSectionInfo.description}</p>
              </div>
            </div>
          </div>

          {activeSection === "overview" && renderOverview()}
          {activeSection === "profile" && renderProfile()}
          {activeSection === "security" && renderSecurity()}
          {activeSection === "system" && isSuperAdmin && renderSystem()}
        </main>
      </div>

      {notice && (
        <div className={`aps-settings-notice ${notice.type}`} role="status">
          {notice.type === "success" ? <CheckCircle2 size={18} /> : notice.type === "error" ? <AlertTriangle size={18} /> : <CircleHelp size={18} />}
          <span>{notice.message}</span>
        </div>
      )}
    </div>
  );
}

function PasswordField({ label, placeholder, value, onChange, visible, onToggle, inputStyle }) {
  return (
    <div className="aps-settings-password-field">
      <label>{label}</label>
      <div className="aps-settings-password-input-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={inputStyle}
        />
        <button type="button" className="aps-settings-eye-button" onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
