import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../../../firebase";

export function useCustomerLookup() {

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerData, setCustomerData] =
    useState(null);

  const [debouncedPhone, setDebouncedPhone] =
    useState("");

  // debounce
  useEffect(() => {

    const timeout = setTimeout(() => {

      setDebouncedPhone(customerPhone);

    }, 400);

    return () => clearTimeout(timeout);

  }, [customerPhone]);

  // fetch customer
  useEffect(() => {

    const fetchCustomer = async () => {

      const normalizedPhone =
        customerPhone
          .replace(/\s/g, "")
          .replace("+2", "")
          .trim();

      if (
        !normalizedPhone ||
        normalizedPhone.length < 10
      ) {

        setCustomerData(null);

        return;
      }

      try {

        const q = query(
          collection(db, "customers"),
          where(
            "phone",
            "==",
            normalizedPhone
          )
        );

        const snapshot =
          await getDocs(q);

        if (!snapshot.empty) {

          const data =
            snapshot.docs[0].data();

          setCustomerName(
            data.name || ""
          );

          setCustomerData(data);

        } else {

          setCustomerData(null);

          setCustomerName("");
        }

      } catch (err) {

      }
    };

    fetchCustomer();

  }, [debouncedPhone]);

  const getCustomerTier = (
    customer
  ) => {

    const spent =
      customer?.totalSpent || 0;

    const orders =
      customer?.ordersCount || 0;

    if (
      spent >= 50000 &&
      orders >= 25
    ) {

      return {
        label: "Elite 👑",
        background: "#ede9fe"
      };
    }

    if (
      spent >= 15000 &&
      orders >= 10
    ) {

      return {
        label: "VIP 💎",
        background: "#fef3c7"
      };
    }

    if (
      orders >= 5 ||
      spent >= 6000
    ) {

      return {
        label: "Loyal 🔁",
        background: "#dbeafe"
      };
    }

    return {
      label: "New 🆕",
      background: "#e2e8f0"
    };
  };

  return {
    customerName,
    setCustomerName,

    customerPhone,
    setCustomerPhone,

    customerData,

    getCustomerTier
  };
}