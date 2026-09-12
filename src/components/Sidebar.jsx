import { NavLink } from "react-router-dom";

function Sidebar() {
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
              background: isActive
                ? "#2563eb"
                : "transparent",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: isActive ? "600" : "500",
              transition:
                "background 0.2s ease, color 0.2s ease",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;