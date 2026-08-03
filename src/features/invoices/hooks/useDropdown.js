import { useEffect, useState } from "react";

export default function useDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const close = () => setDropdownOpen(false);

    window.addEventListener("click", close);

    return () =>
      window.removeEventListener(
        "click",
        close
      );
  }, []);

  return {
    dropdownOpen,
    setDropdownOpen,
  };
}