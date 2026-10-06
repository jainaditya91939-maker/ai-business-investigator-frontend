import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: "⌂", end: true },
  { path: "/suppliers", label: "Suppliers", icon: "▣" },
  { path: "/products", label: "Products", icon: "▤" },
  { path: "/transactions", label: "Transactions", icon: "↔" },
  { path: "/add-transaction", label: "Add Transaction", icon: "+" },
  { path: "/ai", label: "AI Investigator", icon: "✦" },
];

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const handleNavigate = () => {
    setMobileOpen(false);
  };

  const renderNav = (mobile = false) => (
    <nav className={mobile ? "mobile-nav" : "desktop-nav"}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={handleNavigate}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon" aria-hidden="true">
            {item.icon}
          </span>

          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const userBlock = (
    <div className="sidebar-user-block">
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-name">
            {user.name}
          </div>

          <div className="sidebar-user-email">
            {user.email}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="logout-button"
      >
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* ================================
          DESKTOP SIDEBAR
          ================================ */}

      <aside className="sidebar">
        <h2>AI Investigator</h2>

        {renderNav()}

        {userBlock}
      </aside>


      {/* ================================
          MOBILE HEADER
          ================================ */}

      <header className="mobile-header">
        <div className="mobile-brand">
          <span className="mobile-brand-icon">
            ✦
          </span>

          <span>
            AI Investigator
          </span>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>


      {/* ================================
          MOBILE NAVIGATION DRAWER
          ================================ */}

      {mobileOpen && (
        <div className="mobile-menu-layer">

          <button
            type="button"
            className="mobile-menu-overlay"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          />

          <aside
            className="mobile-drawer"
            aria-label="Mobile navigation"
          >

            <div className="mobile-drawer-header">

              <div>
                <div className="mobile-drawer-title">
                  AI Investigator
                </div>

                <div className="mobile-drawer-subtitle">
                  Business workspace
                </div>
              </div>

              <button
                type="button"
                className="mobile-close-button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                ×
              </button>

            </div>

            {renderNav(true)}

            {userBlock}

          </aside>

        </div>
      )}
    </>
  );
}

export default Sidebar;