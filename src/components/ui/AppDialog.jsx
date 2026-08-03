import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { theme } from "../../theme";

export default function AppDialog({
  open,
  onClose,
  title,
  subtitle,
  width = 520,
  children,
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
}) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => {
              if (closeOnBackdrop) {
                onClose?.();
              }
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              background: theme.colors.overlay,
              backdropFilter: "blur(4px)",
            }}
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            transition={{
              duration: 0.2,
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: width,
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: theme.colors.card,
                border: `1px solid ${theme.colors.cardBorder}`,
                borderRadius: 24,
                boxShadow: theme.colors.shadow,
              }}
            >
              {(title || subtitle) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: 20,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div>
                    {title && (
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 700,
                          color: theme.colors.text,
                        }}
                      >
                        {title}
                      </h2>
                    )}

                    {subtitle && (
                      <p
                        style={{
                          marginTop: 6,
                          marginBottom: 0,
                          color: theme.colors.textSecondary,
                          fontSize: 14,
                        }}
                      >
                        {subtitle}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={onClose}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    <X size={22} />
                  </button>
                </div>
              )}

              <div
                style={{
                  padding: 20,
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {children}
              </div>

              {footer && (
                <div
                  style={{
                    padding: 20,
                    borderTop: `1px solid ${theme.colors.border}`,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}