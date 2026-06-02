import {
  lazy,
  Suspense
} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/useAuth";

import Login from "./pages/Login";
import SalesPage from "./features/sales/pages/SalesPage";;
import DailyClosing from "./pages/DailyClosing";
import Branches from "./pages/Branches";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Operations from "./pages/Operations";
import Expenses from "./pages/Expenses";
import Waste from "./pages/Waste";
import Returns from "./pages/Returns";
import Layout from "./components/Layout";
import DailyClosingHistory
from "./pages/DailyClosingHistory";
import ProtectedRoute from "./routes/ProtectedRoute";
import {
  PERMISSIONS
} from "./constants/permissions";
import { Toaster } from "react-hot-toast";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
const Dashboard = lazy(() =>
  import("./pages/Dashboard")
);

const Reports = lazy(() =>
  import("./pages/Reports")
);

const Inventory = lazy(() =>
  import("./pages/Inventory")
);

const Customers = lazy(() =>
  import("./pages/Customers")
);

const CustomerProfile = lazy(() =>
  import("./pages/CustomerProfile")
);

const Purchases = lazy(() =>
  import("./pages/Purchases")
);

const Invoices = lazy(() =>
  import("./pages/Invoices")
);

const Logs = lazy(() =>
  import("./pages/Logs")
);

const Pricing = lazy(() =>
  import("./pages/Pricing")
);
function App() {
  const { user, loading } = useAuth();
  console.log("🔥 CURRENT USER:", user);
  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="global-bg-logo"></div>

      <Router>

        <Suspense fallback={<div>Loading...</div>}>

          <Routes>

          {/* 🔓 Login */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/home" />}
          />

          {/* Root Redirect */}
          <Route
            path="/"
            element={<Splash />}
          />

          {/* 🔐 Protected App */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              <Route
                path="/home"
                element={<Home />}
              />
              
              {/* Dashboard */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.REPORTS_VIEW]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              {/* Sales */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.SALES_VIEW]} />}>
                <Route path="/sales" element={<SalesPage />} />
              </Route>
              {/* Daily Closing */}
              <Route
                element={
                  <ProtectedRoute
                    permissions={[
                      PERMISSIONS.REPORTS_VIEW
                    ]}
                  />
                }
              >
                <Route
                  path="/daily-closing"
                  element={<DailyClosing />}
                />
                <Route
                  path="/daily-closing-history"
                  element={
                    <DailyClosingHistory />
                  }
                />
              </Route>
              {/* Expenses */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.EXPENSES_VIEW]} />}>
                <Route path="/expenses" element={<Expenses />} />
              </Route>

              {/* Waste */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.INVENTORY_ADJUST]} />}>
                <Route path="/waste" element={<Waste />} />
              </Route>

              {/* Returns */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.RETURNS_VIEW]} />}>
                <Route path="/returns" element={<Returns />} />
              </Route>

              {/* Invoices */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.SALES_VIEW]} />}>
                <Route path="/invoices" element={<Invoices />} />
              </Route>
              <Route
                path="/invoices/:id"
                element={<Invoices />}
              />

              {/* Reports */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.REPORTS_VIEW]} />}>
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Inventory */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.INVENTORY_VIEW]} />}>
                <Route path="/inventory" element={<Inventory />} />
              </Route>

              {/* Purchases */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.INVENTORY_VIEW]} />}>
                <Route path="/purchases" element={<Purchases />} />
              </Route>

              {/* Customers */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.CUSTOMERS_VIEW]} />}>
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerProfile />} />
              </Route>

              {/* Branches */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.SETTINGS_VIEW]} />}>
                <Route path="/branches" element={<Branches />} />
              </Route>

              {/* Users */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.USERS_VIEW]} />}>
                <Route path="/users" element={<Users />} />
              </Route>

              {/* Settings */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.SETTINGS_VIEW]} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute
                    permissions={[
                      PERMISSIONS.LOGS_VIEW
                    ]}
                  />
                }
              >
              <Route path="/logs" element={<Logs />} />
            </Route>
              {/* Operations */}
              <Route
                element={
                  <ProtectedRoute
                    permissions={[
                      PERMISSIONS.OPERATIONS_VIEW
                    ]}
                  />
                }
              >
                <Route path="/operations" element={<Operations />} />
              </Route>
              {/* Pricing */}
              <Route element={<ProtectedRoute permissions={[PERMISSIONS.PRICING_VIEW]} />}>
                <Route path="/pricing" element={<Pricing />} />
              </Route>

            </Route>
          </Route>
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} replace />}
        />
        </Routes>
        </Suspense>
      </Router>
      <Toaster
  position="top-right"
  containerStyle={{
    zIndex: 9999999,
    top: 20,
    right: 20
  }}
  toastOptions={{
    style: {
      zIndex: 9999999
    }
  }}
/>
    </>
  );
}

export default App;