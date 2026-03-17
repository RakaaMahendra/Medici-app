const { Stock, StockLog, Product, sequelize } = require("../models");
const { Op } = require("sequelize");

async function getAllStocks() {
  return await Stock.findAll({
    include: [{ model: Product }],
    order: [["createdAt", "DESC"]],
  });
}

async function adjustStock(data) {
  const t = await sequelize.transaction();
  try {
    const { productId, qty, type, reason, userId } = data;

    if (!productId) throw new Error("productId required");
    if (!qty || qty <= 0) throw new Error("qty must be > 0");
    if (!type || !["addition", "reduction"].includes(type))
      throw new Error("type must be 'addition' or 'reduction'");
    if (!reason || reason.trim() === "") throw new Error("reason required");

    let stock = await Stock.findOne({
      where: { productId },
      transaction: t,
    });

    if (!stock) {
      if (type === "reduction") {
        throw new Error("Stock not found for this product");
      }
      stock = await Stock.create({ productId, qty: 0 }, { transaction: t });
    }

    if (type === "addition") {
      stock.qty += qty;
    } else {
      if (stock.qty < qty) {
        throw new Error("Insufficient stock");
      }
      stock.qty -= qty;
    }

    await stock.save({ transaction: t });

    await StockLog.create(
      {
        stockId: stock.id,
        productId,
        qty,
        type,
        reason,
        userId,
      },
      { transaction: t }
    );

    await t.commit();

    return await Stock.findByPk(stock.id, {
      include: [{ model: Product }],
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function getStockLogs({ productId, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const where = {};
  if (productId) where.productId = productId;

  const { rows, count } = await StockLog.findAndCountAll({
    where,
    include: [{ model: Product }],
    order: [["createdAt", "DESC"]],
    limit: Number(limit),
    offset,
  });

  return { logs: rows, total: count, page: Number(page), limit: Number(limit) };
}

module.exports = {
  getAllStocks,
  adjustStock,
  getStockLogs,
};
