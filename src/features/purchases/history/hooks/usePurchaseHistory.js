import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../../firebase";

import { useAuth } from "../../../../store/useAuth";
import { useApp } from "../../../../store/useApp";


export default function usePurchaseHistory() {

  const { user } = useAuth();

  const { selectedBranch } = useApp();


  const [loading, setLoading] = useState(true);


  const [purchases, setPurchases] = useState([]);

  const [stockLogs, setStockLogs] = useState([]);


  const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");


  const [openId, setOpenId] = useState(null);



  // ==========================
  // Purchases
  // ==========================

  useEffect(() => {

    if (!user) return;


    if (
      user.role === "owner" &&
      !selectedBranch
    ) {
      return;
    }



    const branchId =
      user.role === "owner"
        ? selectedBranch
        : user.branchIds?.[0];



    if (!branchId) return;



    const purchasesQuery =

      user.role === "owner" &&
      branchId === "all"

        ? query(
            collection(db, "purchases"),
            orderBy(
              "createdAt",
              "desc"
            )
          )

        : query(
            collection(db, "purchases"),
            where(
              "branchId",
              "==",
              branchId
            ),
            orderBy(
              "createdAt",
              "desc"
            )
          );



    const unsubscribe =
      onSnapshot(
        purchasesQuery,
        (snapshot) => {

          setPurchases(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );


          setLoading(false);

        }
      );



    return unsubscribe;


  }, [
    user,
    selectedBranch,
  ]);





  // ==========================
  // Stock Logs
  // ==========================

  useEffect(() => {

    if (!user) return;



    const branchId =
      user.role === "owner"
        ? selectedBranch
        : user.branchIds?.[0];



    if (!branchId) return;



    const stockQuery =

      user.role === "owner" &&
      branchId === "all"

        ? query(
            collection(db, "stock"),
            orderBy(
              "createdAt",
              "desc"
            )
          )

        : query(
            collection(db, "stock"),
            where(
              "branchId",
              "==",
              branchId
            ),
            orderBy(
              "createdAt",
              "desc"
            )
          );



    const unsubscribe =
      onSnapshot(
        stockQuery,
        (snapshot) => {

          setStockLogs(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );

        }
      );



    return unsubscribe;


  }, [
    user,
    selectedBranch,
  ]);





  // ==========================
  // Filters
  // ==========================

  const filteredPurchases = useMemo(() => {


    return purchases.filter(
      (purchase) => {


        const purchaseDate =
          purchase.createdAt?.seconds

            ? new Date(
                purchase.createdAt.seconds *
                1000
              )

            : null;



        const searchText =
          search
            .toLowerCase()
            .trim();




        const matchesSearch =

          !searchText

          ||

          purchase.branchName
            ?.toLowerCase()
            .includes(searchText)

          ||

          purchase.userName
            ?.toLowerCase()
            .includes(searchText)

          ||

          purchase.items?.some(
            (item) =>
              item.productId
                ?.toLowerCase()
                .includes(searchText)
          );




        let matchesDate = true;



        if (purchaseDate) {


          // From Date

          if (fromDate) {

            const startDate =
              new Date(fromDate);


            startDate.setHours(
              0,
              0,
              0,
              0
            );


            if (
              purchaseDate <
              startDate
            ) {

              matchesDate = false;

            }

          }



          // To Date

          if (toDate) {

            const endDate =
              new Date(toDate);


            endDate.setHours(
              23,
              59,
              59,
              999
            );


            if (
              purchaseDate >
              endDate
            ) {

              matchesDate = false;

            }

          }


        }




        return (
          matchesSearch &&
          matchesDate
        );


      }
    );


  }, [
    purchases,
    search,
    fromDate,
    toDate,
  ]);





  return {

    loading,


    purchases:
      filteredPurchases,


    stockLogs,


    search,
    setSearch,


    fromDate,
    setFromDate,


    toDate,
    setToDate,


    openId,
    setOpenId,

  };

}