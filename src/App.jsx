import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/useAuth";

import Login from "./pages/Login";
import SalesPage from "./features/sales/SalesPage";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import Branches from "./pages/Branches";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Operations from "./pages/Operations";
import Purchases from "./pages/Purchases";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Waste from "./pages/Waste";
import Returns from "./pages/Returns";
import Invoices from "./pages/Invoices";

import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Logs from "./pages/Logs";  
import { Toaster } from "react-hot-toast";
function App() {
  const { user, loading } = useAuth();
  console.log("🔥 CURRENT USER:", user);
  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="global-bg-logo"></div>

      <Router>
        <Routes>

          {/* 🔓 Login */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />

          {/* Root Redirect */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />

          {/* 🔐 Protected App */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>


              {/* Dashboard */}
              <Route element={<ProtectedRoute permissions={["view_dashboard"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              {/* Sales */}
              <Route element={<ProtectedRoute permissions={["view_sales"]} />}>
                <Route path="/sales" element={<SalesPage />} />
              </Route>

              {/* Expenses */}
              <Route element={<ProtectedRoute permissions={["view_sales"]} />}>
                <Route path="/expenses" element={<Expenses />} />
              </Route>

              {/* Waste */}
              <Route element={<ProtectedRoute permissions={["view_sales"]} />}>
                <Route path="/waste" element={<Waste />} />
              </Route>

              {/* Returns */}
              <Route element={<ProtectedRoute permissions={["returns.view"]} />}>
                <Route path="/returns" element={<Returns />} />
              </Route>

              {/* Invoices */}
              <Route element={<ProtectedRoute permissions={["view_sales"]} />}>
                <Route path="/invoices" element={<Invoices />} />
              </Route>

              {/* Reports */}
              <Route element={<ProtectedRoute permissions={["view_reports"]} />}>
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Inventory */}
              <Route element={<ProtectedRoute permissions={["view_inventory"]} />}>
                <Route path="/inventory" element={<Inventory />} />
              </Route>

              {/* Purchases */}
              <Route element={<ProtectedRoute permissions={["view_inventory"]} />}>
                <Route path="/purchases" element={<Purchases />} />
              </Route>

              {/* Customers */}
              <Route element={<ProtectedRoute permissions={["view_customers"]} />}>
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerProfile />} />
              </Route>

              {/* Branches */}
              <Route element={<ProtectedRoute permissions={["view_branches"]} />}>
                <Route path="/branches" element={<Branches />} />
              </Route>

              {/* Users */}
              <Route element={<ProtectedRoute permissions={["view_users"]} />}>
                <Route path="/users" element={<Users />} />
              </Route>

              {/* Settings */}
              <Route element={<ProtectedRoute permissions={["view_settings"]} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route
              element={<ProtectedRoute permissions={["view_logs"]} />}
            >
              <Route path="/logs" element={<Logs />} />
            </Route>
              {/* Operations */}
              <Route element={<ProtectedRoute permissions={["view_operations"]} />}>
                <Route path="/operations" element={<Operations />} />
              </Route>

            </Route>
          </Route>
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;