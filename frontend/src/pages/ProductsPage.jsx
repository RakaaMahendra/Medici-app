import { useState, useEffect, useRef } from "react";
import { productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiPackage,
  FiUpload,
  FiImage,
} from "react-icons/fi";

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/api/${path.replace(/^\//, "")}`;
}

const emptyForm = { name: "", price: "" };

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploading, setUploading] = useState(null); // product id being uploaded
  const fileInputRef = useRef(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch {
      showToast("Gagal memuat produk", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
      };
      if (editingId) {
        await productAPI.update(editingId, payload);
        showToast("Produk berhasil diperbarui");
      } else {
        await productAPI.create(payload);
        showToast("Produk berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menyimpan produk", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      showToast("Produk berhasil dihapus");
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menghapus produk", "error");
    }
  };

  const handleCalculateCOGS = async (productId) => {
    try {
      const res = await productAPI.getCOGS(productId);
      showToast(`COGS dihitung: ${formatRupiah(res.data.cogs)}`);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menghitung COGS", "error");
    }
  };

  const handleImageUpload = async (productId, file) => {
    setUploading(productId);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await productAPI.uploadImage(productId, formData);
      showToast("Gambar berhasil diupload");
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal upload gambar", "error");
    } finally {
      setUploading(null);
    }
  };

  const triggerFileInput = (productId) => {
    fileInputRef.current.dataset.productId = productId;
    fileInputRef.current.click();
  };

  const onFileSelected = (e) => {
    const file = e.target.files[0];
    const productId = Number(e.target.dataset.productId);
    if (file && productId) {
      handleImageUpload(productId, file);
    }
    e.target.value = "";
  };

  return (
    <>
      {ToastComponent}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={onFileSelected}
      />

      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Produk</h2>
            <p>Kelola daftar produk jamu dan herbal</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiPackage />
              </div>
              <p>Belum ada produk. Tambahkan produk pertama Anda.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Gambar</th>
                    <th>Nama Produk</th>
                    <th>Harga Jual</th>
                    <th>COGS</th>
                    <th>Margin</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => {
                    const margin = p.price && p.cogs ? p.price - p.cogs : null;
                    return (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td>
                          {p.image ? (
                            <img
                              src={getImageUrl(p.image)}
                              alt={p.name}
                              style={{
                                width: 48,
                                height: 48,
                                objectFit: "cover",
                                borderRadius: "var(--radius-sm)",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                background: "var(--color-border)",
                                borderRadius: "var(--radius-sm)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--color-text-light)",
                              }}
                            >
                              <FiImage />
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{formatRupiah(p.price)}</td>
                        <td>
                          {p.cogs ? (
                            formatRupiah(p.cogs)
                          ) : (
                            <span style={{ color: "var(--color-text-light)" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          {margin !== null ? (
                            <span
                              className={
                                margin >= 0
                                  ? "profit-positive"
                                  : "profit-negative"
                              }
                            >
                              {formatRupiah(margin)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <div className="action-group">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => triggerFileInput(p.id)}
                              title="Upload Gambar"
                              disabled={uploading === p.id}
                            >
                              {uploading === p.id ? "..." : <FiUpload />}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleCalculateCOGS(p.id)}
                              title="Hitung COGS"
                            >
                              <FiDollarSign />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEdit(p)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteConfirm(p)}
                              title="Hapus"
                              style={{ color: "var(--color-danger)" }}
                            >
                              <FiTrash2 />
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
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingId ? "Edit Produk" : "Tambah Produk"}
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
              <label className="form-label">Nama Produk</label>
              <input
                className="form-input"
                placeholder="Contoh: Jamu Kuat"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Harga Jual (Rp)</label>
              <input
                type="number"
                className="form-input"
                placeholder="20000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                min="0"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal
          title="Hapus Produk"
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
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </Modal>
      )}
    </>
  );
}
