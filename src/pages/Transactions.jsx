import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, apiFetch } from "../api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionsResponse, suppliersResponse] =
        await Promise.all([
          apiFetch(`${API_URL}/api/v1/transactions`),
          apiFetch(`${API_URL}/api/v1/suppliers`),
        ]);

      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch transactions");
      }

      if (!suppliersResponse.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const transactionsData =
        await transactionsResponse.json();
      const suppliersData =
        await suppliersResponse.json();

      setTransactions(transactionsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error(error);
      setError("Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTransactionClass = (type) => {
    switch (type) {
      case "PURCHASE":
        return "status status-warning";
      case "PAYMENT":
        return "status status-success";
      case "RETURN":
        return "status status-danger";
      case "CREDIT_NOTE":
        return "status status-success";
      default:
        return "status";
    }
  };

  const startEdit = (transaction) => {
    setEditingTransaction({
      ...transaction,
      amount: String(transaction.amount),
      transaction_date: transaction.transaction_date,
      reference_number:
        transaction.reference_number || "",
      notes: transaction.notes || "",
    });
    setError("");
  };

  const cancelEdit = () => {
    if (savingEdit) return;
    setEditingTransaction(null);
  };

  const handleEditChange = (field, value) => {
    setEditingTransaction((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!editingTransaction) return;

    if (
      !editingTransaction.supplier_id ||
      !editingTransaction.transaction_type ||
      !editingTransaction.amount ||
      Number(editingTransaction.amount) <= 0 ||
      !editingTransaction.transaction_date
    ) {
      alert("Please fill all required transaction fields correctly.");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const response = await apiFetch(
        `${API_URL}/api/v1/transactions/${editingTransaction.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplier_id: Number(editingTransaction.supplier_id),
            transaction_type:
              editingTransaction.transaction_type,
            amount: Number(editingTransaction.amount),
            transaction_date:
              editingTransaction.transaction_date,
            reference_number:
              editingTransaction.reference_number.trim() || null,
            notes:
              editingTransaction.notes.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 409) {
        alert(
          data.detail ||
            "Another transaction with the same details already exists."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update transaction"
        );
      }

      setEditingTransaction(null);
      await fetchData();
      alert("Transaction updated successfully!");
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Unable to update transaction."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteTransaction = async (transaction) => {
    const confirmed = window.confirm(
      `Delete this ${transaction.transaction_type.toLowerCase()} of ${formatMoney(
        transaction.amount
      )} from ${transaction.supplier_name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(transaction.id);
      setError("");

      const response = await apiFetch(
        `${API_URL}/api/v1/transactions/${transaction.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete transaction"
        );
      }

      setTransactions((current) =>
        current.filter((item) => item.id !== transaction.id)
      );

      alert("Transaction deleted successfully!");
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Unable to delete transaction."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      {/* PAGE HEADER */}
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
          <h1>Transactions</h1>
          <p className="subtitle">
            View, edit and delete your purchases, payments,
            returns and credit notes.
          </p>
        </div>

        <Link
          to="/add-transaction"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#2563eb",
            color: "#ffffff",
            padding: "11px 18px",
            borderRadius: "9px",
            fontSize: "14px",
            fontWeight: "600",
            textDecoration: "none",
            boxShadow:
              "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          + Add Transaction
        </Link>
      </div>

      {/* TRANSACTIONS SECTION */}
      <div className="section">
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ marginBottom: "5px" }}>
            Transaction History
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Review and manage your complete supplier transaction history.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="card"
            style={{
              marginBottom: "18px",
              borderLeft: "4px solid #dc2626",
            }}
          >
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="card">
            <p>Loading transactions...</p>
          </div>
        )}

        {/* TABLE */}
        {!loading && (
          <div
            className="table-container"
            style={{
              overflowX: "auto",
              borderRadius: "14px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Notes</th>
                  <th style={{ minWidth: "145px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.transaction_date}</td>

                      <td>
                        <strong>
                          {transaction.supplier_name}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={getTransactionClass(
                            transaction.transaction_type
                          )}
                        >
                          {transaction.transaction_type}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: "15px" }}>
                          {formatMoney(transaction.amount)}
                        </strong>
                      </td>

                      <td>
                        {transaction.reference_number || "-"}
                      </td>

                      <td>
                        <span
                          style={{
                            color: transaction.notes
                              ? "#374151"
                              : "#9ca3af",
                          }}
                        >
                          {transaction.notes || "-"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => startEdit(transaction)}
                            disabled={deletingId === transaction.id}
                            title="Edit transaction"
                            style={{
                              border: "1px solid #bfdbfe",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              cursor: "pointer",
                              fontWeight: "700",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteTransaction(transaction)}
                            disabled={deletingId === transaction.id}
                            title="Delete transaction"
                            style={{
                              border: "1px solid #fecaca",
                              background: "#fff1f2",
                              color: "#b91c1c",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              cursor: deletingId === transaction.id
                                ? "not-allowed"
                                : "pointer",
                              fontWeight: "700",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {deletingId === transaction.id
                              ? "Deleting..."
                              : "🗑️ Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingTransaction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "30px",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.24)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2>Edit Transaction</h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  Update the transaction details and save the changes.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                disabled={savingEdit}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  padding: "8px 11px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveEdit}>
              <div style={{ marginBottom: "16px" }}>
                <label>Transaction Type</label>
                <select
                  value={editingTransaction.transaction_type}
                  onChange={(e) =>
                    handleEditChange(
                      "transaction_type",
                      e.target.value
                    )
                  }
                  style={{ width: "100%", marginTop: "6px" }}
                  disabled={savingEdit}
                >
                  <option value="PURCHASE">Purchase</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="RETURN">Return</option>
                  <option value="CREDIT_NOTE">Credit Note</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Supplier</label>
                <select
                  value={editingTransaction.supplier_id}
                  onChange={(e) =>
                    handleEditChange(
                      "supplier_id",
                      e.target.value
                    )
                  }
                  style={{ width: "100%", marginTop: "6px" }}
                  disabled={savingEdit}
                >
                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    handleEditChange("amount", e.target.value)
                  }
                  style={{ width: "100%", marginTop: "6px" }}
                  disabled={savingEdit}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Transaction Date</label>
                <input
                  type="date"
                  value={editingTransaction.transaction_date}
                  onChange={(e) =>
                    handleEditChange(
                      "transaction_date",
                      e.target.value
                    )
                  }
                  style={{ width: "100%", marginTop: "6px" }}
                  disabled={savingEdit}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Reference Number</label>
                <input
                  type="text"
                  value={editingTransaction.reference_number}
                  onChange={(e) =>
                    handleEditChange(
                      "reference_number",
                      e.target.value
                    )
                  }
                  placeholder="e.g. INV001"
                  style={{ width: "100%", marginTop: "6px" }}
                  disabled={savingEdit}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>Notes</label>
                <textarea
                  value={editingTransaction.notes}
                  onChange={(e) =>
                    handleEditChange("notes", e.target.value)
                  }
                  placeholder="Enter notes"
                  rows={4}
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    resize: "vertical",
                  }}
                  disabled={savingEdit}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={savingEdit}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    border: "none",
                    background: savingEdit
                      ? "#93c5fd"
                      : "#2563eb",
                    color: "#ffffff",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    cursor: savingEdit
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
