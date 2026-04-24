import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState("");

  // 📥 تحميل الفروع
  const fetchBranches = async () => {
    const snapshot = await getDocs(collection(db, "branches"));

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setBranches(data);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ➕ إضافة فرع
  const handleAdd = async () => {
    if (!name.trim()) return;

    await addDoc(collection(db, "branches"), {
      name,
      createdAt: new Date()
    });

    setName("");
    fetchBranches();
  };

  // ❌ حذف فرع
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "branches", id));
    fetchBranches();
  };

  return (
    <div style={{ flex: 1 }}>

      <h2 style={{ marginBottom: "20px" }}>Branches 🏪</h2>

      {/* ➕ Add */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <input
          placeholder="Branch name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: "10px" }}
        />

        <button className="primary" onClick={handleAdd}>
          Add Branch
        </button>
      </div>

      {/* 📋 List */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "15px"
      }}>
        {branches.map(b => (
          <div key={b.id} className="card">
            <h3>{b.name}</h3>

            <button
              onClick={() => handleDelete(b.id)}
              style={{
                marginTop: "10px",
                background: "#ef4444",
                color: "#fff"
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}