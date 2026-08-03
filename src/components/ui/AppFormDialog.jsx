import AppDialog from "./AppDialog";
import AppButton from "./AppButton";

import { useTranslate } from "../../useTranslate";

export default function AppFormDialog({
  open,
  onClose,

  title,
  subtitle,

  children,

  width = 520,

  onSubmit,

  loading = false,

  submitLabel,

  cancelLabel,

  submitVariant = "primary",

  footer,
}) {
  const { t } = useTranslate();

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      width={width}
      title={title}
      subtitle={subtitle}
      footer={
        footer ?? (
          <>
            <AppButton
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel ??
                t("common.cancel")}
            </AppButton>

            <AppButton
              variant={submitVariant}
              onClick={onSubmit}
              loading={loading}
            >
              {submitLabel ??
                t("common.save")}
            </AppButton>
          </>
        )
      }
    >
      {children}
    </AppDialog>
  );
}