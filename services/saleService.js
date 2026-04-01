const {
  Sale,
  SaleItem,
  Stock,
  StockLog,
  Product,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

const VALID_PAYMENT_METHODS = [
  "cash",
  "debit",
  "credit",
  "transfer",
  "qris",
  "other",
];

async function createSale(data) {
  const t = await sequelize.transaction();

  try {
    const { items, userId, paymentMethod, paymentAmount, customerName, notes } =
      data;

    //  VALIDATION

    if (!items || items.length === 0) {
      throw new Error("items required");
    }

    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      throw new Error(
        "paymentMethod harus salah satu: " + VALID_PAYMENT_METHODS.join(", ")
      );
    }

    let total = 0;

    // create sale
    const sale = await Sale.create(
      {
        total: 0,
        date: new Date(),
        userId,
        paymentMethod,
        paymentAmount: paymentAmount || 0,
        changeAmount: 0,
        customerName: customerName || null,
        notes: notes || null,
      },
      { transaction: t }
    );

    for (const item of items) {
      if (!item.productId) {
        throw new Error("productId required");
      }

      if (!item.qty || item.qty <= 0) {
        throw new Error("qty must be > 0");
      }

      const product = await Product.findByPk(item.productId, {
        transaction: t,
      });

      if (!product) {
        throw new Error("product not found");
      }

      const stock = await Stock.findOne({
        where: {
          productId: item.productId,
        },
        transaction: t,
      });

      if (!stock) {
        throw new Error("stock not found for product: " + product.name);
      }

      if (stock.qty < item.qty) {
        throw new Error(
          "Stok tidak cukup untuk " +
            product.name +
            " (tersedia: " +
            stock.qty +
            ")"
        );
      }

      const price = product.price;

      total += price * item.qty;

      await SaleItem.create(
        {
          saleId: sale.id,
          productId: item.productId,
          qty: item.qty,
          price,
        },
        { transaction: t }
      );

      // update stock

      stock.qty -= item.qty;

      await stock.save({ transaction: t });

      // stock log

      await StockLog.create(
        {
          stockId: stock.id,
          productId: item.productId,
          qty: item.qty,
          type: "sale",
          reason: "sale",
          userId,
        },
        { transaction: t }
      );
    }

    sale.total = total;

    // Calculate change for cash payments
    const paidAmount = paymentAmount || 0;
    if (paymentMethod === "cash") {
      if (paidAmount < total) {
        throw new Error(
          "Pembayaran kurang. Total: " + total + ", Dibayar: " + paidAmount
        );
      }
      sale.changeAmount = paidAmount - total;
    } else {
      // For non-cash, paymentAmount = total
      sale.paymentAmount = paidAmount || total;
      sale.changeAmount = 0;
    }

    await sale.save({ transaction: t });

    await t.commit();

    // Reload with items for response
    const result = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          include: [Product],
        },
      ],
    });

    return result;
  } catch (err) {
    await t.rollback();

    throw err;
  }
}

async function getProductsForPOS() {
  const products = await Product.findAll({
    include: [
      {
        model: Stock,
        attributes: ["qty"],
      },
    ],
    order: [["name", "ASC"]],
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    stock: p.Stock ? p.Stock.qty : 0,
  }));
}

async function getSalesReport({
  page = 1,
  limit = 10,
  date,
  startDate,
  endDate,
}) {
  const offset = (page - 1) * limit;

  let where = {};

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    where.date = {
      [Op.between]: [start, end],
    };
  }

  if (startDate && endDate) {
    where.date = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  const sales = await Sale.findAll({
    where,

    include: [
      {
        model: SaleItem,
        include: [Product],
      },
    ],

    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return sales;
}

module.exports = {
  createSale,
  getProductsForPOS,
  getSalesReport,
};
