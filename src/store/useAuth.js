import { create } from "zustand";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // ✅ مهم
import { auth, db } from "../firebase";

let authUnsub = null;

export const useAuth = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  initAuth: () => {
    if (authUnsub) return;

    authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {

      // ❌ لو مفيش user
      if (!firebaseUser) {
        set({ user: null, loading: false });
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        // 🔥 تجاهل أي user مش موجود في Firestore
        if (!snap.exists()) {
          console.warn("⚠️ Ignored unknown auth user");
          return;
        }

        const data = snap.data();

        set({
          user: {
            uid: firebaseUser.uid,
            email: data.email || "",
            name: data.name || "",
            role: data.role || "",
            branchId: data.branchId || "",
            status: data.status || "active",
            permissions: Array.isArray(data.permissions)
              ? data.permissions
              : Object.values(data.permissions || {})
          },
          loading: false
        });

      } catch (err) {
        console.error("Auth Error:", err);
        set({ user: null, loading: false });
      }
    });
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (err) {
      console.error("Logout Error:", err);
    }
  }
}));