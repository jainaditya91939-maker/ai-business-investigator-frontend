import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../api";

function SupplierDetails() {
  const { supplierName } = useParams();

  const decodedSupplierName = decodeURIComponent(supplierName);

  const [supplier, setSupplier] = useState(null);
  const [pending, setPending] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all suppliers
        const suppliersResponse = await fetch(
          `${API_URL}/api/v1/suppliers`
        );

        if (!suppliersResponse.ok) {
          throw new Error("Failed to fetch suppliers");
        }

        const suppliersData = await suppliersResponse.json();

        // Find current supplier
        const foundSupplier = suppliersData.find(
          (item) => item.name === decodedSupplierName
        );

        if (!foundSupplier) {
          throw new Error("Supplier not found");
        }

        setSupplier(foundSupplier);

        const supplierId = foundSupplier.id;

        // Fetch balance and ledger
        const [balanceResponse, ledgerResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/api/v1/suppliers/${supplierId}/balance`
            ),
            fetch(
              `${API_URL}/api/v1/suppliers/${supplierId}/ledger`
            ),
          ]);

        if (!balanceResponse.ok) {
          throw new Error(
            "Failed to fetch supplier balance"
          );
        }

        if (!ledgerResponse.ok) {
          throw new Error(
            "Failed to fetch supplier ledger"
          );
        }

        const balanceData = await balanceResponse.json();
        const ledgerData = await ledgerResponse.json();

        // Backend is the source of truth
        setPending(
          Number(balanceData.pending_amount || 0)
        );

        // Backend returns ledger inside "ledger"
        if (Array.isArray(ledgerData.ledger)) {
          setTransactions(ledgerData.ledger);
        } else if (Array.isArray(ledgerData.rows)) {
          setTransactions(ledgerData.rows);
        } else if (
          Array.isArray(ledgerData.transactions)
        ) {
          setTransactions(ledgerData.transactions);
        } else if (Array.isArray(ledgerData)) {
          setTransactions(ledgerData);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error(
          "Supplier details error:",
          error
        );

        setError(
          error.message ||
            "Unable to load supplier details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDetails();
  }, [decodedSupplierName]);

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // Get transaction amount from backend debit/credit
  const getTransactionAmount = (transaction) => {
    if (
      transaction.debit !== null &&
      transaction.debit !== undefined &&
      Number(transaction.debit) > 0
    ) {
      return Number(transaction.debit);
    }

    if (
      transaction.credit !== null &&
      transaction.credit !== undefined &&
      Number(transaction.credit) > 0
    ) {
      return Number(transaction.credit);
    }

    return 0;
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Supplier Details</h1>
        <p className="subtitle">
          Loading supplier details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Supplier Details</h1>

        <p
          style={{
            color: "#dc2626",
            marginTop: "15px",
            marginBottom: "15px",
          }}
        >
          {error}
        </p>

        <Link to="/suppliers">
          ← Back to Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/suppliers">
        ← Back to Suppliers
      </Link>

      <div style={{ marginTop: "24px" }}>
        <h1>{supplier.name}</h1>

        <p className="subtitle">
          Supplier account and transaction history
        </p>
      </div>

      <div
        className="card"
        style={{
          marginTop: "24px",
          maxWidth: "700px",
        }}
      >
        <p>
          <strong>Phone:</strong>{" "}
          {supplier.phone || "-"}
        </p>

        <p style={{ marginTop: "10px" }}>
          <strong>Address:</strong>{" "}
          {supplier.address || "-"}
        </p>
      </div>

      <div className="section">
        <h2>Pending Amount</h2>

        <div
          className="card"
          style={{
            maxWidth: "400px",
          }}
        >
          <h2>{formatMoney(pending)}</h2>

          <span
            className={`status ${
              pending > 0
                ? "status-warning"
                : "status-success"
            }`}
          >
            {pending > 0
              ? "Payment Due"
              : "No Payment Due"}
          </span>
        </div>
      </div>

      <div className="section">
        <h2>Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="card">
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Notes</th>
                  <th>Running Balance</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {transaction.transaction_date}
                    </td>

                    <td>
                      <span
                        className={`status ${
                          transaction.transaction_type ===
                          "PAYMENT"
                            ? "status-success"
                            : transaction.transaction_type ===
                                "RETURN"
                              ? "status-warning"
                              : "status-danger"
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>

                    <td>
                      {formatMoney(
                        getTransactionAmount(
                          transaction
                        )
                      )}
                    </td>

                    <td>
                      {transaction.reference_number ||
                        "-"}
                    </td>

                    <td>
                      {transaction.notes || "-"}
                    </td>

                    <td>
                      {formatMoney(
                        transaction.running_balance
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplierDetails;