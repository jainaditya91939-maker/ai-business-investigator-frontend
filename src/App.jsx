import {
  BrowserRouter,
  Routes,
  Route
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar />
                  <main className="main-content">
                    <Suppliers />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar />
                  <main className="main-content">
                    <Products />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar />
                  <main className="main-content">
                    <Transactions />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-transaction"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar />
                  <main className="main-content">
                    <AddTransaction />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar />
                  <main className="main-content">
                    <AIInvestigator />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/suppliers/:supplierName"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar />
                  <main className="main-content">
                    <SupplierDetails />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;