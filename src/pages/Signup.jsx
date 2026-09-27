import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      await signup(
        name,
        businessName,
        email,
        password
      );

      navigate("/", { replace: true });
    } catch (error) {
      setError(
        error.message || "Signup failed"
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
          maxWidth: "450px",
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
            Create Your Account
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "28px"
            }}
          >
            Start managing your business
            intelligently
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
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Your name"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginBottom: "16px",
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
            Business Name
          </label>

          <input
            type="text"
            value={businessName}
            onChange={(event) =>
              setBusinessName(
                event.target.value
              )
            }
            placeholder="Your business name"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginBottom: "16px",
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
              marginBottom: "16px",
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
            placeholder="Minimum 8 characters"
            minLength={8}
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
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            color: "#6b7280"
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#2563eb",
              fontWeight: "600"
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;