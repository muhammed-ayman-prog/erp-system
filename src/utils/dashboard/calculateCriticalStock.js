    import {
    collection,
    getDocs
    } from "firebase/firestore";
    export default async function
    calculateCriticalStock(
    db,
    branchNames
    ) {

    let low = 0;
            let out = 0;
            const criticalStock = [];
            const inventorySnap = await getDocs(
            collection(db, "inventory")
            );
    
            const productsSnap = await getDocs(
            collection(db, "products")
            );
    
            const productMeta = {};
    
            productsSnap.forEach(doc => {
            productMeta[doc.id] = doc.data();
            });
            const criticalMap = {};
            inventorySnap.forEach(doc => {
    
    
        const item = doc.data();
    
        const meta =
        productMeta[item.productId] || {};
    
        const qty = item.quantity || 0;
        const productName =
        meta.name || item.productId;
    
    const productType =
        meta.type || "unknown";
    
        let lowThreshold = 5;
    
    // Oils
    if (meta.type === "oil") {
        lowThreshold = 50;
    }
    
    // Containers
    if (meta.type === "container") {
    
        // Bottles
        if (meta.subCategory === "bottle") {
        lowThreshold = 30;
        }
    
        // Boxes
        else if (meta.subCategory === "box") {
        lowThreshold = 15;
        }
    
        // Samples
        else if (
        meta.subCategory === "sample" ||
        meta.subCategory === "samples"
        ) {
        lowThreshold = 10;
        }
    }
    
    // Ready Products / Originals
    if (
        meta.type === "product" ||
        meta.type === "original"
    ) {
        lowThreshold = 3;
    }
        if (qty <= lowThreshold) {
    
        let severity = "low";
    
        if (qty <= 0) {
        severity = "out";
        out++;
        } else if (qty <= lowThreshold / 2) {
        severity = "critical";
        low++;
        } else {
        low++;
        }
    
        const key = `${productName}_${productType}`;
    
    if (!criticalMap[key]) {
    
        criticalMap[key] = {
        name: productName,
        lowestQty: qty,
        type: productType,
        severity,
        threshold: lowThreshold,
    
        subCategory: meta.subCategory || "",
        category: meta.category || "",
    
        branches: [
        branchNames[item.branchId] || "Unknown"
        ],
    
        branchDetails: [
        {
            branch:
            branchNames[item.branchId] || "Unknown",
    
            qty
        }
        ]
    };
    
    } else {
    
        criticalMap[key].lowestQty = Math.min(
        criticalMap[key].lowestQty,
        qty
        );
    
        criticalMap[key].branches.push(
        branchNames[item.branchId] || "Unknown"
        );
    
        criticalMap[key].branchDetails.push({
        branch:
            branchNames[item.branchId] || "Unknown",
    
        qty
        });
    
        // أسوأ severity تكسب
        if (
        severity === "out" ||
        (
            severity === "critical" &&
            criticalMap[key].severity !== "out"
        )
        ) {
        criticalMap[key].severity = severity;
        }
    }
    }
    });
    Object.values(criticalMap)
        .forEach(item => criticalStock.push(item));
    criticalStock.sort((a, b) => {
    
        const severityOrder = {
        out: 0,
        critical: 1,
        low: 2
        };
    
        return (
        severityOrder[a.severity] -
        severityOrder[b.severity]
        );
    });
    return {
    criticalStock,
    low,
    out
    };
    }