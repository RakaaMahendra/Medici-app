import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  FiGrid,
  FiPackage,
  FiTool,
  FiShoppingCart,
  FiBarChart2,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
  FiTruck,
  FiBox,
  FiBookOpen,
  FiDatabase,
} from "react-icons/fi";
import { GiMortar } from "react-icons/gi";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [];

  if (user?.role === "admin") {
    navItems.push(
      { section: "Overview" },
      { path: "/dashboard", label: "Dashboard", icon: <FiGrid /> }
    );
  }

  navItems.push(
    { section: "Management" },
    { path: "/products", label: "Produk", icon: <FiPackage /> },
    { path: "/suppliers", label: "Supplier", icon: <FiTruck /> },
    { path: "/materials", label: "Bahan Baku", icon: <FiBox /> },
    { path: "/recipes", label: "Resep", icon: <FiBookOpen /> },
    { path: "/stocks", label: "Stok", icon: <FiDatabase /> }
  );

  if (user?.role === "staff") {
    navItems.push(
      { path: "/production", label: "Produksi", icon: <FiTool /> },
      { path: "/sales", label: "Penjualan", icon: <FiShoppingCart /> }
    );
  }

  navItems.push({ section: "Laporan" });

  if (user?.role === "admin") {
    navItems.push({
      path: "/production/report",
      label: "Laporan Produksi",
      icon: <FiBarChart2 />,
    });
  }

  navItems.push({
    path: "/sales/report",
    label: "Laporan Penjualan",
    icon: <FiFileText />,
  });

  const initials = user?.email ? user.email[0].toUpperCase() : "?";

  return (
    <div className="app-layout">
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <h1>
            <span className="brand-icon">
              <GiMortar />
            </span>
            The Medici
          </h1>
          <small>Herbal Management System</small>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={i} className="sidebar-section-label">
                  {item.section}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{user?.email}</div>
              <div className="role">{user?.role}</div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={logout}
              title="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content herbal-pattern">
        <Outlet />
      </main>
    </div>
  );
}
