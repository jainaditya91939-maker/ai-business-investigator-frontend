import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, authFetch } from "../api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get all suppliers
        const suppliersResponse = await authFetch(
          `${API_URL}/api/v1/suppliers`
        );

        if (!suppliersResponse.ok) {
          throw new Error("Failed to fetch suppliers");
        }

        const suppliersData =
          await suppliersResponse.json();

        // Get ledger for every supplier
        const ledgerResults = await Promise.all(
          suppliersData.map(async (supplier) => {
            const response = await authFetch(
              `${API_URL}/api/v1/suppliers/${supplier.id}/ledger`
            );

            if (!response.ok) {
              throw new Error(
                `Failed to fetch ledger for ${supplier.name}`
              );
            }

            const ledgerData =
              await response.json();

            return {
              supplier,
              rows: ledgerData.ledger || [],
            };
          })
        );

        // Combine all supplier transactions
        const allTransactions = [];

        ledgerResults.forEach(
          ({ supplier, rows }) => {
            rows.forEach((transaction) => {
              allTransactions.push({
                ...transaction,
                supplier_id: supplier.id,
                supplier_name: supplier.name,

                // Ledger stores amount as debit or credit
                amount:
                  Number(transaction.debit) > 0
                    ? Number(transaction.debit)
                    : Number(transaction.credit),
              });
            });
          }
        );

        // Newest transactions first
        allTransactions.sort((a, b) => {
          return b.id - a.id;
        });

        setTransactions(allTransactions);
      } catch (error) {
        console.error(error);
        setError(
          "Unable to load transactions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
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
            View all purchases, payments, returns and
            credit notes.
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

        <div
          style={{
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              marginBottom: "5px",
            }}
          >
            Transaction History
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Review your complete supplier transaction history.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="card">
            <p>Loading transactions...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            className="card"
            style={{
              borderLeft:
                "4px solid #dc2626",
            }}
          >
            <p
              style={{
                color: "#dc2626",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="table-container">

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
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
                  transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                      >

                        {/* DATE */}
                        <td>
                          {transaction.transaction_date}
                        </td>

                        {/* SUPPLIER */}
                        <td>
                          <strong>
                            {transaction.supplier_name}
                          </strong>
                        </td>

                        {/* TYPE */}
                        <td>
                          <span
                            className={getTransactionClass(
                              transaction.transaction_type
                            )}
                          >
                            {transaction.transaction_type}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td>
                          <strong
                            style={{
                              fontSize: "15px",
                            }}
                          >
                            {formatMoney(
                              transaction.amount
                            )}
                          </strong>
                        </td>

                        {/* REFERENCE */}
                        <td>
                          {transaction.reference_number ||
                            "-"}
                        </td>

                        {/* NOTES */}
                        <td>
                          <span
                            style={{
                              color:
                                transaction.notes
                                  ? "#374151"
                                  : "#9ca3af",
                            }}
                          >
                            {transaction.notes || "-"}
                          </span>
                        </td>

                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>

          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;