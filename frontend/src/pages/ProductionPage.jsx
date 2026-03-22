import { useState, useEffect } from "react";
import {
  productionAPI,
  productAPI,
  materialAPI,
  recipeAPI,
} from "../services/api";
import { useToast } from "../components/Toast";
import { FiPlus, FiTrash2, FiCheckCircle } from "react-icons/fi";

export default function ProductionPage() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ productId: "", qty: "" });
  const [items, setItems] = useState([{ materialId: "", qtyUsed: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    Promise.all([productAPI.getAll(), materialAPI.getAll()])
      .then(([prodRes, matRes]) => {
        setProducts(prodRes.data);
        setMaterials(matRes.data);
      })
      .catch(() => {});
  }, []);

  // When product is selected, auto-load recipe items
  const handleProductChange = async (productId) => {
    setForm({ ...form, productId });
    if (productId) {
      try {
        const res = await recipeAPI.getByProduct(productId);
        if (res.data && res.data.RecipeItems) {
          setItems(
            res.data.RecipeItems.map((ri) => ({
              materialId: String(ri.materialId),
              qtyUsed: "",
            }))
          );
          return;
        }
      } catch {
        // No recipe found, keep manual entry
      }
    }
    setItems([{ materialId: "", qtyUsed: "" }]);
  };

  const addItem = () => {
    setItems([...items, { materialId: "", qtyUsed: "" }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        productId: Number(form.productId),
        qty: Number(form.qty),
        items: items.map((i) => ({
          materialId: Number(i.materialId),
          qtyUsed: Number(i.qtyUsed),
        })),
      };
      const res = await productionAPI.create(payload);
      setResult(res.data);
      showToast("Produksi berhasil dicatat!");
      setForm({ productId: "", qty: "" });
      setItems([{ materialId: "", qtyUsed: "" }]);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Gagal mencatat produksi",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {ToastComponent}

      <div className="page-header">
        <h2>Catat Produksi</h2>
        <p>Catat hasil produksi dan bahan yang digunakan</p>
      </div>

      <div className="page-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: result ? "1fr 1fr" : "1fr",
            gap: 24,
          }}
        >
          <div className="card">
            <div className="card-header">
              <h3>Form Produksi</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Produk</label>
                    <select
                      className="form-select"
                      value={form.productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      required
                    >
                      <option value="">Pilih produk...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jumlah Produksi</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="10"
                      value={form.qty}
                      onChange={(e) =>
                        setForm({ ...form, qty: e.target.value })
                      }
                      required
                      min="1"
                    />
                  </div>
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
                      Bahan yang Digunakan
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
                      <div style={{ flex: 1 }}>
                        {index === 0 && (
                          <label className="form-label">Bahan Baku</label>
                        )}
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
                          <label className="form-label">Qty Aktual</label>
                        )}
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0.5"
                          step="any"
                          value={item.qtyUsed}
                          onChange={(e) =>
                            updateItem(index, "qtyUsed", e.target.value)
                          }
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                        style={{
                          color: "var(--color-danger)",
                          marginBottom: 0,
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: "100%" }}
                >
                  {submitting ? "Memproses..." : "Simpan Produksi"}
                </button>
              </form>
            </div>
          </div>

          {result && (
            <div className="card">
              <div className="card-header">
                <h3>
                  <FiCheckCircle
                    style={{ color: "var(--color-success)", marginRight: 8 }}
                  />
                  Hasil Produksi
                </h3>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                      marginBottom: 4,
                    }}
                  >
                    ID Produksi
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>
                    #{result.production.id}
                  </div>
                </div>

                {result.compare && result.compare.length > 0 && (
                  <>
                    <h4
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        marginBottom: 12,
                      }}
                    >
                      Perbandingan dengan Resep
                    </h4>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Bahan</th>
                            <th>Resep</th>
                            <th>Aktual</th>
                            <th>Selisih</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.compare.map((c, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 500 }}>
                                {c.materialName || `Material #${c.materialId}`}
                              </td>
                              <td>
                                {c.expected} {c.unit || ""}
                              </td>
                              <td>
                                {c.used} {c.unit || ""}
                              </td>
                              <td>
                                <span
                                  className={
                                    c.diff > 0
                                      ? "diff-positive"
                                      : c.diff < 0
                                      ? "diff-negative"
                                      : "diff-zero"
                                  }
                                >
                                  {c.diff > 0 ? "+" : ""}
                                  {c.diff}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <span className="diff-positive">+positif</span> = lebih
                      banyak dari resep,{" "}
                      <span className="diff-negative">-negatif</span> = lebih
                      sedikit, <span className="diff-zero">0</span> = sesuai
                      resep
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
