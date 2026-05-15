import AppModal
from "../../../components/ui/AppModal";

import AppButton
from "../../../components/ui/AppButton";

export default function EditUserModal({
  editingUser,
  setEditingUser,
  t,
  branches,
  isRTL,
  handleUpdateUser,
}) {

  return (
    <AppModal
      open={!!editingUser}
      onClose={() => {
        setEditingUser(null);
      }}
    >
      {editingUser && (

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >

          <h3>
            {t("common.edit")} ✏️
          </h3>

          <input
            value={editingUser.name}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                name: e.target.value,
              })
            }
            placeholder={t("common.name")}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              width: "100%",
            }}
          />

          <select
            value={editingUser.role}
            onChange={(e) => {

              const role =
                e.target.value;

              setEditingUser({
                ...editingUser,
                role,

                branchIds:
                  role === "owner"
                    ? ["all"]
                    : editingUser.branchIds || [],
              });
            }}
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

          {editingUser.role !== "owner" && (

            <div
              style={{
                marginTop: "10px",
              }}
            >

              <p>
                <b>
                  {t("users.branch")}:
                </b>
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >

                {branches.map((branch) => {

                  const checked =
                    editingUser.branchIds?.includes(
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

                            setEditingUser({
                              ...editingUser,

                              branchIds: [
                                ...(editingUser.branchIds || []),
                                branch.id,
                              ],
                            });

                          } else {

                            setEditingUser({
                              ...editingUser,

                              branchIds:
                                editingUser.branchIds.filter(
                                  (id) =>
                                    id !== branch.id
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
              handleUpdateUser
            }
            style={{
              width: "100%",
            }}
          >
            {t("common.save")}
          </AppButton>

          <AppButton
            variant="secondary"
            onClick={() => {
              setEditingUser(null);
            }}
            style={{
              width: "100%",
            }}
          >
            {t("common.cancel")}
          </AppButton>

        </div>
      )}
    </AppModal>
  );
}