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
      setError(
        error.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fb",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              marginBottom: "8px",
              color: "#111827"
            }}
          >
            AI Business Investigator
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "28px"
            }}
          >
            Login to your business account
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600"
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px"
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600"
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginBottom: "22px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            color: "#6b7280"
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#2563eb",
              fontWeight: "600"
            }}
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;