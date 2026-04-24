import { create } from "zustand";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

let authUnsub = null;
let docUnsub = null;

export const useAuth = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  initAuth: () => {
    // امنع تكرار listeners
    if (authUnsub) return;

    authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      // اقفل أي subscription قديم على الدوك
      if (docUnsub) {
        docUnsub();
        docUnsub = null;
      }

      if (!firebaseUser) {
        set({ user: null, loading: false });
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);

        // 🔥 live data بدل getDoc
        docUnsub = onSnapshot(
          userRef,
          (snap) => {
            if (!snap.exists()) {
              set({ user: null, loading: false });
              return;
            }

            const data = snap.data();

            // 🔍 Debug
            console.log("🔥 LIVE FIRESTORE DATA:", data);

            set({
              user: {
              uid: firebaseUser.uid,
              email: data.email || "",
              name: data.name || "",
              role: data.role || "",
              branchId: data.branchId || "",
              status: data.status || "active", // 🔥 ده المهم

                // ضمان array
                permissions: Array.isArray(data.permissions)
                  ? data.permissions
                  : Object.values(data.permissions || {})
              },
              loading: false
            });
          },
          (error) => {
            console.error("Snapshot Error:", error);
            set({ user: null, loading: false });
          }
        );
      } catch (err) {
        console.error("Auth Error:", err);
        set({ user: null, loading: false });
      }
    });
  },

  logout: async () => {
    try {
      if (docUnsub) {
        docUnsub();
        docUnsub = null;
      }
      await signOut(auth);
      set({ user: null });
    } catch (err) {
      console.error("Logout Error:", err);
    }
  }
}));