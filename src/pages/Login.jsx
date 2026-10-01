import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 20px",
        background:
          "radial-gradient(circle at 10% 15%, rgba(59,130,246,0.28), transparent 30%), radial-gradient(circle at 90% 85%, rgba(99,102,241,0.24), transparent 32%), linear-gradient(135deg, #eef4ff 0%, #f8fafc 48%, #eef2ff 100%)",
      }}
    >
      {/* Decorative background shapes */}
      <div
        style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "rgba(37,99,235,0.10)",
          filter: "blur(2px)",
          top: "-90px",
          left: "-70px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "rgba(99,102,241,0.09)",
          bottom: "-150px",
          right: "-120px",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          pointerEvents: "none",
        }}
      />

      <div
        className="login-shell"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "980px",
          display: "grid",
          gridTemplateColumns: "1fr 430px",
          gap: "0",
          alignItems: "stretch",
          borderRadius: "24px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 30px 80px rgba(30,64,175,0.16)",
          backdropFilter: "blur(18px)",
        }}
      >
        {/* Brand panel */}
        <div
          style={{
            padding: "54px 48px",
            color: "white",
            background:
              "linear-gradient(145deg, #1d4ed8 0%, #2563eb 48%, #4f46e5 100%)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "500px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.16)",
              right: "-80px",
              top: "-80px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.13)",
              left: "-70px",
              bottom: "-70px",
            }}
          />

          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "15px",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.22)",
              fontSize: "26px",
              marginBottom: "24px",
            }}
          >
            ✦
          </div>

          <p
            style={{
              margin: "0 0 10px",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              opacity: 0.78,
            }}
          >
            AI-powered business intelligence
          </p>

          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "42px",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              fontWeight: 800,
            }}
          >
            AI Business
            <br />
            Investigator
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "430px",
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Manage suppliers, transactions and business payables in one
            intelligent workspace.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "28px",
            }}
          >
            {["Suppliers", "Transactions", "AI Insights"].map((item) => (
              <span
                key={item}
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Login panel */}
        <div
          style={{
            padding: "44px 38px",
            background: "rgba(255,255,255,0.94)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: "26px" }}>
            <p
              style={{
                margin: "0 0 7px",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              WELCOME BACK
            </p>
            <h2
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "30px",
                letterSpacing: "-0.7px",
              }}
            >
              Sign in
            </h2>
            <p
              style={{
                color: "#6b7280",
                margin: "8px 0 0",
                fontSize: "14px",
              }}
            >
              Access your business dashboard.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#fff1f2",
                color: "#be123c",
                border: "1px solid #fecdd3",
                padding: "11px 13px",
                borderRadius: "10px",
                marginBottom: "18px",
                fontSize: "13px",
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#374151",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                marginBottom: "18px",
                border: "1px solid #dbe1ea",
                borderRadius: "10px",
                fontSize: "14px",
                background: "#f8fafc",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#374151",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                marginBottom: "22px",
                border: "1px solid #dbe1ea",
                borderRadius: "10px",
                fontSize: "14px",
                background: "#f8fafc",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 16px",
                border: "none",
                borderRadius: "10px",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                color: "white",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 8px 18px rgba(37,99,235,0.22)",
              }}
            >
              {loading ? "Logging in..." : "Login to Dashboard →"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "22px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#2563eb",
                fontWeight: "700",
              }}
            >
              Create account
            </Link>
          </p>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid #edf0f5",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "11px",
            }}
          >
            Secure business workspace
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .login-shell {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
