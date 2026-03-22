import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductionPage from "./pages/ProductionPage";
import ProductionReportPage from "./pages/ProductionReportPage";
import SalesPage from "./pages/SalesPage";
import SalesReportPage from "./pages/SalesReportPage";
import SuppliersPage from "./pages/SuppliersPage";
import MaterialsPage from "./pages/MaterialsPage";
import RecipesPage from "./pages/RecipesPage";
import StockPage from "./pages/StockPage";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <RegisterPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            user?.role === "admin" || user?.role === "user" ? (
              <DashboardPage />
            ) : (
              <Navigate to="/products" />
            )
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={["admin", "user"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="products" element={<ProductsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="stocks" element={<StockPage />} />
        <Route
          path="production"
          element={
            <ProtectedRoute roles={["staff"]}>
              <ProductionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="production/report"
          element={
            <ProtectedRoute roles={["admin", "user"]}>
              <ProductionReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="sales"
          element={
            <ProtectedRoute roles={["staff"]}>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route path="sales/report" element={<SalesReportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
