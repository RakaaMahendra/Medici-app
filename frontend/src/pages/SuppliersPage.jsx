import { useState, useEffect } from "react";
import { supplierAPI } from "../services/api";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { FiPlus, FiEdit2, FiTrash2, FiTruck } from "react-icons/fi";

const emptyForm = { name: "", phone: "", address: "" };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await supplierAPI.getAll();
      setSuppliers(res.data);
    } catch {
      showToast("Gagal memuat supplier", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, phone: s.phone || "", address: s.address || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await supplierAPI.update(editingId, form);
        showToast("Supplier berhasil diperbarui");
      } else {
        await supplierAPI.create(form);
        showToast("Supplier berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Gagal menyimpan supplier",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supplierAPI.delete(id);
      showToast("Supplier berhasil dihapus");
      setDeleteConfirm(null);
      fetchSuppliers();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Gagal menghapus supplier",
        "error"
      );
    }
  };

  return (
    <>
      {ToastComponent}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Supplier</h2>
            <p>Kelola daftar supplier bahan baku</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Tambah Supplier
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : suppliers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiTruck />
              </div>
              <p>Belum ada supplier. Tambahkan supplier pertama.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama Supplier</th>
                    <th>Telepon</th>
                    <th>Alamat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.phone || "—"}</td>
                      <td>{s.address || "—"}</td>
                      <td>
                        <div className="action-group">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(s)}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(s)}
                            title="Hapus"
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
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? "Edit Supplier" : "Tambah Supplier"}
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
              <label className="form-label">Nama Supplier</label>
              <input
                className="form-input"
                placeholder="PT. ABC"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">No. Telepon</label>
              <input
                className="form-input"
                placeholder="08123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alamat</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Alamat lengkap"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          title="Hapus Supplier"
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
