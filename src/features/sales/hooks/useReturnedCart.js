import { useEffect } from "react";

export function useReturnedCart({
  setCart,
  setShowCart
}) {

  useEffect(() => {

    const raw =
      localStorage.getItem(
        "returnedCart"
      );

    if (!raw) return;

    localStorage.removeItem(
      "returnedCart"
    );

    const returned =
      JSON.parse(raw);

    if (!returned.length) return;

    setCart(prev => {

      const merged = [...prev];

      returned.forEach(item => {

        const exists =
          merged.find(
            i =>
              i.returnedItemId ===
              item.returnedItemId
          );

        if (!exists) {

          if (
            !item.returnedItemId
          ) return;

          merged.push(item);
        }
      });

      return merged;
    });

    setShowCart(true);

  }, []);
}