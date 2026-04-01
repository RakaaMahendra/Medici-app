import { useState, useEffect, useRef } from "react";
import { saleAPI } from "../services/api";
import { useToast } from "../components/Toast";
import {
  FiPlus,
  FiMinus,
  FiTrash2,
  FiShoppingCart,
  FiDollarSign,
  FiPrinter,
  FiSearch,
  FiX,
  FiCheck,
} from "react-icons/fi";

function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "debit", label: "Debit", icon: "💳" },
  { value: "credit", label: "Kredit", icon: "💳" },
  { value: "transfer", label: "Transfer", icon: "🏦" },
  { value: "qris", label: "QRIS", icon: "📱" },
  { value: "other", label: "Lainnya", icon: "📝" },
];

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const receiptRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await saleAPI.getPOSProducts();
      setProducts(res.data);
    } catch {
      showToast("Gagal memuat produk", "error");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      if (existing.qty >= product.stock) {
        showToast("Stok tidak cukup", "error");
        return;
      }
      setCart(
        cart.map((c) =>
          c.productId === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      if (product.stock <= 0) {
        showToast("Stok habis", "error");
        return;
      }
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          maxStock: product.stock,
        },
      ]);
    }
  };

  const updateQty = (productId, delta) => {
    setCart(
      cart
        .map((c) => {
          if (c.productId === productId) {
            const newQty = c.qty + delta;
            if (newQty <= 0) return null;
            if (newQty > c.maxStock) {
              showToast("Stok tidak cukup", "error");
              return c;
            }
            return { ...c, qty: newQty };
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((c) => c.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setPaymentAmount("");
    setPaymentMethod("cash");
    setCustomerName("");
    setNotes("");
    setShowPayment(false);
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const paid = Number(paymentAmount) || 0;
  const change = paymentMethod === "cash" ? Math.max(0, paid - total) : 0;

  const canSubmit = () => {
    if (cart.length === 0) return false;
    if (!paymentMethod) return false;
    if (paymentMethod === "cash" && paid < total) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((c) => ({ productId: c.productId, qty: c.qty })),
        paymentMethod,
        paymentAmount: paymentMethod === "cash" ? paid : total,
        customerName: customerName || undefined,
        notes: notes || undefined,
      };
      const res = await saleAPI.create(payload);
      setReceipt(res.data);
      showToast("Transaksi berhasil!");
      setCart([]);
      setPaymentAmount("");
      setCustomerName("");
      setNotes("");
      setShowPayment(false);
      loadProducts(); // Refresh stock
    } catch (err) {
      showToast(
        err.response?.data?.error || "Gagal memproses transaksi",
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
          <title>Struk #${receipt.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 16px; border-bottom: 1px dashed #333; padding-bottom: 12px; }
            .header h1 { font-size: 18px; margin-bottom: 4px; }
            .header p { font-size: 11px; color: #555; }
            .info div { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
            .items { margin: 12px 0; border-top: 1px dashed #333; border-bottom: 1px dashed #333; padding: 8px 0; }
            .item { margin-bottom: 4px; }
            .item-name { font-weight: bold; }
            .item-detail { display: flex; justify-content: space-between; font-size: 11px; }
            .totals div { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .grand-total { font-weight: bold; font-size: 14px; border-top: 1px dashed #333; padding-top: 8px; margin-top: 4px; }
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

  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.value === receipt?.paymentMethod)?.label ||
    receipt?.paymentMethod;

  // Quick amount buttons for cash
  const quickAmounts = [
    total,
    Math.ceil(total / 5000) * 5000,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 20000) * 20000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ]
    .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
    .slice(0, 5);

  return (
    <>
      {ToastComponent}

      <div className="page-header">
        <h2>
          <FiShoppingCart style={{ marginRight: 8 }} />
          Point of Sale
        </h2>
        <p>Kasir — Input Penjualan</p>
      </div>

      <div className="page-body">
        {/* Receipt Modal */}
        {receipt && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: 24,
                maxWidth: 420,
                width: "90%",
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ color: "var(--color-success)" }}>
                  <FiCheck style={{ marginRight: 6 }} /> Transaksi Berhasil
                </h3>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setReceipt(null)}
                >
                  <FiX />
                </button>
              </div>

              <div ref={receiptRef}>
                <div
                  className="header"
                  style={{
                    textAlign: "center",
                    marginBottom: 16,
                    borderBottom: "1px dashed #ccc",
                    paddingBottom: 12,
                  }}
                >
                  <h1 style={{ fontSize: 18 }}>The Medici</h1>
                  <p style={{ fontSize: 11, color: "#888" }}>
                    Herbal &amp; Jamu
                  </p>
                </div>

                <div
                  className="info"
                  style={{ marginBottom: 12, fontSize: "0.85rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>No. Transaksi</span>
                    <span>
                      <strong>#{receipt.id}</strong>
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
                        receipt.date || receipt.createdAt
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {receipt.customerName && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>Pelanggan</span>
                      <span>{receipt.customerName}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>Pembayaran</span>
                    <span>{paymentLabel}</span>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed #ccc",
                    borderBottom: "1px dashed #ccc",
                    padding: "8px 0",
                    marginBottom: 12,
                  }}
                >
                  {receipt.SaleItems?.map((item, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {item.Product?.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.82rem",
                          color: "#666",
                        }}
                      >
                        <span>
                          {item.qty} x {formatRupiah(item.price)}
                        </span>
                        <span>{formatRupiah(item.qty * item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "0.9rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 700 }}>
                      {formatRupiah(receipt.total)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>Dibayar</span>
                    <span>{formatRupiah(receipt.paymentAmount)}</span>
                  </div>
                  {receipt.paymentMethod === "cash" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "var(--color-success)",
                      }}
                    >
                      <span>Kembalian</span>
                      <span>{formatRupiah(receipt.changeAmount)}</span>
                    </div>
                  )}
                </div>

                {receipt.notes && (
                  <div
                    style={{ marginTop: 8, fontSize: "0.82rem", color: "#888" }}
                  >
                    Catatan: {receipt.notes}
                  </div>
                )}

                <div
                  style={{
                    textAlign: "center",
                    marginTop: 16,
                    borderTop: "1px dashed #ccc",
                    paddingTop: 12,
                    fontSize: "0.8rem",
                    color: "#888",
                  }}
                >
                  <p>Terima kasih atas kunjungan Anda!</p>
                  <p>The Medici — Sehat Alami</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  className="btn btn-primary"
                  onClick={handlePrint}
                  style={{ flex: 1 }}
                >
                  <FiPrinter /> Cetak Struk
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setReceipt(null)}
                  style={{ flex: 1 }}
                >
                  Transaksi Baru
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 20,
            minHeight: "calc(100vh - 200px)",
          }}
        >
          {/* LEFT: Product Grid */}
          <div>
            {/* Search */}
            <div style={{ marginBottom: 16, position: "relative" }}>
              <FiSearch
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  color: "#999",
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>

            {/* Product Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{
                    background: "white",
                    borderRadius: 10,
                    padding: 14,
                    cursor: p.stock > 0 ? "pointer" : "not-allowed",
                    border: "2px solid transparent",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: p.stock > 0 ? 1 : 0.5,
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (p.stock > 0)
                      e.currentTarget.style.borderColor =
                        "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  {p.image && (
                    <img
                      src={`/api/uploads/${p.image}`}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginBottom: 8,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      marginBottom: 4,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      fontSize: "0.95rem",
                    }}
                  >
                    {formatRupiah(p.price)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      marginTop: 4,
                      padding: "2px 6px",
                      borderRadius: 4,
                      display: "inline-block",
                      background: p.stock > 0 ? "#e8f5e9" : "#ffebee",
                      color: p.stock > 0 ? "#2e7d32" : "#c62828",
                    }}
                  >
                    Stok: {p.stock}
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                Tidak ada produk ditemukan
              </div>
            )}
          </div>

          {/* RIGHT: Cart & Payment */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Cart Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiShoppingCart /> Keranjang
                {cart.length > 0 && (
                  <span
                    style={{
                      background: "var(--color-primary)",
                      color: "white",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                    }}
                  >
                    {cart.length}
                  </span>
                )}
              </h3>
              {cart.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={clearCart}
                  style={{ color: "var(--color-danger)", fontSize: "0.8rem" }}
                >
                  <FiTrash2 /> Hapus Semua
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflow: "auto", padding: "12px 20px" }}>
              {cart.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#999",
                  }}
                >
                  <FiShoppingCart style={{ fontSize: 32, marginBottom: 8 }} />
                  <p>Keranjang kosong</p>
                  <p style={{ fontSize: "0.82rem" }}>
                    Klik produk untuk menambahkan
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                        {item.name}
                      </div>
                      <div
                        style={{
                          color: "var(--color-primary)",
                          fontWeight: 500,
                          fontSize: "0.82rem",
                        }}
                      >
                        {formatRupiah(item.price)}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{
                          width: 28,
                          height: 28,
                          padding: 0,
                          border: "1px solid #ddd",
                          borderRadius: 6,
                        }}
                        onClick={() => updateQty(item.productId, -1)}
                      >
                        <FiMinus style={{ fontSize: 12 }} />
                      </button>
                      <span
                        style={{
                          width: 30,
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {item.qty}
                      </span>
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{
                          width: 28,
                          height: 28,
                          padding: 0,
                          border: "1px solid #ddd",
                          borderRadius: 6,
                        }}
                        onClick={() => updateQty(item.productId, 1)}
                      >
                        <FiPlus style={{ fontSize: 12 }} />
                      </button>
                    </div>
                    <div
                      style={{
                        width: 85,
                        textAlign: "right",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                      }}
                    >
                      {formatRupiah(item.price * item.qty)}
                    </div>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ color: "var(--color-danger)", padding: 4 }}
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <FiX style={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Payment Section */}
            {cart.length > 0 && (
              <div
                style={{ borderTop: "2px solid #eee", padding: "16px 20px" }}
              >
                {/* Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    Total
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatRupiah(total)}
                  </span>
                </div>

                {!showPayment ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
                    onClick={() => setShowPayment(true)}
                  >
                    <FiDollarSign /> Bayar
                  </button>
                ) : (
                  <div>
                    {/* Payment Method */}
                    <div style={{ marginBottom: 12 }}>
                      <label
                        className="form-label"
                        style={{ fontSize: "0.82rem" }}
                      >
                        Metode Pembayaran
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 6,
                        }}
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(m.value);
                              if (m.value !== "cash")
                                setPaymentAmount(String(total));
                              else setPaymentAmount("");
                            }}
                            style={{
                              padding: "8px 4px",
                              border:
                                paymentMethod === m.value
                                  ? "2px solid var(--color-primary)"
                                  : "1px solid #ddd",
                              borderRadius: 8,
                              background:
                                paymentMethod === m.value
                                  ? "var(--color-primary-50)"
                                  : "white",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: paymentMethod === m.value ? 600 : 400,
                              textAlign: "center",
                            }}
                          >
                            <div style={{ fontSize: "1.1rem" }}>{m.icon}</div>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer Name (optional) */}
                    <div style={{ marginBottom: 10 }}>
                      <label
                        className="form-label"
                        style={{ fontSize: "0.82rem" }}
                      >
                        Nama Pelanggan (opsional)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nama pelanggan..."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ fontSize: "0.88rem" }}
                      />
                    </div>

                    {/* Payment Amount (for cash) */}
                    {paymentMethod === "cash" && (
                      <div style={{ marginBottom: 10 }}>
                        <label
                          className="form-label"
                          style={{ fontSize: "0.82rem" }}
                        >
                          Jumlah Bayar
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Masukkan jumlah uang..."
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          style={{ fontSize: "1rem", fontWeight: 600 }}
                          min={0}
                        />
                        {/* Quick amount buttons */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                            marginTop: 6,
                          }}
                        >
                          {quickAmounts.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{
                                fontSize: "0.75rem",
                                padding: "4px 8px",
                              }}
                              onClick={() => setPaymentAmount(String(amt))}
                            >
                              {formatRupiah(amt)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Change Display */}
                    {paymentMethod === "cash" && paid > 0 && (
                      <div
                        style={{
                          background: paid >= total ? "#e8f5e9" : "#ffebee",
                          padding: "10px 14px",
                          borderRadius: 8,
                          marginBottom: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: paid >= total ? "#2e7d32" : "#c62828",
                          }}
                        >
                          {paid >= total ? "Kembalian" : "Kurang"}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "1.15rem",
                            color: paid >= total ? "#2e7d32" : "#c62828",
                          }}
                        >
                          {formatRupiah(paid >= total ? change : total - paid)}
                        </span>
                      </div>
                    )}

                    {/* Notes (optional) */}
                    <div style={{ marginBottom: 12 }}>
                      <label
                        className="form-label"
                        style={{ fontSize: "0.82rem" }}
                      >
                        Catatan (opsional)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Catatan transaksi..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ fontSize: "0.88rem" }}
                      />
                    </div>

                    {/* Submit */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setShowPayment(false)}
                        style={{ flex: 0 }}
                      >
                        Batal
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: "12px", fontSize: "1rem" }}
                        onClick={handleSubmit}
                        disabled={submitting || !canSubmit()}
                      >
                        {submitting ? (
                          "Memproses..."
                        ) : (
                          <>
                            <FiCheck /> Proses Pembayaran
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
