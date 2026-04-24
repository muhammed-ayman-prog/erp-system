import { useEffect } from "react";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  ShoppingCart,
  Boxes,
  Truck,
  Building2,
  Users,
  BarChart3,
  Wallet,
  Activity,
  ShieldCheck
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { useLocation } from "react-router-dom";
import React from "react";
export default function Home() {
  const [totalSales, setTotalSales] = useState(0);
  const [invoicesCount, setInvoicesCount] = useState(0);
  const [branchesCount, setBranchesCount] = useState(0);
  const [salesData, setSalesData] = useState([]);
const [pieData, setPieData] = useState([]);

const paymentColors = {
  Cash: "#22c55e",     // أخضر
  Visa: "#3b82f6",     // أزرق
  Instapay: "#8b5cf6", // بنفسجي
  Unknown: "#94a3b8"
};
const user = JSON.parse(localStorage.getItem("user"));
useEffect(() => {
  const fetchStats = async () => {
    const ref = doc(db, "stats", "dashboard");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      setTotalSales(data.totalSales || 0);
      setInvoicesCount(data.invoices || 0);
      setBranchesCount(data.branches || 0);

      setPieData([
        { name: "Cash", value: data.cash || 0 },
        { name: "Visa", value: data.visa || 0 },
        { name: "Instapay", value: data.instapay || 0 }
      ]);

      setSalesData([
        { name: "Cash", sales: data.cash || 0 },
        { name: "Visa", sales: data.visa || 0 },
        { name: "Instapay", sales: data.instapay || 0 }
      ]);
    }
  };

  fetchStats();
}, []);
  if (!user) return null;  

  return (
    <div style={{ 
    flex: 1, 
    padding: "20px",
    animation: "fadeIn 0.4s ease"
  }}>  

      {/* 📊 Cards */}
      <div style={{ marginBottom: "20px" }}>
  
</div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "25px"
        }}>
        
        

        <div>
            
        </div>

        </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px"
        }}>

        <div className="card card-green">
        
            <h4 style={{
            color: "#475569",
            fontSize: "14px",
            fontWeight: "500"
            }}>
            إجمالي المبيعات
            </h4>

            <h2 style={{
            color: "#0f172a",
            fontSize: "28px",
            fontWeight: "bold",
            marginTop: "8px"
            }}>
            {totalSales.toLocaleString() || "..."} EGP
            </h2>
            </div>

            <div className="card card-blue">
          
            <h4 style={{
            color: "#475569",
            fontSize: "14px",
            fontWeight: "500"
            }}>
           عدد الفواتير
            </h4>

            <h2 style={{
            color: "#0f172a",
            fontSize: "28px",
            fontWeight: "bold",
            marginTop: "8px"
            }}>
            {invoicesCount}
            </h2>
            </div>

            <div className="card card-yellow">
            
        
       
            <h4 style={{
            color: "#475569",
            fontSize: "14px",
            fontWeight: "500"
            }}>
           عدد الفروع
            </h4>

            <h2 style={{
            color: "#0f172a",
            fontSize: "28px",
            fontWeight: "bold",
            marginTop: "8px"
            }}>
            {branchesCount}
            </h2>
            </div>

        </div>
        {/* 📊 Charts */}
<div style={{
  marginTop: "30px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px"
}}>

  <div style={{
    background: "#fff",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  }}>
    <h3>مبيعات الفروع</h3>

    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={salesData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#3b82f6" radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div style={{
    background: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  }}>
    <h3>المبيعات اليومية</h3>

    <ResponsiveContainer width="100%" height={250}>
  <PieChart>

    <Tooltip /> {/* 🔥 ده المهم */}

    <Pie 
      data={pieData} 
      dataKey="value" 
      outerRadius={80} 
      label
    >
      {pieData.map((entry, index) => (
        <Cell 
  key={index} 
  fill={paymentColors[entry.name] || "#ccc"} 
/>
      ))}
    </Pie>

  </PieChart>
</ResponsiveContainer>
  </div>

</div>


    </div>
  );
}