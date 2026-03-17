const { Sale, SaleItem, Production, Stock, Product } = require("../models");

const { Op } = require("sequelize");

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

async function getDashboard() {
  const { start, end } = todayRange();

  // =====================
  // SALES TODAY
  // =====================

  const salesToday = await Sale.sum("total", {
    where: {
      date: {
        [Op.between]: [start, end],
      },
    },
  });

  // =====================
  // PRODUCTION TODAY
  // =====================

  const productionToday = await Production.sum("qty", {
    where: {
      date: {
        [Op.between]: [start, end],
      },
    },
  });

  // =====================
  // TOTAL STOCK
  // =====================

  const stockTotal = await Stock.sum("qty");

  // =====================
  // PROFIT TODAY
  // =====================

  const saleItems = await SaleItem.findAll({
    include: [
      {
        model: Sale,
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
      },
      {
        model: Product,
      },
    ],
  });

  let profitToday = 0;

  for (const item of saleItems) {
    const price = item.price;
    const cogs = item.Product.cogs;
    const qty = item.qty;

    profitToday += (price - cogs) * qty;
  }

  return {
    salesToday: salesToday || 0,
    productionToday: productionToday || 0,
    stockTotal: stockTotal || 0,
    profitToday,
  };
}

module.exports = {
  getDashboard,
};
