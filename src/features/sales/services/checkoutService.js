import {
  runTransaction,
  doc,
  addDoc,
  collection,
  serverTimestamp,
  increment,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { db } from "../../../firebase";
const branchMap = {
  y2aCRTss8tUiLw9g8WCw: "ABBAS1",
  RFA1pToN9LPfFSnenbSY: "ABBAS2",
  nCYR3hk9rVjhT8fcWbV5: "ABBAS3",
  DUuSkP04TnYT2XhvqoVy: "CITY",
 QPGcEaPljiGIpQMz9GYy: "ELOBOUR",
  VmNcbSmkrVo5Bjup8Zxx: "ELREHAB"
};
export const processCheckout = async ({
  cart,
  branchToUse,
  total,
  paymentMethod,
  customerName,
  customerPhone
}) => {

    await runTransaction(db, async (transaction) => {

      const reads = [];

      // 🟡 نجمع كل القراءات الأول
      for (const item of cart) {

        const isReadyProduct =
          item.containerType === "Original" ||
          item.containerType === "Ready";

        if (isReadyProduct) {

          const ref = doc(db, "inventory", `${branchToUse}_${item.id}`);
const snap = await transaction.get(ref);

if (!snap.exists()) {
  throw new Error("❌ المنتج مش موجود في المخزن");
}

const current = snap.data()?.quantity || 0;



          if (current < item.qty) {
            throw new Error(`❌ المنتج ${item.name} مش متوفر`);
          }

          reads.push({ type: "ready", ref, item });

        } else {

          const containerRef = doc(
            db,
            "inventory",
            `${branchToUse}_${item.containerType}_${item.size}`
            );
const containerDoc = await transaction.get(containerRef);

if (!containerDoc.exists()) {
  throw new Error("❌ الكونتينر مش موجود");
}

const containerStock = containerDoc.data()?.quantity || 0;

if (containerStock < item.qty) {
  throw new Error(`❌ الكونتينر مش كفاية لـ ${item.name}`);
}


          let oilRef = null;
let neededOil = 0;

if (item.oilQty > 0) {

  oilRef = doc(db, "inventory", `${branchToUse}_${item.id}`);

  const oilDoc = await transaction.get(oilRef);

  if (!oilDoc.exists()) {
    throw new Error("❌ الزيت مش موجود");
  }

  const oilStock = oilDoc.data()?.quantity || 0;
  neededOil = item.oilQty * item.qty;

  if (oilStock < neededOil) {
    throw new Error(`❌ الزيت مش كفاية لـ ${item.name}`);
  }
}

          reads.push({
            type: "mix",
            containerRef,
            oilRef,
            neededOil,
            item
          });
        }
      }

      // 🔵 بعد ما خلصنا كل الـ reads → نعمل writes
      for (const r of reads) {

        if (r.type === "ready") {
          transaction.set(r.ref, {
            quantity: increment(-r.item.qty)
          }, { merge: true });

        } else {

          transaction.set(r.containerRef, {
            quantity: increment(-r.item.qty)
          }, { merge: true });
          

          if (r.oilRef) {
            transaction.set(r.oilRef, {
              quantity: increment(-r.neededOil)
            }, { merge: true });
            
          }
        }
      }
    });
    // 🟢 تسجيل الحركة في stock (بعد نجاح العملية)
await Promise.all(
  cart.flatMap(item => {
    const arr = [];

    arr.push(
      addDoc(collection(db, "stock"), {
        productId: item.size,
        quantity: item.qty,
        type: "sale",
        branchId: branchToUse,
        createdAt: serverTimestamp()
      })
    );

    if (item.oilQty > 0) {
      arr.push(
        addDoc(collection(db, "stock"), {
          productId: item.id,
          quantity: item.oilQty * item.qty,
          type: "sale",
          branchId: branchToUse,
          createdAt: serverTimestamp()
        })
      );
    }

    return arr;
  })
);

    // 🟢 2) INVOICE NUMBER
    let invoiceNumber = "";

    await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, "counters", branchToUse);
      const snap = await transaction.get(counterRef);

      if (!snap.exists()) {
        throw new Error("Counter not found");
      }

      const newNumber = snap.data().lastNumber + 1;

      transaction.update(counterRef, {
        lastNumber: newNumber
      });

      const branchPrefix = branchMap[branchToUse] || "BRCH";

      invoiceNumber = `${branchPrefix}-${String(newNumber).padStart(4, "0")}`;
    });

    // 🟢 3) SAVE INVOICE
    const saleRef = await addDoc(collection(db, "sales"), {
      invoiceNumber,
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      customerName: customerName,
      customerPhone: customerPhone,
      branchId: branchToUse,
      createdAt: serverTimestamp(),
      totalQty: cart.reduce((sum, i) => sum + i.qty, 0),
      refundedQty: 0,
      
    });
    // 🔗 ربط العميل
if (customerPhone) {
  const q = query(
    collection(db, "customers"),
    where("phone", "==", customerPhone.trim())
  );

  const snapshot = await getDocs(q);

  let customerId = "";

  if (snapshot.empty) {
    // 🆕 create
    const newCustomer = await addDoc(collection(db, "customers"), {
      name: customerName,
      phone: customerPhone,
      lastPurchase: serverTimestamp()
    });

    customerId = newCustomer.id;

  } else {
    // 🔄 update
    const docRef = snapshot.docs[0].ref;
    customerId = docRef.id;

    await updateDoc(docRef, {
      name: customerName,
      lastPurchase: serverTimestamp()
    });
  }

  // 🔗 اربط الفاتورة بالعميل
  await updateDoc(
    doc(db, "sales", saleRef.id),
    {
      customerId
    }
  );
}

return invoiceNumber;
};