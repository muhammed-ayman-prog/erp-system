import AppModal
from "../../../components/ui/AppModal";

import AppButton
from "../../../components/ui/AppButton";

export default function CreateUserModal({
  open,
  onClose,
  t,
  newUser,
  setNewUser,
  branches,
  isMobile,
  isRTL,
  handleCreateUser,
}) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
    >
      <h3
        style={{
          marginBottom: "10px",
        }}
      >
        {t("users.addUser")} 👤
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <input
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "14px",
            width: "100%",
          }}
          placeholder={t("common.name")}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              name: e.target.value,
            })
          }
        />

        <input
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "14px",
            width: "100%",
          }}
          placeholder={t("common.email")}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "14px",
            width: "100%",
          }}
          placeholder={t("common.password")}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              password: e.target.value,
            })
          }
        />

        <select
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            width: "100%",
          }}
          value={newUser.role}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              role: e.target.value,
            })
          }
        >
          <option value="sales">
            {t("roles.sales")}
          </option>

          <option value="assistant_manager">
            {t("roles.assistantManager")}
          </option>

          <option value="branch_manager">
            {t("roles.branchManager")}
          </option>

          <option value="supervisor">
            {t("roles.supervisor")}
          </option>

          <option value="owner">
            {t("roles.owner")}
          </option>
        </select>

        {newUser.role !== "owner" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {t("users.branch")}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",

                maxHeight:
                  isMobile
                    ? "220px"
                    : "160px",

                overflowY: "auto",

                border:
                  "1px solid #ddd",

                borderRadius: "10px",

                padding: "10px",
              }}
            >
              {branches.map((branch) => {

                const checked =
                  newUser.branchIds.includes(
                    branch.id
                  );

                return (
                  <label
                    key={branch.id}
                    style={{
                      display: "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      gap: "10px",

                      padding:
                        "8px 10px",

                      borderRadius:
                        "10px",

                      background:
                        "#f9f9fb",

                      cursor:
                        "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {

                        if (
                          e.target.checked
                        ) {

                          setNewUser({
                            ...newUser,

                            branchIds: [
                              ...newUser.branchIds,
                              branch.id,
                            ],
                          });

                        } else {

                          setNewUser({
                            ...newUser,

                            branchIds:
                              newUser.branchIds.filter(
                                (
                                  id
                                ) =>
                                  id !==
                                  branch.id
                              ),
                          });
                        }
                      }}
                    />

                    <span
                      style={{
                        flex: 1,

                        textAlign:
                          isRTL
                            ? "right"
                            : "left",
                      }}
                    >
                      {branch.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <AppButton
          onClick={
            handleCreateUser
          }
          style={{
            width: "100%",
            marginTop: "12px",
          }}
        >
          {t("common.add")}
        </AppButton>

        <AppButton
          onClick={onClose}
          variant="secondary"
          style={{
            width: "100%",
          }}
        >
          {t("common.cancel")}
        </AppButton>
      </div>
    </AppModal>
  );
}