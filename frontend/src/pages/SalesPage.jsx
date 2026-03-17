import { useState, useEffect, useRef } from "react";
import { saleAPI, productAPI } from "../services/api";
import { useToast } from "../components/Toast";
import {
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiShoppingCart,
  FiPrinter,
} from "react-icons/fi";

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", qty: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [resultItems, setResultItems] = useState([]);
  const { showToast, ToastComponent } = useToast();
  const receiptRef = useRef(null);

  useEffect(() => {
    productAPI
      .getAll()
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  const addItem = () => {
    setItems([...items, { productId: "", qty: "" }]);
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

  const getEstimatedTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === Number(item.productId));
      if (product && item.qty) {
        return sum + product.price * Number(item.qty);
      }
      return sum;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: Number(i.productId),
          qty: Number(i.qty),
        })),
      };
      const res = await saleAPI.create(payload);
      setResult(res.data);
      // Build receipt items from submitted data
      setResultItems(
        items.map((i) => {
          const product = products.find((p) => p.id === Number(i.productId));
          return {
            name: product?.name || `Produk #${i.productId}`,
            qty: Number(i.qty),
            price: product?.price || 0,
          };
        })
      );
      showToast("Penjualan berhasil dicatat!");
      setItems([{ productId: "", qty: "" }]);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Gagal mencatat penjualan",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Struk Penjualan #${result.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 16px; border-bottom: 1px dashed #333; padding-bottom: 12px; }
            .header h1 { font-size: 18px; margin-bottom: 4px; }
            .header p { font-size: 11px; color: #555; }
            .info { margin-bottom: 12px; }
            .info div { display: flex; justify-content: space-between; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { text-align: left; padding: 4px 0; font-size: 12px; }
            th { border-bottom: 1px dashed #333; }
            .total-row { border-top: 1px dashed #333; font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 16px; border-top: 1px dashed #333; padding-top: 12px; font-size: 11px; color: #555; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>window.print(); window.close();<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <>
      {ToastComponent}

      <div className="page-header">
        <h2>Catat Penjualan</h2>
        <p>Catat transaksi penjualan produk</p>
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
              <h3>
                <FiShoppingCart style={{ marginRight: 8 }} /> Form Penjualan
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
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
                      Item Penjualan
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={addItem}
                    >
                      <FiPlus /> Tambah Item
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
                        {index === 0 && (
                          <label className="form-label">Produk</label>
                        )}
                        <select
                          className="form-select"
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          required
                        >
                          <option value="">Pilih produk...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {formatRupiah(p.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        {index === 0 && (
                          <label className="form-label">Qty</label>
                        )}
                        <input
                          type="number"
                          className="form-input"
                          placeholder="1"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(index, "qty", e.target.value)
                          }
                          required
                          min="1"
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

                {/* Estimated Total */}
                <div
                  style={{
                    background: "var(--color-primary-50)",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--color-primary-dark)",
                    }}
                  >
                    Estimasi Total
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatRupiah(getEstimatedTotal())}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: "100%" }}
                >
                  {submitting ? "Memproses..." : "Simpan Penjualan"}
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
                  Penjualan Berhasil
                </h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handlePrint}
                >
                  <FiPrinter /> Cetak Struk
                </button>
              </div>
              <div className="card-body">
                {/* Printable receipt content */}
                <div ref={receiptRef}>
                  <div className="header">
                    <h1>The Medici</h1>
                    <p>Herbal &amp; Jamu</p>
                  </div>
                  <div className="info">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>No. Transaksi</span>
                      <span>
                        <strong>#{result.id}</strong>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>Tanggal</span>
                      <span>
                        {new Date(
                          result.date || result.createdAt
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {resultItems.length > 0 && (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Harga</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultItems.map((ri, idx) => (
                            <tr key={idx}>
                              <td>{ri.name}</td>
                              <td>{ri.qty}</td>
                              <td>{formatRupiah(ri.price)}</td>
                              <td>{formatRupiah(ri.price * ri.qty)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div
                    style={{
                      background: "var(--color-primary-50)",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 12,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "var(--color-primary-dark)",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "1.3rem",
                        color: "var(--color-primary)",
                      }}
                    >
                      {formatRupiah(result.total)}
                    </span>
                  </div>

                  <div
                    className="footer"
                    style={{
                      textAlign: "center",
                      marginTop: 16,
                      fontSize: "0.8rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <p>Terima kasih atas kunjungan Anda!</p>
                    <p>The Medici — Sehat Alami</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
