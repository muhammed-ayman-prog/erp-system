import { create } from "zustand";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

let authUnsub = null;

export const useAuth = create((set) => ({
  user: null,

  loading: true,

  setUser: (user) =>
  set({
    user,
    loading: false,
  }),

updateUser: (data) =>
  set((state) => ({
    user: {
      ...state.user,
      ...data,
    },
  })),

  initAuth: () => {

    if (authUnsub) return;

    authUnsub = onAuthStateChanged(
      auth,

      async (firebaseUser) => {

        // ❌ No user
        if (!firebaseUser) {

          set({
            user: null,
            loading: false,
          });

          return;
        }

        try {

          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const snap =
            await getDoc(userRef);

          // ❌ User not found in Firestore
          if (!snap.exists()) {

            console.warn(
              "⚠️ Ignored unknown auth user"
            );

            await signOut(auth);

            set({
              user: null,
              loading: false,
            });

            return;
          }

          const data = snap.data();

          // ❌ Disabled account
          if (
            data.status ===
            "disabled"
          ) {

            await signOut(auth);

            set({
              user: null,
              loading: false,
            });

            return;
          }

          set({

            user: {

              uid:
                firebaseUser.uid,

              email:
                data.email || "",

              name:
                data.name || "",

              role:
                data.role || "",

              // ✅ New system
              branchIds:
                data.branchIds || [],

              // ✅ TEMP compatibility
              branchId:
                data.branchIds?.[0] || "",

              status:
                data.status || "active",
            },

            loading: false,
          });

        } catch (err) {

          console.error(
            "Auth Error:",
            err
          );

          set({
            user: null,
            loading: false,
          });
        }
      }
    );
  },

  logout: async () => {

    try {

      await signOut(auth);

      set({
        user: null,
      });

    } catch (err) {

      console.error(
        "Logout Error:",
        err
      );
    }
  },
}));