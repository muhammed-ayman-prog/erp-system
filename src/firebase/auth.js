import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../store/useAuth";

export const initAuthListener = () => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    const setUser = useAuth.getState().setUser;

    if (firebaseUser) {
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const userData = {
            uid: firebaseUser.uid,
            ...snap.data()
          };

          // 🔥 خزّن في zustand
          setUser(userData);

          // 🔥 optional: خزّن في localStorage
          localStorage.setItem("user", JSON.stringify(userData));

        } else {
          console.warn("User not found in Firestore");
          setUser(null);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
      }
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }
  });
};

// 🔐 logout موحد
export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem("user");
  useAuth.getState().setUser(null);
};