import { useEffect, useMemo, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { db } from "../../../firebase";

export function useProducts(selectedBranch) {

  const [products, setProducts] = useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [inventoryMap, setInventoryMap] =
    useState({});

  const [branches, setBranches] = useState([]);

  const [pricing, setPricing] = useState([]);

  // 🔥 Pricing
  useEffect(() => {

    const fetchPricing = async () => {

      const snap = await getDocs(
        collection(db, "pricing")
      );

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPricing(data);
    };

    fetchPricing();

  }, []);

 // 🔥 Products Realtime
useEffect(() => {

  const unsub = onSnapshot(

    collection(db, "products"),

    (snapshot) => {

      const data = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => !product.isArchived);

      setProducts(data);

      setLoadingProducts(false);
    }

  );

  return () => unsub();

}, []);

  // 🔥 Inventory
  useEffect(() => {

    if (!selectedBranch) return;

    // ALL
    if (selectedBranch === "all") {

      const unsub = onSnapshot(
        collection(db, "inventory"),
        (snapshot) => {

          const map = {};

          snapshot.forEach(doc => {

            const data = doc.data();

            if (!data.productId) return;

            map[data.productId] =
              (map[data.productId] || 0)
              + data.quantity;
          });

          setInventoryMap(map);
        }
      );

      return () => unsub();
    }

    // Branch
    const unsub = onSnapshot(

      query(
        collection(db, "inventory"),
        where(
          "branchId",
          "==",
          selectedBranch
        )
      ),

      (snapshot) => {

        const map = {};

        snapshot.forEach(doc => {

          const data = doc.data();

          if (!data.productId) return;

          map[data.productId] =
            (map[data.productId] || 0)
            + data.quantity;
        });

        setInventoryMap(map);
      }
    );

    return () => unsub();

  }, [selectedBranch]);

  // 🔥 Branches
  useEffect(() => {

    const fetchBranches = async () => {

      const snap = await getDocs(
        collection(db, "branches")
      );

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBranches(data);
    };

    fetchBranches();

  }, []);

  // 🔥 Memoized products
  const productsWithStock = useMemo(() => {

    return products.map(p => ({
      ...p,
      quantity: inventoryMap[p.id] || 0
    }));

  }, [products, inventoryMap]);

  return {
    products,
    productsWithStock,
    loadingProducts,
    inventoryMap,
    branches,
    pricing
  };
}