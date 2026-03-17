import { useState, useEffect } from "react";
import { saleAPI } from "../services/api";
import { useToast } from "../components/Toast";
import { FiSearch, FiCalendar } from "react-icons/fi";

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function SalesReportPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    date: "",
    startDate: "",
    endDate: "",
  });
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchReport();
  }, [page]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filters.date) params.date = filters.date;
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }
      const res = await saleAPI.getReport(params);
      setData(res.data);
    } catch {
      showToast("Gagal memuat laporan penjualan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReport();
  };

  const grandTotal = data.reduce((sum, s) => sum + (s.total || 0), 0);

  return (
    <>
      {ToastComponent}

      <div className="page-header">
        <h2>Laporan Penjualan</h2>
        <p>Riwayat dan analisis penjualan</p>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div className="filters-bar">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tanggal</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      date: e.target.value,
                      startDate: "",
                      endDate: "",
                    })
                  }
                />
              </div>
              <div
                style={{
                  color: "var(--color-text-light)",
                  padding: "20px 4px 0",
                }}
              >
                atau
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Dari</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      startDate: e.target.value,
                      date: "",
                    })
                  }
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Sampai</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      endDate: e.target.value,
                      date: "",
                    })
                  }
                />
              </div>
              <div style={{ paddingTop: 20 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSearch}
                >
                  <FiSearch /> Cari
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {data.length > 0 && (
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-icon green">
                <FiCalendar />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Transaksi</div>
                <div className="stat-value">{data.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">
                <span style={{ fontSize: "1rem" }}>Rp</span>
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Penjualan</div>
                <div className="stat-value">{formatRupiah(grandTotal)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiCalendar />
              </div>
              <p>Tidak ada data penjualan ditemukan.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tanggal</th>
                    <th>Item</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((sale) => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td>{new Date(sale.date).toLocaleDateString("id-ID")}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {sale.SaleItems?.map((item, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: "0.82rem",
                                display: "flex",
                                gap: 8,
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>
                                {item.Product?.name}
                              </span>
                              <span
                                style={{ color: "var(--color-text-secondary)" }}
                              >
                                {item.qty}x @ {formatRupiah(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {formatRupiah(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                padding: 16,
              }}
            >
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </button>
              <span
                className="btn btn-ghost btn-sm"
                style={{ cursor: "default" }}
              >
                Halaman {page}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={data.length < 10}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
