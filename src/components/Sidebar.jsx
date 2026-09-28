import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
    },
    {
      path: "/suppliers",
      label: "Suppliers",
    },
    {
      path: "/products",
      label: "Products",
    },
    {
      path: "/transactions",
      label: "Transactions",
    },
    {
      path: "/ai",
      label: "AI Investigator",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <h2>AI Investigator</h2>

      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display: "block",
              width: "100%",
              padding: "12px 14px",
              borderRadius: "9px",
              color: isActive ? "#ffffff" : "#9ca3af",
              background: isActive ? "#2563eb" : "transparent",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: isActive ? "600" : "500",
              transition: "background 0.2s ease, color 0.2s ease",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "20px",
        }}
      >
        {user && (
          <div
            style={{
              padding: "12px 14px",
              marginBottom: "10px",
              borderTop: "1px solid #1f2937",
              color: "#9ca3af",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              {user.name}
            </div>

            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "11px 14px",
            border: "1px solid #374151",
            borderRadius: "9px",
            background: "transparent",
            color: "#fca5a5",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;