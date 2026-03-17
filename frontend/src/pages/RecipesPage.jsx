import { useState, useEffect } from "react";
import { recipeAPI, productAPI, materialAPI } from "../services/api";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen } from "react-icons/fi";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState([{ materialId: "", qty: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [recRes, prodRes, matRes] = await Promise.all([
        recipeAPI.getAll(),
        productAPI.getAll(),
        materialAPI.getAll(),
      ]);
      setRecipes(recRes.data);
      setProducts(prodRes.data);
      setMaterials(matRes.data);
    } catch {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  const productsWithRecipe = recipes.map((r) => r.productId);

  const openCreate = () => {
    setEditingId(null);
    setSelectedProductId("");
    setItems([{ materialId: "", qty: "" }]);
    setModalOpen(true);
  };

  const openEdit = (recipe) => {
    setEditingId(recipe.id);
    setSelectedProductId(recipe.productId);
    setItems(
      recipe.RecipeItems?.map((ri) => ({
        materialId: String(ri.materialId),
        qty: String(ri.qty),
      })) || [{ materialId: "", qty: "" }]
    );
    setModalOpen(true);
  };

  const addItem = () => setItems([...items, { materialId: "", qty: "" }]);

  const removeItem = (i) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  };

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        productId: Number(selectedProductId),
        items: items.map((it) => ({
          materialId: Number(it.materialId),
          qty: Number(it.qty),
        })),
      };
      if (editingId) {
        await recipeAPI.update(editingId, payload);
        showToast("Resep berhasil diperbarui");
      } else {
        await recipeAPI.create(payload);
        showToast("Resep berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menyimpan resep", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await recipeAPI.delete(id);
      showToast("Resep berhasil dihapus");
      setDeleteConfirm(null);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Gagal menghapus resep", "error");
    }
  };

  return (
    <>
      {ToastComponent}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Resep Produk</h2>
            <p>Kelola komposisi bahan baku untuk setiap produk</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Tambah Resep
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">
                <FiBookOpen />
              </div>
              <p>Belum ada resep. Buat resep pertama untuk produk Anda.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {recipes.map((r) => (
              <div className="card" key={r.id}>
                <div className="card-header">
                  <h3>{r.Product?.name || "Produk tidak ditemukan"}</h3>
                  <div className="action-group">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(r)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDeleteConfirm(r)}
                      title="Hapus"
                      style={{ color: "var(--color-danger)" }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                {r.RecipeItems && r.RecipeItems.length > 0 && (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Bahan</th>
                          <th>Jumlah</th>
                          <th>Satuan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.RecipeItems.map((ri, idx) => (
                          <tr key={ri.id}>
                            <td>{idx + 1}</td>
                            <td style={{ fontWeight: 500 }}>
                              {ri.Material?.name || "—"}
                            </td>
                            <td>{ri.qty}</td>
                            <td>{ri.Material?.unit || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingId ? "Edit Resep" : "Tambah Resep"}
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
              <label className="form-label">Produk</label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                disabled={!!editingId}
              >
                <option value="">Pilih produk...</option>
                {products
                  .filter((p) =>
                    editingId
                      ? p.id === selectedProductId
                      : !productsWithRecipe.includes(p.id)
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <label className="form-label" style={{ margin: 0 }}>
                  Bahan Baku
                </label>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addItem}
                >
                  <FiPlus /> Tambah Bahan
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 10,
                    alignItems: "flex-end",
                  }}
                >
                  <div style={{ flex: 2 }}>
                    {index === 0 && <label className="form-label">Bahan</label>}
                    <select
                      className="form-select"
                      value={item.materialId}
                      onChange={(e) =>
                        updateItem(index, "materialId", e.target.value)
                      }
                      required
                    >
                      <option value="">Pilih bahan...</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    {index === 0 && (
                      <label className="form-label">Jumlah</label>
                    )}
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.5"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value)}
                      required
                      min="0.001"
                      step="any"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    style={{ color: "var(--color-danger)" }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal
          title="Hapus Resep"
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
            Yakin ingin menghapus resep untuk{" "}
            <strong>{deleteConfirm.Product?.name}</strong>?
          </p>
        </Modal>
      )}
    </>
  );
}
