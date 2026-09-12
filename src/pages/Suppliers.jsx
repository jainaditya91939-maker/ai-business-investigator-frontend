import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Fetch suppliers with backend-calculated balances
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/v1/suppliers/summary`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch supplier summary");
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Suppliers error:", error);
      setError("Unable to load suppliers from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Add new supplier
  const addSupplier = async (e) => {
    e.preventDefault();

    if (
      !newSupplier.name.trim() ||
      !newSupplier.phone.trim() ||
      !newSupplier.address.trim()
    ) {
      alert("Please enter supplier name, phone and address.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/v1/suppliers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newSupplier.name.trim(),
            phone: newSupplier.phone.trim(),
            address: newSupplier.address.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to add supplier"
        );
      }

      alert("Supplier added successfully!");

      setNewSupplier({
        name: "",
        phone: "",
        address: "",
      });

      setShowForm(false);

      // Refresh from backend
      await fetchSuppliers();
    } catch (error) {
      console.error("Add supplier error:", error);

      alert(
        error.message || "Unable to add supplier."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div className="page">

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>Suppliers</h1>

          <p className="subtitle">
            Manage your suppliers and track pending payments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm
              ? "#f3f4f6"
              : "#2563eb",
            color: showForm
              ? "#374151"
              : "#ffffff",
            border: "1px solid",
            borderColor: showForm
              ? "#d1d5db"
              : "#2563eb",
            padding: "11px 18px",
            borderRadius: "9px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: showForm
              ? "none"
              : "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          {showForm ? "Cancel" : "+ Add Supplier"}
        </button>
      </div>

      {/* Add Supplier Form */}
      {showForm && (
        <div
          className="card"
          style={{
            marginTop: "25px",
            padding: "25px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              marginBottom: "6px",
            }}
          >
            Add New Supplier
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              marginBottom: "22px",
            }}
          >
            Enter the supplier's basic business information.
          </p>

          <form onSubmit={addSupplier}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >

              {/* Supplier Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#374151",
                  }}
                >
                  Supplier Name
                </label>

                <input
                  type="text"
                  placeholder="Enter supplier name"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      name: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#374151",
                  }}
                >
                  Phone
                </label>

                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      phone: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Address */}
              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#374151",
                  }}
                >
                  Address
                </label>

                <input
                  type="text"
                  placeholder="Enter supplier address"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      address: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "#ffffff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  padding: "10px 17px",
                  borderRadius: "9px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "9px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Supplier Accounts */}
      <div className="section">
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ marginBottom: "5px" }}>
            Supplier Accounts
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Track how much you owe each supplier.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card">
            <p>Loading suppliers...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="card"
            style={{
              borderLeft: "4px solid #dc2626",
            }}
          >
            <p style={{ color: "#dc2626" }}>
              {error}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="table-container">

            <table>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Pending Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "35px",
                        color: "#6b7280",
                      }}
                    >
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => {
                    const pending = Number(
                      supplier.pending_amount || 0
                    );

                    return (
                      <tr key={supplier.id}>

                        {/* Supplier */}
                        <td>
                          <Link
                            to={`/suppliers/${encodeURIComponent(
                              supplier.name
                            )}`}
                            style={{
                              fontWeight: "600",
                              color: "#2563eb",
                            }}
                          >
                            {supplier.name}
                          </Link>
                        </td>

                        {/* Contact */}
                        <td>
                          {supplier.phone || "-"}
                        </td>

                        {/* Pending */}
                        <td>
                          <strong>
                            {formatMoney(pending)}
                          </strong>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={
                              pending > 0
                                ? "status status-warning"
                                : "status status-success"
                            }
                          >
                            {pending > 0
                              ? "Payment Due"
                              : "Paid"}
                          </span>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

          </div>
        )}
      </div>
    </div>
  );
}

export default Suppliers;