import { useState, useEffect } from "react";
import { stockAPI, productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { FiPlus, FiMinus, FiDatabase, FiList } from "react-icons/fi";

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function StockPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logMeta, setLogMeta] = useState({ total: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stock"); // "stock" | "logs"
  const [adjustModal, setAdjustModal] = useState(null); // null | { type, productId, productName }
  const [adjustForm, setAdjustForm] = useState({ qty: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [logFilter, setLogFilter] = useState("");
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tab === "logs") fetchLogs(1);
  }, [tab, logFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockRes, prodRes] = await Promise.all([
        stockAPI.getAll(),
        productAPI.getAll(),
      ]);
      setStocks(stockRes.data);
      setProducts(prodRes.data);
    } catch {
      showToast("Gagal memuat data stok", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page) => {
    try {
      const params = { page, limit: 20 };
      if (logFilter) params.productId = logFilter;
      const res = await stockAPI.getLogs(params);
      setLogs(res.data.rows || res.data);
      setLogMeta({ total: res.data.count || 0, page });
    } catch {
      showToast("Gagal memuat log stok", "error");
    }
  };

  const openAdjust = (type, productId, productName) => {
    setAdjustModal({ type, productId, productName });
    setAdjustForm({ qty: "", reason: "" });
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stockAPI.adjust({
        productId: adjustModal.productId,
        qty: Number(adjustForm.qty),
        type: adjustModal.type,
        reason: adjustForm.reason,
        userId: user?.id,
      });
      showToast(
        adjustModal.type === "addition"
          ? "Stok berhasil ditambahkan"
          : "Stok berhasil dikurangi"
      );
      setAdjustModal(null);
      fetchData();
      if (tab === "logs") fetchLogs(1);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Gagal menyesuaikan stok",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStockForProduct = (productId) => {
    const s = stocks.find((st) => st.productId === productId);
    return s ? s.qty : 0;
  };

  return (
    <>
      {ToastComponent}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Manajemen Stok</h2>
            <p>Kelola stok produk dan lihat riwayat perubahan</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            className={`btn ${tab === "stock" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab("stock")}
          >
            <FiDatabase /> Stok Produk
          </button>
          <button
            className={`btn ${tab === "logs" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab("logs")}
          >
            <FiList /> Riwayat Log
          </button>
        </div>

        {tab === "stock" && (
          <div className="card">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiDatabase />
                </div>
                <p>Belum ada produk.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Produk</th>
                      <th>Harga</th>
                      <th>Stok Saat Ini</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => {
                      const qty = getStockForProduct(p.id);
                      return (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>{formatRupiah(p.price)}</td>
                          <td style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                            {qty}
                          </td>
                          <td>
                            {qty <= 0 ? (
                              <span className="badge badge-danger">Habis</span>
                            ) : qty < 10 ? (
                              <span className="badge badge-warning">
                                Menipis
                              </span>
                            ) : (
                              <span className="badge badge-success">
                                Tersedia
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="action-group">
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() =>
                                  openAdjust("addition", p.id, p.name)
                                }
                                style={{ color: "var(--color-success)" }}
                              >
                                <FiPlus /> Tambah
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() =>
                                  openAdjust("reduction", p.id, p.name)
                                }
                                style={{ color: "var(--color-danger)" }}
                              >
                                <FiMinus /> Kurangi
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "logs" && (
          <div className="card">
            <div className="card-header">
              <h3>Riwayat Perubahan Stok</h3>
              <select
                className="form-select"
                style={{ maxWidth: 220 }}
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
              >
                <option value="">Semua Produk</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {logs.length === 0 ? (
              <div className="empty-state">
                <p>Belum ada riwayat perubahan stok.</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Produk</th>
                        <th>Tipe</th>
                        <th>Jumlah</th>
                        <th>Alasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {log.Product?.name || "—"}
                          </td>
                          <td>
                            {log.type === "addition" ? (
                              <span className="badge badge-success">
                                Tambah
                              </span>
                            ) : log.type === "reduction" ? (
                              <span className="badge badge-danger">
                                Kurangi
                              </span>
                            ) : (
                              <span className="badge badge-info">
                                {log.type}
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{log.qty}</td>
                          <td>{log.reason || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {logMeta.total > 20 && (
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
                      disabled={logMeta.page <= 1}
                      onClick={() => fetchLogs(logMeta.page - 1)}
                    >
                      Sebelumnya
                    </button>
                    <span style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                      Halaman {logMeta.page}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={logMeta.page * 20 >= logMeta.total}
                      onClick={() => fetchLogs(logMeta.page + 1)}
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <Modal
          title={
            adjustModal.type === "addition"
              ? `Tambah Stok — ${adjustModal.productName}`
              : `Kurangi Stok — ${adjustModal.productName}`
          }
          onClose={() => setAdjustModal(null)}
          footer={
            <>
              <button
                className="btn btn-outline"
                onClick={() => setAdjustModal(null)}
              >
                Batal
              </button>
              <button
                className={`btn ${
                  adjustModal.type === "addition" ? "btn-primary" : "btn-danger"
                }`}
                onClick={handleAdjust}
                disabled={submitting}
              >
                {submitting
                  ? "Memproses..."
                  : adjustModal.type === "addition"
                  ? "Tambah"
                  : "Kurangi"}
              </button>
            </>
          }
        >
          <form onSubmit={handleAdjust}>
            <div className="form-group">
              <label className="form-label">Jumlah</label>
              <input
                type="number"
                className="form-input"
                placeholder="10"
                value={adjustForm.qty}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, qty: e.target.value })
                }
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Alasan <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <textarea
                className="form-input"
                placeholder="Contoh: Barang rusak, stok opname, pengiriman dari supplier..."
                value={adjustForm.reason}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, reason: e.target.value })
                }
                required
                rows={3}
                style={{ resize: "vertical" }}
              />
              <small style={{ color: "var(--color-text-secondary)" }}>
                Wajib diisi sebagai catatan perubahan stok
              </small>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
