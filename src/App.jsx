import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import AIInvestigator from "./pages/AIInvestigator";
import SupplierDetails from "./pages/SupplierDetails";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./auth/AuthContext";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          {/* Protected Dashboard Routes */}

          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/suppliers"
            element={
              <ProtectedLayout>
                <Suppliers />
              </ProtectedLayout>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedLayout>
                <Products />
              </ProtectedLayout>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedLayout>
                <Transactions />
              </ProtectedLayout>
            }
          />

          <Route
            path="/add-transaction"
            element={
              <ProtectedLayout>
                <AddTransaction />
              </ProtectedLayout>
            }
          />

          <Route
            path="/ai"
            element={
              <ProtectedLayout>
                <AIInvestigator />
              </ProtectedLayout>
            }
          />

          <Route
            path="/suppliers/:supplierName"
            element={
              <ProtectedLayout>
                <SupplierDetails />
              </ProtectedLayout>
            }
          />

          {/* Unknown routes */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;