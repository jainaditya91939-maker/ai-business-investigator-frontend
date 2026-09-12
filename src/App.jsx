import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import AIInvestigator from "./pages/AIInvestigator";
import SupplierDetails from "./pages/SupplierDetails";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <Sidebar />

        <main className="main-content">
          <Routes>

            <Route path="/" element={<Dashboard />} />

            <Route path="/suppliers" element={<Suppliers />} />

            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<Transactions />} />

            <Route
  path="/add-transaction"
  element={<AddTransaction />}
/>
<Route
  path="/ai"
  element={<AIInvestigator />}
/>
<Route
  path="/suppliers/:supplierName"
  element={<SupplierDetails />}
/>

          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;