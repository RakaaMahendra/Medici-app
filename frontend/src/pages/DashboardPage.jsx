import { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";
import { FiDollarSign, FiBox, FiLayers, FiTrendingUp } from "react-icons/fi";

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.get();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h2>Dashboard</h2>
          <p>Ringkasan aktivitas hari ini</p>
        </div>
        <div className="page-body">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <div className="page-body">
          <div className="empty-state">
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={fetchDashboard}
              style={{ marginTop: 16 }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </>
    );
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>{today}</p>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">
              <FiDollarSign />
            </div>
            <div className="stat-info">
              <div className="stat-label">Penjualan Hari Ini</div>
              <div className="stat-value">{formatRupiah(data.salesToday)}</div>
              <div className="stat-sub">Total transaksi hari ini</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <FiBox />
            </div>
            <div className="stat-info">
              <div className="stat-label">Produksi Hari Ini</div>
              <div className="stat-value">
                {data.productionToday || 0}{" "}
                <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                  unit
                </span>
              </div>
              <div className="stat-sub">Jumlah produksi hari ini</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <FiLayers />
            </div>
            <div className="stat-info">
              <div className="stat-label">Total Stok</div>
              <div className="stat-value">
                {data.stockTotal || 0}{" "}
                <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                  unit
                </span>
              </div>
              <div className="stat-sub">Stok semua produk</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <FiTrendingUp />
            </div>
            <div className="stat-info">
              <div className="stat-label">Profit Hari Ini</div>
              <div
                className={`stat-value ${
                  data.profitToday >= 0 ? "profit-positive" : "profit-negative"
                }`}
              >
                {formatRupiah(data.profitToday)}
              </div>
              <div className="stat-sub">Selisih penjualan - COGS</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
