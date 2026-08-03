import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot
} from "firebase/firestore";

import { db } from "../../../firebase";


export function subscribeInvoices({
  branchId,
  allBranches = false,
  callback
}) {


  let q;


  if(allBranches){

    q = query(
      collection(db,"sales"),
      orderBy(
        "createdAt",
        "desc"
      )
    );

  }

  else {

    q = query(
      collection(db,"sales"),

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

  }



  return onSnapshot(
    q,

    snap => {

      const data =
        snap.docs.map(d => ({
          id:d.id,
          ...d.data()
        }));


      callback(data);

    }

  );

}