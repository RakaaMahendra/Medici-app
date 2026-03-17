const {
  Sale,
  SaleItem,
  Stock,
  StockLog,
  Product,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

async function createSale(data) {
  const t = await sequelize.transaction();

  try {
    const { items, userId } = data;

    //  VALIDATION

    if (!items || items.length === 0) {
      throw new Error("items required");
    }

    let total = 0;

    // create sale
    const sale = await Sale.create(
      {
        total: 0,
        date: new Date(),
        userId,
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
        throw new Error("stock not found");
      }

      if (stock.qty < item.qty) {
        throw new Error("stock not enough");
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

    await sale.save({ transaction: t });

    await t.commit();

    return sale;
  } catch (err) {
    await t.rollback();

    throw err;
  }
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
  getSalesReport,
};
