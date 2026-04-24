import { create } from "zustand";

export const useApp = create((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),

  selectedBranch: localStorage.getItem("branch") || "",

  setSelectedBranch: (val) => {
    localStorage.setItem("branch", val); // 🔥 حفظ
    set({ selectedBranch: val });
  },
  // 👇 تحت باقي الـ state
lang: localStorage.getItem("lang") || "ar",

setLang: (lang) => {
  localStorage.setItem("lang", lang);
  set({ lang });
},
}));