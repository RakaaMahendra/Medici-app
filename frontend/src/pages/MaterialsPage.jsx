import { useState, useEffect } from "react";
import { materialAPI, supplierAPI } from "../services/api";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { FiPlus, FiEdit2, FiTrash2, FiBox, FiDollarSign } from "react-icons/fi";

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

const emptyForm = { name: "", unit: "" };
const emptyPriceForm = { materialId: "", supplierId: "", price: "" };

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [priceForm, setPriceForm] = useState(emptyPriceForm);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [matRes, supRes] = await Promise.all([
        materialAPI.getAll(),
        supplierAPI.getAll(),
      ]);
      setMaterials(matRes.data);
      setSuppliers(supRes.data);
    } catch {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({ name: m.name, unit: m.unit || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await materialAPI.update(editingId, form);
        showToast("Bahan berhasil diperbarui");
      } else {
        await materialAPI.create(form);
        showToast("Bahan berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menyimpan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await materialAPI.delete(id);
      showToast("Bahan berhasil dihapus");
      setDeleteConfirm(null);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menghapus", "error");
    }
  };

  // Price management
  const openAddPrice = (materialId) => {
    setEditingPriceId(null);
    setPriceForm({ materialId, supplierId: "", price: "" });
    setPriceModalOpen(true);
  };

  const openEditPrice = (mp) => {
    setEditingPriceId(mp.id);
    setPriceForm({
      materialId: mp.materialId,
      supplierId: mp.supplierId,
      price: mp.price,
    });
    setPriceModalOpen(true);
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        materialId: Number(priceForm.materialId),
        supplierId: Number(priceForm.supplierId),
        price: Number(priceForm.price),
      };
      if (editingPriceId) {
        await materialAPI.updatePrice(editingPriceId, payload);
        showToast("Harga berhasil diperbarui");
      } else {
        await materialAPI.addPrice(payload);
        showToast("Harga berhasil ditambahkan");
      }
      setPriceModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menyimpan harga", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrice = async (id) => {
    try {
      await materialAPI.deletePrice(id);
      showToast("Harga berhasil dihapus");
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menghapus harga", "error");
    }
  };

  return (
    <>
      {ToastComponent}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Bahan Baku</h2>
            <p>Kelola daftar bahan baku dan harga dari supplier</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Tambah Bahan
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : materials.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">
                <FiBox />
              </div>
              <p>Belum ada bahan baku. Tambahkan bahan pertama.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {materials.map((m) => {
              const maxPrice =
                m.MaterialPrices?.length > 0
                  ? Math.max(...m.MaterialPrices.map((p) => p.price))
                  : null;

              return (
                <div className="card" key={m.id}>
                  <div className="card-header">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <h3>{m.name}</h3>
                      <span className="badge badge-info">{m.unit}</span>
                      {maxPrice && (
                        <span className="badge badge-warning">
                          Harga max: {formatRupiah(maxPrice)}/{m.unit}
                        </span>
                      )}
                    </div>
                    <div className="action-group">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openAddPrice(m.id)}
                      >
                        <FiDollarSign /> Tambah Harga
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(m)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteConfirm(m)}
                        title="Hapus"
                        style={{ color: "var(--color-danger)" }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  {m.MaterialPrices && m.MaterialPrices.length > 0 && (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Supplier</th>
                            <th>Harga per {m.unit}</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.MaterialPrices.map((mp) => (
                            <tr
                              key={mp.id}
                              style={
                                mp.price === maxPrice
                                  ? { background: "var(--color-primary-50)" }
                                  : {}
                              }
                            >
                              <td style={{ fontWeight: 500 }}>
                                {mp.Supplier?.name || "—"}
                              </td>
                              <td>
                                {formatRupiah(mp.price)}
                                {mp.price === maxPrice && (
                                  <span
                                    className="badge badge-danger"
                                    style={{ marginLeft: 8 }}
                                  >
                                    Termahal
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="action-group">
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => openEditPrice(mp)}
                                    title="Edit Harga"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleDeletePrice(mp.id)}
                                    title="Hapus Harga"
                                    style={{ color: "var(--color-danger)" }}
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Material Modal */}
      {modalOpen && (
        <Modal
          title={editingId ? "Edit Bahan" : "Tambah Bahan"}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button
                className="btn btn-outline"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Bahan</label>
              <input
                className="form-input"
                placeholder="Contoh: Ginseng"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Satuan Unit</label>
              <input
                className="form-input"
                placeholder="kg, pcs, liter..."
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Price Modal */}
      {priceModalOpen && (
        <Modal
          title={
            editingPriceId ? "Edit Harga Supplier" : "Tambah Harga Supplier"
          }
          onClose={() => setPriceModalOpen(false)}
          footer={
            <>
              <button
                className="btn btn-outline"
                onClick={() => setPriceModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePriceSubmit}
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </>
          }
        >
          <form onSubmit={handlePriceSubmit}>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select
                className="form-select"
                value={priceForm.supplierId}
                onChange={(e) =>
                  setPriceForm({ ...priceForm, supplierId: e.target.value })
                }
                required
              >
                <option value="">Pilih supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Harga (Rp)</label>
              <input
                type="number"
                className="form-input"
                placeholder="100000"
                value={priceForm.price}
                onChange={(e) =>
                  setPriceForm({ ...priceForm, price: e.target.value })
                }
                required
                min="0"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal
          title="Hapus Bahan"
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <button
                className="btn btn-outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Hapus
              </button>
            </>
          }
        >
          <p>
            Yakin ingin menghapus <strong>{deleteConfirm.name}</strong>?
          </p>
        </Modal>
      )}
    </>
  );
}
