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
  import logAction
  from "../../../utils/logAction";
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
    customerPhone,
    seller,
    user       
  }) => {
    try {

      await runTransaction(db, async (transaction) => {

        const reads = [];

        // 🟡 نجمع كل القراءات الأول
        // ✅ تأكد إن الكارت مش فاضي
        if (!cart.length) {
          throw new Error("❌ الكارت فاضي");
        }

        for (const item of cart) {
          // 🔁 Returned Item → skip all inventory validation
  if (item.isReturned) {
    reads.push({ type: "returned", item });
    continue;
  }

          // ✅ تأكد إن الكونتينر موجود
          
        const type =
          (item.containerType || "")
            .toLowerCase()
            .trim();

        const isReadyProduct =
          type === "original" ||
          type === "ready" ||
          type === "cream" ||
          type === "مخمرية";

        if (
          !item.containerId &&
          item.containerType !== "oil" &&
          !isReadyProduct
        ) {
          throw new Error("❌ لازم تختار كونتينر");
        }
        if (
          item.containerType !== "oil" &&
          !isReadyProduct &&
          (!item.oilQty || item.oilQty <= 0)
        ) {
          throw new Error("❌ لازم تدخل كمية الزيت");
        }
          const isOilOnly = item.containerType === "oil";
          if (isOilOnly) {
          const oilRef = doc(db, "inventory", `${branchToUse}_${item.oilId || item.id}`);
          const oilDoc = await transaction.get(oilRef);

          if (!oilDoc.exists()) {
            throw new Error("❌ الزيت مش موجود");
          }

          const oilStock = oilDoc.data()?.quantity || 0;
          const neededOil = item.oilQty * item.qty;

          if (oilStock < neededOil) {
            throw new Error(`❌ الزيت مش كفاية لـ ${item.name}`);
          }

          reads.push({
            type: "oil",
            oilRef,
            neededOil,
            item
          });

          continue;
        }
          

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
    `${branchToUse}_${item.containerId}`
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

  if (item.containerType !== "oil" && item.oilQty > 0) {


  oilRef = doc(
    db,
    "inventory",
    `${branchToUse}_${item.oilId || item.id}`
  );

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
          if (r.type === "oil") {
            transaction.set(r.oilRef, {
              quantity: increment(-r.neededOil)
            }, { merge: true });

            continue;
          }

          // 🔁 Returned Item
          if (r.item.isReturned) {
            const returnedRef = doc(db, "returned_items", r.item.returnedItemId);
            const returnedSnap = await transaction.get(returnedRef);
              if (!returnedSnap.exists()) {
                throw new Error("❌ المنتج المرتجع غير موجود");
              }
              if (returnedSnap.data()?.status === "sold") {
                throw new Error("❌ المنتج المرتجع تم بيعه بالفعل");
              }
            transaction.update(returnedRef, {
              status: "sold",
              soldAt: serverTimestamp()
            });

            // 🔥 تحديث returns
            if (r.item.returnId) {
            const returnRef = doc(db, "returns", r.item.returnId);

            transaction.update(returnRef, {
              status: "sold"
            });
          }

            continue;
          }

          // 🟢 Normal Flow
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
  try {

  await Promise.all(
    cart.flatMap(item => {
      const arr = [];

      arr.push(
        addDoc(collection(db, "stock")  , {
          productId: item.containerType === "oil"
    ? item.id
    : item.containerId || item.id,
          quantity:
    item.containerType === "oil"
      ? item.oilQty * item.qty
      : item.qty,
          type: item.isReturned ? "resell" : "sale",
          movementType: item.isReturned
            ? "RETURN_RESALE"
            : "SALE",

          movementSource:
            item.isReturned
              ? "RETURN_RESALE"
              : "SALE",

          direction: "OUT",

          productType:
            item.isReturned
              ? "RETURNED_PRODUCT"
              : item.containerType === "oil"
              ? "RAW_OIL"
              : "CONTAINER",

          unit:
            item.containerType === "oil"
              ? "ML"
              : "PCS",

          unitCost:
            item.containerType === "oil"
              ? item.oilCostPerML || 0
              : item.containerCost || 0,

          totalCost:
            item.containerType === "oil"
              ? item.oilCost || 0
              : item.containerCost || 0,
          price: item.price || 0,
          total: (item.price || 0) * item.qty,
          branchId: branchToUse,
          branchName: branchMap[branchToUse] || "Unknown",
          createdAt: serverTimestamp()
        })
      );

      if (
  !item.isReturned &&
  item.containerType !== "oil" &&
  item.oilQty > 0
) {
        arr.push(
          addDoc(collection(db, "stock"), {
            productId: item.id,
            quantity: item.oilQty * item.qty,
            type: item.isReturned ? "resell" : "sale",
            movementType: item.isReturned
              ? "RETURN_RESALE"
              : "SALE",

            movementSource:
              item.isReturned
                ? "RETURN_RESALE"
                : "SALE",

            direction: "OUT",

            productType: "RAW_OIL",

            unit: "ML",

            unitCost: item.oilCostPerML || 0,

            totalCost: item.oilCost || 0,
            price: item.oilQty ? item.price / item.oilQty : 0,
            total: (item.price || 0) * item.qty,
            branchId: branchToUse,
            branchName: branchMap[branchToUse] || "Unknown",
            createdAt: serverTimestamp()
          })
        );
      }

      return arr;
    })
  );

} catch (err) {

  

  throw err;
}

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
      const cleanedCart = cart.map(item => ({
    // 🧾 Basic
    id: item.id,
    name: item.name,

    itemType: item.itemType || "UNKNOWN",

    saleMode: item.saleMode || "UNKNOWN",

    // 🛢 Oil
    oilId: item.oilId || item.id,
    oilName: item.oilName || item.name,
    oilCategory: item.oilCategory || "",

    oilQtyML: item.oilQtyML || 0,

    // 🧴 Container
    size: item.size || "",

    containerName: item.containerName || "",
    containerType: item.containerType ?? "unknown",
    containerId: item.containerId ?? null,

    // 📦 Qty
    qty: item.qty || 1,

    // 💰 Pricing
    unitPrice: item.unitPrice || item.price || 0,
    price: item.price || 0,

    // 💸 Costing
    oilCostPerML: item.oilCostPerML || 0,

    oilCost: item.oilCost || 0,

    containerCost: item.containerCost || 0,

    overheadCost: item.overheadCost || 0,

    unitCost: item.unitCost || 0,

    profit: item.profit || 0,

    margin: item.margin || 0,

    // 🟡 Backward compatibility
    oilQty: item.oilQty || 0
  }));
      const totalProfit = cleanedCart.reduce(
    (sum, item) => sum + (item.profit || 0),
    0
  );

  const totalCost = cleanedCart.reduce(
    (sum, item) => sum + (item.unitCost || 0),
    0
  );

  const overallMargin =
    total > 0
      ? Number(((totalProfit / total) * 100).toFixed(2))
      : 0;
  const saleRef = await addDoc(collection(db, "sales"), {
    invoiceNumber,
    items: cleanedCart,

    total: total || 0,
    totalCost,
    totalProfit,
    overallMargin,

    paymentMethod: paymentMethod || "",
    customerName: customerName || "",
    customerPhone: customerPhone || "",

    branchId: branchToUse,
    branchName:
      branchMap[branchToUse] || "Unknown",
    createdAt: serverTimestamp(),

    totalQty: cart.reduce(
      (sum, i) =>
        sum +
        (i.containerType === "oil"
          ? i.oilQty * i.qty
          : i.qty),
      0
    ),

    refundedQty: 0,

    seller:
      seller || {
        name: user?.name || "—",
        role: "seller"
      },
    enteredBy: user?.name || "—",
    enteredById:
      user?.uid || null
  });
  await logAction({

    action:
      "CREATE_INVOICE",

    module:
      "Sales",

    severity:
      "success",

    status:
      "success",

    by:
      user?.uid || "",

    byName:
      user?.name || "",

    userId:
      user?.uid || "",

    branchId:
      branchToUse,

    targetId:
      saleRef.id,

    targetName:
      invoiceNumber,

    details: {

      invoiceNumber,

      branchName:
      branchMap[branchToUse] || "Unknown",

      seller:
        seller || {
          name: user?.name || "—",
          role: "seller"
        },

      

      paymentCategory:
      paymentMethod,  

      customerName,

      customerPhone,

      paymentMethod,

      total,

      totalProfit,

      totalCost,

      overallMargin,

      totalItems:
        cleanedCart.length,

      totalQty:
    cleanedCart.reduce(
      (sum, item) =>
        sum +
        (
          item.containerType === "oil"
            ? (item.oilQty || 0) * (item.qty || 0)
            : (item.qty || 0)
        ),
      0
    ),

      topItems:
    cleanedCart
      .slice(0, 5)
      .map(item => ({

        name:
          item.name,

        qty:
          item.qty

      }))

    }

  });   
      
  
  // 🔗 ربط العميل
  /*
  if (
  customerPhone &&
  user?.role === "owner"
) {
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

        lastPurchase: serverTimestamp(),

        totalSpent: total || 0,

        ordersCount: 1
      });

      customerId = newCustomer.id;

    } else {
      // 🔄 update
      const docRef = snapshot.docs[0].ref;
      customerId = docRef.id;

      await updateDoc(docRef, {
        name: customerName,

        lastPurchase: serverTimestamp(),

        totalSpent: increment(total || 0),

        ordersCount: increment(1)
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
  */

  return invoiceNumber;

    } catch (err) {

      console.error(
        "Checkout Error:",
        err
      );

      await logAction({

        action:
          "CREATE_INVOICE",

        module:
          "Sales",

        severity:
          "danger",

        status:
          "error",

        by:
          user?.uid || "",

        byName:
          user?.name || "",

        userId:
          user?.uid || "",

        branchId:
          branchToUse,
        
        details: {

          customerName,

          customerPhone,

          paymentMethod,

          total,

          cartSize:
            cart.length,

          topItems:
            cart
              .slice(0, 5)
              .map(item => ({

                name:
                  item.name,

                qty:
                  item.qty

              })),

          error:
            err.message

        }

      });

      throw err;

    }

  };