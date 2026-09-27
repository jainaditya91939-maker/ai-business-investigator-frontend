import { useEffect, useState } from "react";
import { API_URL, authFetch } from "../api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch(
          `${API_URL}/api/v1/dashboard`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const data = await response.json();
        setDashboard(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="page">
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <p className="subtitle">
          Overview of your business transactions.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card" style={{ marginTop: "30px" }}>
          <p>Loading dashboard...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="card"
          style={{
            marginTop: "30px",
            borderLeft: "4px solid #dc2626",
          }}
        >
          <p style={{ color: "#dc2626" }}>{error}</p>
        </div>
      )}

      {/* Dashboard */}
      {!loading && !error && dashboard && (
        <>
          {/* Main Statistics */}
          <div className="cards">
            <div className="card">
              <p>Total Suppliers</p>

              <h2>{dashboard.total_suppliers}</h2>

              <span>
                Suppliers currently in your business
              </span>
            </div>

            <div className="card">
              <p>Total Pending</p>

              <h2>
                {formatMoney(dashboard.total_pending)}
              </h2>

              <span>
                Amount currently pending with suppliers
              </span>
            </div>

            <div className="card">
              <p>Highest Pending Supplier</p>

              <h2>
                {dashboard.highest_pending_supplier
                  ? dashboard.highest_pending_supplier.name
                  : "None"}
              </h2>

              <span>
                {dashboard.highest_pending_supplier
                  ? formatMoney(
                      dashboard.highest_pending_supplier
                        .pending_amount
                    )
                  : "No pending supplier"}
              </span>
            </div>
          </div>

          {/* Business Summary */}
          <div className="section">
            <h2>Business Summary</h2>

            <div className="card">
              <p>
                Total suppliers:{" "}
                <strong>
                  {dashboard.total_suppliers}
                </strong>
              </p>

              <p style={{ marginTop: "10px" }}>
                Total amount pending with suppliers:{" "}
                <strong>
                  {formatMoney(dashboard.total_pending)}
                </strong>
              </p>

              {dashboard.highest_pending_supplier && (
                <p style={{ marginTop: "10px" }}>
                  Highest pending supplier:{" "}
                  <strong>
                    {dashboard.highest_pending_supplier.name}
                  </strong>
                  {" — "}
                  <strong>
                    {formatMoney(
                      dashboard.highest_pending_supplier
                        .pending_amount
                    )}
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="section">
            <h2>Recent Transactions</h2>

            {dashboard.recent_transactions &&
            dashboard.recent_transactions.length > 0 ? (
              <div>
                {dashboard.recent_transactions.map(
                  (transaction) => (
                    <div
                      key={transaction.id}
                      className="card"
                      style={{ marginBottom: "12px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <strong>
                            {transaction.transaction_type}
                          </strong>

                          <p style={{ marginTop: "7px" }}>
                            Supplier:{" "}
                            {transaction.supplier_name}
                          </p>

                          <span>
                            Date:{" "}
                            {transaction.transaction_date}
                          </span>
                        </div>

                        <strong
                          style={{
                            fontSize: "18px",
                          }}
                        >
                          {formatMoney(transaction.amount)}
                        </strong>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="card">
                <p>No recent transactions.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;