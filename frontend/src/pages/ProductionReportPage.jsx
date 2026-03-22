import { useState, useEffect } from "react";
import { productionAPI } from "../services/api";
import { useToast } from "../components/Toast";
import { FiSearch, FiCalendar } from "react-icons/fi";

export default function ProductionReportPage() {
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
      const res = await productionAPI.getReport(params);
      setData(res.data);
    } catch {
      showToast("Gagal memuat laporan produksi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReport();
  };

  return (
    <>
      {ToastComponent}

      <div className="page-header">
        <h2>Laporan Produksi</h2>
        <p>Riwayat dan analisis produksi</p>
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
              <p>Tidak ada data produksi ditemukan.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produk</th>
                    <th>Qty</th>
                    <th>Tanggal</th>
                    <th>Detail Bahan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((prod) => (
                    <tr key={prod.id}>
                      <td>#{prod.id}</td>
                      <td style={{ fontWeight: 600 }}>{prod.product}</td>
                      <td>{prod.qty}</td>
                      <td>{new Date(prod.date).toLocaleDateString("id-ID")}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {prod.items.map((item, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: "0.82rem",
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>
                                {item.material}
                              </span>
                              <span
                                style={{ color: "var(--color-text-secondary)" }}
                              >
                                resep: {item.expected}
                                {item.unit ? ` ${item.unit}` : ""} | aktual:{" "}
                                {item.used}
                                {item.unit ? ` ${item.unit}` : ""}
                              </span>
                              <span
                                className={
                                  item.diff > 0
                                    ? "diff-positive"
                                    : item.diff < 0
                                    ? "diff-negative"
                                    : "diff-zero"
                                }
                              >
                                ({item.diff > 0 ? "+" : ""}
                                {item.diff}
                                {item.diffPercent
                                  ? ` / ${item.diffPercent}%`
                                  : ""}
                                )
                              </span>
                            </div>
                          ))}
                        </div>
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
